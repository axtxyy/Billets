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
    DATABASE_URL: str = "sqlite:///./billets.db"
    
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
    
    # Hotel Info
    HOTEL_NAME: str = "Billet, Mangalore"
    HOTEL_TAGLINE: str = "Budget Hostel near Surathkal Beach"
    HOTEL_DESCRIPTION: str = "Located just 150 meters from the pristine sands of Surathkal Beach—one of the cleanest stretches of coastline you'll ever find—Billet offers affordable, clean and comfortable stays with a vibrant community vibe."
    HOTEL_LOGO: str = "/favicon.svg"
    HOTEL_HERO_IMAGE: str = "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg"
    HOTEL_ADDRESS_LINE1: str = "Dodda Kopla, Surathkal"
    HOTEL_ADDRESS_LINE2: str = "Billet, Mangaluru, Karnataka 575014"
    HOTEL_CITY: str = "Mangalore"
    HOTEL_STATE: str = "Karnataka"
    HOTEL_COUNTRY: str = "India"
    HOTEL_PINCODE: str = "575014"
    HOTEL_PHONE: str = "+91 98765 43210"
    HOTEL_EMAIL: str = "stay@billetmangalore.com"
    HOTEL_CHECK_IN: str = "14:00"
    HOTEL_CHECK_OUT: str = "11:00"
    HOTEL_POLICIES: List[str] = [
        "Unmarried couples allowed. Local IDs accepted.",
        "Primary guest must be at least 18 years old.",
        "Groups with only male guests are allowed.",
        "Passport, Aadhaar, Driving License, Govt. ID accepted.",
        "Pets are not allowed.",
    ]
    HOTEL_AMENITIES: List[str] = [
        "Free Wi‑Fi",
        "Kitchenette access",
        "Parking",
        "Power backup",
        "Hot & cold water",
        "Electronic safe",
        "Mineral water",
        "Toiletries",
    ]
    HOTEL_NEARBY: List[str] = [
        "Surathkal Beach:1.5 km",
        "Mangalore International Airport:17.8 km",
        "Surathkal Railway Station:3.8 km",
        "Mangalore Central Railway Station:19 km",
    ]
    HOTEL_SOCIAL_FACEBOOK: str = "https://facebook.com/billetmangalore"
    HOTEL_SOCIAL_INSTAGRAM: str = "https://instagram.com/billetmangalore"
    HOTEL_SOCIAL_TWITTER: str = "https://twitter.com/billetmangalore"
    HOTEL_MAP_EMBED_URL: str = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.123456789!2d74.795!3d13.018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba35b1c2d3e4f5f%3A0x123456789abcdef!2sBillet%2C%20Mangalore!5e0!3m2!1sen!2sin!4v1234567890"
    
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