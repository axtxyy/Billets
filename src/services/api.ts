export interface Amenity {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RoomImage {
  id: number;
  room_id: number;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Room {
  id: number;
  name: string;
  description: string | null;
  room_type: string;
  price_per_night: number;
  capacity: number;
  bed_type: string | null;
  floor: number | null;
  room_number: string;
  is_active: boolean;
  is_featured: boolean;
  primary_image: string | null;
  created_at: string;
  amenities?: Amenity[];
  images?: RoomImage[];
}

export interface RoomListResponse {
  items: Room[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error_code?: string;
  status_code?: number;
}

export interface Hotel {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  heroImage: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  policies: string[];
  amenities: string[];
  nearby: Array<{ name: string; distance: string }>;
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  mapEmbedUrl: string;
}

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const roomsApi = {
  async getAll(params?: { page?: number; size?: number; room_type?: string; min_price?: number; max_price?: number; capacity?: number; is_featured?: boolean }): Promise<ApiResponse<PaginatedResponse<Room>>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi<ApiResponse<PaginatedResponse<Room>>>(`/rooms${query ? `?${query}` : ''}`);
  },

  async getFeatured(limit = 6): Promise<ApiResponse<Room[]>> {
    return fetchApi<ApiResponse<Room[]>>(`/rooms/featured?limit=${limit}`);
  },

  async getById(id: number): Promise<ApiResponse<Room>> {
    return fetchApi<ApiResponse<Room>>(`/rooms/${id}`);
  },

  async search(params: { check_in_date: string; check_out_date: string; adults?: number; children?: number; room_type?: string; min_price?: number; max_price?: number; capacity?: number; amenities?: number[]; page?: number; size?: number }): Promise<ApiResponse<{ rooms: Array<{ room: Room; total_price: number; total_nights: number }>; total: number; filters_applied: any }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    return fetchApi<ApiResponse<any>>(`/rooms/search?${searchParams.toString()}`);
  },
};

export const amenitiesApi = {
  async getAll(): Promise<ApiResponse<Array<{ id: number; name: string; description: string | null; icon: string | null; category: string | null; is_active: boolean; created_at: string }>>> {
    return fetchApi<ApiResponse<any>>('/rooms/amenities');
  },
};

export const galleryApi = {
  async getAll(): Promise<ApiResponse<Array<{ id: number; title: string; description: string | null; image_url: string; category: string | null; display_order: number; is_published: boolean; created_at: string }>>> {
    return fetchApi<ApiResponse<any>>('/gallery');
  },
};

export const hotelApi = {
  async getInfo(): Promise<Hotel> {
    const response = await fetch(`${API_BASE}/`);
    if (!response.ok) throw new Error('Failed to fetch hotel info');
    await response.json();
    return {
      name: 'Billet, Mangalore',
      tagline: 'Budget Hostel near Surathkal Beach',
      description: 'Located just 150 meters from the pristine sands of Surathkal Beach—one of the cleanest stretches of coastline you\'ll ever find—Billet offers affordable, clean and comfortable stays with a vibrant community vibe.',
      logo: '/favicon.svg',
      heroImage: 'https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KT6ZHFEASY7FQQ76FBJ4FR71/01KT6ZHFEASY7FQQ76FBJ4FR71.jpg',
      address: {
        line1: 'Dodda Kopla, Surathkal',
        line2: 'Billet, Mangaluru, Karnataka 575014',
        city: 'Mangalore',
        state: 'Karnataka',
        country: 'India',
        pincode: '575014',
      },
      phone: '+91 98765 43210',
      email: 'stay@billetmangalore.com',
      checkIn: '14:00',
      checkOut: '11:00',
      policies: [
        'Unmarried couples allowed. Local IDs accepted.',
        'Primary guest must be at least 18 years old.',
        'Groups with only male guests are allowed.',
        'Passport, Aadhaar, Driving License, Govt. ID accepted.',
        'Pets are not allowed.',
      ],
      amenities: [
        'Free Wi‑Fi',
        'Kitchenette access',
        'Parking',
        'Power backup',
        'Hot & cold water',
        'Electronic safe',
        'Mineral water',
        'Toiletries',
      ],
      nearby: [
        { name: 'Surathkal Beach', distance: '1.5 km' },
        { name: 'Mangalore International Airport', distance: '17.8 km' },
        { name: 'Surathkal Railway Station', distance: '3.8 km' },
        { name: 'Mangalore Central Railway Station', distance: '19 km' },
      ],
      social: {
        facebook: 'https://facebook.com/billetmangalore',
        instagram: 'https://instagram.com/billetmangalore',
        twitter: 'https://twitter.com/billetmangalore',
      },
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.123456789!2d74.795!3d13.018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba35b1c2d3e4f5f%3A0x123456789abcdef!2sBillet%2C%20Mangalore!5e0!3m2!1sen!2sin!4v1234567890',
    };
  },
};

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ access_token: string; refresh_token: string; token_type: string; expires_in: number }>> {
    return fetchApi<ApiResponse<any>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: { email: string; password: string; full_name: string; phone?: string }): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async refreshToken(refresh_token: string): Promise<ApiResponse<{ access_token: string; refresh_token: string; token_type: string; expires_in: number }>> {
    return fetchApi<ApiResponse<any>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    });
  },
};

export const bookingsApi = {
  async create(data: { room_id: number; check_in_date: string; check_out_date: string; adults: number; children: number; special_requests?: string }, token: string): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  async getMyBookings(token: string): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async getById(id: number, token: string): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>(`/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async cancel(id: number, token: string, reason?: string): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>(`/bookings/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ cancellation_reason: reason }),
    });
  },
};

export const contactApi = {
  async submit(data: { name: string; email: string; phone?: string; subject: string; message: string }): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const newsletterApi = {
  async subscribe(data: { email: string; name?: string }): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const healthApi = {
  async check(): Promise<{ status: string; app: string; version: string; environment: string }> {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },
};

export function getImageUrl(path: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/uploads/${path}`;
}