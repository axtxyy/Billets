"""
Payment service for Billets Hotel Booking System.

This module handles payment gateway integration (Razorpay, Stripe).

Why this file exists:
- Separates payment gateway logic from routers
- Provides unified interface for different payment providers
- Handles payment initiation, verification, and webhooks
- Keeps sensitive payment logic isolated

How it connects to the project:
- Used by payments router
- Uses models for database operations
- Uses config for API keys
- Integrates with Razorpay and Stripe SDKs

Payment Flow:
1. Frontend calls /api/payments/initiate with booking_id and provider
2. Service creates payment record and calls gateway API
3. Gateway returns order/payment intent data
4. Frontend redirects user to gateway payment page
5. User completes payment on gateway
6. Gateway redirects back to frontend with payment details
7. Frontend calls /api/payments/verify with gateway response
8. Service verifies payment with gateway
9. If successful, updates booking status to confirmed
10. Gateway also sends webhook for async confirmation

Security:
- Never log sensitive payment data
- Verify webhook signatures
- Use environment variables for API keys
- Validate amounts match booking totals
"""

import json
import hmac
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Payment, PaymentStatus, PaymentProvider, Booking, BookingStatus
from app.schemas import PaymentInitiateResponse
from app.utils import utc_now


class PaymentService:
    """Service class for payment operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ========================================================================
    # Razorpay Integration
    # ========================================================================
    
    def _get_razorpay_client(self):
        """Get Razorpay client instance."""
        try:
            import razorpay
            return razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
        except ImportError:
            raise ValueError("Razorpay SDK not installed. Run: pip install razorpay")
    
    def initiate_razorpay_payment(
        self,
        booking: Booking,
        payment_method: Optional[str] = None,
        return_url: Optional[str] = None
    ) -> PaymentInitiateResponse:
        """
        Initiate Razorpay payment for a booking.
        
        Args:
            booking: Booking to pay for
            payment_method: Payment method (card, upi, netbanking, etc.)
            return_url: URL to redirect after payment
            
        Returns:
            PaymentInitiateResponse: Gateway response data
        """
        client = self._get_razorpay_client()
        
        # Create Razorpay order
        amount_paise = int(booking.total_amount * 100)  # Razorpay expects paise
        
        order_data = {
            "amount": amount_paise,
            "currency": "INR",  # Razorpay primarily uses INR
            "receipt": f"booking_{booking.id}",
            "notes": {
                "booking_id": str(booking.id),
                "user_id": str(booking.user_id),
            },
        }
        
        order = client.order.create(order_data)
        
        # Create payment record
        payment = Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            currency="INR",
            provider=PaymentProvider.RAZORPAY,
            provider_order_id=order["id"],
            status=PaymentStatus.PENDING,
            payment_method=payment_method,
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        
        return PaymentInitiateResponse(
            payment_id=payment.id,
            order_id=order["id"],
            amount=booking.total_amount,
            currency="INR",
            provider=PaymentProvider.RAZORPAY,
            razorpay_order_id=order["id"],
            razorpay_key_id=settings.RAZORPAY_KEY_ID,
        )
    
    def verify_razorpay_payment(
        self,
        payment: Payment,
        razorpay_payment_id: str,
        razorpay_order_id: str,
        razorpay_signature: str
    ) -> Payment:
        """
        Verify Razorpay payment signature.
        
        Args:
            payment: Payment record
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_order_id: Order ID from Razorpay
            razorpay_signature: Signature from Razorpay
            
        Returns:
            Updated Payment record
            
        Raises:
            ValueError: If verification fails
        """
        client = self._get_razorpay_client()
        
        # Verify signature
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            })
        except Exception as e:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = f"Signature verification failed: {str(e)}"
            self.db.commit()
            raise ValueError("Payment signature verification failed")
        
        # Fetch payment details from Razorpay
        rzp_payment = client.payment.fetch(razorpay_payment_id)
        
        # Verify amount matches
        expected_amount = int(payment.amount * 100)
        if rzp_payment["amount"] != expected_amount:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = "Amount mismatch"
            self.db.commit()
            raise ValueError("Payment amount mismatch")
        
        # Update payment record
        payment.provider_payment_id = razorpay_payment_id
        payment.status = PaymentStatus.COMPLETED
        payment.payment_method = rzp_payment.get("method")
        payment.processed_at = utc_now()
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment
    
    def verify_razorpay_webhook(self, body: bytes, signature: str) -> bool:
        """
        Verify Razorpay webhook signature.
        
        Args:
            body: Raw request body
            signature: X-Razorpay-Signature header
            
        Returns:
            bool: True if valid
        """
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    def process_razorpay_webhook(self, body: bytes) -> Dict[str, Any]:
        """
        Process Razorpay webhook event.
        
        Args:
            body: Raw request body
            
        Returns:
            Dict with processing result
        """
        event = json.loads(body)
        event_type = event.get("event")
        
        if event_type == "payment.captured":
            payment_data = event["payload"]["payment"]["entity"]
            self._handle_razorpay_payment_captured(payment_data)
        elif event_type == "payment.failed":
            payment_data = event["payload"]["payment"]["entity"]
            self._handle_razorpay_payment_failed(payment_data)
        elif event_type == "refund.processed":
            refund_data = event["payload"]["refund"]["entity"]
            self._handle_razorpay_refund_processed(refund_data)
        
        return {"status": "processed", "event": event_type}
    
    def _handle_razorpay_payment_captured(self, payment_data: Dict[str, Any]):
        """Handle payment.captured webhook."""
        rzp_order_id = payment_data.get("order_id")
        rzp_payment_id = payment_data.get("id")
        
        payment = self.db.query(Payment).filter(
            Payment.provider_order_id == rzp_order_id,
            Payment.provider == PaymentProvider.RAZORPAY
        ).first()
        
        if payment and payment.status != PaymentStatus.COMPLETED:
            payment.provider_payment_id = rzp_payment_id
            payment.status = PaymentStatus.COMPLETED
            payment.payment_method = payment_data.get("method")
            payment.processed_at = utc_now()
            
            # Update booking status
            booking = self.db.query(Booking).filter(Booking.id == payment.booking_id).first()
            if booking and booking.status == BookingStatus.PENDING:
                booking.status = BookingStatus.CONFIRMED
            
            self.db.commit()
    
    def _handle_razorpay_payment_failed(self, payment_data: Dict[str, Any]):
        """Handle payment.failed webhook."""
        rzp_order_id = payment_data.get("order_id")
        
        payment = self.db.query(Payment).filter(
            Payment.provider_order_id == rzp_order_id,
            Payment.provider == PaymentProvider.RAZORPAY
        ).first()
        
        if payment:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = payment_data.get("error_description", "Payment failed")
            self.db.commit()
    
    def _handle_razorpay_refund_processed(self, refund_data: Dict[str, Any]):
        """Handle refund.processed webhook."""
        rzp_payment_id = refund_data.get("payment_id")
        
        payment = self.db.query(Payment).filter(
            Payment.provider_payment_id == rzp_payment_id,
            Payment.provider == PaymentProvider.RAZORPAY
        ).first()
        
        if payment:
            payment.refund_amount = refund_data.get("amount", 0) / 100
            payment.status = PaymentStatus.REFUNDED if payment.refund_amount >= payment.amount else PaymentStatus.PARTIALLY_REFUNDED
            self.db.commit()
    
    # ========================================================================
    # Stripe Integration
    # ========================================================================
    
    def _get_stripe_client(self):
        """Get Stripe client instance."""
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            return stripe
        except ImportError:
            raise ValueError("Stripe SDK not installed. Run: pip install stripe")
    
    def initiate_stripe_payment(
        self,
        booking: Booking,
        payment_method: Optional[str] = None,
        return_url: Optional[str] = None
    ) -> PaymentInitiateResponse:
        """
        Initiate Stripe payment for a booking.
        
        Args:
            booking: Booking to pay for
            payment_method: Payment method type
            return_url: URL to redirect after payment
            
        Returns:
            PaymentInitiateResponse: Gateway response data
        """
        stripe = self._get_stripe_client()
        
        # Create PaymentIntent
        amount_cents = int(booking.total_amount * 100)  # Stripe expects cents
        
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",  # Stripe uses USD by default
            metadata={
                "booking_id": str(booking.id),
                "user_id": str(booking.user_id),
            },
            automatic_payment_methods={"enabled": True},
        )
        
        # Create payment record
        payment = Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            currency="USD",
            provider=PaymentProvider.STRIPE,
            provider_payment_id=intent.id,  # Store payment intent ID
            status=PaymentStatus.PENDING,
            payment_method=payment_method,
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        
        return PaymentInitiateResponse(
            payment_id=payment.id,
            order_id=intent.id,
            amount=booking.total_amount,
            currency="USD",
            provider=PaymentProvider.STRIPE,
            stripe_client_secret=intent.client_secret,
            stripe_publishable_key=settings.STRIPE_PUBLISHABLE_KEY,
        )
    
    def verify_stripe_payment(
        self,
        payment: Payment,
        payment_intent_id: str
    ) -> Payment:
        """
        Verify Stripe payment.
        
        Args:
            payment: Payment record
            payment_intent_id: Payment Intent ID from Stripe
            
        Returns:
            Updated Payment record
            
        Raises:
            ValueError: If verification fails
        """
        stripe = self._get_stripe_client()
        
        # Retrieve PaymentIntent
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status != "succeeded":
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = f"Payment status: {intent.status}"
            self.db.commit()
            raise ValueError(f"Payment not successful: {intent.status}")
        
        # Verify amount
        expected_amount = int(payment.amount * 100)
        if intent.amount != expected_amount:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = "Amount mismatch"
            self.db.commit()
            raise ValueError("Payment amount mismatch")
        
        # Update payment record
        payment.status = PaymentStatus.COMPLETED
        payment.payment_method = intent.payment_method_types[0] if intent.payment_method_types else "card"
        payment.processed_at = utc_now()
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment
    
    def process_stripe_webhook(self, body: bytes, signature: str) -> Dict[str, Any]:
        """
        Process Stripe webhook event.
        
        Args:
            body: Raw request body
            signature: Stripe-Signature header
            
        Returns:
            Dict with processing result
        """
        stripe = self._get_stripe_client()
        
        try:
            event = stripe.Webhook.construct_event(
                body, signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")
        
        event_type = event["type"]
        
        if event_type == "payment_intent.succeeded":
            self._handle_stripe_payment_succeeded(event["data"]["object"])
        elif event_type == "payment_intent.payment_failed":
            self._handle_stripe_payment_failed(event["data"]["object"])
        elif event_type == "charge.refunded":
            self._handle_stripe_refund(event["data"]["object"])
        
        return {"status": "processed", "event": event_type}
    
    def _handle_stripe_payment_succeeded(self, intent: Dict[str, Any]):
        """Handle payment_intent.succeeded webhook."""
        payment = self.db.query(Payment).filter(
            Payment.provider_payment_id == intent["id"],
            Payment.provider == PaymentProvider.STRIPE
        ).first()
        
        if payment and payment.status != PaymentStatus.COMPLETED:
            payment.status = PaymentStatus.COMPLETED
            payment.payment_method = intent["payment_method_types"][0] if intent["payment_method_types"] else "card"
            payment.processed_at = utc_now()
            
            # Update booking status
            booking = self.db.query(Booking).filter(Booking.id == payment.booking_id).first()
            if booking and booking.status == BookingStatus.PENDING:
                booking.status = BookingStatus.CONFIRMED
            
            self.db.commit()
    
    def _handle_stripe_payment_failed(self, intent: Dict[str, Any]):
        """Handle payment_intent.payment_failed webhook."""
        payment = self.db.query(Payment).filter(
            Payment.provider_payment_id == intent["id"],
            Payment.provider == PaymentProvider.STRIPE
        ).first()
        
        if payment:
            payment.status = PaymentStatus.FAILED
            error = intent.get("last_payment_error", {})
            payment.failure_reason = error.get("message", "Payment failed")
            self.db.commit()
    
    def _handle_stripe_refund(self, charge: Dict[str, Any]):
        """Handle charge.refunded webhook."""
        payment_intent_id = charge.get("payment_intent")
        
        payment = self.db.query(Payment).filter(
            Payment.provider_payment_id == payment_intent_id,
            Payment.provider == PaymentProvider.STRIPE
        ).first()
        
        if payment:
            refund_amount = sum(r["amount"] for r in charge.get("refunds", {}).get("data", []))
            payment.refund_amount = refund_amount / 100
            payment.status = PaymentStatus.REFUNDED if payment.refund_amount >= payment.amount else PaymentStatus.PARTIALLY_REFUNDED
            self.db.commit()
    
    # ========================================================================
    # Generic Methods
    # ========================================================================
    
    def initiate_payment(
        self,
        booking: Booking,
        provider: PaymentProvider,
        payment_method: Optional[str] = None,
        return_url: Optional[str] = None
    ) -> PaymentInitiateResponse:
        """
        Initiate payment with specified provider.
        
        Args:
            booking: Booking to pay for
            provider: Payment provider
            payment_method: Payment method
            return_url: Return URL
            
        Returns:
            PaymentInitiateResponse: Gateway response data
        """
        if provider == PaymentProvider.RAZORPAY:
            return self.initiate_razorpay_payment(booking, payment_method, return_url)
        elif provider == PaymentProvider.STRIPE:
            return self.initiate_stripe_payment(booking, payment_method, return_url)
        elif provider == PaymentProvider.CASH:
            return self._initiate_cash_payment(booking)
        else:
            raise ValueError(f"Unsupported payment provider: {provider}")
    
    def _initiate_cash_payment(self, booking: Booking) -> PaymentInitiateResponse:
        """Create a cash payment record (no gateway)."""
        payment = Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            currency="USD",
            provider=PaymentProvider.CASH,
            status=PaymentStatus.PENDING,
            payment_method="cash",
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        
        return PaymentInitiateResponse(
            payment_id=payment.id,
            order_id=f"cash_{payment.id}",
            amount=booking.total_amount,
            currency="USD",
            provider=PaymentProvider.CASH,
        )
    
    def verify_payment(
        self,
        payment: Payment,
        provider: PaymentProvider,
        verification_data: Dict[str, Any]
    ) -> Payment:
        """
        Verify payment with specified provider.
        
        Args:
            payment: Payment record
            provider: Payment provider
            verification_data: Provider-specific verification data
            
        Returns:
            Updated Payment record
        """
        if provider == PaymentProvider.RAZORPAY:
            return self.verify_razorpay_payment(
                payment,
                verification_data.get("razorpay_payment_id"),
                verification_data.get("razorpay_order_id"),
                verification_data.get("razorpay_signature"),
            )
        elif provider == PaymentProvider.STRIPE:
            return self.verify_stripe_payment(
                payment,
                verification_data.get("stripe_payment_intent_id"),
            )
        elif provider == PaymentProvider.CASH:
            return self._verify_cash_payment(payment)
        else:
            raise ValueError(f"Unsupported payment provider: {provider}")
    
    def _verify_cash_payment(self, payment: Payment) -> Payment:
        """Mark cash payment as completed (admin action)."""
        payment.status = PaymentStatus.COMPLETED
        payment.processed_at = utc_now()
        self.db.commit()
        self.db.refresh(payment)
        return payment
    
    def process_refund(
        self,
        payment: Payment,
        amount: float,
        reason: str
    ) -> Payment:
        """
        Process a refund for a payment.
        
        Args:
            payment: Payment to refund
            amount: Refund amount
            reason: Refund reason
            
        Returns:
            Updated Payment record
        """
        if payment.provider == PaymentProvider.RAZORPAY:
            return self._process_razorpay_refund(payment, amount, reason)
        elif payment.provider == PaymentProvider.STRIPE:
            return self._process_stripe_refund(payment, amount, reason)
        elif payment.provider == PaymentProvider.CASH:
            return self._process_cash_refund(payment, amount, reason)
        else:
            raise ValueError(f"Refund not supported for provider: {payment.provider}")
    
    def _process_razorpay_refund(self, payment: Payment, amount: float, reason: str) -> Payment:
        """Process Razorpay refund."""
        client = self._get_razorpay_client()
        
        refund = client.payment.refund(
            payment.provider_payment_id,
            {
                "amount": int(amount * 100),
                "notes": {"reason": reason},
            }
        )
        
        payment.refund_amount = amount
        payment.refund_reason = reason
        payment.status = PaymentStatus.REFUNDED if amount >= payment.amount else PaymentStatus.PARTIALLY_REFUNDED
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment
    
    def _process_stripe_refund(self, payment: Payment, amount: float, reason: str) -> Payment:
        """Process Stripe refund."""
        stripe = self._get_stripe_client()
        
        refund = stripe.Refund.create(
            payment_intent=payment.provider_payment_id,
            amount=int(amount * 100),
            reason="requested_by_customer",
            metadata={"reason": reason},
        )
        
        payment.refund_amount = amount
        payment.refund_reason = reason
        payment.status = PaymentStatus.REFUNDED if amount >= payment.amount else PaymentStatus.PARTIALLY_REFUNDED
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment
    
    def _process_cash_refund(self, payment: Payment, amount: float, reason: str) -> Payment:
        """Process cash refund (manual)."""
        payment.refund_amount = amount
        payment.refund_reason = reason
        payment.status = PaymentStatus.REFUNDED if amount >= payment.amount else PaymentStatus.PARTIALLY_REFUNDED
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment


# Convenience function for dependency injection
def get_payment_service(db: Session) -> PaymentService:
    """Get payment service instance."""
    return PaymentService(db)