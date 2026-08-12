"""
Configuration module for Billets Hotel Booking System.

This module loads all environment variables and provides a centralized
configuration object for the entire application.

Why this file exists:
- Centralizes all configuration in one place
- Uses python-dotenv to load from .env file
- Provides type-safe access to environment variables
- Makes it easy to change settings without modifying code

How it connects to the project:
- Imported by database.py for database URL
- Imported by auth.py for JWT secret and algorithm
- Imported by main.py for CORS origins
- Imported by services for payment API keys
"""

import os
from pathlib import Path
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    BaseSettings automatically reads from .env file and environment variables.
    All fields are optional with defaults, but some are required for production.
    """
    
    # Application
    APP_NAME: str = "Billets Hotel Booking System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/billets"
    
    # JWT Authentication
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Password hashing
    BCRYPT_ROUNDS: int = 12
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # File upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]
    
    # Payment gateways (optional - for future integration)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # Email (optional - for notifications)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@billets.com"
    
    # Frontend URL (for email links)
    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Using lru_cache ensures we only create one Settings instance
    and reuse it across the application (singleton pattern).
    
    Returns:
        Settings: Application settings instance
    """
    return Settings()


# Create a global settings instance for easy access
settings = get_settings()

# Ensure upload directory exists
UPLOAD_PATH = Path(settings.UPLOAD_DIR)
UPLOAD_PATH.mkdir(parents=True, exist_ok=True)