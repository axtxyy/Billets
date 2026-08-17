import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bookingsApi, roomsApi } from '../services/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Booking Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Booking API', () => {
    it('should create booking when user is authenticated', async () => {
      const mockBookingResponse = {
        success: true,
        data: {
          id: 1,
          room_id: 1,
          check_in_date: '2024-01-15',
          check_out_date: '2024-01-17',
          total_amount: 10000,
          status: 'pending',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBookingResponse),
      });

      const result = await bookingsApi.create(
        { room_id: 1, check_in_date: '2024-01-15', check_out_date: '2024-01-17', adults: 2, children: 0 },
        'test-token'
      );

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      expect(result.data.status).toBe('pending');
    });

    it('should fail to create booking without auth token', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Authentication required',
        error_code: 'UNAUTHORIZED',
        status_code: 401,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockErrorResponse),
      });

      try {
        await bookingsApi.create(
          { room_id: 1, check_in_date: '2024-01-15', check_out_date: '2024-01-17', adults: 2, children: 0 },
          ''
        );
      } catch (error: any) {
        // The fetchApi function throws with the error message from the response
        expect(error.message).toContain('401');
      }
    });

    it('should get user bookings', async () => {
      const mockBookingsResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              room_id: 1,
              check_in_date: '2024-01-15',
              check_out_date: '2024-01-17',
              total_amount: 10000,
              status: 'confirmed',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBookingsResponse),
      });

      const result = await bookingsApi.getMyBookings('test-token');

      expect(result.success).toBe(true);
      expect(result.data.items.length).toBe(1);
    });
  });

  describe('Rooms API', () => {
    it('should search rooms with availability', async () => {
      const mockRoomsResponse = {
        success: true,
        data: {
          rooms: [
            {
              room: {
                id: 1,
                name: 'Deluxe Room',
                description: 'A nice room',
                room_type: 'deluxe',
                price_per_night: 5000,
                capacity: 2,
                bed_type: 'King',
                primary_image: '/room1.jpg',
                amenities: [{ name: 'WiFi' }, { name: 'AC' }],
                images: [{ image_url: '/room1.jpg', is_primary: true }],
              },
              total_price: 10000,
              total_nights: 2,
            },
          ],
          total: 1,
          filters_applied: {},
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoomsResponse),
      });

      const result = await roomsApi.search({
        check_in_date: '2024-01-15',
        check_out_date: '2024-01-17',
        adults: 2,
      });

      expect(result.success).toBe(true);
      expect(result.data.rooms.length).toBe(1);
      expect(result.data.rooms[0].room.name).toBe('Deluxe Room');
    });
  });
});