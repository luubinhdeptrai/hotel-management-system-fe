import { apiFetch } from '@/lib/services/api';

export interface BookingResponse {
  id: string;
  bookingCode: string;
  primaryCustomer?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalGuests: number;
  totalPrice?: number;
  bookingRooms?: Array<{
    id: string;
    room: {
      id: string;
      roomNumber: string;
    };
    roomType?: {
      name: string;
    };
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RoomResponse {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  roomType?: {
    id: string;
    name: string;
  };
}

export interface RoomsListResponse {
  data: RoomResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface RoomStatusSummary {
  total: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  reserved: number;
  outOfService: number;
}

export const bookingsApi = {
  /**
   * GET /api/v1/employee/bookings
   * Get bookings with filters
   */
  async getBookings(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<BookingResponse>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiFetch(`/employee/bookings?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (response as any)?.data || response;
  },

  /**
   * Get bookings with check-in date TODAY
   * (for Arrivals table on Dashboard)
   */
  async getArrivalsToday(): Promise<BookingResponse[]> {
    const today = new Date().toISOString().split('T')[0];
    console.log('📡 [bookingsApi.getArrivalsToday] Fetching arrivals for:', today);
    
    const response = await this.getBookings({
      startDate: today,
      endDate: today,
      status: 'CONFIRMED,PENDING',
      limit: 100,
    });

    // Filter for CONFIRMED or PENDING bookings with check-in today
    const arrivals = (response.data || []).filter(booking => {
      const checkInDate = booking.checkInDate.split('T')[0];
      return checkInDate === today && ['CONFIRMED', 'PENDING'].includes(booking.status);
    });

    console.log('✅ Arrivals today:', arrivals.length);
    return arrivals;
  },

  /**
   * Get bookings with check-out date TODAY
   * (for Departures table on Dashboard)
   */
  async getDeparturesToday(): Promise<BookingResponse[]> {
    const today = new Date().toISOString().split('T')[0];
    console.log('📡 [bookingsApi.getDeparturesToday] Fetching departures for:', today);
    
    const response = await this.getBookings({
      status: 'CHECKED_IN',
      limit: 100,
    });

    // Filter for CHECKED_IN bookings with check-out today
    const departures = (response.data || []).filter(booking => {
      const checkOutDate = booking.checkOutDate.split('T')[0];
      return checkOutDate === today && booking.status === 'CHECKED_IN';
    });

    console.log('✅ Departures today:', departures.length);
    return departures;
  },
};

export const roomsApi = {
  /**
   * GET /api/v1/employee/rooms
   * Get all rooms
   */
  async getRooms(filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<RoomsListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);

    const response = await apiFetch(`/employee/rooms?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (response as any)?.data || response;
    return result;
  },

  /**
   * Get room status summary
   * Returns count of rooms by status
   */
  async getRoomStatusSummary(): Promise<RoomStatusSummary> {
    console.log('📡 [roomsApi.getRoomStatusSummary] Fetching room status summary...');
    
    try {
      const response = await this.getRooms({ limit: 1000 });
      const rooms = response.data || [];

      const summary: RoomStatusSummary = {
        total: rooms.length,
        available: 0,
        occupied: 0,
        cleaning: 0,
        maintenance: 0,
        reserved: 0,
        outOfService: 0,
      };

      rooms.forEach(room => {
        switch (room.status) {
          case 'AVAILABLE':
            summary.available++;
            break;
          case 'OCCUPIED':
            summary.occupied++;
            break;
          case 'CLEANING':
            summary.cleaning++;
            break;
          case 'MAINTENANCE':
            summary.maintenance++;
            break;
          case 'RESERVED':
            summary.reserved++;
            break;
          case 'OUT_OF_SERVICE':
            summary.outOfService++;
            break;
        }
      });

      console.log('✅ Room status summary:', summary);
      return summary;
    } catch (error) {
      console.error('❌ Failed to fetch room status summary:', error);
      return {
        total: 0,
        available: 0,
        occupied: 0,
        cleaning: 0,
        maintenance: 0,
        reserved: 0,
        outOfService: 0,
      };
    }
  },
};
