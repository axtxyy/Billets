"""
Amenities router for Billets Hotel Booking System.

This router handles amenity management.

Why this file exists:
- Provides dedicated endpoints for amenity CRUD
- Separates amenity management from rooms

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations

Endpoints:
- GET /api/amenities - List amenities (public)
- GET /api/amenities/{amenity_id} - Get amenity details
- POST /api/amenities - Create amenity (admin)
- PUT /api/amenities/{amenity_id} - Update amenity (admin)
- DELETE /api/amenities/{amenity_id} - Delete amenity (admin)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user, get_optional_current_user
from app.models import Amenity
from app.schemas import (
    AmenityCreate,
    AmenityUpdate,
    AmenityResponse,
)
from app.utils import success_response, build_paginated_response


router = APIRouter()


@router.get("", response_model=dict, summary="List amenities")
def list_amenities(
    page: int = 1,
    size: int = 20,
    category: Optional[str] = None,
    is_active: bool = True,
    current_user: Optional[object] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    List all amenities with filtering.
    
    Public endpoint.
    """
    # Non-admin users only see active amenities
    if not current_user or current_user.role != "admin":
        is_active = True
    
    query = db.query(Amenity)
    
    if is_active is not None:
        query = query.filter(Amenity.is_active == is_active)
    if category:
        query = query.filter(Amenity.category == category)
    
    total = query.count()
    amenities = query.order_by(Amenity.name).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(amenities, total, page, size),
        message="Amenities retrieved",
    )


@router.get("/categories", response_model=dict, summary="Get amenity categories")
def get_amenity_categories(db: Session = Depends(get_db)):
    """
    Get list of all amenity categories.
    """
    categories = db.query(Amenity.category).filter(
        Amenity.category.isnot(None),
        Amenity.is_active == True
    ).distinct().all()
    
    category_list = [c[0] for c in categories if c[0]]
    
    return success_response(data=category_list, message="Categories retrieved")


@router.get("/{amenity_id}", response_model=dict, summary="Get amenity details")
def get_amenity(
    amenity_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed amenity information.
    """
    amenity = db.query(Amenity).filter(Amenity.id == amenity_id).first()
    if not amenity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Amenity not found",
        )
    
    return success_response(data=amenity, message="Amenity retrieved")


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Create amenity (admin)")
def create_amenity(
    amenity_data: AmenityCreate,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new amenity (admin only).
    """
    # Check if name already exists
    existing = db.query(Amenity).filter(Amenity.name == amenity_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amenity with this name already exists",
        )
    
    amenity = Amenity(**amenity_data.model_dump())
    db.add(amenity)
    db.commit()
    db.refresh(amenity)
    
    return success_response(data=amenity, message="Amenity created")


@router.put("/{amenity_id}", response_model=dict, summary="Update amenity (admin)")
def update_amenity(
    amenity_id: int,
    amenity_data: AmenityUpdate,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update an amenity (admin only).
    """
    amenity = db.query(Amenity).filter(Amenity.id == amenity_id).first()
    if not amenity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Amenity not found",
        )
    
    update_data = amenity_data.model_dump(exclude_unset=True)
    
    # Check name uniqueness if changed
    if "name" in update_data and update_data["name"] != amenity.name:
        existing = db.query(Amenity).filter(Amenity.name == update_data["name"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amenity with this name already exists",
            )
    
    for field, value in update_data.items():
        setattr(amenity, field, value)
    
    db.commit()
    db.refresh(amenity)
    
    return success_response(data=amenity, message="Amenity updated")


@router.delete("/{amenity_id}", summary="Delete amenity (admin)")
def delete_amenity(
    amenity_id: int,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete an amenity (admin only).
    """
    amenity = db.query(Amenity).filter(Amenity.id == amenity_id).first()
    if not amenity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Amenity not found",
        )
    
    db.delete(amenity)
    db.commit()
    
    return success_response(message="Amenity deleted")