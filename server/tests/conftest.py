"""
Test configuration and fixtures for Billets Hotel Booking System.

This module provides shared fixtures for all tests.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
from pathlib import Path

# Add server to path
sys.path.append(str(Path(__file__).parent.parent))

from app.main import app
from app.database import Base, get_db
from app.config import settings
from app.models import User, UserRole, Room, Amenity


# Test database URL (SQLite in memory for testing)
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


def override_get_db():
    """Override database dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create test database tables before all tests."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a new database session for each test."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create test client with overridden database."""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        hashed_password="$2b$12$testhash",  # dummy hash
        full_name="Test User",
        role=UserRole.GUEST,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_user(db_session):
    """Create an admin test user."""
    user = User(
        email="admin@example.com",
        hashed_password="$2b$12$testhash",
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_room(db_session):
    """Create a test room."""
    room = Room(
        name="Test Room",
        description="A test room",
        room_type="standard",
        price_per_night=100.0,
        capacity=2,
        room_number="101",
        is_active=True,
    )
    db_session.add(room)
    db_session.commit()
    db_session.refresh(room)
    return room


@pytest.fixture
def test_amenity(db_session):
    """Create a test amenity."""
    amenity = Amenity(
        name="WiFi",
        description="Free WiFi",
        category="room",
        is_active=True,
    )
    db_session.add(amenity)
    db_session.commit()
    db_session.refresh(amenity)
    return amenity


@pytest.fixture
def auth_headers(test_user):
    """Create authorization headers for test user."""
    from app.auth import create_token_pair
    access_token, _ = create_token_pair(
        user_id=test_user.id,
        email=test_user.email,
        role=test_user.role,
    )
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_auth_headers(admin_user):
    """Create authorization headers for admin user."""
    from app.auth import create_token_pair
    access_token, _ = create_token_pair(
        user_id=admin_user.id,
        email=admin_user.email,
        role=admin_user.role,
    )
    return {"Authorization": f"Bearer {access_token}"}