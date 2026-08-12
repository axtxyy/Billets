"""
Database seeder for Billets Hotel Booking System.

This script populates the database with initial data:
- Amenities
- Rooms with images
- Gallery images

Run with: python seed.py
"""

import sys
import os
from pathlib import Path

# Add server directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.models import Room, RoomImage, Amenity, GalleryImage
from app.config import settings


def seed_amenities(db):
    """Seed amenities."""
    amenities_data = [
        {"name": "Free Wi-Fi", "description": "High-speed wireless internet", "icon": "wifi", "category": "room"},
        {"name": "Air Conditioning", "description": "Individual climate control", "icon": "air-conditioner", "category": "room"},
        {"name": "Private Bathroom", "description": "En-suite bathroom with hot & cold water", "icon": "bath", "category": "room"},
        {"name": "Electronic Safe", "description": "In-room digital safe for valuables", "icon": "safe", "category": "room"},
        {"name": "Kitchenette Access", "description": "Shared kitchenette with basic appliances", "icon": "kitchen", "category": "room"},
        {"name": "Mineral Water", "description": "Complimentary bottled water daily", "icon": "droplet", "category": "room"},
        {"name": "Toiletries", "description": "Soap, shampoo, and essential toiletries", "icon": "soap", "category": "room"},
        {"name": "Hot & Cold Water", "description": "24/7 hot and cold water supply", "icon": "thermometer", "category": "room"},
        {"name": "Parking", "description": "On-site parking available", "icon": "car", "category": "hotel"},
        {"name": "Power Backup", "description": "Generator backup for all rooms", "icon": "battery", "category": "hotel"},
        {"name": "Beach Access", "description": "150m walk to Surathkal Beach", "icon": "waves", "category": "hotel"},
        {"name": "Free Cancellation", "description": "Free cancellation up to 24 hours before check-in", "icon": "calendar-x", "category": "policy"},
    ]

    for amenity_data in amenities_data:
        existing = db.query(Amenity).filter(Amenity.name == amenity_data["name"]).first()
        if not existing:
            amenity = Amenity(**amenity_data)
            db.add(amenity)
            print(f"Added amenity: {amenity_data['name']}")
        else:
            print(f"Amenity already exists: {amenity_data['name']}")

    db.commit()


def seed_rooms(db):
    """Seed rooms with initial data matching frontend."""
    # Get amenity IDs
    wifi = db.query(Amenity).filter(Amenity.name == "Free Wi-Fi").first()
    ac = db.query(Amenity).filter(Amenity.name == "Air Conditioning").first()
    bathroom = db.query(Amenity).filter(Amenity.name == "Private Bathroom").first()
    safe = db.query(Amenity).filter(Amenity.name == "Electronic Safe").first()
    kitchenette = db.query(Amenity).filter(Amenity.name == "Kitchenette Access").first()
    water = db.query(Amenity).filter(Amenity.name == "Mineral Water").first()
    toiletries = db.query(Amenity).filter(Amenity.name == "Toiletries").first()
    hot_cold = db.query(Amenity).filter(Amenity.name == "Hot & Cold Water").first()
    cancellation = db.query(Amenity).filter(Amenity.name == "Free Cancellation").first()

    rooms_data = [
        {
            "name": "2 Beds Combo (Free Cancellation)",
            "description": "Fits 2 adults. Includes kitchenette access, free cancellation up to 24 hrs before check-in.",
            "room_type": "private",
            "price_per_night": 1598,
            "capacity": 2,
            "size_sqm": 20,
            "bed_type": "2 Single Beds",
            "floor": 1,
            "room_number": "101",
            "is_active": True,
            "is_featured": True,
            "amenities": [wifi, kitchenette, cancellation, water, toiletries, hot_cold] if all([wifi, kitchenette, cancellation, water, toiletries, hot_cold]) else [],
            "images": [
                {
                    "image_url": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg",
                    "alt_text": "2 Beds Combo room at Billets",
                    "display_order": 0,
                    "is_primary": True,
                },
            ],
        },
        {
            "name": "8-Bed Mixed Dormitory (per bed)",
            "description": "Shared dormitory with Wi-Fi, private bathroom, mineral water, electronic safe, hot & cold water, toiletries.",
            "room_type": "dormitory",
            "price_per_night": 799,
            "capacity": 1,
            "size_sqm": 30,
            "bed_type": "Single Bed in 8-bed dorm",
            "floor": 1,
            "room_number": "DORM-8-01",
            "is_active": True,
            "is_featured": True,
            "amenities": [wifi, bathroom, safe, water, toiletries, hot_cold, cancellation] if all([wifi, bathroom, safe, water, toiletries, hot_cold, cancellation]) else [],
            "images": [
                {
                    "image_url": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFG7ZS9YBFEHAQ5T5YPD/01KT6ZHFG7ZS9YBFEHAQ5T5YPD.jpg",
                    "alt_text": "8-Bed Mixed Dormitory at Billets",
                    "display_order": 0,
                    "is_primary": True,
                },
            ],
        },
        {
            "name": "6-Bed Mixed Dormitory (per bed)",
            "description": "Shared dormitory with Wi-Fi, private bathroom, mineral water, electronic safe, hot & cold water, toiletries.",
            "room_type": "dormitory",
            "price_per_night": 799,
            "capacity": 1,
            "size_sqm": 25,
            "bed_type": "Single Bed in 6-bed dorm",
            "floor": 1,
            "room_number": "DORM-6-01",
            "is_active": True,
            "is_featured": True,
            "amenities": [wifi, bathroom, safe, water, toiletries, hot_cold, cancellation] if all([wifi, bathroom, safe, water, toiletries, hot_cold, cancellation]) else [],
            "images": [
                {
                    "image_url": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFG7ZS9YBFEHAQ5T5YPD/01KT6ZHFG7ZS9YBFEHAQ5T5YPD.jpg",
                    "alt_text": "6-Bed Mixed Dormitory at Billets",
                    "display_order": 0,
                    "is_primary": True,
                },
            ],
        },
        {
            "name": "Couple Room (Double Bed)",
            "description": "Private double-bed room with Wi-Fi, bathroom, electronic safe, hot & cold water, toiletries, towels. Free cancellation up to 24 hrs before check-in.",
            "room_type": "private",
            "price_per_night": 3199,
            "capacity": 2,
            "size_sqm": 22,
            "bed_type": "Double Bed",
            "floor": 2,
            "room_number": "201",
            "is_active": True,
            "is_featured": True,
            "amenities": [wifi, bathroom, safe, water, toiletries, hot_cold, cancellation] if all([wifi, bathroom, safe, water, toiletries, hot_cold, cancellation]) else [],
            "images": [
                {
                    "image_url": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg",
                    "alt_text": "Couple Room with Double Bed at Billets",
                    "display_order": 0,
                    "is_primary": True,
                },
            ],
        },
    ]

    for room_data in rooms_data:
        amenities = room_data.pop("amenities", [])
        images = room_data.pop("images", [])

        # Check if room already exists
        existing = db.query(Room).filter(Room.room_number == room_data["room_number"]).first()
        if existing:
            print(f"Room already exists: {room_data['name']} ({room_data['room_number']})")
            continue

        room = Room(**room_data)
        room.amenities = [a for a in amenities if a]
        db.add(room)
        db.flush()  # Get the room ID

        # Add images
        for img_data in images:
            image = RoomImage(room_id=room.id, **img_data)
            db.add(image)

        print(f"Added room: {room.name} ({room.room_number})")

    db.commit()


def seed_gallery(db):
    """Seed gallery images."""
    gallery_data = [
        {
            "title": "Billets Hostel Exterior",
            "description": "Front view of Billets hostel near Surathkal Beach",
            "image_url": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg",
            "category": "hotel",
            "display_order": 0,
            "is_published": True,
        },
        {
            "title": "Dormitory Room",
            "description": "Shared dormitory with bunk beds",
            "image_url": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFG7ZS9YBFEHAQ5T5YPD/01KT6ZHFG7ZS9YBFEHAQ5T5YPD.jpg",
            "category": "rooms",
            "display_order": 1,
            "is_published": True,
        },
        {
            "title": "Surathkal Beach",
            "description": "Beautiful beach just 150m from the hostel",
            "image_url": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg",
            "category": "hotel",
            "display_order": 2,
            "is_published": True,
        },
        {
            "title": "Common Area",
            "description": "Shared common area for guests",
            "image_url": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFG7ZS9YBFEHAQ5T5YPD/01KT6ZHFG7ZS9YBFEHAQ5T5YPD.jpg",
            "category": "amenities",
            "display_order": 3,
            "is_published": True,
        },
    ]

    for img_data in gallery_data:
        existing = db.query(GalleryImage).filter(GalleryImage.title == img_data["title"]).first()
        if not existing:
            image = GalleryImage(**img_data)
            db.add(image)
            print(f"Added gallery image: {img_data['title']}")
        else:
            print(f"Gallery image already exists: {img_data['title']}")

    db.commit()


def main():
    """Main seeder function."""
    print("=" * 50)
    print("Billets Database Seeder")
    print("=" * 50)
    print(f"Database: {settings.DATABASE_URL}")
    print(f"Environment: {settings.ENVIRONMENT}")
    print()

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("Database tables created/verified")

    db = SessionLocal()
    try:
        print("\n--- Seeding Amenities ---")
        seed_amenities(db)

        print("\n--- Seeding Rooms ---")
        seed_rooms(db)

        print("\n--- Seeding Gallery ---")
        seed_gallery(db)

        print("\n" + "=" * 50)
        print("Seeding completed successfully!")
        print("=" * 50)

    except Exception as e:
        print(f"\nError during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()