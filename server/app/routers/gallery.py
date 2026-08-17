"""
Gallery router for Billets Hotel Booking System.

This router handles hotel gallery image management.

Why this file exists:
- Provides endpoints for gallery CRUD operations
- Public endpoint for viewing gallery
- Admin endpoints for managing gallery images

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations
- Uses utils for file upload

Endpoints:
- GET /api/gallery - List gallery images (public)
- GET /api/gallery/{image_id} - Get image details
- POST /api/gallery - Upload image (admin)
- PUT /api/gallery/{image_id} - Update image (admin)
- DELETE /api/gallery/{image_id} - Delete image (admin)
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user, get_optional_current_user
from app.models import GalleryImage
from app.schemas import (
    GalleryImageCreate,
    GalleryImageUpdate,
    GalleryImageResponse,
)
from app.utils import (
    success_response,
    build_paginated_response,
    save_upload_file,
    generate_unique_filename,
    validate_file_extension,
    delete_file,
)
from app.config import settings


router = APIRouter()


@router.get("", response_model=dict, summary="List gallery images")
def list_gallery_images(
    page: int = 1,
    size: int = 20,
    category: Optional[str] = None,
    is_published: bool = True,
    current_user: Optional[object] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    List gallery images with pagination and filtering.
    
    Public endpoint - shows only published images.
    Admins see all images.
    """
    # Non-admin users only see published images
    if not current_user or current_user.role != "admin":
        is_published = True
    
    query = db.query(GalleryImage)
    
    if is_published is not None:
        query = query.filter(GalleryImage.is_published == is_published)
    if category:
        query = query.filter(GalleryImage.category == category)
    
    total = query.count()
    images = query.order_by(GalleryImage.display_order, GalleryImage.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    # Convert to response schemas
    image_responses = [GalleryImageResponse.model_validate(img) for img in images]
    
    return success_response(
        data=build_paginated_response(image_responses, total, page, size),
        message="Gallery images retrieved",
    )


@router.get("/categories", response_model=dict, summary="Get gallery categories")
def get_gallery_categories(db: Session = Depends(get_db)):
    """
    Get list of all gallery categories.
    """
    categories = db.query(GalleryImage.category).filter(
        GalleryImage.category.isnot(None),
        GalleryImage.is_published == True
    ).distinct().all()
    
    category_list = [c[0] for c in categories if c[0]]
    
    return success_response(data=category_list, message="Categories retrieved")


@router.get("/{image_id}", response_model=dict, summary="Get gallery image details")
def get_gallery_image(
    image_id: int,
    current_user: Optional[object] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed gallery image information.
    """
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )
    
    # Non-admin users only see published images
    if not image.is_published and (not current_user or current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )
    
    return success_response(data=GalleryImageResponse.model_validate(image), message="Image retrieved")


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Upload gallery image (admin)")
async def upload_gallery_image(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    display_order: int = Form(0),
    is_published: bool = Form(True),
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Upload a gallery image (admin only).
    
    **Form Data:**
    - file: Image file (JPEG, PNG, WebP)
    - title: Image title (required)
    - description: Image description (optional)
    - category: Category (hotel, rooms, dining, events, amenities)
    - display_order: Display order (default: 0)
    - is_published: Publish immediately (default: true)
    """
    # Validate file
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )
    
    # Read file content
    content = await file.read()
    
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE / 1024 / 1024} MB",
        )
    
    # Generate unique filename
    filename = generate_unique_filename(file.filename)
    
    # Save file
    relative_path = save_upload_file(content, filename, "gallery")
    
    # Create image record
    image = GalleryImage(
        title=title,
        description=description,
        image_url=relative_path,
        category=category,
        display_order=display_order,
        is_published=is_published,
    )
    
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return success_response(data=image, message="Image uploaded successfully")


@router.put("/{image_id}", response_model=dict, summary="Update gallery image (admin)")
def update_gallery_image(
    image_id: int,
    image_data: GalleryImageUpdate,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a gallery image (admin only).
    """
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )
    
    update_data = image_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(image, field, value)
    
    db.commit()
    db.refresh(image)
    
    return success_response(data=image, message="Image updated successfully")


@router.delete("/{image_id}", summary="Delete gallery image (admin)")
def delete_gallery_image(
    image_id: int,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a gallery image (admin only).
    """
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )
    
    # Delete file from disk
    delete_file(image.image_url)
    
    db.delete(image)
    db.commit()
    
    return success_response(message="Image deleted successfully")