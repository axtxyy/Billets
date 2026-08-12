"""
Booking service for Billets Hotel Booking System.

This module contains business logic for booking operations.

Why this file exists:
- Separates complex booking logic from routers
- Handles availability checking, price calculation, and booking management
- Makes booking logic reusable and testable

How it connects to the project:
- Used by bookings router for complex operations
- Uses models for database operations
- Uses utils for calculations

Key Functions:
- check_availability: Check room availability for dates
- calculate_price: Calculate booking price with taxes
- create_booking: Create booking with validation
- cancel_booking: Handle booking cancellation with refund logic
- get_upcoming_bookings: Get user's upcoming bookings
"""

from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models import Booking, Room, BookingStatus
from app.utils import calculate_booking_price, nights_between, is_room_available
from app.schemas import BookingPriceBreakdown


class BookingService:
    """Service class for booking operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_availability(
        self,
        room_id: int,
        check_in: datetime,
        check_out: datetime,
        exclude_booking_id: Optional[int] = None
    ) -> bool:
        """
        Check if a room is available for the given dates.
        
        Args:
            room_id: Room ID to check
            check_in: Check-in date/time
            check_out: Check-out date/time
            exclude_booking_id: Booking ID to exclude (for updates)
            
        Returns:
            bool: True if available
        """
        return is_room_available(self.db, room_id, check_in, check_out, exclude_booking_id)
    
    def calculate_price(
        self,
        room_id: int,
        check_in: datetime,
        check_out: datetime,
        discount: float = 0.0
    ) -> BookingPriceBreakdown:
        """
        Calculate booking price for a room and date range.
        
        Args:
            room_id: Room ID
            check_in: Check-in date/time
            check_out: Check-out date/time
            discount: Discount amount
            
        Returns:
            BookingPriceBreakdown: Price breakdown
            
        Raises:
            ValueError: If room not found
        """
        room = self.db.query(Room).filter(Room.id == room_id).first()
        if not room:
            raise ValueError("Room not found")
        
        total_nights = nights_between(check_in, check_out)
        
        price_data = calculate_booking_price(
            price_per_night=room.price_per_night,
            nights=total_nights,
            discount=discount,
        )
        
        return BookingPriceBreakdown(**price_data)
    
    def get_conflicting_bookings(
        self,
        room_id: int,
        check_in: datetime,
        check_out: datetime,
        exclude_booking_id: Optional[int] = None
    ) -> List[Booking]:
        """
        Get bookings that conflict with the given date range.
        
        Args:
            room_id: Room ID
            check_in: Check-in date/time
            check_out: Check-out date/time
            exclude_booking_id: Booking ID to exclude
            
        Returns:
            List of conflicting bookings
        """
        query = self.db.query(Booking).filter(
            Booking.room_id == room_id,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
            Booking.check_in_date < check_out,
            Booking.check_out_date > check_in,
        )
        
        if exclude_booking_id:
            query = query.filter(Booking.id != exclude_booking_id)
        
        return query.all()
    
    def get_user_upcoming_bookings(self, user_id: int) -> List[Booking]:
        """
        Get user's upcoming bookings (confirmed or pending).
        
        Args:
            user_id: User ID
            
        Returns:
            List of upcoming bookings
        """
        now = datetime.utcnow()
        return self.db.query(Booking).filter(
            Booking.user_id == user_id,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
            Booking.check_in_date >= now,
        ).order_by(Booking.check_in_date).all()
    
    def get_user_past_bookings(self, user_id: int) -> List[Booking]:
        """
        Get user's past bookings (checked out, cancelled, no-show).
        
        Args:
            user_id: User ID
            
        Returns:
            List of past bookings
        """
        now = datetime.utcnow()
        return self.db.query(Booking).filter(
            Booking.user_id == user_id,
            Booking.status.in_([BookingStatus.CHECKED_OUT, BookingStatus.CANCELLED, BookingStatus.NO_SHOW]),
        ).order_by(Booking.check_in_date.desc()).all()
    
    def can_cancel_booking(self, booking: Booking) -> tuple[bool, Optional[str]]:
        """
        Check if a booking can be cancelled.
        
        Args:
            booking: Booking to check
            
        Returns:
            Tuple of (can_cancel, reason_if_not)
        """
        if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
            return False, f"Cannot cancel booking with status: {booking.status.value}"
        
        if booking.check_in_date <= datetime.utcnow():
            return False, "Cannot cancel booking that has already started"
        
        return True, None
    
    def calculate_cancellation_fee(self, booking: Booking) -> float:
        """
        Calculate cancellation fee based on booking policy.
        
        Policy:
        - More than 7 days before check-in: Full refund
        - 3-7 days before check-in: 50% refund
        - Less than 3 days before check-in: No refund
        
        Args:
            booking: Booking to calculate fee for
            
        Returns:
            float: Refund amount (0 to total_amount)
        """
        days_until_checkin = (booking.check_in_date - datetime.utcnow()).days
        
        if days_until_checkin > 7:
            return booking.total_amount  # Full refund
        elif days_until_checkin >= 3:
            return booking.total_amount * 0.5  # 50% refund
        else:
            return 0.0  # No refund
    
    def get_booking_with_details(self, booking_id: int) -> Optional[Booking]:
        """
        Get booking with all related data loaded.
        
        Args:
            booking_id: Booking ID
            
        Returns:
            Booking with relationships or None
        """
        return self.db.query(Booking).filter(Booking.id == booking_id).first()
    
    def get_room_occupancy_rate(
        self,
        room_id: int,
        start_date: date,
        end_date: date
    ) -> float:
        """
        Calculate room occupancy rate for a date range.
        
        Args:
            room_id: Room ID
            start_date: Start date
            end_date: End date
            
        Returns:
            float: Occupancy rate (0.0 to 1.0)
        """
        from app.utils import days_between
        
        total_days = days_between(start_date, end_date)
        if total_days <= 0:
            return 0.0
        
        # Get bookings in range
        bookings = self.db.query(Booking).filter(
            Booking.room_id == room_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT]),
            Booking.check_in_date <= end_date,
            Booking.check_out_date >= start_date,
        ).all()
        
        # Calculate occupied days
        occupied_days = 0
        for booking in bookings:
            booking_start = max(booking.check_in_date.date(), start_date)
            booking_end = min(booking.check_out_date.date(), end_date)
            occupied_days += days_between(booking_start, booking_end)
        
        return min(1.0, occupied_days / total_days)


# Convenience function for dependency injection
def get_booking_service(db: Session) -> BookingService:
    """Get booking service instance."""
    return BookingService(db)