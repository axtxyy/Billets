"""
Contact router for Billets Hotel Booking System.

This router handles contact form submissions and inquiries.

Why this file exists:
- Provides endpoints for contact form submission
- Stores inquiries in database for staff follow-up
- Admin endpoints for managing inquiries

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations

Endpoints:
- POST /api/contact - Submit contact form (public)
- GET /api/contact/my - Get user's submitted messages
- GET /api/contact/{message_id} - Get message details
- Admin endpoints for managing all messages
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user, get_current_staff_user, get_optional_current_user
from app.models import ContactMessage, ContactStatus, User
from app.schemas import (
    ContactMessageCreate,
    ContactMessageUpdate,
    ContactMessageResponse,
)
from app.utils import success_response, build_paginated_response, send_email


router = APIRouter()


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Submit contact form")
def submit_contact_form(
    message_data: ContactMessageCreate,
    current_user: Optional[object] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a contact form inquiry.
    
    Public endpoint - no authentication required.
    If user is logged in, associates message with their account.
    
    **Request Body:**
    ```json
    {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "subject": "Booking Inquiry",
        "message": "I would like to know about group booking discounts..."
    }
    ```
    
    **Response (201):**
    ```json
    {
        "success": true,
        "message": "Your message has been sent. We'll respond within 24 hours.",
        "data": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "subject": "Booking Inquiry",
            "status": "new",
            "created_at": "2024-01-15T10:30:00"
        }
    }
    """
    # Create contact message
    message = ContactMessage(
        user_id=current_user.id if current_user else None,
        name=message_data.name,
        email=message_data.email,
        phone=message_data.phone,
        subject=message_data.subject,
        message=message_data.message,
        status=ContactStatus.NEW,
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Send notification email to staff (placeholder)
    # In production, send to support team
    send_email(
        to="support@billets.com",
        subject=f"New Contact Form: {message_data.subject}",
        body=f"New inquiry from {message_data.name} ({message_data.email}):\n\n{message_data.message}",
    )
    
    # Send confirmation to user
    send_email(
        to=message_data.email,
        subject="We received your message - Billets Hotel",
        body=f"Hi {message_data.name},\n\nThank you for contacting Billets Hotel. We've received your message and will respond within 24 hours.\n\nYour inquiry:\n{message_data.message}\n\nBest regards,\nBillets Hotel Team",
    )
    
    return success_response(
        data=message,
        message="Your message has been sent. We'll respond within 24 hours.",
    )


@router.get("/my", response_model=dict, summary="Get my contact messages")
def get_my_contact_messages(
    page: int = 1,
    size: int = 20,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's submitted contact messages.
    """
    query = db.query(ContactMessage).filter(ContactMessage.user_id == current_user.id)
    
    total = query.count()
    messages = query.order_by(ContactMessage.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(messages, total, page, size),
        message="Your messages retrieved",
    )


@router.get("/{message_id}", response_model=dict, summary="Get contact message details")
def get_contact_message(
    message_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed contact message information.
    
    Users can only view their own messages.
    """
    message = db.query(ContactMessage).filter(
        ContactMessage.id == message_id,
        ContactMessage.user_id == current_user.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    return success_response(data=message, message="Message retrieved")


# ============================================================================
# Admin/Staff Endpoints
# ============================================================================

@router.get("/admin/all", response_model=dict, summary="List all contact messages (staff)")
def list_all_contact_messages(
    page: int = 1,
    size: int = 20,
    status: Optional[ContactStatus] = None,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    List all contact messages (staff/admin only).
    """
    query = db.query(ContactMessage)
    
    if status:
        query = query.filter(ContactMessage.status == status)
    
    total = query.count()
    messages = query.order_by(ContactMessage.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(messages, total, page, size),
        message="All messages retrieved",
    )


@router.get("/admin/{message_id}", response_model=dict, summary="Get contact message (staff)")
def get_contact_message_admin(
    message_id: int,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    Get any contact message (staff/admin only).
    """
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    return success_response(data=message, message="Message retrieved")


@router.put("/admin/{message_id}", response_model=dict, summary="Update contact message (staff)")
def update_contact_message(
    message_id: int,
    message_data: ContactMessageUpdate,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    Update contact message status and add admin notes (staff/admin only).
    """
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    update_data = message_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(message, field, value)
    
    # Set responded_at when status changes to resolved
    if message_data.status == ContactStatus.RESOLVED and not message.responded_at:
        from app.utils import utc_now
        message.responded_at = utc_now()
    
    db.commit()
    db.refresh(message)
    
    return success_response(data=message, message="Message updated")


@router.post("/admin/{message_id}/respond", response_model=dict, summary="Respond to contact message (staff)")
def respond_to_message(
    message_id: int,
    response: str,
    current_user: object = Depends(get_current_staff_user),
    db: Session = Depends(get_db)
):
    """
    Send a response to a contact message (staff/admin only).
    
    Updates message status to resolved and sends email to user.
    """
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    # Update message
    message.status = ContactStatus.RESOLVED
    message.admin_notes = response
    from app.utils import utc_now
    message.responded_at = utc_now()
    
    db.commit()
    db.refresh(message)
    
    # Send response email to user
    send_email(
        to=message.email,
        subject=f"Re: {message.subject} - Billets Hotel",
        body=f"Hi {message.name},\n\nThank you for contacting Billets Hotel. Here's our response:\n\n{response}\n\nBest regards,\nBillets Hotel Team",
    )
    
    return success_response(data=message, message="Response sent successfully")