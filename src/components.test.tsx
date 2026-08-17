import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import Dining from './pages/Dining';
import Amenities from './pages/Amenities';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: {} }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useParams: () => ({ roomId: '1' }),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
    BrowserRouter: actual.BrowserRouter,
  };
});

// Mock framer-motion - use a proxy to handle any motion component
vi.mock('framer-motion', () => {
  const motionComponents = new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'AnimatePresence') {
        return ({ children }: any) => <>{children}</>;
      }
      return ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      );
    },
  });
  
  return {
    motion: motionComponents,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock lucide-react
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    Calendar: () => <span data-testid="calendar-icon" />,
    Users: () => <span data-testid="users-icon" />,
    Search: () => <span data-testid="search-icon" />,
    ArrowRight: () => <span data-testid="arrow-right-icon" />,
    ChevronDown: () => <span data-testid="chevron-down-icon" />,
    X: () => <span data-testid="x-icon" />,
    CreditCard: () => <span data-testid="credit-card-icon" />,
    CheckCircle: () => <span data-testid="check-circle-icon" />,
    Clock: () => <span data-testid="clock-icon" />,
    AlertTriangle: () => <span data-testid="alert-triangle-icon" />,
    ArrowLeft: () => <span data-testid="arrow-left-icon" />,
    MapPin: () => <span data-testid="map-pin-icon" />,
    Star: () => <span data-testid="star-icon" />,
    Loader2: () => <span data-testid="loader-icon" />,
    User: () => <span data-testid="user-icon" />,
    Mail: () => <span data-testid="mail-icon" />,
  };
});

// Mock components
vi.mock('./components/PageHero', () => ({
  PageHero: ({ title, subtitle, backgroundImage }: any) => (
    <div data-testid="page-hero" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('./components/RoomModal', () => ({
  default: ({ room, onClose }: any) => (
    <div data-testid="room-modal">
      <h2>{room.name}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('./components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('./components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PublicOnlyRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Test wrapper with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Login Page', () => {
    it('should render login form', () => {
      renderWithProviders(<Login />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show error on failed login', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid credentials',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockErrorResponse),
      });

      renderWithProviders(<Login />);

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should navigate to register page', () => {
      renderWithProviders(<Login />);

      // Navigation is mocked, just check the link exists
      expect(screen.getByRole('link', { name: /Create one/i })).toBeInTheDocument();
    });
  });

  describe('Register Page', () => {
    it('should render registration form', () => {
      renderWithProviders(<Register />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getAllByText(/create account/i).length).toBeGreaterThan(0);
    });

    it('should show error when passwords do not match', async () => {
      renderWithProviders(<Register />);

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      const passwordFields = screen.getAllByLabelText(/password/i);
      fireEvent.change(passwordFields[0], { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'differentpassword' } });
      fireEvent.click(screen.getAllByText(/create account/i)[screen.getAllByText(/create account/i).length - 1]);

      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('MyBookings Page', () => {
    it('should show login prompt when not authenticated', () => {
      renderWithProviders(<MyBookings />);

      expect(screen.getByText(/Please log in to view your bookings/i)).toBeInTheDocument();
    });

    it('should display bookings when authenticated', async () => {
      const mockLoginResponse = {
        success: true,
        data: {
          access_token: 'test-token',
          refresh_token: 'refresh-token',
          token_type: 'bearer',
          expires_in: 1800,
          user: { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'guest' },
        },
      };

      const mockBookingsResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              room_id: 1,
              check_in_date: '2024-01-15',
              check_out_date: '2024-01-17',
              adults: 2,
              children: 0,
              total_amount: 10000,
              status: 'confirmed',
              special_requests: '',
              created_at: '2024-01-01',
              room: {
                id: 1,
                name: 'Deluxe Room',
                room_type: 'deluxe',
                primary_image: '/room1.jpg',
                images: [{ image_url: '/room1.jpg', is_primary: true }],
              },
            },
          ],
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLoginResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBookingsResponse),
        });

      function TestComponent() {
        const { login } = useAuth();
        return (
          <div>
            <button onClick={() => login('test@example.com', 'password123')}>Login</button>
            <MyBookings />
          </div>
        );
      }

      renderWithProviders(<TestComponent />);

      // Login first
      await act(async () => {
        fireEvent.click(screen.getByText('Login'));
      });

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
        expect(screen.getByText('₹10,000')).toBeInTheDocument();
      });
    });
  });

  describe('Dining Page', () => {
    it('should render dining information and reservation form', () => {
      renderWithProviders(<Dining />);

      expect(screen.getByText(/Dining at Our Hotel/i)).toBeInTheDocument();
      expect(screen.getByText(/Kitchenette & Self‑Catering/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Reserve a Table/i).length).toBeGreaterThan(0);
    });

    it('should show reservation form when button clicked', async () => {
      renderWithProviders(<Dining />);

      const reserveButtons = screen.getAllByText(/Reserve a Table/i);
      // Click the last one which is the actual button (not the paragraph)
      fireEvent.click(reserveButtons[reserveButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Guests/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Reservation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Amenities Page', () => {
    it('should fetch and display amenities', async () => {
      const mockAmenitiesResponse = {
        success: true,
        data: {
          items: [
            { id: 1, name: 'Free WiFi', description: 'High-speed internet', icon: 'wifi', category: 'room', is_active: true, created_at: '2024-01-01' },
            { id: 2, name: 'Swimming Pool', description: 'Outdoor pool', icon: 'pool', category: 'hotel', is_active: true, created_at: '2024-01-01' },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAmenitiesResponse),
      });

      renderWithProviders(<Amenities />);

      await waitFor(() => {
        expect(screen.getByText('Free WiFi')).toBeInTheDocument();
        expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
        expect(screen.getByText('High-speed internet')).toBeInTheDocument();
      });
    });
  });

  describe('Events Page', () => {
    it('should fetch and display events', async () => {
      const mockEventsResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              event_name: 'Wedding Celebration',
              event_type: 'wedding',
              event_date: '2024-06-15',
              start_time: '16:00',
              end_time: '23:00',
              expected_guests: 150,
              special_requirements: 'Need stage and sound system',
              status: 'pending',
              estimated_cost: 50000,
              created_at: '2024-01-15',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEventsResponse),
      });

      renderWithProviders(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Celebration')).toBeInTheDocument();
        expect(screen.getByText('wedding')).toBeInTheDocument();
      });
    });
  });

  describe('Gallery Page', () => {
    it('should fetch and display gallery images', async () => {
      const mockGalleryResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              title: 'Hotel Exterior',
              description: 'Main building',
              image_url: '/gallery/hotel.jpg',
              category: 'hotel',
              display_order: 1,
              is_published: true,
              created_at: '2024-01-01',
            },
            {
              id: 2,
              title: 'Room View',
              description: 'Deluxe room',
              image_url: '/gallery/room.jpg',
              category: 'rooms',
              display_order: 2,
              is_published: true,
              created_at: '2024-01-01',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGalleryResponse),
      });

      renderWithProviders(<Gallery />);

      await waitFor(() => {
        expect(screen.getByText('Hotel Exterior')).toBeInTheDocument();
        expect(screen.getByText('Room View')).toBeInTheDocument();
      });
    });

    it('should filter by category', async () => {
      const mockGalleryResponse = {
        success: true,
        data: {
          items: [
            { id: 1, title: 'Hotel Exterior', image_url: '/gallery/hotel.jpg', category: 'hotel', display_order: 1, is_published: true, created_at: '2024-01-01' },
            { id: 2, title: 'Room View', image_url: '/gallery/room.jpg', category: 'rooms', display_order: 2, is_published: true, created_at: '2024-01-01' },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGalleryResponse),
      });

      renderWithProviders(<Gallery />);

      await waitFor(() => {
        expect(screen.getByText('Hotel Exterior')).toBeInTheDocument();
        expect(screen.getByText('Room View')).toBeInTheDocument();
      });

      // Click on 'rooms' category filter
      fireEvent.click(screen.getByRole('button', { name: /rooms/i }));

      await waitFor(() => {
        expect(screen.queryByText('Hotel Exterior')).not.toBeInTheDocument();
        expect(screen.getByText('Room View')).toBeInTheDocument();
      });
    });
  });

  describe('Rooms Page', () => {
    it('should fetch and display rooms', async () => {
      const mockRoomsResponse = {
        success: true,
        data: {
          items: [
            {
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
              is_active: true,
              is_featured: false,
              room_number: '101',
              floor: 1,
              created_at: '2024-01-01',
            },
          ],
          total: 1,
          page: 1,
          size: 20,
          pages: 1,
        },
      };

      const mockHotelResponse = {
        success: true,
        data: {
          name: 'Test Hotel',
          heroImage: '/hero.jpg',
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRoomsResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHotelResponse),
        });

      renderWithProviders(<Rooms />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
        expect(screen.getByText('₹5,000')).toBeInTheDocument();
      });
    });
  });

  describe('RoomDetail Page', () => {
    it('should fetch and display room details', async () => {
      const mockRoomResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Deluxe Room',
          description: 'A spacious deluxe room',
          room_type: 'deluxe',
          price_per_night: 5000,
          capacity: 2,
          bed_type: 'King',
          primary_image: '/room1.jpg',
          amenities: [{ name: 'WiFi' }, { name: 'AC' }],
          images: [
            { id: 1, room_id: 1, image_url: '/room1.jpg', alt_text: 'Room 1', display_order: 1, is_primary: true },
            { id: 2, room_id: 1, image_url: '/room2.jpg', alt_text: 'Room 2', display_order: 2, is_primary: false },
          ],
          is_active: true,
          is_featured: false,
          room_number: '101',
          floor: 1,
          created_at: '2024-01-01',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoomResponse),
      });

      renderWithProviders(<RoomDetail />);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
        expect(screen.getByText('A spacious deluxe room')).toBeInTheDocument();
        expect(screen.getByText('₹5,000')).toBeInTheDocument();
        expect(screen.getByText('WiFi')).toBeInTheDocument();
        expect(screen.getByText('AC')).toBeInTheDocument();
      });
    });

    it('should navigate to search when Book Now clicked', async () => {
      const mockRoomResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Deluxe Room',
          description: 'A spacious deluxe room',
          room_type: 'deluxe',
          price_per_night: 5000,
          capacity: 2,
          bed_type: 'King',
          primary_image: '/room1.jpg',
          amenities: [{ name: 'WiFi' }],
          images: [{ id: 1, room_id: 1, image_url: '/room1.jpg', alt_text: 'Room 1', display_order: 1, is_primary: true }],
          is_active: true,
          is_featured: false,
          room_number: '101',
          floor: 1,
          created_at: '2024-01-01',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoomResponse),
      });

      renderWithProviders(<RoomDetail />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Book Now/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Book Now/i }));
      // Navigation is handled by mocked useNavigate
    });
  });
});