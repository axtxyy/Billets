"""
Database module for Billets Hotel Booking System.

This module sets up SQLAlchemy database connection and session management.

Why this file exists:
- Creates the database engine and session factory
- Provides a dependency for getting database sessions in routes
- Handles connection pooling and lifecycle

How it connects to the project:
- Used by all routers and services to get database sessions
- Models import Base from here for table creation
- Main app uses it for startup/shutdown events

Key concepts:
- Engine: Manages connections to the database
- Session: Represents a transaction with the database
- Base: Base class for all ORM models
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import NullPool
from contextlib import contextmanager
from typing import Generator

from app.config import settings


# Create the database engine
# pool_pre_ping=True verifies connections before using them
# pool_recycle=3600 recycles connections after 1 hour
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    # Use NullPool for testing to avoid connection issues
    poolclass=NullPool if settings.ENVIRONMENT == "testing" else None,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
)

# Create session factory
# autocommit=False: we manually commit transactions
# autoflush=False: we manually flush changes
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)

# Base class for all models
# All model classes will inherit from this
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency for getting a database session.
    
    This is used with Depends() in route functions.
    The session is automatically closed after the request.
    
    Yields:
        Session: Database session
        
    Example usage in a route:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for getting a database session outside of FastAPI routes.
    
    Use this in scripts, services, or background tasks where you need
    a database session but don't have access to FastAPI's dependency injection.
    
    Yields:
        Session: Database session
        
    Example usage:
        with get_db_context() as db:
            user = db.query(User).first()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize the database by creating all tables.
    
    This creates tables for all models that inherit from Base.
    Called during application startup.
    
    Note: In production, use Alembic migrations instead of this.
    This is mainly for development and testing.
    """
    # Import all models to register them with Base
    from app import models  # noqa: F401
    
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """
    Drop all tables from the database.
    
    WARNING: This deletes all data! Only use in testing.
    """
    Base.metadata.drop_all(bind=engine)