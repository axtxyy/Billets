"""
Rooms router for Billets Hotel Booking System.

This router handles room CRUD operations, availability checking, and search.

Why this file exists:
- Provides endpoints for room management (admin)
- Public endpoints for room browsing and search
- Availability checking for booking

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations
- Uses utils for availability checking and price calculation

Endpoints:
- GET /api/rooms - List rooms (public, with filters)
- GET /api/rooms/featured - Get featured rooms
- GET /api/rooms/search - Search rooms with availability
- GET /api/rooms/{room_id} - Get room details
- POST /api/rooms - Create room (admin)
- PUT /api/rooms/{room_id} - Update room (admin)
- DELETE /api/rooms/{room_id} - Delete room (admin)
- POST /api/rooms/{room_id}/images - Upload room image (admin)
- DELETE /api/rooms/{room_id}/images/{image_id} - Delete room image (admin)
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user, get_optional_current_user
from app.models import Room, RoomImage, Amenity, Booking, BookingStatus
from app.schemas import (
    RoomCreate,
    RoomUpdate,
    RoomResponse,
    RoomListResponse,
    RoomAvailabilityRequest,
    RoomAvailabilityResponse,
    RoomSearchFilters,
    RoomSearchResponse,
    AmenityCreate,
    AmenityUpdate,
    AmenityResponse,
    RoomImageCreate,
    RoomImageResponse,
)
from app.utils import (
    success_response,
    build_paginated_response,
    calculate_booking_price,
    nights_between,
    is_room_available,
    save_upload_file,
    generate_unique_filename,
    validate_file_extension,
)
from app.config import settings


router = APIRouter()


# ============================================================================
# Public Room Endpoints
# ============================================================================

@router.get("", response_model=dict, summary="List rooms")
def list_rooms(
    page: int = 1,
    size: int = 20,
    room_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    capacity: Optional[int] = None,
    is_featured: Optional[bool] = None,
    is_active: bool = True,
    current_user: Optional[object] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    List rooms with filtering and pagination.
    
    Public endpoint - no authentication required.
    Admins see all rooms, guests only see active rooms.
    
    **Query Parameters:**
    - page: Page number (default: 1)
    - size: Items per page (default: 20, max: 100)
    - room_type: Filter by room type
    - min_price: Minimum price per night
    - max_price: Maximum price per night
    - capacity: Minimum capacity
    - is_featured: Filter featured rooms
    - is_active: Filter by active status (admin only)
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Rooms retrieved",
        "data": {
            "items": [...],
            "total": 50,
            "page": 1,
            "size": 20,
            "pages": 3
        }
    }
    """
    # Non-admin users only see active rooms
    if not current_user or current_user.role != "admin":
        is_active = True
    
    query = db.query(Room)
    
    if is_active is not None:
        query = query.filter(Room.is_active == is_active)
    if room_type:
        query = query.filter(Room.room_type == room_type)
    if min_price is not None:
        query = query.filter(Room.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Room.price_per_night <= max_price)
    if capacity is not None:
        query = query.filter(Room.capacity >= capacity)
    if is_featured is not None:
        query = query.filter(Room.is_featured == is_featured)
    
    total = query.count()
    rooms = query.order_by(Room.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    # Build response with primary image
    room_responses = []
    for room in rooms:
        primary_image = next((img.image_url for img in room.images if img.is_primary), None)
        if not primary_image and room.images:
            primary_image = room.images[0].image_url
        
        room_responses.append(RoomListResponse(
            id=room.id,
            name=room.name,
            description=room.description,
            room_type=room.room_type,
            price_per_night=room.price_per_night,
            capacity=room.capacity,
            bed_type=room.bed_type,
            floor=room.floor,
            room_number=room.room_number,
            is_active=room.is_active,
            is_featured=room.is_featured,
            primary_image=primary_image,
            created_at=room.created_at,
        ))
    
    return success_response(
        data=build_paginated_response(room_responses, total, page, size),
        message="Rooms retrieved",
    )


@router.get("/featured", response_model=dict, summary="Get featured rooms")
def get_featured_rooms(
    limit: int = 6,
    db: Session = Depends(get_db)
):
    """
    Get featured rooms for homepage display.
    
    **Query Parameters:**
    - limit: Maximum number of rooms (default: 6)
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Featured rooms retrieved",
        "data": [...]
    }
    """
    rooms = db.query(Room).filter(
        Room.is_active == True,
        Room.is_featured == True
    ).limit(limit).all()
    
    room_responses = []
    for room in rooms:
        primary_image = next((img.image_url for img in room.images if img.is_primary), None)
        if not primary_image and room.images:
            primary_image = room.images[0].image_url
        
        room_responses.append(RoomListResponse(
            id=room.id,
            name=room.name,
            description=room.description,
            room_type=room.room_type,
            price_per_night=room.price_per_night,
            capacity=room.capacity,
            bed_type=room.bed_type,
            floor=room.floor,
            room_number=room.room_number,
            is_active=room.is_active,
            is_featured=room.is_featured,
            primary_image=primary_image,
            created_at=room.created_at,
        ))
    
    return success_response(data=room_responses, message="Featured rooms retrieved")


@router.get("/search", response_model=dict, summary="Search rooms with availability")
def search_rooms(
    check_in_date: datetime,
    check_out_date: datetime,
    adults: int = 1,
    children: int = 0,
    room_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    capacity: Optional[int] = None,
    amenities: Optional[List[int]] = None,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db)
):
    """
    Search available rooms for given dates.
    
    Returns rooms that are available for the entire date range
    with price calculation.
    
    **Query Parameters:**
    - check_in_date: Check-in date/time (required)
    - check_out_date: Check-out date/time (required)
    - adults: Number of adults (default: 1)
    - children: Number of children (default: 0)
    - room_type: Filter by room type
    - min_price: Minimum price per night
    - max_price: Maximum price per night
    - capacity: Minimum capacity
    - amenities: List of amenity IDs (room must have all)
    - page: Page number
    - size: Items per page
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Available rooms found",
        "data": {
            "rooms": [
                {
                    "room": {...},
                    "total_price": 500.00,
                    "total_nights": 2
                }
            ],
            "total": 10,
            "filters_applied": {...}
        }
    }
    """
    # Validate dates
    if check_in_date >= check_out_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date",
        )
    
    if check_in_date.date() < datetime.utcnow().date():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past",
        )
    
    total_nights = nights_between(check_in_date, check_out_date)
    
    # Build query for active rooms
    query = db.query(Room).filter(Room.is_active == True)
    
    if room_type:
        query = query.filter(Room.room_type == room_type)
    if min_price is not None:
        query = query.filter(Room.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Room.price_per_night <= max_price)
    if capacity is not None:
        query = query.filter(Room.capacity >= capacity)
    
    # Filter by amenities if provided
    if amenities:
        for amenity_id in amenities:
            query = query.filter(Room.amenities.any(Amenity.id == amenity_id))
    
    all_rooms = query.all()
    
    # Check availability for each room
    available_rooms = []
    for room in all_rooms:
        if is_room_available(db, room.id, check_in_date, check_out_date):
            price_breakdown = calculate_booking_price(
                price_per_night=room.price_per_night,
                nights=total_nights,
            )
            
            primary_image = next((img.image_url for img in room.images if img.is_primary), None)
            if not primary_image and room.images:
                primary_image = room.images[0].image_url
            
            room_list = RoomListResponse(
                id=room.id,
                name=room.name,
                description=room.description,
                room_type=room.room_type,
                price_per_night=room.price_per_night,
                capacity=room.capacity,
                bed_type=room.bed_type,
                floor=room.floor,
                room_number=room.room_number,
                is_active=room.is_active,
                is_featured=room.is_featured,
                primary_image=primary_image,
                created_at=room.created_at,
            )
            
            available_rooms.append(RoomAvailabilityResponse(
                room=room_list,
                total_price=price_breakdown["total_amount"],
                total_nights=total_nights,
            ))
    
    # Paginate results
    total = len(available_rooms)
    start = (page - 1) * size
    end = start + size
    paginated_rooms = available_rooms[start:end]
    
    filters = RoomSearchFilters(
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        adults=adults,
        children=children,
        room_type=room_type,
        min_price=min_price,
        max_price=max_price,
        capacity=capacity,
        amenities=amenities,
    )
    
    return success_response(
        data=RoomSearchResponse(
            rooms=paginated_rooms,
            total=total,
            filters_applied=filters,
        ),
        message=f"Found {total} available rooms",
    )


# ============================================================================
# Amenities Endpoints (must come before /{room_id} to avoid route conflicts)
# ============================================================================

@router.get("/amenities", response_model=dict, summary="List amenities")
def list_amenities(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all amenities.
    
    Public endpoint.
    """
    query = db.query(Amenity).filter(Amenity.is_active == True)
    
    if category:
        query = query.filter(Amenity.category == category)
    
    amenities = query.order_by(Amenity.name).all()
    
    # Convert to response schemas
    amenity_responses = [AmenityResponse.model_validate(a) for a in amenities]
    
    return success_response(data=amenity_responses, message="Amenities retrieved")


@router.get("/{room_id}", response_model=dict, summary="Get room details")
def get_room(
    room_id: int,
    current_user: Optional[object] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed room information.
    
    Public endpoint - no authentication required.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Non-admin users only see active rooms
    if not room.is_active and (not current_user or current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Build full response with relationships
    room_response = RoomResponse(
        id=room.id,
        name=room.name,
        description=room.description,
        room_type=room.room_type,
        price_per_night=room.price_per_night,
        capacity=room.capacity,
        size_sqm=room.size_sqm,
        bed_type=room.bed_type,
        floor=room.floor,
        room_number=room.room_number,
        is_active=room.is_active,
        is_featured=room.is_featured,
        amenities=[AmenityResponse.model_validate(a) for a in room.amenities],
        images=[RoomImageResponse.model_validate(img) for img in room.images],
        created_at=room.created_at,
        updated_at=room.updated_at,
    )
    
    return success_response(data=room_response, message="Room retrieved")


# ============================================================================
# Admin Room Endpoints
# ============================================================================

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Create room (admin)")
def create_room(
    room_data: RoomCreate,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new room (admin only).
    
    **Request Body:**
    ```json
    {
        "name": "Deluxe Suite",
        "description": "Spacious suite with ocean view",
        "room_type": "suite",
        "price_per_night": 299.99,
        "capacity": 4,
        "size_sqm": 50,
        "bed_type": "king",
        "floor": 5,
        "room_number": "501",
        "is_active": true,
        "is_featured": false,
        "amenity_ids": [1, 2, 3]
    }
    ```
    """
    # Check if room number already exists
    existing = db.query(Room).filter(Room.room_number == room_data.room_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room number already exists",
        )
    
    # Create room
    room = Room(
        name=room_data.name,
        description=room_data.description,
        room_type=room_data.room_type,
        price_per_night=room_data.price_per_night,
        capacity=room_data.capacity,
        size_sqm=room_data.size_sqm,
        bed_type=room_data.bed_type,
        floor=room_data.floor,
        room_number=room_data.room_number,
        is_active=room_data.is_active,
        is_featured=room_data.is_featured,
    )
    
    # Add amenities
    if room_data.amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(room_data.amenity_ids)).all()
        room.amenities = amenities
    
    db.add(room)
    db.commit()
    db.refresh(room)
    
    return success_response(data=room, message="Room created successfully")


@router.put("/{room_id}", response_model=dict, summary="Update room (admin)")
def update_room(
    room_id: int,
    room_data: RoomUpdate,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a room (admin only).
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Check room number uniqueness if changed
    if room_data.room_number and room_data.room_number != room.room_number:
        existing = db.query(Room).filter(Room.room_number == room_data.room_number).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room number already exists",
            )
    
    update_data = room_data.model_dump(exclude_unset=True, exclude={"amenity_ids"})
    
    for field, value in update_data.items():
        setattr(room, field, value)
    
    # Update amenities if provided
    if room_data.amenity_ids is not None:
        amenities = db.query(Amenity).filter(Amenity.id.in_(room_data.amenity_ids)).all()
        room.amenities = amenities
    
    db.commit()
    db.refresh(room)
    
    return success_response(data=room, message="Room updated successfully")


@router.delete("/{room_id}", summary="Delete room (admin)")
def delete_room(
    room_id: int,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a room (admin only).
    
    Cannot delete room if it has active bookings.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Check for active bookings
    active_bookings = db.query(Booking).filter(
        Booking.room_id == room_id,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
    ).count()
    
    if active_bookings > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete room with active bookings",
        )
    
    db.delete(room)
    db.commit()
    
    return success_response(message="Room deleted successfully")


# ============================================================================
# Room Images
# ============================================================================

@router.post("/{room_id}/images", response_model=dict, summary="Upload room image (admin)")
async def upload_room_image(
    room_id: int,
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    display_order: int = Form(0),
    is_primary: bool = Form(False),
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Upload an image for a room (admin only).
    
    **Form Data:**
    - file: Image file (JPEG, PNG, WebP)
    - alt_text: Alternative text (optional)
    - display_order: Display order (default: 0)
    - is_primary: Set as primary image (default: false)
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
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
    relative_path = save_upload_file(content, filename, "rooms")
    
    # If this is primary, unset other primary images
    if is_primary:
        db.query(RoomImage).filter(
            RoomImage.room_id == room_id,
            RoomImage.is_primary == True
        ).update({RoomImage.is_primary: False})
    
    # Create image record
    image = RoomImage(
        room_id=room_id,
        image_url=relative_path,
        alt_text=alt_text,
        display_order=display_order,
        is_primary=is_primary,
    )
    
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return success_response(data=image, message="Image uploaded successfully")


@router.delete("/{room_id}/images/{image_id}", summary="Delete room image (admin)")
def delete_room_image(
    room_id: int,
    image_id: int,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a room image (admin only).
    """
    image = db.query(RoomImage).filter(
        RoomImage.id == image_id,
        RoomImage.room_id == room_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )
    
    # Delete file from disk
    from app.utils import delete_file
    delete_file(image.image_url)
    
    db.delete(image)
    db.commit()
    
    return success_response(message="Image deleted successfully")


@router.post("/amenities", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Create amenity (admin)")
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


@router.put("/amenities/{amenity_id}", response_model=dict, summary="Update amenity (admin)")
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
    
    for field, value in update_data.items():
        setattr(amenity, field, value)
    
    db.commit()
    db.refresh(amenity)
    
    return success_response(data=amenity, message="Amenity updated")


@router.delete("/amenities/{amenity_id}", summary="Delete amenity (admin)")
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