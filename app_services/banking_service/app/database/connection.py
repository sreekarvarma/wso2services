"""Database connection management"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.config import settings

# Create database engine
# Use postgresql+psycopg for psycopg3
database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")

engine = create_engine(
    database_url,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,  
    echo=False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """
    Dependency for getting database session
    
    Usage in FastAPI:
    ```python
    @router.get("/")
    async def my_endpoint(db: Session = Depends(get_db)):
        # Use db here
        pass
    ```
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
