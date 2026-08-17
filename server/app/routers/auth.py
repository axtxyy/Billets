"""
Authentication router for Billets Hotel Booking System.

This router handles user registration, login, token refresh, and password management.

Why this file exists:
- Provides authentication endpoints (register, login, logout)
- Handles JWT token creation and refresh
- Manages user sessions

How it connects to the project:
- Uses auth.py for token creation/validation
- Uses dependencies.py for database session
- Uses schemas.py for request/response validation
- Uses models.py for User database model

Endpoints:
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login and get tokens
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Logout (client-side token removal)
- GET /api/auth/me - Get current user profile
- PUT /api/auth/me - Update current user profile
- POST /api/auth/forgot-password - Request password reset (optional)
- POST /api/auth/reset-password - Reset password with token (optional)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.auth import (
    hash_password,
    verify_password,
    create_token_pair,
    decode_refresh_token,
    authenticate_user,
)
from app.dependencies import get_current_user
from app.models import User, UserRole
from app.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    Token,
    TokenData,
    RefreshTokenRequest,
    MessageResponse,
    UserResponse as UserResponseSchema,
)
from app.utils import success_response, error_response


router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register new user")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a new user with the provided email, password, and profile information.
    Password is hashed before storage.
    
    **Request Body:**
    ```json
    {
        "email": "user@example.com",
        "password": "SecurePass123!",
        "full_name": "John Doe",
        "phone": "+1234567890",
        "date_of_birth": "1990-01-01",
        "address": "123 Main St",
        "city": "New York",
        "country": "USA",
        "postal_code": "10001"
    }
    ```
    
    **Response (201):**
    ```json
    {
        "success": true,
        "message": "User registered successfully",
        "data": {
            "id": 1,
            "email": "user@example.com",
            "full_name": "John Doe",
            "phone": "+1234567890",
            "role": "guest",
            "is_active": true,
            "is_verified": false,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    }
    ```
    
    **Errors:**
    - 400: Email already registered
    - 422: Validation error (invalid email, weak password, etc.)
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        date_of_birth=user_data.date_of_birth,
        address=user_data.address,
        city=user_data.city,
        country=user_data.country,
        postal_code=user_data.postal_code,
        role=UserRole.GUEST,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    from app.schemas import UserResponse as UserResponseSchema
    return UserResponseSchema.model_validate(user)


@router.post("/login", response_model=Token, summary="Login user")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return access/refresh tokens.
    
    **Request Body:**
    ```json
    {
        "email": "user@example.com",
        "password": "SecurePass123!"
    }
    ```
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Login successful",
        "data": {
            "access_token": "eyJhbGciOiJIUzI1NiIs...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
            "token_type": "bearer",
            "expires_in": 1800
        }
    }
    ```
    
    **Errors:**
    - 401: Invalid email or password
    - 403: Account deactivated
    """
    user = authenticate_user(credentials.email, credentials.password, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    
    # Create token pair
    access_token, refresh_token = create_token_pair(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=1800,
    )


@router.post("/refresh", response_model=Token, summary="Refresh access token")
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Get a new access token using a refresh token.
    
    **Request Body:**
    ```json
    {
        "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
    }
    ```
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Token refreshed successfully",
        "data": {
            "access_token": "eyJhbGciOiJIUzI1NiIs...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
            "token_type": "bearer",
            "expires_in": 1800
        }
    }
    ```
    
    **Errors:**
    - 401: Invalid or expired refresh token
    """
    # Decode and validate refresh token
    token_data = decode_refresh_token(request.refresh_token)
    
    # Verify user still exists and is active
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Create new token pair
    access_token, new_refresh_token = create_token_pair(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=1800,
    )


@router.post("/logout", response_model=MessageResponse, summary="Logout user")
def logout():
    """
    Logout user (client-side token removal).
    
    Since JWT tokens are stateless, logout is handled client-side by
    deleting the tokens. This endpoint exists for API consistency
    and can be extended for token blacklisting in the future.
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Logged out successfully"
    }
    ```
    """
    return success_response(message="Logged out successfully")


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get the profile of the currently authenticated user.
    
    Requires valid access token in Authorization header.
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "User profile retrieved",
        "data": {
            "id": 1,
            "email": "user@example.com",
            "full_name": "John Doe",
            "phone": "+1234567890",
            "role": "guest",
            "is_active": true,
            "is_verified": true,
            "avatar_url": null,
            "last_login": "2024-01-01T00:00:00",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    }
    ```
    """
    return UserResponseSchema.model_validate(current_user)


@router.put("/me", response_model=UserResponse, summary="Update current user profile")
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the currently authenticated user's profile.
    
    Users can update their own profile information.
    Email and password cannot be changed here (separate endpoints).
    
    **Request Body:**
    ```json
    {
        "full_name": "John Smith",
        "phone": "+1987654321",
        "address": "456 Oak Ave",
        "city": "Los Angeles",
        "country": "USA",
        "postal_code": "90001"
    }
    ```
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Profile updated successfully",
        "data": { ... updated user object ... }
    }
    """
    # Update only provided fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponseSchema.model_validate(current_user)


@router.post("/change-password", response_model=MessageResponse, summary="Change password")
def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change the current user's password.
    
    **Request Body:**
    ```json
    {
        "current_password": "OldPass123!",
        "new_password": "NewPass456!"
    }
    ```
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Password changed successfully"
    }
    ```
    
    **Errors:**
    - 400: Current password incorrect
    - 422: New password doesn't meet requirements
    """
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    
    # Validate new password (same rules as registration)
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters",
        )
    
    # Check complexity
    has_upper = any(c.isupper() for c in new_password)
    has_lower = any(c.islower() for c in new_password)
    has_digit = any(c.isdigit() for c in new_password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in new_password)
    
    if not (has_upper and has_lower and has_digit and has_special):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must contain uppercase, lowercase, digit, and special character",
        )
    
    # Hash and update
    current_user.hashed_password = hash_password(new_password)
    db.commit()
    
    return success_response(message="Password changed successfully")


# ============================================================================
# Admin-only endpoints
# ============================================================================

@router.get("/users", summary="List all users (admin only)")
def list_users(
    page: int = 1,
    size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all users (admin only).
    
    Requires admin role.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    query = db.query(User)
    total = query.count()
    users = query.offset((page - 1) * size).limit(size).all()
    
    from app.utils import build_paginated_response
    return success_response(
        data=build_paginated_response(users, total, page, size),
        message="Users retrieved",
    )


@router.put("/users/{user_id}/role", response_model=UserResponse, summary="Update user role (admin only)")
def update_user_role(
    user_id: int,
    role: UserRole,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a user's role (admin only).
    
    **Request Body:**
    ```json
    {
        "role": "staff"
    }
    ```
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.role = role
    db.commit()
    db.refresh(user)
    
    return success_response(data=user, message="User role updated")