"""
Pydantic schemas for Billets Hotel Booking System.

This module defines all request/response validation schemas.

Why this file exists:
- Validates incoming request data (request bodies, query params)
- Defines response shapes for API documentation (Swagger)
- Separates API contracts from database models
- Provides type safety and automatic documentation

How it connects to the project:
- Used by all routers for request/response validation
- Mirrors database models but with validation rules
- Used by FastAPI to generate OpenAPI/Swagger docs
- Keeps API contracts stable even if database changes

Naming Convention:
- *Create: For creating new resources (POST requests)
- *Update: For updating resources (PATCH/PUT requests)
- *Response: For API responses (includes ID, timestamps)
- *InDB: For internal use with database fields (hashed passwords)
"""

from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from enum import Enum

from app.models import (
    UserRole, BookingStatus, PaymentStatus, PaymentProvider,
    DiningReservationStatus, EventBookingStatus, ContactStatus
)


# ============================================================================
# Base Schemas
# ============================================================================

class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    model_config = ConfigDict(
        from_attributes=True,  # Allow creating from SQLAlchemy models
        populate_by_name=True,  # Allow both snake_case and camelCase
        str_strip_whitespace=True,  # Auto-strip strings
    )


class PaginationParams(BaseSchema):
    """Pagination query parameters."""
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Items per page")


class PaginatedResponse(BaseSchema):
    """Generic paginated response wrapper."""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    
    @classmethod
    def create(cls, items: List[Any], total: int, page: int, size: int):
        pages = (total + size - 1) // size
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )


class MessageResponse(BaseSchema):
    """Simple message response."""
    message: str
    success: bool = True


class ErrorResponse(BaseSchema):
    """Error response format."""
    detail: str
    success: bool = False
    error_code: Optional[str] = None


# ============================================================================
# User Schemas
# ============================================================================

class UserBase(BaseSchema):
    """Base user fields."""
    email: EmailStr = Field(..., description="User's email address")
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    date_of_birth: Optional[date] = Field(None, description="Date of birth")
    address: Optional[str] = Field(None, description="Street address")
    city: Optional[str] = Field(None, max_length=100, description="City")
    country: Optional[str] = Field(None, max_length=100, description="Country")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")


class UserCreate(UserBase):
    """Schema for creating a new user (registration)."""
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 chars)")
    
    @validator("password")
    def validate_password(cls, v):
        # Check for at least one uppercase, lowercase, digit, special char
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v)
        
        if not (has_upper and has_lower and has_digit and has_special):
            raise ValueError("Password must contain uppercase, lowercase, digit, and special character")
        return v


class UserUpdate(BaseSchema):
    """Schema for updating user profile."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = Field(None, max_length=500)


class UserUpdateAdmin(UserUpdate):
    """Schema for admin updating user (includes role, active status)."""
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserInDB(UserBase):
    """User schema with database fields (includes hashed password)."""
    id: int
    hashed_password: str
    role: UserRole
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str]
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class UserResponse(UserBase):
    """User schema for API responses (no password)."""
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str]
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseSchema):
    """User login credentials."""
    email: EmailStr
    password: str


class Token(BaseSchema):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenData(BaseSchema):
    """Decoded token data."""
    user_id: int
    email: str
    role: UserRole
    exp: Optional[datetime] = None


class RefreshTokenRequest(BaseSchema):
    """Refresh token request."""
    refresh_token: str


# ============================================================================
# Room Schemas
# ============================================================================

class RoomImageBase(BaseSchema):
    """Base room image fields."""
    image_url: str = Field(..., max_length=500)
    alt_text: Optional[str] = Field(None, max_length=255)
    display_order: int = Field(0, ge=0)
    is_primary: bool = False


class RoomImageCreate(RoomImageBase):
    """Schema for creating room image."""
    pass


class RoomImageResponse(RoomImageBase):
    """Room image response."""
    id: int
    room_id: int
    created_at: datetime


class AmenityBase(BaseSchema):
    """Base amenity fields."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=50)


class AmenityCreate(AmenityBase):
    """Schema for creating amenity."""
    pass


class AmenityUpdate(BaseSchema):
    """Schema for updating amenity."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class AmenityResponse(AmenityBase):
    """Amenity response."""
    id: int
    is_active: bool
    created_at: datetime


class RoomBase(BaseSchema):
    """Base room fields."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    room_type: str = Field(..., min_length=1, max_length=50)
    price_per_night: float = Field(..., ge=0, description="Price per night")
    capacity: int = Field(2, ge=1, description="Maximum guests")
    size_sqm: Optional[int] = Field(None, ge=0)
    bed_type: Optional[str] = Field(None, max_length=50)
    floor: Optional[int] = Field(None, ge=0)
    room_number: str = Field(..., min_length=1, max_length=20)
    is_active: bool = True
    is_featured: bool = False


class RoomCreate(RoomBase):
    """Schema for creating a room."""
    amenity_ids: Optional[List[int]] = Field(default_factory=list)


class RoomUpdate(BaseSchema):
    """Schema for updating a room."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    room_type: Optional[str] = Field(None, min_length=1, max_length=50)
    price_per_night: Optional[float] = Field(None, ge=0)
    capacity: Optional[int] = Field(None, ge=1)
    size_sqm: Optional[int] = Field(None, ge=0)
    bed_type: Optional[str] = Field(None, max_length=50)
    floor: Optional[int] = Field(None, ge=0)
    room_number: Optional[str] = Field(None, min_length=1, max_length=20)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    amenity_ids: Optional[List[int]] = None


class RoomResponse(RoomBase):
    """Room response with relationships."""
    id: int
    amenities: List[AmenityResponse] = []
    images: List[RoomImageResponse] = []
    created_at: datetime
    updated_at: datetime


class RoomListResponse(BaseSchema):
    """Room list response (lighter, no full relationships)."""
    id: int
    name: str
    description: Optional[str]
    room_type: str
    price_per_night: float
    capacity: int
    bed_type: Optional[str]
    floor: Optional[int]
    room_number: str
    is_active: bool
    is_featured: bool
    primary_image: Optional[str] = None  # URL of primary image
    created_at: datetime


class RoomAvailabilityRequest(BaseSchema):
    """Request for checking room availability."""
    check_in_date: datetime
    check_out_date: datetime
    adults: int = Field(1, ge=1)
    children: int = Field(0, ge=0)
    room_type: Optional[str] = None


class RoomAvailabilityResponse(BaseSchema):
    """Available room response."""
    room: RoomListResponse
    total_price: float
    total_nights: int


# ============================================================================
# Booking Schemas
# ============================================================================

class BookingBase(BaseSchema):
    """Base booking fields."""
    room_id: int
    check_in_date: datetime
    check_out_date: datetime
    adults: int = Field(1, ge=1)
    children: int = Field(0, ge=0)
    special_requests: Optional[str] = None


class BookingCreate(BookingBase):
    """Schema for creating a booking."""
    pass


class BookingUpdate(BaseSchema):
    """Schema for updating a booking (limited fields)."""
    special_requests: Optional[str] = None
    # Admin-only fields:
    status: Optional[BookingStatus] = None
    cancellation_reason: Optional[str] = None


class BookingPriceBreakdown(BaseSchema):
    """Price breakdown for a booking."""
    price_per_night: float
    total_nights: int
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float


class BookingResponse(BookingBase):
    """Booking response with all details."""
    id: int
    user_id: int
    total_nights: int
    price_per_night: float
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    status: BookingStatus
    cancellation_reason: Optional[str]
    cancelled_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    # Related objects (optional, loaded when needed)
    room: Optional[RoomListResponse] = None
    user: Optional[UserResponse] = None


class BookingListResponse(BaseSchema):
    """Lightweight booking for list views."""
    id: int
    room_id: int
    room_name: str
    room_type: str
    check_in_date: datetime
    check_out_date: datetime
    total_nights: int
    total_amount: float
    status: BookingStatus
    created_at: datetime


class BookingCancelRequest(BaseSchema):
    """Request to cancel a booking."""
    cancellation_reason: Optional[str] = Field(None, max_length=500)


# ============================================================================
# Payment Schemas
# ============================================================================

class PaymentBase(BaseSchema):
    """Base payment fields."""
    booking_id: int
    amount: float = Field(..., gt=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    provider: PaymentProvider
    payment_method: Optional[str] = None


class PaymentCreate(PaymentBase):
    """Schema for creating a payment record."""
    provider_payment_id: Optional[str] = None
    provider_order_id: Optional[str] = None


class PaymentUpdate(BaseSchema):
    """Schema for updating payment status (webhook)."""
    status: PaymentStatus
    provider_payment_id: Optional[str] = None
    failure_reason: Optional[str] = None
    processed_at: Optional[datetime] = None


class PaymentResponse(PaymentBase):
    """Payment response."""
    id: int
    provider_payment_id: Optional[str]
    provider_order_id: Optional[str]
    status: PaymentStatus
    failure_reason: Optional[str]
    refund_amount: float
    refund_reason: Optional[str]
    processed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class PaymentInitiateRequest(BaseSchema):
    """Request to initiate payment for a booking."""
    booking_id: int
    provider: PaymentProvider
    payment_method: Optional[str] = None
    return_url: Optional[str] = None  # For redirect after payment


class PaymentInitiateResponse(BaseSchema):
    """Response with payment gateway data."""
    payment_id: int
    order_id: str
    amount: float
    currency: str
    provider: PaymentProvider
    # Provider-specific fields
    razorpay_order_id: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    stripe_client_secret: Optional[str] = None
    stripe_publishable_key: Optional[str] = None


class PaymentVerifyRequest(BaseSchema):
    """Request to verify payment after redirect."""
    booking_id: int
    provider: PaymentProvider
    # Razorpay fields
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    # Stripe fields
    stripe_payment_intent_id: Optional[str] = None


# ============================================================================
# Review Schemas
# ============================================================================

class ReviewBase(BaseSchema):
    """Base review fields."""
    room_id: int
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    """Schema for creating a review."""
    pass


class ReviewUpdate(BaseSchema):
    """Schema for updating a review."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    comment: Optional[str] = None
    is_published: Optional[bool] = None  # Admin only


class ReviewResponse(ReviewBase):
    """Review response."""
    id: int
    user_id: int
    user_name: str
    is_verified: bool
    is_published: bool
    created_at: datetime
    updated_at: datetime


class ReviewStats(BaseSchema):
    """Review statistics for a room."""
    total_reviews: int
    average_rating: float
    rating_distribution: dict  # {1: count, 2: count, ...}


# ============================================================================
# Dining Reservation Schemas
# ============================================================================

class DiningReservationBase(BaseSchema):
    """Base dining reservation fields."""
    reservation_date: date
    reservation_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    party_size: int = Field(1, ge=1)
    special_requests: Optional[str] = None


class DiningReservationCreate(DiningReservationBase):
    """Schema for creating a dining reservation."""
    pass


class DiningReservationUpdate(BaseSchema):
    """Schema for updating a dining reservation."""
    reservation_date: Optional[date] = None
    reservation_time: Optional[str] = Field(None, pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    party_size: Optional[int] = Field(None, ge=1)
    special_requests: Optional[str] = None
    status: Optional[DiningReservationStatus] = None
    table_number: Optional[str] = Field(None, max_length=20)


class DiningReservationResponse(DiningReservationBase):
    """Dining reservation response."""
    id: int
    user_id: int
    status: DiningReservationStatus
    table_number: Optional[str]
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None


# ============================================================================
# Event Booking Schemas
# ============================================================================

class EventBookingBase(BaseSchema):
    """Base event booking fields."""
    event_name: str = Field(..., min_length=1, max_length=255)
    event_type: Optional[str] = Field(None, max_length=100)
    event_date: date
    start_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    expected_guests: int = Field(..., ge=1)
    contact_email: EmailStr
    contact_phone: Optional[str] = Field(None, max_length=20)
    special_requirements: Optional[str] = None


class EventBookingCreate(EventBookingBase):
    """Schema for creating an event booking."""
    pass


class EventBookingUpdate(BaseSchema):
    """Schema for updating an event booking."""
    event_name: Optional[str] = Field(None, min_length=1, max_length=255)
    event_type: Optional[str] = Field(None, max_length=100)
    event_date: Optional[date] = None
    start_time: Optional[str] = Field(None, pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: Optional[str] = Field(None, pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    expected_guests: Optional[int] = Field(None, ge=1)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=20)
    special_requirements: Optional[str] = None
    status: Optional[EventBookingStatus] = None
    estimated_cost: Optional[float] = Field(None, ge=0)


class EventBookingResponse(EventBookingBase):
    """Event booking response."""
    id: int
    user_id: int
    status: EventBookingStatus
    estimated_cost: Optional[float]
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None


# ============================================================================
# Contact Message Schemas
# ============================================================================

class ContactMessageBase(BaseSchema):
    """Base contact message fields."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    subject: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)


class ContactMessageCreate(ContactMessageBase):
    """Schema for creating a contact message."""
    pass


class ContactMessageUpdate(BaseSchema):
    """Schema for updating contact message (admin)."""
    status: Optional[ContactStatus] = None
    admin_notes: Optional[str] = None


class ContactMessageResponse(ContactMessageBase):
    """Contact message response."""
    id: int
    user_id: Optional[int]
    status: ContactStatus
    admin_notes: Optional[str]
    responded_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


# ============================================================================
# Newsletter Schemas
# ============================================================================

class NewsletterSubscribe(BaseSchema):
    """Newsletter subscription request."""
    email: EmailStr
    name: Optional[str] = Field(None, max_length=255)


class NewsletterSubscriberResponse(BaseSchema):
    """Newsletter subscriber response."""
    id: int
    email: str
    name: Optional[str]
    is_active: bool
    subscribed_at: datetime
    unsubscribed_at: Optional[datetime]


# ============================================================================
# Gallery Schemas
# ============================================================================

class GalleryImageBase(BaseSchema):
    """Base gallery image fields."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    image_url: str = Field(..., max_length=500)
    category: Optional[str] = Field(None, max_length=50)
    display_order: int = Field(0, ge=0)
    is_published: bool = True


class GalleryImageCreate(GalleryImageBase):
    """Schema for creating a gallery image."""
    pass


class GalleryImageUpdate(BaseSchema):
    """Schema for updating a gallery image."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=50)
    display_order: Optional[int] = Field(None, ge=0)
    is_published: Optional[bool] = None


class GalleryImageResponse(GalleryImageBase):
    """Gallery image response."""
    id: int
    created_at: datetime


# ============================================================================
# Search/Filter Schemas
# ============================================================================

class RoomSearchFilters(BaseSchema):
    """Room search filters."""
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None
    adults: int = Field(1, ge=1)
    children: int = Field(0, ge=0)
    room_type: Optional[str] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    capacity: Optional[int] = Field(None, ge=1)
    amenities: Optional[List[int]] = None
    is_featured: Optional[bool] = None


class RoomSearchResponse(BaseSchema):
    """Room search results."""
    rooms: List[RoomAvailabilityResponse]
    total: int
    filters_applied: RoomSearchFilters