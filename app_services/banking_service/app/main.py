"""
Banking Service - Main Application
Handles bank account linking via Mastercard Open Finance
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.api.v1 import bank_accounts
from app.schemas import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Banking Service",
    version=settings.SERVICE_VERSION,
    description="Bank account linking and management via Mastercard Open Finance",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Starting {settings.SERVICE_NAME} v{settings.SERVICE_VERSION}")
    logger.info(f"Mastercard API: {settings.MASTERCARD_BASE_URL}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info(f"Shutting down {settings.SERVICE_NAME}")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    
    Used by Docker health checks and monitoring systems
    """
    return HealthResponse(
        status="healthy",
        service=settings.SERVICE_NAME,
        version=settings.SERVICE_VERSION,
        database="connected",
        cache="connected"
    )


@app.get("/")
async def root():
    """
    Root endpoint with service information
    """
    return {
        "service": "Banking Service",
        "version": settings.SERVICE_VERSION,
        "description": "Bank account linking and management",
        "documentation": "/docs",
        "health": "/health",
        "endpoints": {
            "connect": "POST /api/v1/{user_id}/bank-accounts/connect",
            "callback": "GET /api/v1/{user_id}/bank-accounts/callback",
            "list": "GET /api/v1/{user_id}/bank-accounts",
            "get": "GET /api/v1/{user_id}/bank-accounts/{account_id}",
            "refresh": "POST /api/v1/{user_id}/bank-accounts/{account_id}/refresh",
            "unlink": "DELETE /api/v1/{user_id}/bank-accounts/{account_id}",
            "set_primary": "POST /api/v1/{user_id}/bank-accounts/{account_id}/set-primary"
        }
    }


# Include API routers
app.include_router(
    bank_accounts.router,
    prefix=f"{settings.API_V1_PREFIX}",
    tags=["bank-accounts"]
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=True,  # Enable for development
        log_level="info"
    )
