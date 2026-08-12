"""
Initial migration for Billets Hotel Booking System.

Creates all tables for the hotel booking system.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('role', sa.Enum('guest', 'admin', 'staff', name='userrole'), nullable=False, server_default='guest'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('date_of_birth', sa.DateTime(), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('postal_code', sa.String(length=20), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_role', 'users', ['role'])

    # Create amenities table
    op.create_table(
        'amenities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=100), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )

    # Create rooms table
    op.create_table(
        'rooms',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('room_type', sa.String(length=50), nullable=False),
        sa.Column('price_per_night', sa.Float(), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('size_sqm', sa.Integer(), nullable=True),
        sa.Column('bed_type', sa.String(length=50), nullable=True),
        sa.Column('floor', sa.Integer(), nullable=True),
        sa.Column('room_number', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_featured', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('room_number'),
        sa.CheckConstraint('price_per_night >= 0', name='ck_rooms_price_positive'),
        sa.CheckConstraint('capacity > 0', name='ck_rooms_capacity_positive'),
    )
    op.create_index('ix_rooms_room_type', 'rooms', ['room_type'])
    op.create_index('ix_rooms_is_active', 'rooms', ['is_active'])
    op.create_index('ix_rooms_is_featured', 'rooms', ['is_featured'])

    # Create room_images table
    op.create_table(
        'room_images',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('room_id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('alt_text', sa.String(length=255), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['room_id'], ['rooms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_room_images_room_id', 'room_images', ['room_id'])
    op.create_index('ix_room_images_display_order', 'room_images', ['display_order'])

    # Create room_amenities association table
    op.create_table(
        'room_amenities',
        sa.Column('room_id', sa.Integer(), nullable=False),
        sa.Column('amenity_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['room_id'], ['rooms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['amenity_id'], ['amenities.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('room_id', 'amenity_id'),
    )

    # Create bookings table
    op.create_table(
        'bookings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('room_id', sa.Integer(), nullable=False),
        sa.Column('check_in_date', sa.DateTime(), nullable=False),
        sa.Column('check_out_date', sa.DateTime(), nullable=False),
        sa.Column('adults', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('children', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_nights', sa.Integer(), nullable=False),
        sa.Column('price_per_night', sa.Float(), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=False),
        sa.Column('tax_amount', sa.Float(), nullable=False, server_default='0'),
        sa.Column('discount_amount', sa.Float(), nullable=False, server_default='0'),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', name='bookingstatus'), nullable=False, server_default='pending'),
        sa.Column('special_requests', sa.Text(), nullable=True),
        sa.Column('cancellation_reason', sa.Text(), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['room_id'], ['rooms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('check_out_date > check_in_date', name='ck_bookings_dates_order'),
        sa.CheckConstraint('adults > 0', name='ck_bookings_adults_positive'),
        sa.CheckConstraint('children >= 0', name='ck_bookings_children_non_negative'),
        sa.CheckConstraint('total_amount >= 0', name='ck_bookings_total_positive'),
    )
    op.create_index('ix_bookings_user_id', 'bookings', ['user_id'])
    op.create_index('ix_bookings_room_id', 'bookings', ['room_id'])
    op.create_index('ix_bookings_check_in_date', 'bookings', ['check_in_date'])
    op.create_index('ix_bookings_status', 'bookings', ['status'])
    op.create_index('ix_bookings_dates', 'bookings', ['check_in_date', 'check_out_date'])

    # Create payments table
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('booking_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False, server_default='USD'),
        sa.Column('provider', sa.Enum('razorpay', 'stripe', 'cash', 'bank_transfer', name='paymentprovider'), nullable=False),
        sa.Column('provider_payment_id', sa.String(length=255), nullable=True),
        sa.Column('provider_order_id', sa.String(length=255), nullable=True),
        sa.Column('status', sa.Enum('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', name='paymentstatus'), nullable=False, server_default='pending'),
        sa.Column('payment_method', sa.String(length=50), nullable=True),
        sa.Column('failure_reason', sa.Text(), nullable=True),
        sa.Column('refund_amount', sa.Float(), nullable=False, server_default='0'),
        sa.Column('refund_reason', sa.Text(), nullable=True),
        sa.Column('processed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('amount > 0', name='ck_payments_amount_positive'),
        sa.CheckConstraint('refund_amount >= 0', name='ck_payments_refund_non_negative'),
    )
    op.create_index('ix_payments_booking_id', 'payments', ['booking_id'])
    op.create_index('ix_payments_provider_payment_id', 'payments', ['provider_payment_id'])
    op.create_index('ix_payments_status', 'payments', ['status'])

    # Create reviews table
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('room_id', sa.Integer(), nullable=False),
        sa.Column('booking_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['room_id'], ['rooms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_id'),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='ck_reviews_rating_range'),
    )
    op.create_index('ix_reviews_user_id', 'reviews', ['user_id'])
    op.create_index('ix_reviews_room_id', 'reviews', ['room_id'])
    op.create_index('ix_reviews_rating', 'reviews', ['rating'])

    # Create dining_reservations table
    op.create_table(
        'dining_reservations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('reservation_date', sa.DateTime(), nullable=False),
        sa.Column('reservation_time', sa.String(length=10), nullable=False),
        sa.Column('party_size', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('special_requests', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'confirmed', 'cancelled', 'completed', 'no_show', name='diningreservationstatus'), nullable=False, server_default='pending'),
        sa.Column('table_number', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('party_size > 0', name='ck_dining_party_size_positive'),
    )
    op.create_index('ix_dining_reservations_user_id', 'dining_reservations', ['user_id'])
    op.create_index('ix_dining_reservations_date', 'dining_reservations', ['reservation_date'])
    op.create_index('ix_dining_reservations_status', 'dining_reservations', ['status'])

    # Create event_bookings table
    op.create_table(
        'event_bookings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('event_name', sa.String(length=255), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=True),
        sa.Column('event_date', sa.DateTime(), nullable=False),
        sa.Column('start_time', sa.String(length=10), nullable=False),
        sa.Column('end_time', sa.String(length=10), nullable=False),
        sa.Column('expected_guests', sa.Integer(), nullable=False),
        sa.Column('contact_email', sa.String(length=255), nullable=False),
        sa.Column('contact_phone', sa.String(length=20), nullable=True),
        sa.Column('special_requirements', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'confirmed', 'cancelled', 'completed', name='eventbookingstatus'), nullable=False, server_default='pending'),
        sa.Column('estimated_cost', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('expected_guests > 0', name='ck_event_guests_positive'),
    )
    op.create_index('ix_event_bookings_user_id', 'event_bookings', ['user_id'])
    op.create_index('ix_event_bookings_date', 'event_bookings', ['event_date'])
    op.create_index('ix_event_bookings_status', 'event_bookings', ['status'])

    # Create contact_messages table
    op.create_table(
        'contact_messages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('new', 'in_progress', 'resolved', 'closed', name='contactstatus'), nullable=False, server_default='new'),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('responded_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_contact_messages_status', 'contact_messages', ['status'])
    op.create_index('ix_contact_messages_created_at', 'contact_messages', ['created_at'])

    # Create newsletter_subscribers table
    op.create_table(
        'newsletter_subscribers',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('subscribed_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('unsubscribed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index('ix_newsletter_subscribers_email', 'newsletter_subscribers', ['email'])
    op.create_index('ix_newsletter_subscribers_is_active', 'newsletter_subscribers', ['is_active'])

    # Create gallery_images table
    op.create_table(
        'gallery_images',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_gallery_images_category', 'gallery_images', ['category'])
    op.create_index('ix_gallery_images_display_order', 'gallery_images', ['display_order'])


def downgrade() -> None:
    op.drop_table('gallery_images')
    op.drop_table('newsletter_subscribers')
    op.drop_table('contact_messages')
    op.drop_table('event_bookings')
    op.drop_table('dining_reservations')
    op.drop_table('reviews')
    op.drop_table('payments')
    op.drop_table('bookings')
    op.drop_table('room_amenities')
    op.drop_table('room_images')
    op.drop_table('rooms')
    op.drop_table('amenities')
    op.drop_table('users')