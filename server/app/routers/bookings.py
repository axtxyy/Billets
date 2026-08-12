"""
Bookings router for Billets Hotel Booking System.

This router handles booking creation, management, and history.

Why this file exists:
- Provides endpoints for booking CRUD operations
- Handles availability checking and double-booking prevention
- Calculates pricing automatically
- Manages booking status lifecycle

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations
- Uses services for complex booking logic
- Uses utils for price calculation and availability checking

Endpoints:
- POST /api/bookings - Create booking
- GET /api/bookings - List user's bookings
- GET /api/bookings/{booking_id} - Get booking details
- PUT /api/bookings/{booking_id} - Update booking (limited)
- POST /api/bookings/{booking_id}/cancel - Cancel booking
- GET /api/bookings/{booking_id}/price - Get price breakdown
- Admin endpoints for managing all bookings
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user, get_current_staff_user
from app.models import Booking, BookingStatus, Room, User, Payment, PaymentStatus
from app.schemas import (
    BookingCreate,
    BookingUpdate,
    BookingResponse,
    BookingListResponse,
    BookingCancelRequest,
    BookingPriceBreakdown,
    PaginationParams,
)
from app.services.booking_service import BookingService
from app.utils import (
    success_response,
    build_paginated_response,
    calculate_booking_price,
    nights_between,
    is_room_available,
    validate_date_range,
)


router = APIRouter()


# ============================================================================
# User Booking Endpoints
# ============================================================================

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Create booking")
def create_booking(
    booking_data: BookingCreate,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new room booking.
    
    Checks availability, calculates price, and creates a pending booking.
    Payment must be completed separately to confirm the booking.
    
    **Request Body:**
    ```json
    {
        "room_id": 1,
        "check_in_date": "2024-02-01T15:00:00",
        "check_out_date": "2024-02-03T11:00:00",
        "adults": 2,
        "children": 0,
        "special_requests": "Late check-in requested"
    }
    ```
    
    **Response (201):**
    ```json
    {
        "success": true,
        "message": "Booking created successfully. Complete payment to confirm.",
        "data": {
            "id": 1,
            "user_id": 1,
            "room_id": 1,
            "check_in_date": "2024-02-01T15:00:00",
            "check_out_date": "2024-02-03T11:00:00",
            "adults": 2,
            "children": 0,
            "total_nights": 2,
            "price_per_night": 199.99,
            "subtotal": 399.98,
            "tax_amount": 72.00,
            "discount_amount": 0,
            "total_amount": 471.98,
            "status": "pending",
            "created_at": "2024-01-15T10:30:00"
        }
    }
    ```
    
    **Errors:**
    - 400: Room not available for dates
    - 404: Room not found
    - 422: Invalid dates or guest count
    """
    # Get room
    room = db.query(Room).filter(Room.id == booking_data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    if not room.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is not available for booking",
        )
    
    # Validate dates
    is_valid, error = validate_date_range(
        booking_data.check_in_date.date(),
        booking_data.check_out_date.date(),
        min_days=1,
        max_days=30,
        allow_past=False
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )
    
    # Validate guest count
    total_guests = booking_data.adults + booking_data.children
    if total_guests > room.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room capacity is {room.capacity} guests",
        )
    
    # Check availability
    if not is_room_available(db, room.id, booking_data.check_in_date, booking_data.check_out_date):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is not available for the selected dates",
        )
    
    # Calculate price
    total_nights = nights_between(booking_data.check_in_date, booking_data.check_out_date)
    price_breakdown = calculate_booking_price(
        price_per_night=room.price_per_night,
        nights=total_nights,
    )
    
    # Create booking
    booking = Booking(
        user_id=current_user.id,
        room_id=room.id,
        check_in_date=booking_data.check_in_date,
        check_out_date=booking_data.check_out_date,
        adults=booking_data.adults,
        children=booking_data.children,
        total_nights=total_nights,
        price_per_night=room.price_per_night,
        subtotal=price_breakdown["subtotal"],
        tax_amount=price_breakdown["tax_amount"],
        discount_amount=price_breakdown["discount_amount"],
        total_amount=price_breakdown["total_amount"],
        status=BookingStatus.PENDING,
        special_requests=booking_data.special_requests,
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    return success_response(
        data=booking,
        message="Booking created successfully. Complete payment to confirm.",
    )


@router.get("", response_model=dict, summary="List my bookings")
def list_my_bookings(
    page: int = 1,
    size: int = 20,
    status: Optional[BookingStatus] = None,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List the current user's bookings.
    
    **Query Parameters:**
    - page: Page number (default: 1)
    - size: Items per page (default: 20)
    - status: Filter by booking status
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Bookings retrieved",
        "data": {
            "items": [...],
            "total": 5,
            "page": 1,
            "size": 20,
            "pages": 1
        }
    }
    """
    query = db.query(Booking).filter(Booking.user_id == current_user.id)
    
    if status:
        query = query.filter(Booking.status == status)
    
    total = query.count()
    bookings = query.order_by(Booking.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    # Build list responses with room info
    booking_responses = []
    for booking in bookings:
        room = db.query(Room).filter(Room.id == booking.room_id).first()
        booking_responses.append(BookingListResponse(
            id=booking.id,
            room_id=booking.room_id,
            room_name=room.name if room else "Unknown",
            room_type=room.room_type if room else "Unknown",
            check_in_date=booking.check_in_date,
            check_out_date=booking.check_out_date,
            total_nights=booking.total_nights,
            total_amount=booking.total_amount,
            status=booking.status,
            created_at=booking.created_at,
        ))
    
    return success_response(
        data=build_paginated_response(booking_responses, total, page, size),
        message="Bookings retrieved",
    )


@router.get("/{booking_id}", response_model=dict, summary="Get booking details")
def get_booking(
    booking_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed booking information.
    
    Users can only view their own bookings.
    """
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Load relationships
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    user = db.query(User).filter(User.id == booking.user_id).first()
    payments = db.query(Payment).filter(Payment.booking_id == booking.id).all()
    
    booking_response = BookingResponse(
        id=booking.id,
        user_id=booking.user_id,
        room_id=booking.room_id,
        check_in_date=booking.check_in_date,
        check_out_date=booking.check_out_date,
        adults=booking.adults,
        children=booking.children,
        total_nights=booking.total_nights,
        price_per_night=booking.price_per_night,
        subtotal=booking.subtotal,
        tax_amount=booking.tax_amount,
        discount_amount=booking.discount_amount,
        total_amount=booking.total_amount,
        status=booking.status,
        special_requests=booking.special_requests,
        cancellation_reason=booking.cancellation_reason,
        cancelled_at=booking.cancelled_at,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
        room=room,
        user=user,
    )
    
    return success_response(data=booking_response, message="Booking retrieved")


@router.put("/{booking_id}", response_model=dict, summary="Update booking")
def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a booking (limited fields).
    
    Users can only update special_requests.
    Admins/staff can update status and cancellation_reason.
    """
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Only allow special_requests update for regular users
    if current_user.role == "guest":
        if booking_data.special_requests is not None:
            booking.special_requests = booking_data.special_requests
        # Ignore other fields for guests
    else:
        # Staff/admin can update more fields
        update_data = booking_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(booking, field, value)
    
    db.commit()
    db.refresh(booking)
    
    return success_response(data=booking, message="Booking updated")


@router.post("/{booking_id}/cancel", response_model=dict, summary="Cancel booking")
def cancel_booking(
    booking_id: int,
    cancel_data: BookingCancelRequest,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a booking.
    
    Can only cancel pending or confirmed bookings.
    Refund policy depends on cancellation time.
    
    **Request Body:**
    ```json
    {
        "cancellation_reason": "Change of plans"
    }
    """
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Check if booking can be cancelled
    if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel booking with status: {booking.status.value}",
        )
    
    # Cancel booking
    booking.status = BookingStatus.CANCELLED
    booking.cancellation_reason = cancel_data.cancellation_reason
    booking.cancelled_at = datetime.utcnow()
    
    db.commit()
    db.refresh(booking)
    
    return success_response(data=booking, message="Booking cancelled successfully")


@router.get("/{booking_id}/price", response_model=dict, summary="Get price breakdown")
def get_booking_price(
    booking_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed price breakdown for a booking.
    """
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    price_breakdown = BookingPriceBreakdown(
        price_per_night=booking.price_per_night,
        total_nights=booking.total_nights,
        subtotal=booking.subtotal,
        tax_amount=booking.tax_amount,
        discount_amount=booking.discount_amount,
        total_amount=booking.total_amount,
    )
    
    return success_response(data=price_breakdown, message="Price breakdown retrieved")


# ============================================================================
# Admin/Staff Booking Endpoints
# ============================================================================

@router.get("/admin/all", response_model=dict, summary="List all bookings (staff)")
def list_all_bookings(
    page: int = 1,
    size: int = 20,
    status: Optional[BookingStatus] = None,
    user_id: Optional[int] = None,
    room_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    List all bookings with filters (staff/admin only).
    
    **Query Parameters:**
    - page: Page number
    - size: Items per page
    - status: Filter by status
    - user_id: Filter by user
    - room_id: Filter by room
    - date_from: Filter check-in from date
    - date_to: Filter check-in to date
    """
    query = db.query(Booking)
    
    if status:
        query = query.filter(Booking.status == status)
    if user_id:
        query = query.filter(Booking.user_id == user_id)
    if room_id:
        query = query.filter(Booking.room_id == room_id)
    if date_from:
        query = query.filter(Booking.check_in_date >= date_from)
    if date_to:
        query = query.filter(Booking.check_in_date <= date_to)
    
    total = query.count()
    bookings = query.order_by(Booking.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    # Build responses with related data
    booking_responses = []
    for booking in bookings:
        room = db.query(Room).filter(Room.id == booking.room_id).first()
        user = db.query(User).filter(User.id == booking.user_id).first()
        booking_responses.append(BookingListResponse(
            id=booking.id,
            room_id=booking.room_id,
            room_name=room.name if room else "Unknown",
            room_type=room.room_type if room else "Unknown",
            check_in_date=booking.check_in_date,
            check_out_date=booking.check_out_date,
            total_nights=booking.total_nights,
            total_amount=booking.total_amount,
            status=booking.status,
            created_at=booking.created_at,
        ))
    
    return success_response(
        data=build_paginated_response(booking_responses, total, page, size),
        message="All bookings retrieved",
    )


@router.put("/admin/{booking_id}/status", response_model=dict, summary="Update booking status (staff)")
def update_booking_status(
    booking_id: int,
    status: BookingStatus,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    Update booking status (staff/admin only).
    
    Valid status transitions:
    - PENDING -> CONFIRMED (after payment)
    - CONFIRMED -> CHECKED_IN
    - CHECKED_IN -> CHECKED_OUT
    - Any -> CANCELLED
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Validate status transition
    valid_transitions = {
        BookingStatus.PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        BookingStatus.CONFIRMED: [BookingStatus.CHECKED_IN, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        BookingStatus.CHECKED_IN: [BookingStatus.CHECKED_OUT, BookingStatus.CANCELLED],
        BookingStatus.CHECKED_OUT: [],
        BookingStatus.CANCELLED: [],
        BookingStatus.NO_SHOW: [],
    }
    
    if status not in valid_transitions.get(booking.status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from {booking.status.value} to {status.value}",
        )
    
    old_status = booking.status
    booking.status = status
    
    # Handle cancellation
    if status == BookingStatus.CANCELLED:
        booking.cancelled_at = datetime.utcnow()
    
    db.commit()
    db.refresh(booking)
    
    return success_response(data=booking, message=f"Booking status changed from {old_status.value} to {status.value}")


@router.post("/admin/{booking_id}/check-in", response_model=dict, summary="Check-in guest (staff)")
def check_in_guest(
    booking_id: int,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    Check in a guest (staff/admin only).
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    if booking.status != BookingStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking must be confirmed to check in",
        )
    
    booking.status = BookingStatus.CHECKED_IN
    db.commit()
    db.refresh(booking)
    
    return success_response(data=booking, message="Guest checked in successfully")


@router.post("/admin/{booking_id}/check-out", response_model=dict, summary="Check-out guest (staff)")
def check_out_guest(
    booking_id: int,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    Check out a guest (staff/admin only).
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    if booking.status != BookingStatus.CHECKED_IN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guest must be checked in to check out",
        )
    
    booking.status = BookingStatus.CHECKED_OUT
    db.commit()
    db.refresh(booking)
    
    return success_response(data=booking, message="Guest checked out successfully")