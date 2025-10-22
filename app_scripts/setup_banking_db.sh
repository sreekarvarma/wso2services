#!/bin/bash

# Banking Service Database Setup Script
# This script initializes the banking service database schema

set -e

echo "🏦 Banking Service Database Setup"
echo "=================================="
echo ""

# Check if postgres container is running
if ! docker ps | grep -q postgres-wso2; then
    echo "Error: PostgreSQL container is not running"
    echo "Please start it with: docker compose up -d postgres"
    exit 1
fi

echo "✓ PostgreSQL container is running"
echo ""

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if banking_db exists
DB_EXISTS=$(docker exec postgres-wso2 psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='banking_db'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
    echo "✓ Database 'banking_db' already exists"
else
    echo "Database 'banking_db' does not exist"
    echo "It should have been created automatically on first startup"
    echo "Creating it now..."
    docker exec postgres-wso2 psql -U postgres -c "CREATE DATABASE banking_db;"
    docker exec postgres-wso2 psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE banking_db TO wso2carbon;"
    echo "✓ Database created"
fi

echo ""
echo "📋 Applying database migrations..."
echo ""

# Apply the migration
docker exec -i postgres-wso2 psql -U postgres -d banking_db < app_services/banking_service/app/database/migrations/001_init_banking_schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Database schema applied successfully"
    echo ""
    
    # Verify tables were created
    echo "📊 Verifying tables..."
    TABLES=$(docker exec postgres-wso2 psql -U postgres -d banking_db -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")
    
    if [ "$TABLES" = "3" ]; then
        echo "✓ All 3 tables created successfully:"
        docker exec postgres-wso2 psql -U postgres -d banking_db -c "\dt"
        echo ""
        echo "Banking service database is ready!"
        echo ""
        echo "Next steps:"
        echo "1. Configure Mastercard credentials in .env file"
        echo "2. Build the service: docker compose build banking-service"
        echo "3. Start the service: docker compose up -d banking-service"
        echo "4. Check health: curl http://localhost:8007/health"
    else
        echo "Warning: Expected 3 tables, found $TABLES"
        echo "Please check the migration script"
    fi
else
    echo ""
    echo "Error applying database schema"
    echo "Please check the error messages above"
    exit 1
fi
