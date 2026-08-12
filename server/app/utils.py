"""
Utility functions for Billets Hotel Booking System.

This module contains helper functions used across the application.

Why this file exists:
- Centralizes common utility functions
- Avoids code duplication across routers and services
- Provides reusable functions for date handling, calculations, etc.
- Keeps business logic separate from HTTP handling

How it connects to the project:
- Used by services for calculations (booking prices, availability)
- Used by routers for formatting responses
- Used by scripts for data processing
"""

from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple
from decimal import Decimal, ROUND_HALF_UP
import uuid
import os
from pathlib import Path

from app.config import settings


# ============================================================================
# Date/Time Utilities
# ============================================================================

def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.utcnow()


def date_to_datetime(d: date, hour: int = 0, minute: int = 0) -> datetime:
    """Convert date to datetime at specified time."""
    return datetime.combine(d, datetime.min.time().replace(hour=hour, minute=minute))


def datetime_to_date(dt: datetime) -> date:
    """Convert datetime to date (discard time component)."""
    return dt.date()


def is_date_in_past(d: date) -> bool:
    """Check if a date is in the past."""
    return d < date.today()


def is_datetime_in_past(dt: datetime) -> bool:
    """Check if a datetime is in the past."""
    return dt < utc_now()


def add_days(d: date, days: int) -> date:
    """Add days to a date."""
    return d + timedelta(days=days)


def days_between(start: date, end: date) -> int:
    """Calculate number of days between two dates."""
    return (end - start).days


def nights_between(check_in: datetime, check_out: datetime) -> int:
    """Calculate number of nights between check-in and check-out."""
    return max(1, days_between(check_in.date(), check_out.date()))


# ============================================================================
# Price Calculation Utilities
# ============================================================================

TAX_RATE = Decimal("0.18")  # 18% GST

def calculate_booking_price(
    price_per_night: float,
    nights: int,
    tax_rate: float = float(TAX_RATE),
    discount: float = 0.0
) -> dict:
    """
    Calculate booking price breakdown.
    
    Args:
        price_per_night: Room price per night
        nights: Number of nights
        tax_rate: Tax rate as decimal (e.g., 0.18 for 18%)
        discount: Discount amount
        
    Returns:
        dict: Price breakdown with subtotal, tax, discount, total
    """
    # Use Decimal for precise monetary calculations
    price = Decimal(str(price_per_night))
    tax = Decimal(str(tax_rate))
    disc = Decimal(str(discount))
    nights_dec = Decimal(str(nights))
    
    subtotal = price * nights_dec
    tax_amount = (subtotal * tax).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total = (subtotal + tax_amount - disc).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    
    return {
        "price_per_night": float(price),
        "total_nights": nights,
        "subtotal": float(subtotal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
        "tax_amount": float(tax_amount),
        "discount_amount": float(disc),
        "total_amount": float(total),
    }


def calculate_nights(check_in: datetime, check_out: datetime) -> int:
    """Calculate number of nights for a booking."""
    return max(1, (check_out.date() - check_in.date()).days)


# ============================================================================
# File Upload Utilities
# ============================================================================

def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename to avoid collisions.
    
    Args:
        original_filename: Original uploaded filename
        
    Returns:
        str: Unique filename with same extension
    """
    ext = Path(original_filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return unique_name


def validate_file_extension(filename: str, allowed_extensions: Optional[List[str]] = None) -> bool:
    """
    Validate file extension against allowed list.
    
    Args:
        filename: Filename to check
        allowed_extensions: List of allowed extensions (with dots)
        
    Returns:
        bool: True if extension is allowed
    """
    if allowed_extensions is None:
        allowed_extensions = settings.ALLOWED_EXTENSIONS
    
    ext = Path(filename).suffix.lower()
    return ext in allowed_extensions


def save_upload_file(file_content: bytes, filename: str, subfolder: str = "") -> str:
    """
    Save uploaded file to disk.
    
    Args:
        file_content: File bytes
        filename: Filename to save as
        subfolder: Optional subfolder within upload directory
        
    Returns:
        str: Relative path to saved file
    """
    upload_dir = Path(settings.UPLOAD_DIR)
    if subfolder:
        upload_dir = upload_dir / subfolder
    
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / filename
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Return relative path for database storage
    return str(file_path.relative_to(Path.cwd()))


def delete_file(file_path: str) -> bool:
    """
    Delete a file from disk.
    
    Args:
        file_path: Relative path to file
        
    Returns:
        bool: True if deleted, False if not found
    """
    full_path = Path.cwd() / file_path
    try:
        if full_path.exists():
            full_path.unlink()
            return True
    except Exception:
        pass
    return False


def get_file_url(file_path: str) -> str:
    """
    Get public URL for uploaded file.
    
    In production, this would return a CDN URL.
    For development, returns local URL.
    
    Args:
        file_path: Relative file path
        
    Returns:
        str: Public URL
    """
    # In production, use CDN/base URL from settings
    base_url = getattr(settings, "FILE_BASE_URL", "http://localhost:8000")
    return f"{base_url}/uploads/{file_path}"


# ============================================================================
# String Utilities
# ============================================================================

def slugify(text: str) -> str:
    """
    Convert text to URL-friendly slug.
    
    Args:
        text: Text to slugify
        
    Returns:
        str: Slugified text
    """
    import re
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


def truncate(text: str, length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to specified length.
    
    Args:
        text: Text to truncate
        length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        str: Truncated text
    """
    if len(text) <= length:
        return text
    return text[:length - len(suffix)] + suffix


def mask_email(email: str) -> str:
    """
    Mask email for display (e.g., j***@example.com).
    
    Args:
        email: Email address
        
    Returns:
        str: Masked email
    """
    parts = email.split("@")
    if len(parts) != 2:
        return email
    local = parts[0]
    domain = parts[1]
    if len(local) <= 2:
        masked_local = local[0] + "*" * (len(local) - 1)
    else:
        masked_local = local[:2] + "*" * (len(local) - 2)
    return f"{masked_local}@{domain}"


def mask_phone(phone: str) -> str:
    """
    Mask phone number for display.
    
    Args:
        phone: Phone number
        
    Returns:
        str: Masked phone
    """
    if len(phone) <= 4:
        return "*" * len(phone)
    return "*" * (len(phone) - 4) + phone[-4:]


# ============================================================================
# Booking Utilities
# ============================================================================

def check_booking_overlap(
    existing_check_in: datetime,
    existing_check_out: datetime,
    new_check_in: datetime,
    new_check_out: datetime
) -> bool:
    """
    Check if two date ranges overlap.
    
    Two bookings overlap if:
    - new check-in is before existing check-out AND
    - new check-out is after existing check-in
    
    Args:
        existing_check_in: Existing booking check-in
        existing_check_out: Existing booking check-out
        new_check_in: New booking check-in
        new_check_out: New booking check-out
        
    Returns:
        bool: True if dates overlap
    """
    return new_check_in < existing_check_out and new_check_out > existing_check_in


def get_conflicting_bookings(
    db,
    room_id: int,
    check_in: datetime,
    check_out: datetime,
    exclude_booking_id: Optional[int] = None
):
    """
    Get bookings that conflict with the given date range.
    
    Args:
        db: Database session
        room_id: Room ID to check
        check_in: Check-in date
        check_out: Check-out date
        exclude_booking_id: Booking ID to exclude (for updates)
        
    Returns:
        List of conflicting Booking objects
    """
    from app.models import Booking, BookingStatus
    
    query = db.query(Booking).filter(
        Booking.room_id == room_id,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
        Booking.check_in_date < check_out,
        Booking.check_out_date > check_in,
    )
    
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    
    return query.all()


def is_room_available(
    db,
    room_id: int,
    check_in: datetime,
    check_out: datetime,
    exclude_booking_id: Optional[int] = None
) -> bool:
    """
    Check if a room is available for the given dates.
    
    Args:
        db: Database session
        room_id: Room ID
        check_in: Check-in date
        check_out: Check-out date
        exclude_booking_id: Booking ID to exclude
        
    Returns:
        bool: True if room is available
    """
    conflicts = get_conflicting_bookings(db, room_id, check_in, check_out, exclude_booking_id)
    return len(conflicts) == 0


# ============================================================================
# Pagination Utilities
# ============================================================================

def paginate_query(query, page: int, size: int):
    """
    Apply pagination to a SQLAlchemy query.
    
    Args:
        query: SQLAlchemy query
        page: Page number (1-indexed)
        size: Items per page
        
    Returns:
        tuple: (items, total_count)
    """
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return items, total


def build_paginated_response(items: List, total: int, page: int, size: int) -> dict:
    """
    Build paginated response dictionary.
    
    Args:
        items: List of items for current page
        total: Total number of items
        page: Current page number
        size: Items per page
        
    Returns:
        dict: Paginated response
    """
    pages = (total + size - 1) // size if total > 0 else 0
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


# ============================================================================
# Validation Utilities
# ============================================================================

def validate_date_range(
    start_date: date,
    end_date: date,
    min_days: int = 1,
    max_days: Optional[int] = None,
    allow_past: bool = False
) -> Tuple[bool, Optional[str]]:
    """
    Validate a date range.
    
    Args:
        start_date: Start date
        end_date: End date
        min_days: Minimum days between dates
        max_days: Maximum days between dates (optional)
        allow_past: Whether past dates are allowed
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if start_date >= end_date:
        return False, "End date must be after start date"
    
    days = (end_date - start_date).days
    
    if days < min_days:
        return False, f"Minimum stay is {min_days} night(s)"
    
    if max_days and days > max_days:
        return False, f"Maximum stay is {max_days} night(s)"
    
    if not allow_past and start_date < date.today():
        return False, "Start date cannot be in the past"
    
    return True, None


def validate_positive_number(value: float, field_name: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that a number is positive.
    
    Args:
        value: Value to validate
        field_name: Name of field (for error message)
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if value <= 0:
        return False, f"{field_name} must be greater than zero"
    return True, None


# ============================================================================
# Response Formatting
# ============================================================================

def success_response(data: any = None, message: str = "Success") -> dict:
    """Standard success response format."""
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return response


def error_response(message: str, error_code: str = None, status_code: int = 400) -> dict:
    """Standard error response format."""
    response = {"success": False, "message": message}
    if error_code:
        response["error_code"] = error_code
    return response


# ============================================================================
# Email Utilities (Placeholder - implement with actual email service)
# ============================================================================

def send_email(to: str, subject: str, body: str, html_body: str = None) -> bool:
    """
    Send email (placeholder implementation).
    
    In production, integrate with SendGrid, AWS SES, or similar.
    
    Args:
        to: Recipient email
        subject: Email subject
        body: Plain text body
        html_body: Optional HTML body
        
    Returns:
        bool: True if sent successfully
    """
    # Placeholder - log instead of sending
    print(f"[EMAIL] To: {to}, Subject: {subject}")
    print(f"[EMAIL] Body: {body}")
    return True


def send_booking_confirmation_email(user_email: str, booking_details: dict) -> bool:
    """Send booking confirmation email."""
    subject = f"Booking Confirmation - {booking_details.get('booking_id', 'N/A')}"
    body = f"""
    Dear Guest,
    
    Your booking has been confirmed!
    
    Booking Details:
    - Booking ID: {booking_details.get('booking_id')}
    - Room: {booking_details.get('room_name')}
    - Check-in: {booking_details.get('check_in')}
    - Check-out: {booking_details.get('check_out')}
    - Total: ${booking_details.get('total_amount')}
    
    Thank you for choosing Billets Hotel!
    """
    return send_email(user_email, subject, body)


def send_payment_receipt_email(user_email: str, payment_details: dict) -> bool:
    """Send payment receipt email."""
    subject = f"Payment Receipt - {payment_details.get('payment_id', 'N/A')}"
    body = f"""
    Dear Guest,
    
    Your payment has been received.
    
    Payment Details:
    - Payment ID: {payment_details.get('payment_id')}
    - Booking ID: {payment_details.get('booking_id')}
    - Amount: ${payment_details.get('amount')}
    - Method: {payment_details.get('payment_method')}
    - Date: {payment_details.get('date')}
    
    Thank you for your payment!
    """
    return send_email(user_email, subject, body)