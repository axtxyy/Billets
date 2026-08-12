"""
Users router for Billets Hotel Booking System.

This router handles user profile management and admin user operations.

Why this file exists:
- Provides endpoints for user profile CRUD
- Admin endpoints for user management
- Separates user management from authentication

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations

Endpoints:
- GET /api/users/me - Get current user (same as auth/me)
- PUT /api/users/me - Update current user profile
- GET /api/users/{user_id} - Get user by ID (admin)
- PUT /api/users/{user_id} - Update user (admin)
- DELETE /api/users/{user_id} - Delete user (admin)
- GET /api/users - List users with pagination (admin)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user
from app.models import User, UserRole
from app.schemas import UserResponse, UserUpdate, UserUpdateAdmin, PaginationParams
from app.utils import success_response, build_paginated_response


router = APIRouter()


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    
    This is an alias for /api/auth/me for RESTful resource organization.
    """
    return success_response(data=current_user, message="Profile retrieved")


@router.put("/me", response_model=UserResponse, summary="Update current user profile")
def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's profile.
    
    Users can update their own profile information.
    """
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return success_response(data=current_user, message="Profile updated")


@router.delete("/me", response_model=dict, summary="Deactivate current user account")
def deactivate_my_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deactivate the current user's account.
    
    This soft-deletes the account by setting is_active=False.
    User can be reactivated by admin.
    """
    current_user.is_active = False
    db.commit()
    
    return success_response(message="Account deactivated successfully")


# ============================================================================
# Admin-only endpoints
# ============================================================================

@router.get("", summary="List all users (admin)")
def list_users(
    page: int = 1,
    size: int = 20,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all users with filtering and pagination (admin only).
    
    **Query Parameters:**
    - page: Page number (default: 1)
    - size: Items per page (default: 20, max: 100)
    - role: Filter by role (guest, staff, admin)
    - is_active: Filter by active status
    - search: Search in email, name, phone
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Users retrieved",
        "data": {
            "items": [...],
            "total": 100,
            "page": 1,
            "size": 20,
            "pages": 5
        }
    }
    """
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_term)) |
            (User.full_name.ilike(search_term)) |
            (User.phone.ilike(search_term))
        )
    
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(users, total, page, size),
        message="Users retrieved",
    )


@router.get("/{user_id}", response_model=UserResponse, summary="Get user by ID (admin)")
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific user by ID (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return success_response(data=user, message="User retrieved")


@router.put("/{user_id}", response_model=UserResponse, summary="Update user (admin)")
def update_user(
    user_id: int,
    user_update: UserUpdateAdmin,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a user's information (admin only).
    
    Admins can update any user's profile, role, and active status.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent admin from demoting themselves
    if user.id == current_user.id and user_update.role and user_update.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own admin role",
        )
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return success_response(data=user, message="User updated")


@router.delete("/{user_id}", summary="Delete user (admin)")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a user (admin only).
    
    This permanently deletes the user and all associated data.
    Use with caution.
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    db.delete(user)
    db.commit()
    
    return success_response(message="User deleted successfully")


@router.post("/{user_id}/activate", response_model=UserResponse, summary="Activate user (admin)")
def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Activate a deactivated user (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    
    return success_response(data=user, message="User activated")


@router.post("/{user_id}/deactivate", response_model=UserResponse, summary="Deactivate user (admin)")
def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Deactivate a user (admin only).
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    
    return success_response(data=user, message="User deactivated")