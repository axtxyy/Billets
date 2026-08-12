"""
Main application entry point for Billets Hotel Booking System.

This is the FastAPI application factory that creates and configures the app.

Why this file exists:
- Creates the FastAPI application instance
- Configures middleware (CORS, etc.)
- Registers all API routers
- Sets up startup/shutdown events
- Configures exception handlers
- Mounts static files for uploads

How it connects to the project:
- Imports and includes all routers
- Uses config for settings
- Uses database for initialization
- Entry point for uvicorn to run the server

Request Lifecycle:
1. Request comes in
2. CORS middleware checks origin
3. Route matching finds handler
4. Dependencies run (DB, auth, etc.)
5. Route function executes
6. Response serialized and returned
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.config import settings
from app.database import init_db, engine
from app.utils import success_response, error_response


# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events.
    Replaces the deprecated @app.on_event("startup") and @app.on_event("shutdown").
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Initialize database tables (development only - use Alembic in production)
    if settings.ENVIRONMENT == "development":
        try:
            init_db()
            logger.info("Database tables created/verified")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
    
    yield  # Application runs here
    
    # Shutdown
    logger.info("Shutting down...")
    engine.dispose()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Hotel Booking System API for Billets Hotel",
    docs_url="/docs" if settings.DEBUG else None,  # Disable Swagger in production
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ============================================================================
# Middleware
# ============================================================================

# CORS Middleware - allows frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom middleware for request logging (optional)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log incoming requests (optional - for debugging)."""
    if settings.DEBUG:
        logger.debug(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    if settings.DEBUG:
        logger.debug(f"Response: {response.status_code}")
    return response


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format."""
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(
            message=exc.detail,
            error_code=f"HTTP_{exc.status_code}",
            status_code=exc.status_code,
        ),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(x) for x in error["loc"])
        errors.append(f"{field}: {error['msg']}")
    
    return JSONResponse(
        status_code=422,
        content=error_response(
            message="Validation error",
            error_code="VALIDATION_ERROR",
            status_code=422,
        ),
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content=error_response(
            message="Database error occurred",
            error_code="DATABASE_ERROR",
            status_code=500,
        ),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=error_response(
            message="Internal server error",
            error_code="INTERNAL_ERROR",
            status_code=500,
        ),
    )


# ============================================================================
# Static Files
# ============================================================================

# Mount uploads directory for serving uploaded files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# ============================================================================
# Health Check
# ============================================================================

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Used by load balancers and monitoring to verify service is running.
    
    Returns:
        dict: Health status
    """
    return success_response(
        data={
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        },
        message="Service is healthy",
    )


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint.
    
    Returns basic API information.
    """
    return success_response(
        data={
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health",
        },
        message=f"Welcome to {settings.APP_NAME} API",
    )


# ============================================================================
# Router Registration
# ============================================================================

# Import all routers
from app.routers import (
    users,
    rooms,
    bookings,
    payments,
    dining,
    events,
    gallery,
    amenities,
    reviews,
    contact,
    newsletter,
    auth as auth_router,
)

# Include routers with prefixes and tags
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(dining.router, prefix="/api/dining", tags=["Dining Reservations"])
app.include_router(events.router, prefix="/api/events", tags=["Event Bookings"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["Gallery"])
app.include_router(amenities.router, prefix="/api/amenities", tags=["Amenities"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["Newsletter"])


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning",
    )