"""
Authentication module for Billets Hotel Booking System.

This module handles JWT token creation, validation, and password hashing.

Why this file exists:
- Centralizes all authentication logic
- Handles password hashing with bcrypt
- Creates and validates JWT access/refresh tokens
- Provides functions for user authentication

How it connects to the project:
- Used by auth router for login/register endpoints
- Used by dependencies.py for getting current user
- Used by services that need to verify tokens
- Uses settings from config.py for secret key and algorithm

Security Considerations:
- Uses bcrypt for password hashing (industry standard)
- JWT tokens with HS256 algorithm
- Access tokens expire quickly (30 min default)
- Refresh tokens last longer (7 days default)
- Tokens include user_id, email, role for authorization
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status

from app.config import settings
from app.schemas import TokenData, UserRole


# Password hashing context
# bcrypt is the recommended algorithm for password hashing
# rounds=12 provides good security without being too slow
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
        
    Example:
        >>> hash_password("MySecurePass123!")
        '$2b$12$...'
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.
    
    Args:
        plain_password: Plain text password to check
        hashed_password: Stored hashed password
        
    Returns:
        bool: True if password matches, False otherwise
        
    Example:
        >>> verify_password("MySecurePass123!", "$2b$12$...")
        True
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in token (user_id, email, role)
        expires_delta: Optional custom expiration time
        
    Returns:
        str: Encoded JWT token
        
    Example:
        >>> create_access_token({"user_id": 1, "email": "user@example.com", "role": "guest"})
        'eyJhbGciOiJIUzI1NiIs...'
    """
    to_encode = data.copy()
    
    # Calculate expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    
    # Encode token with secret key and algorithm
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT refresh token.
    
    Refresh tokens are longer-lived and used to get new access tokens
    without requiring the user to log in again.
    
    Args:
        data: Data to encode in token (user_id, email, role)
        expires_delta: Optional custom expiration time
        
    Returns:
        str: Encoded JWT refresh token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def create_token_pair(user_id: int, email: str, role: UserRole) -> tuple[str, str]:
    """
    Create both access and refresh tokens for a user.
    
    This is a convenience function used during login.
    
    Args:
        user_id: User's database ID
        email: User's email
        role: User's role
        
    Returns:
        tuple: (access_token, refresh_token)
    """
    token_data = {
        "user_id": user_id,
        "email": email,
        "role": role.value
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return access_token, refresh_token


def decode_token(token: str) -> TokenData:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        TokenData: Decoded token data
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract token data
        user_id: int = payload.get("user_id")
        email: str = payload.get("email")
        role: str = payload.get("role")
        exp: int = payload.get("exp")
        token_type: str = payload.get("type")
        
        if user_id is None or email is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing required fields",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(
            user_id=user_id,
            email=email,
            role=UserRole(role),
            exp=datetime.utcfromtimestamp(exp) if exp else None
        )
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_refresh_token(token: str) -> TokenData:
    """
    Decode and validate a refresh token specifically.
    
    Args:
        token: JWT refresh token string
        
    Returns:
        TokenData: Decoded token data
        
    Raises:
        HTTPException: If token is invalid, expired, or not a refresh token
    """
    token_data = decode_token(token)
    
    # Verify it's a refresh token
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type: expected refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token_data


def authenticate_user(email: str, password: str, db) -> Optional[object]:
    """
    Authenticate a user with email and password.
    
    This function:
    1. Finds user by email
    2. Verifies password
    3. Returns user if valid, None otherwise
    
    Args:
        email: User's email
        password: Plain text password
        db: Database session
        
    Returns:
        User object if authentication successful, None otherwise
    """
    from app.models import User
    
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user


def get_current_user_id(token: str) -> int:
    """
    Extract user ID from token without full validation.
    
    Used for quick checks where full user object isn't needed.
    
    Args:
        token: JWT token
        
    Returns:
        int: User ID
    """
    token_data = decode_token(token)
    return token_data.user_id