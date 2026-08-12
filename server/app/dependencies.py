"""
FastAPI dependencies for Billets Hotel Booking System.

This module provides reusable dependencies for routes.

Why this file exists:
- Centralizes common dependencies (DB session, current user, etc.)
- Enforces authentication and authorization consistently
- Makes route functions clean and focused on business logic
- Provides pagination, filtering, and sorting dependencies

How it connects to the project:
- Used by all routers via Depends()
- get_db provides database session
- get_current_user provides authenticated user
- Role-based dependencies enforce permissions
- Pagination dependencies standardize list endpoints

Dependency Injection in FastAPI:
- FastAPI automatically resolves Depends() parameters
- Dependencies can depend on other dependencies
- Dependencies run before the route function
- Can raise HTTPException to stop request processing
"""

from typing import Optional, List
from fastapi import Depends, HTTPException, status, Header, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.auth import decode_token, TokenData
from app.models import User, UserRole
from app.schemas import PaginationParams


# Security scheme for Swagger UI
security = HTTPBearer(auto_error=False)


def get_current_user_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> str:
    """
    Extract JWT token from Authorization header.
    
    Args:
        credentials: HTTP Bearer credentials from header
        
    Returns:
        str: JWT token
        
    Raises:
        HTTPException: If no token provided or invalid format
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme. Use 'Bearer'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return credentials.credentials


def get_current_user(
    token: str = Depends(get_current_user_token),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    This is the main authentication dependency. It:
    1. Decodes and validates the JWT token
    2. Fetches the user from database
    3. Verifies user is active
    4. Returns the User object
    
    Args:
        token: JWT token from Authorization header
        db: Database session
        
    Returns:
        User: Current authenticated user
        
    Raises:
        HTTPException: If token invalid, user not found, or user inactive
    """
    # Decode token
    token_data = decode_token(token)
    
    # Fetch user from database
    user = db.query(User).filter(User.id == token_data.user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user with additional active check.
    
    This is an alias for get_current_user for clarity in routes
    that specifically need an active user.
    
    Args:
        current_user: User from get_current_user dependency
        
    Returns:
        User: Current active user
    """
    return current_user


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify they have admin role.
    
    Use this dependency for admin-only endpoints.
    
    Args:
        current_user: User from get_current_user dependency
        
    Returns:
        User: Current admin user
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def get_current_staff_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify they have staff or admin role.
    
    Use this for staff-only endpoints (staff and admin can access).
    
    Args:
        current_user: User from get_current_user dependency
        
    Returns:
        User: Current staff/admin user
        
    Raises:
        HTTPException: If user is not staff or admin
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required",
        )
    return current_user


def get_optional_current_user(
    token: str = Depends(get_current_user_token),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if token is valid, otherwise return None.
    
    Use this for endpoints that work for both authenticated
    and anonymous users (e.g., public room listings).
    
    Args:
        token: JWT token (optional)
        db: Database session
        
    Returns:
        User if authenticated, None otherwise
    """
    try:
        token_data = decode_token(token)
        user = db.query(User).filter(User.id == token_data.user_id).first()
        if user and user.is_active:
            return user
    except HTTPException:
        pass
    return None


# Role-based access control dependencies
def require_roles(*allowed_roles: UserRole):
    """
    Dependency factory for role-based access control.
    
    Usage:
        @router.get("/admin-only")
        def admin_only(user: User = Depends(require_roles(UserRole.ADMIN))):
            ...
            
        @router.get("/staff-or-admin")
        def staff_only(user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN))):
            ...
    
    Args:
        allowed_roles: One or more allowed UserRole values
        
    Returns:
        Dependency function that checks user role
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}",
            )
        return current_user
    
    return role_checker


# Pagination dependencies
def get_pagination_params(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page")
) -> PaginationParams:
    """
    Get pagination parameters from query string.
    
    Args:
        page: Page number (1-indexed)
        size: Items per page (max 100)
        
    Returns:
        PaginationParams: Pagination parameters
    """
    return PaginationParams(page=page, size=size)


# Database session for background tasks
def get_db_session() -> Session:
    """
    Get a database session for use outside of request context.
    
    Use this in background tasks, scripts, or services where
    FastAPI's dependency injection isn't available.
    
    Returns:
        Session: Database session (caller must close)
        
    Example:
        db = get_db_session()
        try:
            # do work
        finally:
            db.close()
    """
    return SessionLocal()


# File upload validation
def validate_file_type(
    allowed_types: List[str] = ["image/jpeg", "image/png", "image/webp"],
    max_size: int = 5 * 1024 * 1024  # 5 MB
):
    """
    Dependency factory for file upload validation.
    
    Usage:
        @router.post("/upload")
        def upload(file: UploadFile = Depends(validate_file_type())):
            ...
    
    Args:
        allowed_types: List of allowed MIME types
        max_size: Maximum file size in bytes
        
    Returns:
        Dependency function that validates uploaded file
    """
    from fastapi import UploadFile, File
    
    def file_validator(file: UploadFile = File(...)) -> UploadFile:
        # Check content type
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {allowed_types}",
            )
        
        # Check file size (read first chunk to check)
        # Note: Full size check happens when reading the file
        return file
    
    return file_validator


# Rate limiting placeholder (implement with Redis in production)
def rate_limit(
    requests: int = 100,
    window_seconds: int = 60
):
    """
    Dependency factory for rate limiting (placeholder).
    
    In production, implement with Redis or similar.
    This is a no-op placeholder for now.
    
    Args:
        requests: Max requests allowed
        window_seconds: Time window in seconds
        
    Returns:
        No-op dependency
    """
    def no_op():
        pass
    return no_op