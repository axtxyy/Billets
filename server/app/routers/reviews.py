"""
Reviews router for Billets Hotel Booking System.

This router handles guest reviews for rooms.

Why this file exists:
- Provides endpoints for review CRUD operations
- Only verified guests (completed stays) can review
- Calculates and displays review statistics

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations
- Links reviews to bookings for verification

Endpoints:
- POST /api/reviews - Create review (verified guests only)
- GET /api/reviews/room/{room_id} - Get reviews for a room
- GET /api/reviews/my - Get current user's reviews
- PUT /api/reviews/{review_id} - Update review
- DELETE /api/reviews/{review_id} - Delete review
- GET /api/reviews/room/{room_id}/stats - Get review statistics
- Admin endpoints for moderation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user
from app.models import Review, Booking, BookingStatus, Room, User
from app.schemas import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    ReviewStats,
)
from app.utils import success_response, build_paginated_response


router = APIRouter()


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Create review")
def create_review(
    review_data: ReviewCreate,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a review for a room.
    
    Only users with a completed booking for that room can review.
    One review per booking.
    
    **Request Body:**
    ```json
    {
        "room_id": 1,
        "booking_id": 1,
        "rating": 5,
        "title": "Amazing stay!",
        "comment": "The room was beautiful and the staff was wonderful."
    }
    ```
    
    **Response (201):**
    ```json
    {
        "success": true,
        "message": "Review submitted successfully",
        "data": {
            "id": 1,
            "user_id": 1,
            "room_id": 1,
            "booking_id": 1,
            "rating": 5,
            "title": "Amazing stay!",
            "comment": "The room was beautiful...",
            "is_verified": true,
            "is_published": true,
            "created_at": "2024-01-15T10:30:00"
        }
    }
    """
    # Verify booking exists and belongs to user
    booking = db.query(Booking).filter(
        Booking.id == review_data.booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Verify booking is for the same room
    if booking.room_id != review_data.room_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is not for this room",
        )
    
    # Verify booking is completed (checked out)
    if booking.status != BookingStatus.CHECKED_OUT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review after completing your stay",
        )
    
    # Check if review already exists for this booking
    existing_review = db.query(Review).filter(Review.booking_id == review_data.booking_id).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review already exists for this booking",
        )
    
    # Verify room exists
    room = db.query(Room).filter(Room.id == review_data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Create review
    review = Review(
        user_id=current_user.id,
        room_id=review_data.room_id,
        booking_id=review_data.booking_id,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment,
        is_verified=True,  # Verified because booking is completed
        is_published=True,
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return success_response(data=review, message="Review submitted successfully")


@router.get("/room/{room_id}", response_model=dict, summary="Get reviews for a room")
def get_room_reviews(
    room_id: int,
    page: int = 1,
    size: int = 20,
    rating: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get all published reviews for a room.
    
    Public endpoint - no authentication required.
    """
    # Verify room exists
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    query = db.query(Review).filter(
        Review.room_id == room_id,
        Review.is_published == True
    )
    
    if rating:
        query = query.filter(Review.rating == rating)
    
    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    # Build response with user info
    review_responses = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        review_responses.append(ReviewResponse(
            id=review.id,
            user_id=review.user_id,
            room_id=review.room_id,
            booking_id=review.booking_id,
            rating=review.rating,
            title=review.title,
            comment=review.comment,
            is_verified=review.is_verified,
            is_published=review.is_published,
            created_at=review.created_at,
            updated_at=review.updated_at,
            user_name=user.full_name if user else "Anonymous",
        ))
    
    return success_response(
        data=build_paginated_response(review_responses, total, page, size),
        message="Reviews retrieved",
    )


@router.get("/room/{room_id}/stats", response_model=dict, summary="Get review statistics for a room")
def get_room_review_stats(
    room_id: int,
    db: Session = Depends(get_db)
):
    """
    Get review statistics for a room.
    
    Public endpoint.
    """
    # Verify room exists
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )
    
    # Get stats
    reviews = db.query(Review).filter(
        Review.room_id == room_id,
        Review.is_published == True
    ).all()
    
    total_reviews = len(reviews)
    
    if total_reviews == 0:
        return success_response(
            data=ReviewStats(
                total_reviews=0,
                average_rating=0.0,
                rating_distribution={1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            ),
            message="No reviews yet",
        )
    
    average_rating = sum(r.rating for r in reviews) / total_reviews
    
    # Rating distribution
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in reviews:
        distribution[review.rating] += 1
    
    return success_response(
        data=ReviewStats(
            total_reviews=total_reviews,
            average_rating=round(average_rating, 1),
            rating_distribution=distribution,
        ),
        message="Review statistics retrieved",
    )


@router.get("/my", response_model=dict, summary="Get my reviews")
def get_my_reviews(
    page: int = 1,
    size: int = 20,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's reviews.
    """
    query = db.query(Review).filter(Review.user_id == current_user.id)
    
    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(reviews, total, page, size),
        message="Your reviews retrieved",
    )


@router.put("/{review_id}", response_model=dict, summary="Update review")
def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a review.
    
    Users can update their own reviews.
    Admins can update is_published status.
    """
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    
    update_data = review_data.model_dump(exclude_unset=True)
    
    # Regular users can't change is_published
    if current_user.role == "guest":
        update_data.pop("is_published", None)
    
    for field, value in update_data.items():
        setattr(review, field, value)
    
    db.commit()
    db.refresh(review)
    
    return success_response(data=review, message="Review updated")


@router.delete("/{review_id}", summary="Delete review")
def delete_review(
    review_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a review.
    
    Users can delete their own reviews.
    Admins can delete any review.
    """
    query = db.query(Review).filter(Review.id == review_id)
    
    if current_user.role != "admin":
        query = query.filter(Review.user_id == current_user.id)
    
    review = query.first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    
    db.delete(review)
    db.commit()
    
    return success_response(message="Review deleted")


# ============================================================================
# Admin Endpoints
# ============================================================================

@router.get("/admin/all", response_model=dict, summary="List all reviews (admin)")
def list_all_reviews(
    page: int = 1,
    size: int = 20,
    is_published: Optional[bool] = None,
    is_verified: Optional[bool] = None,
    room_id: Optional[int] = None,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all reviews with filters (admin only).
    """
    query = db.query(Review)
    
    if is_published is not None:
        query = query.filter(Review.is_published == is_published)
    if is_verified is not None:
        query = query.filter(Review.is_verified == is_verified)
    if room_id:
        query = query.filter(Review.room_id == room_id)
    
    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(reviews, total, page, size),
        message="All reviews retrieved",
    )


@router.put("/admin/{review_id}/publish", response_model=dict, summary="Toggle review publish status (admin)")
def toggle_review_publish(
    review_id: int,
    is_published: bool,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Publish or unpublish a review (admin only).
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    
    review.is_published = is_published
    db.commit()
    db.refresh(review)
    
    return success_response(data=review, message=f"Review {'published' if is_published else 'unpublished'}")