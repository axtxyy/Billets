"""
Payments router for Billets Hotel Booking System.

This router handles payment processing for bookings.

Why this file exists:
- Provides endpoints for payment initiation and verification
- Integrates with payment gateways (Razorpay, Stripe)
- Handles payment callbacks/webhooks
- Manages payment records

How it connects to the project:
- Uses dependencies for auth and database
- Uses schemas for validation
- Uses models for database operations
- Uses payment_service for gateway integration
- Uses utils for response formatting

Endpoints:
- POST /api/payments/initiate - Initiate payment for booking
- POST /api/payments/verify - Verify payment after gateway redirect
- GET /api/payments/booking/{booking_id} - Get payment history for booking
- POST /api/payments/webhook/razorpay - Razorpay webhook
- POST /api/payments/webhook/stripe - Stripe webhook
- GET /api/payments/{payment_id} - Get payment details
- Admin endpoints for refunds
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user
from app.models import Booking, BookingStatus, Payment, PaymentStatus, PaymentProvider
from app.schemas import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentVerifyRequest,
    PaymentResponse,
    PaymentUpdate,
)
from app.services.payment_service import PaymentService, get_payment_service
from app.utils import success_response, build_paginated_response


router = APIRouter()


@router.post("/initiate", response_model=dict, summary="Initiate payment for booking")
def initiate_payment(
    request: PaymentInitiateRequest,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiate payment for a booking.
    
    Creates a payment record and returns gateway-specific data
    for frontend integration.
    
    **Request Body:**
    ```json
    {
        "booking_id": 1,
        "provider": "razorpay",
        "payment_method": "card",
        "return_url": "https://example.com/payment/success"
    }
    ```
    
    **Response (200) - Razorpay:**
    ```json
    {
        "success": true,
        "message": "Payment initiated",
        "data": {
            "payment_id": 1,
            "order_id": "order_abc123",
            "amount": 471.98,
            "currency": "USD",
            "provider": "razorpay",
            "razorpay_order_id": "order_abc123",
            "razorpay_key_id": "rzp_test_..."
        }
    }
    ```
    
    **Response (200) - Stripe:**
    ```json
    {
        "success": true,
        "message": "Payment initiated",
        "data": {
            "payment_id": 1,
            "order_id": "pi_abc123",
            "amount": 471.98,
            "currency": "USD",
            "provider": "stripe",
            "stripe_client_secret": "pi_abc123_secret_...",
            "stripe_publishable_key": "pk_test_..."
        }
    }
    ```
    
    **Errors:**
    - 400: Booking not found or not in pending status
    - 403: Not authorized for this booking
    - 500: Payment gateway error
    """
    # Get booking
    booking = db.query(Booking).filter(Booking.id == request.booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Check authorization
    if booking.user_id != current_user.id and current_user.role not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this booking",
        )
    
    # Check booking status
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Booking is not in pending status (current: {booking.status.value})",
        )
    
    # Check if payment already exists for this booking
    existing_payment = db.query(Payment).filter(
        Payment.booking_id == booking.id,
        Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.COMPLETED])
    ).first()
    
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already in progress or completed for this booking",
        )
    
    # Initiate payment via service
    try:
        result = payment_service.initiate_payment(
            booking=booking,
            provider=request.provider,
            payment_method=request.payment_method,
            return_url=request.return_url,
        )
        
        return success_response(data=result, message="Payment initiated")
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment initiation failed: {str(e)}",
        )


@router.post("/verify", response_model=dict, summary="Verify payment")
def verify_payment(
    request: PaymentVerifyRequest,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify payment after gateway redirect.
    
    Called by frontend after user completes payment on gateway page.
    
    **Request Body (Razorpay):**
    ```json
    {
        "booking_id": 1,
        "provider": "razorpay",
        "razorpay_payment_id": "pay_abc123",
        "razorpay_order_id": "order_abc123",
        "razorpay_signature": "signature..."
    }
    ```
    
    **Request Body (Stripe):**
    ```json
    {
        "booking_id": 1,
        "provider": "stripe",
        "stripe_payment_intent_id": "pi_abc123"
    }
    ```
    
    **Response (200):**
    ```json
    {
        "success": true,
        "message": "Payment verified and booking confirmed",
        "data": {
            "payment_id": 1,
            "booking_id": 1,
            "status": "completed",
            "booking_status": "confirmed"
        }
    }
    ```
    """
    # Get booking
    booking = db.query(Booking).filter(Booking.id == request.booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Check authorization
    if booking.user_id != current_user.id and current_user.role not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this booking",
        )
    
    # Find payment record
    payment = db.query(Payment).filter(
        Payment.booking_id == booking.id,
        Payment.provider == request.provider,
        Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.PROCESSING])
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending payment found for this booking",
        )
    
    # Verify payment via service
    try:
        result = payment_service.verify_payment(
            payment=payment,
            provider=request.provider,
            verification_data=request.model_dump(exclude={"booking_id", "provider"}),
        )
        
        # Update booking status if payment successful
        if result.status == PaymentStatus.COMPLETED:
            booking.status = BookingStatus.CONFIRMED
            db.commit()
        
        return success_response(
            data={
                "payment_id": result.id,
                "booking_id": booking.id,
                "status": result.status.value,
                "booking_status": booking.status.value,
            },
            message="Payment verified and booking confirmed" if result.status == PaymentStatus.COMPLETED else "Payment verification completed",
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}",
        )


@router.get("/booking/{booking_id}", response_model=dict, summary="Get payment history for booking")
def get_booking_payments(
    booking_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all payment records for a booking.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Check authorization
    if booking.user_id != current_user.id and current_user.role not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this booking",
        )
    
    payments = db.query(Payment).filter(Payment.booking_id == booking_id).order_by(Payment.created_at.desc()).all()
    
    return success_response(data=payments, message="Payment history retrieved")


@router.get("/{payment_id}", response_model=dict, summary="Get payment details")
def get_payment(
    payment_id: int,
    current_user: object = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed payment information.
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )
    
    # Check authorization via booking
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking.user_id != current_user.id and current_user.role not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this payment",
        )
    
    return success_response(data=payment, message="Payment retrieved")


# ============================================================================
# Webhooks (No authentication - called by payment gateways)
# ============================================================================

@router.post("/webhook/razorpay", summary="Razorpay webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Razorpay webhook notifications.
    
    This endpoint is called by Razorpay when payment status changes.
    """
    try:
        # Get raw body for signature verification
        body = await request.body()
        
        # Get signature header
        signature = request.headers.get("X-Razorpay-Signature")
        
        # Verify webhook signature
        if not payment_service.verify_razorpay_webhook(body, signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature",
            )
        
        # Process webhook
        result = payment_service.process_razorpay_webhook(body)
        
        return success_response(data=result, message="Webhook processed")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}",
        )


@router.post("/webhook/stripe", summary="Stripe webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook notifications.
    
    This endpoint is called by Stripe when payment status changes.
    """
    try:
        # Get raw body
        body = await request.body()
        
        # Get signature header
        signature = request.headers.get("Stripe-Signature")
        
        # Process webhook
        result = payment_service.process_stripe_webhook(body, signature)
        
        return success_response(data=result, message="Webhook processed")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}",
        )


# ============================================================================
# Admin Payment Endpoints
# ============================================================================

@router.post("/admin/{payment_id}/refund", response_model=dict, summary="Refund payment (admin)")
def refund_payment(
    payment_id: int,
    amount: Optional[float] = None,
    reason: str = "Refund requested",
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Process a refund for a payment (admin only).
    
    **Query Parameters:**
    - amount: Refund amount (optional, defaults to full amount)
    - reason: Refund reason
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )
    
    if payment.status != PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only refund completed payments",
        )
    
    refund_amount = amount or payment.amount
    
    if refund_amount > payment.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refund amount cannot exceed payment amount",
        )
    
    # Process refund via service
    try:
        result = payment_service.process_refund(
            payment=payment,
            amount=refund_amount,
            reason=reason,
        )
        
        return success_response(data=result, message="Refund processed")
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Refund failed: {str(e)}",
        )


@router.get("/admin/all", response_model=dict, summary="List all payments (admin)")
def list_all_payments(
    page: int = 1,
    size: int = 20,
    status: Optional[PaymentStatus] = None,
    provider: Optional[PaymentProvider] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: object = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all payments with filters (admin only).
    """
    query = db.query(Payment)
    
    if status:
        query = query.filter(Payment.status == status)
    if provider:
        query = query.filter(Payment.provider == provider)
    if date_from:
        query = query.filter(Payment.created_at >= date_from)
    if date_to:
        query = query.filter(Payment.created_at <= date_to)
    
    total = query.count()
    payments = query.order_by(Payment.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return success_response(
        data=build_paginated_response(payments, total, page, size),
        message="Payments retrieved",
    )