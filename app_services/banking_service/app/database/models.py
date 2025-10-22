"""
Database models for Banking Service
"""
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class MastercardCustomer(Base):
    """Mastercard customer mapping"""
    __tablename__ = "mastercard_customers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False, unique=True, index=True)
    mastercard_customer_id = Column(String(255), nullable=False, unique=True)
    username = Column(String(255))
    status = Column(String(50), default="active")
    extra_data = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class LinkedBankAccount(Base):
    """Linked bank accounts"""
    __tablename__ = "linked_bank_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False, index=True)
    mastercard_customer_id = Column(String(255), nullable=False)
    mastercard_account_id = Column(String(255), nullable=False, unique=True)
    
    # Account Details
    account_name = Column(String(255))
    account_number_encrypted = Column(Text)  # Encrypted full account number
    account_number_masked = Column(String(50))  # Display only: ****1234
    account_type = Column(String(50))  # checking, savings, credit_card
    
    # Institution Details
    institution_id = Column(String(255))
    institution_name = Column(String(255))
    institution_logo_url = Column(Text)
    
    # Balance Information
    current_balance = Column(Numeric(15, 2))
    available_balance = Column(Numeric(15, 2))
    currency = Column(String(3), default="USD")
    
    # Additional Metadata
    routing_number = Column(String(50))
    account_holder_name = Column(String(255))
    last_updated_at = Column(DateTime(timezone=True))
    
    # Status & Permissions
    status = Column(String(50), default="active")  # active, inactive, error
    consent_granted_at = Column(DateTime(timezone=True))
    consent_expires_at = Column(DateTime(timezone=True))
    
    # Flags
    is_primary = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_method = Column(String(50))  # instant, micro_deposit
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_user_status', 'user_id', 'status'),
        Index('idx_mastercard_customer', 'mastercard_customer_id'),
    )


class AccountConnectionLog(Base):
    """Log of account connection attempts"""
    __tablename__ = "account_connection_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False, index=True)
    action = Column(String(50), nullable=False)
    institution_id = Column(String(255))
    institution_name = Column(String(255))
    status = Column(String(50))
    error_message = Column(Text)
    ip_address = Column(String(50))
    user_agent = Column(Text)
    extra_data = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
