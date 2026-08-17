import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { roomsApi, amenitiesApi, galleryApi, eventsApi, hotelApi, diningApi, authApi, bookingsApi, getImageUrl } from '../services/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('roomsApi', () => {
    it('getAll should fetch rooms with correct params', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, name: 'Test Room', price_per_night: 100 }],
          total: 1,
          page: 1,
          size: 20,
          pages: 1,
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await roomsApi.getAll({ page: 1, size: 10 });

      expect(mockFetch).toHaveBeenCalledWith('/api/rooms?page=1&size=10', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('getFeatured should fetch featured rooms', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: 1, name: 'Featured Room', price_per_night: 200 }],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await roomsApi.getFeatured(3);

      expect(mockFetch).toHaveBeenCalledWith('/api/rooms/featured?limit=3', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('getById should fetch room by id', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, name: 'Room 1', price_per_night: 100 },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await roomsApi.getById(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/rooms/1', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('search should search rooms with availability', async () => {
      const mockResponse = {
        success: true,
        data: {
          rooms: [{ room: { id: 1, name: 'Available Room' }, total_price: 200, total_nights: 2 }],
          total: 1,
          filters_applied: {},
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await roomsApi.search({
        check_in_date: '2024-01-15',
        check_out_date: '2024-01-17',
        adults: 2,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/rooms/search?check_in_date=2024-01-15&check_out_date=2024-01-17&adults=2',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('amenitiesApi', () => {
    it('getAll should fetch amenities', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, name: 'WiFi', description: 'Free WiFi', icon: 'wifi', category: 'room', is_active: true, created_at: '2024-01-01' }],
          total: 1,
          page: 1,
          size: 20,
          pages: 1,
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await amenitiesApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith('/api/rooms/amenities', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('galleryApi', () => {
    it('getAll should fetch gallery images', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, title: 'Hotel', description: 'Main building', image_url: '/img.jpg', category: 'hotel', display_order: 1, is_published: true, created_at: '2024-01-01' }],
          total: 1,
          page: 1,
          size: 20,
          pages: 1,
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await galleryApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith('/api/gallery', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('eventsApi', () => {
    it('getAll should fetch events', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [{ id: 1, event_name: 'Wedding', event_type: 'wedding', event_date: '2024-06-15', start_time: '16:00', end_time: '23:00', expected_guests: 100, status: 'pending', created_at: '2024-01-01' }],
          total: 1,
          page: 1,
          size: 20,
          pages: 1,
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await eventsApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith('/api/events', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('getById should fetch event by id', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, event_name: 'Wedding', event_type: 'wedding' },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await eventsApi.getById(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/events/1', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('hotelApi', () => {
    it('getInfo should fetch hotel info', async () => {
      const mockResponse = {
        success: true,
        data: {
          name: 'Test Hotel',
          tagline: 'Best Hotel',
          description: 'Description',
          logo: '/logo.png',
          heroImage: '/hero.jpg',
          address: { line1: '123 St', line2: '', city: 'City', state: 'State', country: 'Country', pincode: '12345' },
          phone: '+1234567890',
          email: 'test@hotel.com',
          checkIn: '14:00',
          checkOut: '11:00',
          policies: ['Policy 1'],
          amenities: ['WiFi'],
          nearby: [{ name: 'Beach', distance: '1km' }],
          social: { facebook: '', instagram: '', twitter: '' },
          mapEmbedUrl: '',
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await hotelApi.getInfo();

      expect(mockFetch).toHaveBeenCalledWith('/api/hotel/info', expect.any(Object));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('diningApi', () => {
    it('createReservation should create a dining reservation', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, reservation_date: '2024-02-14', reservation_time: '19:30', party_size: 2, status: 'pending' },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await diningApi.createReservation({
        customer_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        reservation_date: '2024-02-14',
        reservation_time: '19:30',
        guests: 2,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/dining/reservation', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          customer_name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          reservation_date: '2024-02-14',
          reservation_time: '19:30',
          guests: 2,
          notes: undefined,
        }),
      }));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('authApi', () => {
    it('login should authenticate user', async () => {
      const mockResponse = {
        success: true,
        data: { access_token: 'token123', refresh_token: 'refresh123', token_type: 'bearer', expires_in: 1800 },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authApi.login('test@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      }));
      expect(result).toEqual(mockResponse);
    });

    it('register should create new user', async () => {
      const mockResponse = {
        success: true,
        data: { access_token: 'token123', refresh_token: 'refresh123', token_type: 'bearer', expires_in: 1800, user: { id: 1, email: 'test@example.com', full_name: 'Test User' } },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authApi.register({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123', full_name: 'Test User' }),
      }));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('bookingsApi', () => {
    it('create should create a booking with auth token', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, room_id: 1, check_in_date: '2024-01-15', check_out_date: '2024-01-17', total_amount: 200, status: 'pending' },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await bookingsApi.create(
        { room_id: 1, check_in_date: '2024-01-15', check_out_date: '2024-01-17', adults: 2, children: 0 },
        'valid-token'
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/bookings', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer valid-token' }),
        body: JSON.stringify({ room_id: 1, check_in_date: '2024-01-15', check_out_date: '2024-01-17', adults: 2, children: 0, special_requests: undefined }),
      }));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getImageUrl', () => {
    it('should return empty string for null', () => {
      expect(getImageUrl(null)).toBe('');
    });

    it('should return absolute URL as is', () => {
      expect(getImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      expect(getImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
    });

    it('should prepend API base for relative paths', () => {
      expect(getImageUrl('uploads/image.jpg')).toBe('/api/uploads/uploads/image.jpg');
    });
  });
});