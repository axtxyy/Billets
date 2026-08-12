"""
Dining reservations router for Billets Hotel Booking System.

This router handles restaurant reservation management.

Why this file exists:
- Provides endpoints for dining reservation CRUD
- Manages reservation time slots and availability
- Handles special requests and dietary requirements

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations

Endpoints:
- POST /api/dining - Create reservation
- GET /api/dining - List user's reservations
- GET /api/dining/{reservation_id} - Get reservation details
- PUT /api/dining/{reservation_id} - Update reservation
- POST /api/dining/{reservation_id}/cancel - Cancel reservation
- Admin endpoints for managing all reservations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime

from app.database import get_db
from app.dependencies import get_current_user, get_current_staff_user
from app.models import DiningReservation, DiningReservationStatus, User
from app.schemas import (
    DiningReservationCreate,
    DiningReservationUpdate,
    DiningReservationResponse,
)
from app.utils import success_response, build_paginated_response


router = APIRouter()


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Create dining reservation")
def create_dining_reservation(
    reservation_data: DiningReservationCreate,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new dining reservation.
    
    **Request Body:**
    ```json
    {
        "reservation_date": "2024-02-14",
        "reservation_time": "19:30",
        "party_size": 2,
        "special_requests": "Window seat preferred, anniversary dinner"
    }
    ```
    
    **Response (201):**
    ```json
    {
        "success": true,
        "message": "Reservation created successfully",
        "data": {
            "id": 1,
            "user_id": 1,
            "reservation_date": "2024-02-14",
            "reservation_time": "19:30",
            "party_size": 2,
            "special_requests": "Window seat preferred",
            "status": "pending",
            "created_at": "2024-01-15T10:30:00"
        }
    }
    """
    # Validate date is not in past
    if reservation_data.reservation_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation date cannot be in the past",
        )
    
    # Validate time format (HH:MM)
    try:
        datetime.strptime(reservation_data.reservation_time, "%H:%M")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time format. Use HH:MM (24-hour)",
        )
    
    # Validate party size
    if reservation_data.party_size > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum party size is 20. For larger groups, please contact us.",
        )
    
    # Create reservation
    reservation = DiningReservation(
        user_id=current_user.id,
        reservation_date=reservation_data.reservation_date,
        reservation_time=reservation_data.reservation_time,
        party_size=reservation_data.party_size,
        special_requests=reservation_data.special_requests,
        status=DiningReservationStatus.PENDING,
    )
    
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    
    return success_response(data=reservation, message="Reservation created successfully")


@router.get("", response_model=dict, summary="List my dining reservations")
def list_my_dining_reservations(
    page: int = 1,
    size: int = 20,
    status: Optional[DiningReservationStatus] = None,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List the current user's dining reservations.
    """
    query = db.query(DiningReservation).filter(DiningReservation.user_id == current_user.id)
    
    if status:
        query = query.filter(DiningReservation.status == status)
    
    total = query.count()
    reservations = query.order_by(
        DiningReservation.reservation_date.desc(),
        DiningReservation.reservation_time.desc()
    ).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(reservations, total, page, size),
        message="Reservations retrieved",
    )


@router.get("/{reservation_id}", response_model=dict, summary="Get dining reservation details")
def get_dining_reservation(
    reservation_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed dining reservation information.
    """
    reservation = db.query(DiningReservation).filter(
        DiningReservation.id == reservation_id,
        DiningReservation.user_id == current_user.id
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found",
        )
    
    user = db.query(User).filter(User.id == reservation.user_id).first()
    
    response = DiningReservationResponse(
        id=reservation.id,
        user_id=reservation.user_id,
        reservation_date=reservation.reservation_date,
        reservation_time=reservation.reservation_time,
        party_size=reservation.party_size,
        special_requests=reservation.special_requests,
        status=reservation.status,
        table_number=reservation.table_number,
        created_at=reservation.created_at,
        updated_at=reservation.updated_at,
        user=user,
    )
    
    return success_response(data=response, message="Reservation retrieved")


@router.put("/{reservation_id}", response_model=dict, summary="Update dining reservation")
def update_dining_reservation(
    reservation_id: int,
    reservation_data: DiningReservationUpdate,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a dining reservation.
    
    Users can update date, time, party size, and special requests.
    Staff/admin can update status and table number.
    """
    reservation = db.query(DiningReservation).filter(
        DiningReservation.id == reservation_id,
        DiningReservation.user_id == current_user.id
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found",
        )
    
    # Check if reservation can be modified
    if reservation.status in [DiningReservationStatus.CANCELLED, DiningReservationStatus.COMPLETED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot modify reservation with status: {reservation.status.value}",
        )
    
    update_data = reservation_data.model_dump(exclude_unset=True)
    
    # Validate date if provided
    if "reservation_date" in update_data:
        if update_data["reservation_date"] < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reservation date cannot be in the past",
            )
    
    # Validate time if provided
    if "reservation_time" in update_data:
        try:
            datetime.strptime(update_data["reservation_time"], "%H:%M")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid time format. Use HH:MM (24-hour)",
            )
    
    # Validate party size if provided
    if "party_size" in update_data:
        if update_data["party_size"] > 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum party size is 20",
            )
    
    # Regular users can't update status or table_number
    if current_user.role == "guest":
        update_data.pop("status", None)
        update_data.pop("table_number", None)
    
    for field, value in update_data.items():
        setattr(reservation, field, value)
    
    db.commit()
    db.refresh(reservation)
    
    return success_response(data=reservation, message="Reservation updated")


@router.post("/{reservation_id}/cancel", response_model=dict, summary="Cancel dining reservation")
def cancel_dining_reservation(
    reservation_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a dining reservation.
    """
    reservation = db.query(DiningReservation).filter(
        DiningReservation.id == reservation_id,
        DiningReservation.user_id == current_user.id
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found",
        )
    
    if reservation.status in [DiningReservationStatus.CANCELLED, DiningReservationStatus.COMPLETED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel reservation with status: {reservation.status.value}",
        )
    
    reservation.status = DiningReservationStatus.CANCELLED
    db.commit()
    db.refresh(reservation)
    
    return success_response(data=reservation, message="Reservation cancelled")


# ============================================================================
# Admin/Staff Endpoints
# ============================================================================

@router.get("/admin/all", response_model=dict, summary="List all reservations (staff)")
def list_all_dining_reservations(
    page: int = 1,
    size: int = 20,
    status: Optional[DiningReservationStatus] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    List all dining reservations (staff/admin only).
    """
    query = db.query(DiningReservation)
    
    if status:
        query = query.filter(DiningReservation.status == status)
    if date_from:
        query = query.filter(DiningReservation.reservation_date >= date_from)
    if date_to:
        query = query.filter(DiningReservation.reservation_date <= date_to)
    
    total = query.count()
    reservations = query.order_by(
        DiningReservation.reservation_date.desc(),
        DiningReservation.reservation_time.desc()
    ).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(reservations, total, page, size),
        message="All reservations retrieved",
    )


@router.put("/admin/{reservation_id}/status", response_model=dict, summary="Update reservation status (staff)")
def update_reservation_status(
    reservation_id: int,
    status: DiningReservationStatus,
    table_number: Optional[str] = None,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    Update reservation status and table assignment (staff/admin only).
    """
    reservation = db.query(DiningReservation).filter(DiningReservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found",
        )
    
    reservation.status = status
    if table_number:
        reservation.table_number = table_number
    
    db.commit()
    db.refresh(reservation)
    
    return success_response(data=reservation, message="Reservation status updated")