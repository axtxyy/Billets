"""
Event bookings router for Billets Hotel Booking System.

This router handles event space booking requests.

Why this file exists:
- Provides endpoints for event booking CRUD
- Handles event inquiries and quotes
- Manages event requirements and capacity

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations

Endpoints:
- POST /api/events - Create event booking request
- GET /api/events - List user's event bookings
- GET /api/events/{event_id} - Get event booking details
- PUT /api/events/{event_id} - Update event booking
- POST /api/events/{event_id}/cancel - Cancel event booking
- Admin endpoints for managing all event bookings
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime

from app.database import get_db
from app.dependencies import get_current_user, get_current_staff_user
from app.models import EventBooking, EventBookingStatus, User
from app.schemas import (
    EventBookingCreate,
    EventBookingUpdate,
    EventBookingResponse,
)
from app.utils import success_response, build_paginated_response


router = APIRouter()


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Create event booking request")
def create_event_booking(
    event_data: EventBookingCreate,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new event booking request.
    
    **Request Body:**
    ```json
    {
        "event_name": "John & Jane Wedding",
        "event_type": "wedding",
        "event_date": "2024-06-15",
        "start_time": "16:00",
        "end_time": "23:00",
        "expected_guests": 150,
        "contact_email": "john@example.com",
        "contact_phone": "+1234567890",
        "special_requirements": "Need stage, sound system, and catering kitchen access"
    }
    ```
    
    **Response (201):**
    ```json
    {
        "success": true,
        "message": "Event booking request submitted. Our team will contact you within 24 hours.",
        "data": {
            "id": 1,
            "user_id": 1,
            "event_name": "John & Jane Wedding",
            "event_type": "wedding",
            "event_date": "2024-06-15",
            "start_time": "16:00",
            "end_time": "23:00",
            "expected_guests": 150,
            "contact_email": "john@example.com",
            "contact_phone": "+1234567890",
            "special_requirements": "Need stage, sound system...",
            "status": "pending",
            "created_at": "2024-01-15T10:30:00"
        }
    }
    """
    # Validate date is not in past
    if event_data.event_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event date cannot be in the past",
        )
    
    # Validate time format
    try:
        datetime.strptime(event_data.start_time, "%H:%M")
        datetime.strptime(event_data.end_time, "%H:%M")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time format. Use HH:MM (24-hour)",
        )
    
    # Validate end time is after start time
    if event_data.start_time >= event_data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )
    
    # Validate guest count
    if event_data.expected_guests > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum capacity is 500 guests. For larger events, please contact us.",
        )
    
    # Create event booking
    event = EventBooking(
        user_id=current_user.id,
        event_name=event_data.event_name,
        event_type=event_data.event_type,
        event_date=event_data.event_date,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        expected_guests=event_data.expected_guests,
        contact_email=event_data.contact_email,
        contact_phone=event_data.contact_phone,
        special_requirements=event_data.special_requirements,
        status=EventBookingStatus.PENDING,
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return success_response(
        data=event,
        message="Event booking request submitted. Our team will contact you within 24 hours.",
    )


@router.get("", response_model=dict, summary="List my event bookings")
def list_my_event_bookings(
    page: int = 1,
    size: int = 20,
    status: Optional[EventBookingStatus] = None,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List the current user's event bookings.
    """
    query = db.query(EventBooking).filter(EventBooking.user_id == current_user.id)
    
    if status:
        query = query.filter(EventBooking.status == status)
    
    total = query.count()
    events = query.order_by(EventBooking.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(events, total, page, size),
        message="Event bookings retrieved",
    )


@router.get("/{event_id}", response_model=dict, summary="Get event booking details")
def get_event_booking(
    event_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed event booking information.
    """
    event = db.query(EventBooking).filter(
        EventBooking.id == event_id,
        EventBooking.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event booking not found",
        )
    
    user = db.query(User).filter(User.id == event.user_id).first()
    
    response = EventBookingResponse(
        id=event.id,
        user_id=event.user_id,
        event_name=event.event_name,
        event_type=event.event_type,
        event_date=event.event_date,
        start_time=event.start_time,
        end_time=event.end_time,
        expected_guests=event.expected_guests,
        contact_email=event.contact_email,
        contact_phone=event.contact_phone,
        special_requirements=event.special_requirements,
        status=event.status,
        estimated_cost=event.estimated_cost,
        created_at=event.created_at,
        updated_at=event.updated_at,
        user=user,
    )
    
    return success_response(data=response, message="Event booking retrieved")


@router.put("/{event_id}", response_model=dict, summary="Update event booking")
def update_event_booking(
    event_id: int,
    event_data: EventBookingUpdate,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an event booking.
    
    Users can update event details while status is pending.
    Staff/admin can update status and estimated cost.
    """
    event = db.query(EventBooking).filter(
        EventBooking.id == event_id,
        EventBooking.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event booking not found",
        )
    
    # Check if event can be modified
    if event.status not in [EventBookingStatus.PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot modify event with status: {event.status.value}",
        )
    
    update_data = event_data.model_dump(exclude_unset=True)
    
    # Validate date if provided
    if "event_date" in update_data:
        if update_data["event_date"] < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event date cannot be in the past",
            )
    
    # Validate times if provided
    if "start_time" in update_data:
        try:
            datetime.strptime(update_data["start_time"], "%H:%M")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start time format. Use HH:MM (24-hour)",
            )
    
    if "end_time" in update_data:
        try:
            datetime.strptime(update_data["end_time"], "%H:%M")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end time format. Use HH:MM (24-hour)",
            )
    
    # Validate time order
    start = update_data.get("start_time", event.start_time)
    end = update_data.get("end_time", event.end_time)
    if start >= end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )
    
    # Validate guest count
    if "expected_guests" in update_data:
        if update_data["expected_guests"] > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum capacity is 500 guests",
            )
    
    # Regular users can't update status or estimated_cost
    if current_user.role == "guest":
        update_data.pop("status", None)
        update_data.pop("estimated_cost", None)
    
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    
    return success_response(data=event, message="Event booking updated")


@router.post("/{event_id}/cancel", response_model=dict, summary="Cancel event booking")
def cancel_event_booking(
    event_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel an event booking.
    """
    event = db.query(EventBooking).filter(
        EventBooking.id == event_id,
        EventBooking.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event booking not found",
        )
    
    if event.status in [EventBookingStatus.CANCELLED, EventBookingStatus.COMPLETED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel event with status: {event.status.value}",
        )
    
    event.status = EventBookingStatus.CANCELLED
    db.commit()
    db.refresh(event)
    
    return success_response(data=event, message="Event booking cancelled")


# ============================================================================
# Admin/Staff Endpoints
# ============================================================================

@router.get("/admin/all", response_model=dict, summary="List all event bookings (staff)")
def list_all_event_bookings(
    page: int = 1,
    size: int = 20,
    status: Optional[EventBookingStatus] = None,
    event_type: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    List all event bookings (staff/admin only).
    """
    query = db.query(EventBooking)
    
    if status:
        query = query.filter(EventBooking.status == status)
    if event_type:
        query = query.filter(EventBooking.event_type == event_type)
    if date_from:
        query = query.filter(EventBooking.event_date >= date_from)
    if date_to:
        query = query.filter(EventBooking.event_date <= date_to)
    
    total = query.count()
    events = query.order_by(EventBooking.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(events, total, page, size),
        message="All event bookings retrieved",
    )


@router.put("/admin/{event_id}/status", response_model=dict, summary="Update event status (staff)")
def update_event_status(
    event_id: int,
    status: EventBookingStatus,
    estimated_cost: Optional[float] = None,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    Update event booking status and estimated cost (staff/admin only).
    """
    event = db.query(EventBooking).filter(EventBooking.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event booking not found",
        )
    
    event.status = status
    if estimated_cost is not None:
        event.estimated_cost = estimated_cost
    
    db.commit()
    db.refresh(event)
    
    return success_response(data=event, message="Event status updated")