from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Service Configuration
    SERVICE_NAME: str = "banking_service"
    SERVICE_PORT: int = 8007
    SERVICE_VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/banking_db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Redis Cache
    REDIS_URL: str = "redis://:redis-secret@redis:6379/6"
    CACHE_TTL_SECONDS: int = 300  # 5 minutes
    
    # DynamoDB
    DYNAMODB_ENDPOINT: str = "http://dynamodb-local:8000"
    
    # Mastercard Open Finance
    MASTERCARD_PARTNER_ID: Optional[str] = None
    MASTERCARD_PARTNER_SECRET: Optional[str] = None
    MASTERCARD_APP_KEY: Optional[str] = None
    # The sandbox vs production is determined by your credentials/account type
    MASTERCARD_BASE_URL: str = "https://api.finicity.com"
    MASTERCARD_CONNECT_URL: str = "https://connect2.finicity.com"
    
    # Security
    ENCRYPTION_KEY: Optional[str] = None  # For encrypting sensitive data
    JWT_SECRET_KEY: Optional[str] = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    
    # OpenTelemetry
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://otel-collector:4318"
    OTEL_SERVICE_NAME: str = "banking-service"
    
    # Kafka/Redpanda
    KAFKA_BOOTSTRAP_SERVERS: str = "redpanda:9092"
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list = ["*"]  # Configure for production
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
