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

export interface Booking {
  id: number;
  user_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  total_nights: number;
  price_per_night: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  special_requests: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  room?: {
    id: number;
    name: string;
    room_type: string;
    primary_image: string | null;
    images?: Array<{ image_url: string; is_primary: boolean }>;
  };
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
  async getAll(): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/gallery');
  },
};

export const eventsApi = {
  async getAll(params?: { page?: number; size?: number; status?: string; event_type?: string }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchApi<ApiResponse<any>>(`/events${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>(`/events/${id}`);
  },

  async create(data: {
    event_name: string;
    event_type: string;
    event_date: string;
    start_time: string;
    end_time: string;
    expected_guests: number;
    contact_email: string;
    contact_phone?: string;
    special_requirements?: string;
  }): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const hotelApi = {
  async getInfo(): Promise<Hotel> {
    const response = await fetchApi<ApiResponse<Hotel>>('/hotel/info');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch hotel info');
    }
    return response.data;
  },
};
export const diningApi = {
  async createReservation(data: {
    customer_name: string;
    email: string;
    phone: string;
    reservation_date: string;
    reservation_time: string;
    guests: number;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>("/dining/reservation", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getReservations(token?: string): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>("/dining/reservations", {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
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

  async getMe(token: string): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
  if (path.startsWith('http') || path.startsWith('https')) return path;
  if (path.startsWith('/')) return path;
  return `${API_BASE}/uploads/${path}`;
}