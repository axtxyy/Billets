"""
Database models for Billets Hotel Booking System.

This module defines all SQLAlchemy ORM models (tables) for the application.

Why this file exists:
- Defines the database schema as Python classes
- Each class represents a table in the database
- Relationships between tables are defined here
- Used by SQLAlchemy to create tables and run queries

How it connects to the project:
- Inherits from Base in database.py
- Used by routers and services for database operations
- Pydantic schemas in schemas.py mirror these models
- Alembic uses these to generate migrations

Table Relationships Overview:
- User 1:N Booking (user can have many bookings)
- User 1:N Review (user can write many reviews)
- User 1:N DiningReservation
- User 1:N EventBooking
- Room 1:N Booking (room can be booked many times)
- Room 1:N Review (room can have many reviews)
- Room 1:N RoomImage (room can have many images)
- Room N:M Amenity (many-to-many through room_amenities)
- Booking 1:N Payment (booking can have multiple payment attempts)
- Booking 1:1 Review (booking can have one review)
"""

from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional, List
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Table,
    Index,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import relationship, declared_attr
from sqlalchemy.sql import func

from app.database import Base


# ============================================================================
# Association Tables (Many-to-Many Relationships)
# ============================================================================

# Room <-> Amenity many-to-many
room_amenities = Table(
    "room_amenities",
    Base.metadata,
    Column("room_id", Integer, ForeignKey("rooms.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


# ============================================================================
# Enums
# ============================================================================

class UserRole(str, PyEnum):
    """User roles for role-based access control."""
    GUEST = "guest"
    ADMIN = "admin"
    STAFF = "staff"


class BookingStatus(str, PyEnum):
    """Booking status lifecycle."""
    PENDING = "pending"          # Booking created, payment pending
    CONFIRMED = "confirmed"      # Payment confirmed, room reserved
    CHECKED_IN = "checked_in"    # Guest has checked in
    CHECKED_OUT = "checked_out"  # Guest has checked out
    CANCELLED = "cancelled"      # Booking cancelled
    NO_SHOW = "no_show"          # Guest didn't show up


class PaymentStatus(str, PyEnum):
    """Payment status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class PaymentProvider(str, PyEnum):
    """Payment gateway providers."""
    RAZORPAY = "razorpay"
    STRIPE = "stripe"
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"


class DiningReservationStatus(str, PyEnum):
    """Dining reservation status."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class EventBookingStatus(str, PyEnum):
    """Event booking status."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class ContactStatus(str, PyEnum):
    """Contact message status."""
    NEW = "new"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


# ============================================================================
# Models
# ============================================================================

class User(Base):
    """
    User model - represents hotel guests and staff.
    
    Table: users
    
    Relationships:
    - bookings: One-to-Many with Booking
    - reviews: One-to-Many with Review
    - dining_reservations: One-to-Many with DiningReservation
    - event_bookings: One-to-Many with EventBooking
    - contact_messages: One-to-Many with ContactMessage
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.GUEST, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    dining_reservations = relationship("DiningReservation", back_populates="user", cascade="all, delete-orphan")
    event_bookings = relationship("EventBooking", back_populates="user", cascade="all, delete-orphan")
    contact_messages = relationship("ContactMessage", back_populates="user", cascade="all, delete-orphan")

    # Table constraints
    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_role", "role"),
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class Room(Base):
    """
    Room model - represents hotel rooms.
    
    Table: rooms
    
    Relationships:
    - bookings: One-to-Many with Booking
    - reviews: One-to-Many with Review
    - images: One-to-Many with RoomImage
    - amenities: Many-to-Many with Amenity through room_amenities
    """
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    room_type = Column(String(50), nullable=False)  # standard, deluxe, suite, etc.
    price_per_night = Column(Float, nullable=False)
    capacity = Column(Integer, default=2, nullable=False)  # max guests
    size_sqm = Column(Integer, nullable=True)  # room size in square meters
    bed_type = Column(String(50), nullable=True)  # king, queen, twin, etc.
    floor = Column(Integer, nullable=True)
    room_number = Column(String(20), unique=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    bookings = relationship("Booking", back_populates="room", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="room", cascade="all, delete-orphan")
    images = relationship("RoomImage", back_populates="room", cascade="all, delete-orphan", order_by="RoomImage.display_order")
    amenities = relationship("Amenity", secondary=room_amenities, back_populates="rooms")

    # Table constraints
    __table_args__ = (
        Index("ix_rooms_room_type", "room_type"),
        Index("ix_rooms_is_active", "is_active"),
        Index("ix_rooms_is_featured", "is_featured"),
        CheckConstraint("price_per_night >= 0", name="ck_rooms_price_positive"),
        CheckConstraint("capacity > 0", name="ck_rooms_capacity_positive"),
    )

    def __repr__(self):
        return f"<Room(id={self.id}, name={self.name}, type={self.room_type}, price={self.price_per_night})>"


class RoomImage(Base):
    """
    RoomImage model - stores images for rooms.
    
    Table: room_images
    
    Relationships:
    - room: Many-to-One with Room
    """
    __tablename__ = "room_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    alt_text = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    room = relationship("Room", back_populates="images")

    # Table constraints
    __table_args__ = (
        Index("ix_room_images_room_id", "room_id"),
        Index("ix_room_images_display_order", "display_order"),
    )

    def __repr__(self):
        return f"<RoomImage(id={self.id}, room_id={self.room_id}, url={self.image_url})>"


class Amenity(Base):
    """
    Amenity model - hotel/room amenities.
    
    Table: amenities
    
    Relationships:
    - rooms: Many-to-Many with Room through room_amenities
    """
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)  # icon name/class for frontend
    category = Column(String(50), nullable=True)  # room, hotel, dining, etc.
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    rooms = relationship("Room", secondary=room_amenities, back_populates="amenities")

    def __repr__(self):
        return f"<Amenity(id={self.id}, name={self.name})>"


class Booking(Base):
    """
    Booking model - hotel room bookings.
    
    Table: bookings
    
    Relationships:
    - user: Many-to-One with User
    - room: Many-to-One with Room
    - payments: One-to-Many with Payment
    - review: One-to-One with Review
    """
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    check_in_date = Column(DateTime, nullable=False)
    check_out_date = Column(DateTime, nullable=False)
    adults = Column(Integer, default=1, nullable=False)
    children = Column(Integer, default=0, nullable=False)
    total_nights = Column(Integer, nullable=False)
    price_per_night = Column(Float, nullable=False)  # snapshot at booking time
    subtotal = Column(Float, nullable=False)  # price_per_night * total_nights
    tax_amount = Column(Float, default=0, nullable=False)
    discount_amount = Column(Float, default=0, nullable=False)
    total_amount = Column(Float, nullable=False)  # subtotal + tax - discount
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    special_requests = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")

    # Table constraints
    __table_args__ = (
        Index("ix_bookings_user_id", "user_id"),
        Index("ix_bookings_room_id", "room_id"),
        Index("ix_bookings_check_in_date", "check_in_date"),
        Index("ix_bookings_status", "status"),
        Index("ix_bookings_dates", "check_in_date", "check_out_date"),
        CheckConstraint("check_out_date > check_in_date", name="ck_bookings_dates_order"),
        CheckConstraint("adults > 0", name="ck_bookings_adults_positive"),
        CheckConstraint("children >= 0", name="ck_bookings_children_non_negative"),
        CheckConstraint("total_amount >= 0", name="ck_bookings_total_positive"),
    )

    def __repr__(self):
        return f"<Booking(id={self.id}, user_id={self.user_id}, room_id={self.room_id}, status={self.status})>"


class Payment(Base):
    """
    Payment model - payment records for bookings.
    
    Table: payments
    
    Relationships:
    - booking: Many-to-One with Booking
    """
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    provider = Column(Enum(PaymentProvider), nullable=False)
    provider_payment_id = Column(String(255), nullable=True)  # ID from payment gateway
    provider_order_id = Column(String(255), nullable=True)    # Order ID from payment gateway
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(String(50), nullable=True)  # card, upi, netbanking, etc.
    failure_reason = Column(Text, nullable=True)
    refund_amount = Column(Float, default=0, nullable=False)
    refund_reason = Column(Text, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="payments")

    # Table constraints
    __table_args__ = (
        Index("ix_payments_booking_id", "booking_id"),
        Index("ix_payments_provider_payment_id", "provider_payment_id"),
        Index("ix_payments_status", "status"),
        CheckConstraint("amount > 0", name="ck_payments_amount_positive"),
        CheckConstraint("refund_amount >= 0", name="ck_payments_refund_non_negative"),
    )

    def __repr__(self):
        return f"<Payment(id={self.id}, booking_id={self.booking_id}, amount={self.amount}, status={self.status})>"


class Review(Base):
    """
    Review model - guest reviews for rooms.
    
    Table: reviews
    
    Relationships:
    - user: Many-to-One with User
    - room: Many-to-One with Room
    - booking: One-to-One with Booking
    """
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(255), nullable=True)
    comment = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)  # verified stay
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="reviews")
    room = relationship("Room", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")

    # Table constraints
    __table_args__ = (
        Index("ix_reviews_user_id", "user_id"),
        Index("ix_reviews_room_id", "room_id"),
        Index("ix_reviews_rating", "rating"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
    )

    def __repr__(self):
        return f"<Review(id={self.id}, user_id={self.user_id}, room_id={self.room_id}, rating={self.rating})>"


class DiningReservation(Base):
    """
    DiningReservation model - restaurant reservations.
    
    Table: dining_reservations
    
    Relationships:
    - user: Many-to-One with User
    """
    __tablename__ = "dining_reservations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reservation_date = Column(DateTime, nullable=False)
    reservation_time = Column(String(10), nullable=False)  # HH:MM format
    party_size = Column(Integer, default=1, nullable=False)
    special_requests = Column(Text, nullable=True)
    status = Column(Enum(DiningReservationStatus), default=DiningReservationStatus.PENDING, nullable=False)
    table_number = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="dining_reservations")

    # Table constraints
    __table_args__ = (
        Index("ix_dining_reservations_user_id", "user_id"),
        Index("ix_dining_reservations_date", "reservation_date"),
        Index("ix_dining_reservations_status", "status"),
        CheckConstraint("party_size > 0", name="ck_dining_party_size_positive"),
    )

    def __repr__(self):
        return f"<DiningReservation(id={self.id}, user_id={self.user_id}, date={self.reservation_date}, status={self.status})>"


class EventBooking(Base):
    """
    EventBooking model - event space bookings.
    
    Table: event_bookings
    
    Relationships:
    - user: Many-to-One with User
    """
    __tablename__ = "event_bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_name = Column(String(255), nullable=False)
    event_type = Column(String(100), nullable=True)  # wedding, conference, party, etc.
    event_date = Column(DateTime, nullable=False)
    start_time = Column(String(10), nullable=False)  # HH:MM format
    end_time = Column(String(10), nullable=False)    # HH:MM format
    expected_guests = Column(Integer, nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    special_requirements = Column(Text, nullable=True)
    status = Column(Enum(EventBookingStatus), default=EventBookingStatus.PENDING, nullable=False)
    estimated_cost = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="event_bookings")

    # Table constraints
    __table_args__ = (
        Index("ix_event_bookings_user_id", "user_id"),
        Index("ix_event_bookings_date", "event_date"),
        Index("ix_event_bookings_status", "status"),
        CheckConstraint("expected_guests > 0", name="ck_event_guests_positive"),
    )

    def __repr__(self):
        return f"<EventBooking(id={self.id}, user_id={self.user_id}, event_name={self.event_name}, status={self.status})>"


class ContactMessage(Base):
    """
    ContactMessage model - contact form submissions.
    
    Table: contact_messages
    
    Relationships:
    - user: Many-to-One with User (nullable for anonymous submissions)
    """
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum(ContactStatus), default=ContactStatus.NEW, nullable=False)
    admin_notes = Column(Text, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="contact_messages")

    # Table constraints
    __table_args__ = (
        Index("ix_contact_messages_status", "status"),
        Index("ix_contact_messages_created_at", "created_at"),
    )

    def __repr__(self):
        return f"<ContactMessage(id={self.id}, name={self.name}, email={self.email}, status={self.status})>"


class NewsletterSubscriber(Base):
    """
    NewsletterSubscriber model - email newsletter subscriptions.
    
    Table: newsletter_subscribers
    """
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    subscribed_at = Column(DateTime, default=func.now(), nullable=False)
    unsubscribed_at = Column(DateTime, nullable=True)

    # Table constraints
    __table_args__ = (
        Index("ix_newsletter_subscribers_email", "email"),
        Index("ix_newsletter_subscribers_is_active", "is_active"),
    )

    def __repr__(self):
        return f"<NewsletterSubscriber(id={self.id}, email={self.email}, active={self.is_active})>"


class GalleryImage(Base):
    """
    GalleryImage model - hotel gallery images.
    
    Table: gallery_images
    """
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)
    category = Column(String(50), nullable=True)  # hotel, rooms, dining, events, amenities
    display_order = Column(Integer, default=0, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Table constraints
    __table_args__ = (
        Index("ix_gallery_images_category", "category"),
        Index("ix_gallery_images_display_order", "display_order"),
    )

    def __repr__(self):
        return f"<GalleryImage(id={self.id}, title={self.title}, category={self.category})>"