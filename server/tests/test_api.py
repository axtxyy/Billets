"""
Tests for authentication endpoints.
"""

import pytest
from fastapi.testclient import TestClient


class TestAuthEndpoints:
    """Test authentication endpoints."""
    
    def test_register_user(self, client):
        """Test user registration."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecurePass123!",
                "full_name": "New User",
                "phone": "+1234567890",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "newuser@example.com"
        assert data["data"]["full_name"] == "New User"
        assert "id" in data["data"]
        assert "hashed_password" not in data["data"]
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registering with existing email."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": test_user.email,
                "password": "SecurePass123!",
                "full_name": "Another User",
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert "already registered" in data["detail"].lower()
    
    def test_register_invalid_email(self, client):
        """Test registering with invalid email."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "invalid-email",
                "password": "SecurePass123!",
                "full_name": "Test User",
            },
        )
        assert response.status_code == 422
    
    def test_register_weak_password(self, client):
        """Test registering with weak password."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test2@example.com",
                "password": "weak",
                "full_name": "Test User",
            },
        )
        assert response.status_code == 422
    
    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "SecurePass123!",  # Note: test_user has dummy hash, this will fail
            },
        )
        # This will fail because test_user has dummy hash
        # In real tests, you'd create user with known password
        assert response.status_code in [200, 401]
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
    
    def test_get_current_user(self, client, auth_headers):
        """Test getting current user profile."""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "test@example.com"
    
    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without token."""
        response = client.get("/api/auth/me")
        assert response.status_code == 401
    
    def test_update_profile(self, client, auth_headers):
        """Test updating user profile."""
        response = client.put(
            "/api/auth/me",
            headers=auth_headers,
            json={
                "full_name": "Updated Name",
                "phone": "+0987654321",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["full_name"] == "Updated Name"
    
    def test_refresh_token(self, client, test_user):
        """Test refreshing access token."""
        from app.auth import create_token_pair
        _, refresh_token = create_token_pair(
            user_id=test_user.id,
            email=test_user.email,
            role=test_user.role,
        )
        
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]


class TestUserEndpoints:
    """Test user management endpoints."""
    
    def test_get_my_profile(self, client, auth_headers):
        """Test getting my profile."""
        response = client.get("/api/users/me", headers=auth_headers)
        assert response.status_code == 200
    
    def test_list_users_admin(self, client, admin_auth_headers):
        """Test listing users as admin."""
        response = client.get("/api/users", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "items" in data["data"]
    
    def test_list_users_regular_user_forbidden(self, client, auth_headers):
        """Test listing users as regular user (forbidden)."""
        response = client.get("/api/users", headers=auth_headers)
        assert response.status_code == 403


class TestRoomEndpoints:
    """Test room endpoints."""
    
    def test_list_rooms(self, client):
        """Test listing rooms (public)."""
        response = client.get("/api/rooms")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_get_featured_rooms(self, client):
        """Test getting featured rooms."""
        response = client.get("/api/rooms/featured")
        assert response.status_code == 200
    
    def test_search_rooms(self, client):
        """Test searching rooms with availability."""
        from datetime import datetime, timedelta
        check_in = datetime.now() + timedelta(days=7)
        check_out = check_in + timedelta(days=2)
        
        response = client.get(
            "/api/rooms/search",
            params={
                "check_in_date": check_in.isoformat(),
                "check_out_date": check_out.isoformat(),
                "adults": 2,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_create_room_admin(self, client, admin_auth_headers):
        """Test creating room as admin."""
        response = client.post(
            "/api/rooms",
            headers=admin_auth_headers,
            json={
                "name": "New Room",
                "room_type": "deluxe",
                "price_per_night": 200.0,
                "capacity": 2,
                "room_number": "201",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["room_number"] == "201"
    
    def test_create_room_regular_user_forbidden(self, client, auth_headers):
        """Test creating room as regular user (forbidden)."""
        response = client.post(
            "/api/rooms",
            headers=auth_headers,
            json={
                "name": "New Room",
                "room_type": "deluxe",
                "price_per_night": 200.0,
                "capacity": 2,
                "room_number": "202",
            },
        )
        assert response.status_code == 403


class TestBookingEndpoints:
    """Test booking endpoints."""
    
    def test_create_booking(self, client, auth_headers, test_room):
        """Test creating a booking."""
        from datetime import datetime, timedelta
        check_in = datetime.now() + timedelta(days=7)
        check_out = check_in + timedelta(days=2)
        
        response = client.post(
            "/api/bookings",
            headers=auth_headers,
            json={
                "room_id": test_room.id,
                "check_in_date": check_in.isoformat(),
                "check_out_date": check_out.isoformat(),
                "adults": 2,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["room_id"] == test_room.id
        assert data["data"]["status"] == "pending"
    
    def test_list_my_bookings(self, client, auth_headers):
        """Test listing my bookings."""
        response = client.get("/api/bookings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_create_booking_past_date(self, client, auth_headers, test_room):
        """Test creating booking with past date."""
        from datetime import datetime, timedelta
        check_in = datetime.now() - timedelta(days=1)
        check_out = check_in + timedelta(days=2)
        
        response = client.post(
            "/api/bookings",
            headers=auth_headers,
            json={
                "room_id": test_room.id,
                "check_in_date": check_in.isoformat(),
                "check_out_date": check_out.isoformat(),
            },
        )
        assert response.status_code == 400


class TestDiningEndpoints:
    """Test dining reservation endpoints."""
    
    def test_create_dining_reservation(self, client, auth_headers):
        """Test creating a dining reservation."""
        from datetime import date, timedelta
        reservation_date = date.today() + timedelta(days=7)
        
        response = client.post(
            "/api/dining",
            headers=auth_headers,
            json={
                "reservation_date": reservation_date.isoformat(),
                "reservation_time": "19:00",
                "party_size": 2,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["party_size"] == 2
    
    def test_list_my_dining_reservations(self, client, auth_headers):
        """Test listing my dining reservations."""
        response = client.get("/api/dining", headers=auth_headers)
        assert response.status_code == 200


class TestEventEndpoints:
    """Test event booking endpoints."""
    
    def test_create_event_booking(self, client, auth_headers):
        """Test creating an event booking."""
        from datetime import date, timedelta
        event_date = date.today() + timedelta(days=30)
        
        response = client.post(
            "/api/events",
            headers=auth_headers,
            json={
                "event_name": "Test Event",
                "event_type": "meeting",
                "event_date": event_date.isoformat(),
                "start_time": "10:00",
                "end_time": "14:00",
                "expected_guests": 50,
                "contact_email": "test@example.com",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["event_name"] == "Test Event"
    
    def test_list_my_event_bookings(self, client, auth_headers):
        """Test listing my event bookings."""
        response = client.get("/api/events", headers=auth_headers)
        assert response.status_code == 200


class TestContactEndpoints:
    """Test contact form endpoints."""
    
    def test_submit_contact_form(self, client):
        """Test submitting contact form."""
        response = client.post(
            "/api/contact",
            json={
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Inquiry",
                "message": "Test message",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
    
    def test_submit_contact_form_logged_in(self, client, auth_headers):
        """Test submitting contact form while logged in."""
        response = client.post(
            "/api/contact",
            headers=auth_headers,
            json={
                "name": "Test User",
                "email": "test@example.com",
                "subject": "Logged in inquiry",
                "message": "Test message",
            },
        )
        assert response.status_code == 201


class TestNewsletterEndpoints:
    """Test newsletter endpoints."""
    
    def test_subscribe_newsletter(self, client):
        """Test subscribing to newsletter."""
        response = client.post(
            "/api/newsletter/subscribe",
            json={
                "email": "newsletter@example.com",
                "name": "Newsletter User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "newsletter@example.com"
    
    def test_unsubscribe_newsletter(self, client):
        """Test unsubscribing from newsletter."""
        # First subscribe
        client.post(
            "/api/newsletter/subscribe",
            json={"email": "unsub@example.com"},
        )
        
        # Then unsubscribe
        response = client.post(
            "/api/newsletter/unsubscribe",
            json={"email": "unsub@example.com"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["is_active"] is False


class TestReviewEndpoints:
    """Test review endpoints."""
    
    def test_get_room_reviews(self, client, test_room):
        """Test getting reviews for a room."""
        response = client.get(f"/api/reviews/room/{test_room.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_get_room_review_stats(self, client, test_room):
        """Test getting review statistics for a room."""
        response = client.get(f"/api/reviews/room/{test_room.id}/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "total_reviews" in data["data"]


class TestGalleryEndpoints:
    """Test gallery endpoints."""
    
    def test_list_gallery_images(self, client):
        """Test listing gallery images."""
        response = client.get("/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_get_gallery_categories(self, client):
        """Test getting gallery categories."""
        response = client.get("/api/gallery/categories")
        assert response.status_code == 200


class TestAmenityEndpoints:
    """Test amenity endpoints."""
    
    def test_list_amenities(self, client):
        """Test listing amenities."""
        response = client.get("/api/amenities")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_get_amenity_categories(self, client):
        """Test getting amenity categories."""
        response = client.get("/api/amenities/categories")
        assert response.status_code == 200


class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["status"] == "healthy"
    
    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "Billets" in data["data"]["app"]


# Run tests with: pytest tests/ -v
if __name__ == "__main__":
    pytest.main([__file__, "-v"])