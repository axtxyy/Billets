"""
Hotel info router for Billets Hotel Booking System.

This router handles hotel information endpoints.

Endpoints:
- GET /api/hotel/info - Get hotel information (public)
"""

from fastapi import APIRouter, Depends
from app.config import settings
from app.utils import success_response

router = APIRouter()


@router.get("/info", response_model=dict, summary="Get hotel information")
def get_hotel_info():
    """
    Get hotel information.
    
    Public endpoint - no authentication required.
    """
    nearby = []
    for item in settings.HOTEL_NEARBY:
        parts = item.split(":")
        if len(parts) == 2:
            nearby.append({"name": parts[0], "distance": parts[1]})
    
    return success_response(
        data={
            "name": settings.HOTEL_NAME,
            "tagline": settings.HOTEL_TAGLINE,
            "description": settings.HOTEL_DESCRIPTION,
            "logo": settings.HOTEL_LOGO,
            "heroImage": settings.HOTEL_HERO_IMAGE,
            "address": {
                "line1": settings.HOTEL_ADDRESS_LINE1,
                "line2": settings.HOTEL_ADDRESS_LINE2,
                "city": settings.HOTEL_CITY,
                "state": settings.HOTEL_STATE,
                "country": settings.HOTEL_COUNTRY,
                "pincode": settings.HOTEL_PINCODE,
            },
            "phone": settings.HOTEL_PHONE,
            "email": settings.HOTEL_EMAIL,
            "checkIn": settings.HOTEL_CHECK_IN,
            "checkOut": settings.HOTEL_CHECK_OUT,
            "policies": settings.HOTEL_POLICIES,
            "amenities": settings.HOTEL_AMENITIES,
            "nearby": nearby,
            "social": {
                "facebook": settings.HOTEL_SOCIAL_FACEBOOK,
                "instagram": settings.HOTEL_SOCIAL_INSTAGRAM,
                "twitter": settings.HOTEL_SOCIAL_TWITTER,
            },
            "mapEmbedUrl": settings.HOTEL_MAP_EMBED_URL,
        },
        message="Hotel information retrieved",
    )