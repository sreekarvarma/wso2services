-- Banking Service Database Schema
-- Create banking_db database and tables for bank account management

-- ============================================================================
-- Database Creation
-- ============================================================================

-- Run this first to create the database
-- CREATE DATABASE banking_db;
-- GRANT ALL PRIVILEGES ON DATABASE banking_db TO wso2carbon;

-- ============================================================================
-- Tables
-- ============================================================================

-- Mastercard customers table
CREATE TABLE IF NOT EXISTS mastercard_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    mastercard_customer_id VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    extra_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_mc_customers_user_id ON mastercard_customers(user_id);

-- Linked bank accounts table
CREATE TABLE IF NOT EXISTS linked_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    mastercard_customer_id VARCHAR(255) NOT NULL,
    mastercard_account_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Account Details
    account_name VARCHAR(255),
    account_number_encrypted TEXT,
    account_number_masked VARCHAR(50),
    account_type VARCHAR(50),
    
    -- Institution Details
    institution_id VARCHAR(255),
    institution_name VARCHAR(255),
    institution_logo_url TEXT,
    
    -- Balance Information
    current_balance NUMERIC(15, 2),
    available_balance NUMERIC(15, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Additional Metadata
    routing_number VARCHAR(50),
    account_holder_name VARCHAR(255),
    last_updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Status & Permissions
    status VARCHAR(50) DEFAULT 'active',
    consent_granted_at TIMESTAMP WITH TIME ZONE,
    consent_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Flags
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(50),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_id ON linked_bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_status ON linked_bank_accounts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_mc_customer ON linked_bank_accounts(mastercard_customer_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_deleted ON linked_bank_accounts(deleted_at) WHERE deleted_at IS NULL;

-- Account connection logs table
CREATE TABLE IF NOT EXISTS account_connection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    institution_id VARCHAR(255),
    institution_name VARCHAR(255),
    status VARCHAR(50),
    error_message TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    extra_data JSONB,  -- Renamed from metadata (SQLAlchemy reserved word)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for user activity tracking
CREATE INDEX IF NOT EXISTS idx_connection_logs_user_id ON account_connection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_logs_created_at ON account_connection_logs(created_at DESC);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE mastercard_customers IS 'Maps internal user IDs to Mastercard customer IDs';
COMMENT ON TABLE linked_bank_accounts IS 'Stores linked bank account information';
COMMENT ON TABLE account_connection_logs IS 'Audit log of account connection attempts';

COMMENT ON COLUMN linked_bank_accounts.account_number_encrypted IS 'Full account number (encrypted)';
COMMENT ON COLUMN linked_bank_accounts.account_number_masked IS 'Masked for display: ****1234';
COMMENT ON COLUMN linked_bank_accounts.is_primary IS 'Primary funding source for the user';
COMMENT ON COLUMN linked_bank_accounts.deleted_at IS 'Soft delete timestamp';

-- ============================================================================
-- Sample Data (for testing only)
-- ============================================================================

-- Uncomment for development/testing
-- INSERT INTO mastercard_customers (user_id, mastercard_customer_id, username, status)
-- VALUES ('test_user_123', 'mc_customer_456', 'testuser', 'active');
