"""
Newsletter router for Billets Hotel Booking System.

This router handles newsletter subscriptions.

Why this file exists:
- Provides endpoints for email subscription management
- Stores subscriber emails in database
- Handles subscribe/unsubscribe

How it connects to the project:
- Uses dependencies for database
- Uses schemas for validation
- Uses models for database operations

Endpoints:
- POST /api/newsletter/subscribe - Subscribe to newsletter
- POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
- GET /api/newsletter/subscribers - List subscribers (admin)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_admin_user
from app.models import NewsletterSubscriber
from app.schemas import (
    NewsletterSubscribe,
    NewsletterSubscriberResponse,
)
from app.utils import success_response, build_paginated_response


router = APIRouter()


@router.post("/subscribe", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Subscribe to newsletter")
def subscribe_newsletter(
    subscription: NewsletterSubscribe,
    db: Session = Depends(get_db)
):
    """
    Subscribe an email to the newsletter.
    
    **Request Body:**
    ```json
    {
        "email": "user@example.com",
        "name": "John Doe"
    }
    ```
    
    **Response (201):**
    ```json
    {
        "success": true,
        "message": "Successfully subscribed to newsletter!",
        "data": {
            "id": 1,
            "email": "user@example.com",
            "name": "John Doe",
            "is_active": true,
            "subscribed_at": "2024-01-15T10:30:00"
        }
    }
    """
    # Check if already subscribed
    existing = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == subscription.email
    ).first()
    
    if existing:
        if existing.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already subscribed",
            )
        else:
            # Reactivate subscription
            existing.is_active = True
            existing.name = subscription.name or existing.name
            existing.unsubscribed_at = None
            db.commit()
            db.refresh(existing)
            
            return success_response(data=existing, message="Subscription reactivated!")
    
    # Create new subscription
    subscriber = NewsletterSubscriber(
        email=subscription.email,
        name=subscription.name,
        is_active=True,
    )
    
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    
    return success_response(
        data=subscriber,
        message="Successfully subscribed to newsletter!",
    )


@router.post("/unsubscribe", response_model=dict, summary="Unsubscribe from newsletter")
def unsubscribe_newsletter(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Unsubscribe an email from the newsletter.
    
    **Request Body:**
    ```json
    {
        "email": "user@example.com"
    }
    ```
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Successfully unsubscribed from newsletter",
        "data": {
            "id": 1,
            "email": "user@example.com",
            "is_active": false,
            "unsubscribed_at": "2024-01-15T10:30:00"
        }
    }
    """
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()
    
    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found in subscribers",
        )
    
    if not subscriber.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already unsubscribed",
        )
    
    subscriber.is_active = False
    subscriber.unsubscribed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(subscriber)
    
    return success_response(data=subscriber, message="Successfully unsubscribed from newsletter")


@router.get("/subscribers", response_model=dict, summary="List subscribers (admin)")
def list_subscribers(
    page: int = 1,
    size: int = 20,
    is_active: Optional[bool] = None,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all newsletter subscribers (admin only).
    """
    query = db.query(NewsletterSubscriber)
    
    if is_active is not None:
        query = query.filter(NewsletterSubscriber.is_active == is_active)
    
    total = query.count()
    subscribers = query.order_by(NewsletterSubscriber.subscribed_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(subscribers, total, page, size),
        message="Subscribers retrieved",
    )


@router.delete("/subscribers/{subscriber_id}", summary="Remove subscriber (admin)")
def remove_subscriber(
    subscriber_id: int,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Permanently remove a subscriber (admin only).
    """
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.id == subscriber_id
    ).first()
    
    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscriber not found",
        )
    
    db.delete(subscriber)
    db.commit()
    
    return success_response(message="Subscriber removed permanently")