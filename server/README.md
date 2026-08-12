# Billets Hotel Booking System - Backend API

A production-ready FastAPI backend for the Billets Hotel Booking System.

## Features

- **Authentication**: JWT-based auth with access/refresh tokens, role-based access control
- **Rooms**: CRUD, search, availability checking, featured rooms
- **Bookings**: Creation, cancellation, history, price calculation, double-booking prevention
- **Payments**: Razorpay & Stripe integration ready, webhooks, refunds
- **Dining**: Restaurant reservations
- **Events**: Event space booking requests
- **Contact**: Contact form submissions
- **Newsletter**: Email subscriptions
- **Reviews**: Guest reviews with verification
- **Gallery**: Hotel image gallery
- **Amenities**: Room and hotel amenities
- **File Upload**: Image upload with validation

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy 2.0** - ORM with async support
- **Alembic** - Database migrations
- **Pydantic v2** - Data validation
- **JWT** - Token-based authentication
- **Passlib/bcrypt** - Password hashing
- **Uvicorn** - ASGI server
- **Pytest** - Testing framework

## Project Structure

```
server/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database setup
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── dependencies.py      # FastAPI dependencies
│   ├── utils.py             # Utility functions
│   ├── routers/             # API route handlers
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── rooms.py
│   │   ├── bookings.py
│   │   ├── payments.py
│   │   ├── dining.py
│   │   ├── events.py
│   │   ├── gallery.py
│   │   ├── amenities.py
│   │   ├── reviews.py
│   │   ├── contact.py
│   │   └── newsletter.py
│   └── services/            # Business logic
│       ├── booking_service.py
│       └── payment_service.py
├── uploads/                 # Uploaded files
├── tests/                   # Test suite
├── alembic/                 # Database migrations
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
└── alembic.ini              # Alembic configuration
```

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- pip

### Installation

1. **Clone and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

5. **Set up database:**
   ```bash
   # Create PostgreSQL database
   createdb billets
   
   # Run migrations
   alembic upgrade head
   ```

6. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

7. **Access API docs:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Environment Variables

Key variables in `.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/billets
SECRET_KEY=your-super-secret-key-min-32-chars
DEBUG=true
ENVIRONMENT=development

# Payment (optional)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/change-password` - Change password

### Users (Admin)
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/{id}/activate` - Activate user
- `POST /api/users/{id}/deactivate` - Deactivate user

### Rooms
- `GET /api/rooms` - List rooms (public)
- `GET /api/rooms/featured` - Featured rooms
- `GET /api/rooms/search` - Search with availability
- `GET /api/rooms/{id}` - Room details
- `POST /api/rooms` - Create room (admin)
- `PUT /api/rooms/{id}` - Update room (admin)
- `DELETE /api/rooms/{id}` - Delete room (admin)
- `POST /api/rooms/{id}/images` - Upload image (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - My bookings
- `GET /api/bookings/{id}` - Booking details
- `PUT /api/bookings/{id}` - Update booking
- `POST /api/bookings/{id}/cancel` - Cancel booking
- `GET /api/bookings/{id}/price` - Price breakdown

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/booking/{id}` - Payment history
- `POST /api/payments/webhook/razorpay` - Razorpay webhook
- `POST /api/payments/webhook/stripe` - Stripe webhook

### Dining
- `POST /api/dining` - Create reservation
- `GET /api/dining` - My reservations
- `PUT /api/dining/{id}` - Update reservation
- `POST /api/dining/{id}/cancel` - Cancel reservation

### Events
- `POST /api/events` - Create event booking
- `GET /api/events` - My event bookings
- `PUT /api/events/{id}` - Update event
- `POST /api/events/{id}/cancel` - Cancel event

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact/my` - My messages

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe
- `POST /api/newsletter/unsubscribe` - Unsubscribe

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/room/{id}` - Room reviews
- `GET /api/reviews/room/{id}/stats` - Review stats

### Gallery
- `GET /api/gallery` - Gallery images
- `POST /api/gallery` - Upload image (admin)

### Amenities
- `GET /api/amenities` - List amenities
- `POST /api/amenities` - Create amenity (admin)

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Deployment

### Docker

```bash
docker build -t billets-api .
docker run -p 8000:8000 billets-api
```

### Production Checklist

- [ ] Set `DEBUG=false`
- [ ] Set strong `SECRET_KEY`
- [ ] Use production database
- [ ] Configure HTTPS
- [ ] Set up payment webhooks
- [ ] Configure email service
- [ ] Set up file storage (S3/Cloudinary)
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging

## License

MIT License