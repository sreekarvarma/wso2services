"""
Bank Account API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
import logging
from datetime import datetime
import uuid

from app.schemas import (
    ConnectRequest, ConnectResponse, BankAccount, BankAccountListResponse,
    BankAccountDetails, UnlinkAccountResponse, SetPrimaryAccountResponse
)
from app.services.mastercard_client import mastercard_client
from app.database.models import MastercardCustomer, LinkedBankAccount, AccountConnectionLog
from app.database.connection import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/{user_id}/bank-accounts/connect", response_model=ConnectResponse)
async def generate_connect_url(
    user_id: str,
    request: ConnectRequest,
    db: Session = Depends(get_db)
):
    """
    Generate Mastercard Connect URL for bank account linking
    
    **Flow:**
    1. Check if user has Mastercard customer ID
    2. If not, create new Mastercard customer
    3. Generate Connect URL
    4. Log the connection attempt
    5. Return URL to frontend
    
    **Frontend Usage:**
    ```javascript
    const response = await fetch('/api/v1/user123/bank-accounts/connect', {
        method: 'POST',
        body: JSON.stringify({ redirect_uri: 'https://myapp.com/callback' })
    });
    const data = await response.json();
    window.location.href = data.connect_url;  // Redirect user
    ```
    """
    try:
        # Check if Mastercard customer exists
        mc_customer = db.query(MastercardCustomer).filter(
            MastercardCustomer.user_id == user_id
        ).first()
        
        if not mc_customer:
            # Create new Mastercard customer
            logger.info(f"Creating Mastercard customer for user {user_id}")
            
            mc_data = await mastercard_client.create_customer(
                user_id=user_id,
                username=f"user_{user_id}"
            )
            
            # Save to database
            mc_customer = MastercardCustomer(
                user_id=user_id,
                mastercard_customer_id=mc_data["id"],
                username=mc_data.get("username"),
                status="active"
            )
            db.add(mc_customer)
            db.commit()
            db.refresh(mc_customer)
        
        # Generate Connect URL
        connect_url = await mastercard_client.generate_connect_url(
            customer_id=mc_customer.mastercard_customer_id,
            redirect_uri=request.redirect_uri,
            institution_id=request.institution_id,
            webhook_url=request.webhook_url
        )
        
        # Log connection attempt
        log_entry = AccountConnectionLog(
            user_id=user_id,
            action="connect_initiated",
            status="pending"
        )
        db.add(log_entry)
        db.commit()
        
        session_id = str(uuid.uuid4())
        
        return ConnectResponse(
            connect_url=connect_url,
            session_id=session_id
        )
        
    except Exception as e:
        logger.error(f"Error generating Connect URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Connect URL: {str(e)}"
        )


@router.get("/{user_id}/bank-accounts/callback")
async def handle_connect_callback(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Handle callback after user completes account linking
    
    **Flow:**
    1. User completes linking on Mastercard Connect
    2. Mastercard redirects back to our app
    3. Fetch linked accounts from Mastercard
    4. Save accounts to our database
    5. Return account list
    
    **Note:** In production, you might want to accept a `code` or `session_id` 
    parameter to validate the callback.
    """
    try:
        # Get Mastercard customer
        mc_customer = db.query(MastercardCustomer).filter(
            MastercardCustomer.user_id == user_id
        ).first()
        
        if not mc_customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mastercard customer not found"
            )
        
        # Fetch accounts from Mastercard
        logger.info(f"Fetching accounts for customer {mc_customer.mastercard_customer_id}")
        accounts = await mastercard_client.get_customer_accounts(
            customer_id=mc_customer.mastercard_customer_id
        )
        
        saved_accounts = []
        
        for account in accounts:
            # Check if account already exists
            existing_account = db.query(LinkedBankAccount).filter(
                LinkedBankAccount.mastercard_account_id == account["id"]
            ).first()
            
            if existing_account:
                # Update existing account
                existing_account.current_balance = account.get("balance")
                existing_account.available_balance = account.get("availableBalance")
                existing_account.last_updated_at = datetime.now()
                existing_account.status = "active"
                db.commit()
                saved_accounts.append(existing_account)
            else:
                # Create new account record
                new_account = LinkedBankAccount(
                    user_id=user_id,
                    mastercard_customer_id=mc_customer.mastercard_customer_id,
                    mastercard_account_id=account["id"],
                    account_name=account.get("name", "Unknown Account"),
                    account_number_masked=account.get("accountNumberDisplay", "****"),
                    account_type=account.get("type", "unknown"),
                    institution_id=str(account.get("institutionId", "")),
                    institution_name=account.get("institutionName", "Unknown"),
                    institution_logo_url=account.get("institutionLogo"),
                    current_balance=account.get("balance"),
                    available_balance=account.get("availableBalance"),
                    currency=account.get("currency", "USD"),
                    status="active",
                    consent_granted_at=datetime.now(),
                    is_verified=True,
                    verification_method="instant"
                )
                db.add(new_account)
                db.commit()
                db.refresh(new_account)
                saved_accounts.append(new_account)
        
        # Log successful connection
        log_entry = AccountConnectionLog(
            user_id=user_id,
            action="connect_success",
            status="completed"
        )
        db.add(log_entry)
        db.commit()
        
        logger.info(f"Successfully linked {len(saved_accounts)} accounts for user {user_id}")
        
        return {
            "status": "success",
            "accounts_added": len(saved_accounts),
            "accounts": [BankAccount.model_validate(acc) for acc in saved_accounts]
        }
        
    except Exception as e:
        logger.error(f"Error handling callback: {e}")
        
        # Log failed connection
        log_entry = AccountConnectionLog(
            user_id=user_id,
            action="connect_failed",
            status="error",
            error_message=str(e)
        )
        db.add(log_entry)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process account linking: {str(e)}"
        )


@router.get("/{user_id}/bank-accounts", response_model=BankAccountListResponse)
async def list_bank_accounts(
    user_id: str,
    status_filter: str = "active",
    db: Session = Depends(get_db)
):
    """
    List all linked bank accounts for a user
    
    **Query Parameters:**
    - status_filter: Filter by status (active, inactive, all)
    """
    try:
        query = db.query(LinkedBankAccount).filter(
            LinkedBankAccount.user_id == user_id,
            LinkedBankAccount.deleted_at.is_(None)
        )
        
        if status_filter != "all":
            query = query.filter(LinkedBankAccount.status == status_filter)
        
        accounts = query.all()
        
        return BankAccountListResponse(
            accounts=[BankAccount.model_validate(acc) for acc in accounts],
            total=len(accounts)
        )
        
    except Exception as e:
        logger.error(f"Error listing accounts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list accounts: {str(e)}"
        )


@router.get("/{user_id}/bank-accounts/{account_id}", response_model=BankAccountDetails)
async def get_bank_account(
    user_id: str,
    account_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed information for a specific bank account"""
    try:
        account = db.query(LinkedBankAccount).filter(
            LinkedBankAccount.id == account_id,
            LinkedBankAccount.user_id == user_id,
            LinkedBankAccount.deleted_at.is_(None)
        ).first()
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        return BankAccountDetails.model_validate(account)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting account details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get account details: {str(e)}"
        )


@router.post("/{user_id}/bank-accounts/{account_id}/refresh")
async def refresh_account_balance(
    user_id: str,
    account_id: str,
    db: Session = Depends(get_db)
):
    """
    Refresh account balance from Mastercard
    
    **Note:** This triggers a real-time data fetch from the bank.
    Use sparingly to avoid rate limits.
    """
    try:
        account = db.query(LinkedBankAccount).filter(
            LinkedBankAccount.id == account_id,
            LinkedBankAccount.user_id == user_id,
            LinkedBankAccount.deleted_at.is_(None)
        ).first()
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        # Refresh from Mastercard
        mc_account = await mastercard_client.refresh_account(
            customer_id=account.mastercard_customer_id,
            account_id=account.mastercard_account_id
        )
        
        # Update database
        account.current_balance = mc_account.get("balance")
        account.available_balance = mc_account.get("availableBalance")
        account.last_updated_at = datetime.now()
        db.commit()
        
        return {
            "status": "refreshed",
            "balances": {
                "current": float(account.current_balance or 0),
                "available": float(account.available_balance or 0),
                "updated_at": account.last_updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh account: {str(e)}"
        )


@router.delete("/{user_id}/bank-accounts/{account_id}", response_model=UnlinkAccountResponse)
async def unlink_bank_account(
    user_id: str,
    account_id: str,
    db: Session = Depends(get_db)
):
    """
    Unlink a bank account
    
    **Note:** This performs a soft delete. The account record remains in the database
    but is marked as deleted.
    """
    try:
        account = db.query(LinkedBankAccount).filter(
            LinkedBankAccount.id == account_id,
            LinkedBankAccount.user_id == user_id,
            LinkedBankAccount.deleted_at.is_(None)
        ).first()
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        # Soft delete in our database
        account.deleted_at = datetime.now()
        account.status = "inactive"
        db.commit()
        
        # Optionally delete from Mastercard
        # await mastercard_client.delete_account(
        #     customer_id=account.mastercard_customer_id,
        #     account_id=account.mastercard_account_id
        # )
        
        logger.info(f"Unlinked account {account_id} for user {user_id}")
        
        return UnlinkAccountResponse(
            status="unlinked",
            message="Bank account successfully unlinked",
            account_id=str(account.id)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlinking account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unlink account: {str(e)}"
        )


@router.post("/{user_id}/bank-accounts/{account_id}/set-primary", response_model=SetPrimaryAccountResponse)
async def set_primary_account(
    user_id: str,
    account_id: str,
    db: Session = Depends(get_db)
):
    """Set an account as the primary funding source"""
    try:
        account = db.query(LinkedBankAccount).filter(
            LinkedBankAccount.id == account_id,
            LinkedBankAccount.user_id == user_id,
            LinkedBankAccount.deleted_at.is_(None)
        ).first()
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        
        # Unset other primary accounts
        db.query(LinkedBankAccount).filter(
            LinkedBankAccount.user_id == user_id,
            LinkedBankAccount.id != account_id
        ).update({"is_primary": False})
        
        # Set this account as primary
        account.is_primary = True
        db.commit()
        
        return SetPrimaryAccountResponse(
            status="updated",
            account_id=str(account.id),
            is_primary=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting primary account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set primary account: {str(e)}"
        )
