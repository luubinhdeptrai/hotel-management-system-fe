/**
 * Reports API Client
 * Matches Backend API exactly: /api/v1/employee/reports/*
 * 
 * Report Categories:
 * 1. Room Availability Reports
 * 2. Customer Reports  
 * 3. Employee Reports
 * 4. Service Reports
 * 5. Revenue Reports
 */

import { apiFetch } from "@/lib/services/api";

// ==================== TYPE DEFINITIONS ====================

// Room Availability Reports
export interface RoomAvailabilityFilters {
  checkInDate: string;
  checkOutDate: string;
  roomTypeId?: string;
  capacity?: number;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface OccupancyForecastFilters {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface RoomAvailabilityResult {
  availableRooms: any[];
  totalAvailable: number;
  totalRooms: number;
}

export interface OccupancyForecastResult {
  forecast: Array<{
    date: string;
    period: string;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
  }>;
}

// Customer Reports
export interface CustomerStayHistoryFilters {
  fromDate?: string;
  toDate?: string;
  rankId?: string;
  minStays?: number;
  minTotalSpent?: number;
  sortBy?: 'totalSpent' | 'totalStays' | 'lastVisit';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FirstTimeGuestsFilters {
  fromDate: string;
  toDate: string;
  page?: number;
  limit?: number;
}

export interface CustomerLifetimeValueOptions {
  limit?: number;
}

export interface CustomerStayHistoryResult {
  data: Array<{
    customerId: string;
    customerName: string;
    email?: string;
    phone?: string;
    rankName?: string;
    totalStays: number;
    totalSpent: number;
    lastVisit?: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface CustomerLifetimeValueResult {
  data: Array<{
    customerId: string;
    customerName: string;
    totalSpent: number;
    totalBookings: number;
    averageSpendPerBooking: number;
  }>;
}

export interface CustomerRankDistributionResult {
  distribution: Array<{
    rankId: string;
    rankName: string;
    customerCount: number;
    percentage: number;
  }>;
}

// Employee Reports
export interface EmployeeBookingPerformanceFilters {
  employeeId?: string;
  fromDate: string;
  toDate: string;
  sortBy?: 'totalBookings' | 'totalRevenue' | 'totalTransactions';
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeServicePerformanceFilters {
  employeeId?: string;
  fromDate: string;
  toDate: string;
}

export interface EmployeeActivitySummaryFilters {
  employeeId?: string;
  fromDate?: string;
  toDate?: string;
  activityTypes?: string[];
}

export interface EmployeeBookingPerformanceResult {
  data: Array<{
    employeeId: string;
    employeeName: string;
    totalBookings: number;
    totalRevenue: number;
    totalTransactions: number;
  }>;
}

export interface EmployeeServicePerformanceResult {
  data: Array<{
    employeeId: string;
    employeeName: string;
    totalServices: number;
    totalServiceRevenue: number;
  }>;
}

export interface EmployeeActivitySummaryResult {
  data: Array<{
    employeeId: string;
    employeeName: string;
    activities: Array<{
      activityType: string;
      count: number;
    }>;
  }>;
}

// Service Reports
export interface ServiceUsageStatisticsFilters {
  fromDate: string;
  toDate: string;
  serviceId?: string;
  status?: string;
}

export interface TopServicesByRevenueFilters {
  fromDate: string;
  toDate: string;
  limit?: number;
}

export interface ServicePerformanceTrendFilters {
  fromDate: string;
  toDate: string;
  serviceId?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface ServiceUsageStatisticsResult {
  data: Array<{
    serviceId: string;
    serviceName: string;
    totalUsage: number;
    totalRevenue: number;
    averagePrice: number;
  }>;
}

export interface TopServicesByRevenueResult {
  data: Array<{
    serviceId: string;
    serviceName: string;
    totalRevenue: number;
    totalUsage: number;
  }>;
}

export interface ServicePerformanceTrendResult {
  trend: Array<{
    date: string;
    period: string;
    totalUsage: number;
    totalRevenue: number;
  }>;
}

// Revenue Reports
export interface RevenueSummaryFilters {
  fromDate: string;
  toDate: string;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface RevenueByRoomTypeFilters {
  fromDate: string;
  toDate: string;
}

export interface PaymentMethodDistributionFilters {
  fromDate: string;
  toDate: string;
}

export interface PromotionEffectivenessFilters {
  fromDate: string;
  toDate: string;
}

export interface RevenueSummaryResult {
  period: {
    fromDate: string;
    toDate: string;
    groupBy: string;
  };
  summary: {
    totalRevenue: number;
    roomRevenue: number;
    serviceRevenue: number;
    totalBookings: number;
    totalRoomNights: number;
    occupancyRate: number;
    averageDailyRate: number;
    revenuePerAvailableRoom: number;
  };
  breakdown: Array<{
    date: string;
    period: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface RevenueByRoomTypeResult {
  data: Array<{
    roomTypeId: string;
    roomTypeName: string;
    totalRevenue: number;
    totalBookings: number;
    averageRate: number;
  }>;
}

export interface PaymentMethodDistributionResult {
  data: Array<{
    method: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
  }>;
}

export interface PromotionEffectivenessResult {
  data: Array<{
    promotionId: string;
    promotionName: string;
    totalUsage: number;
    totalDiscount: number;
    totalRevenue: number;
  }>;
}

// ==================== API CLIENT ====================

export const reportsApi = {
  // ==================== ROOM AVAILABILITY REPORTS ====================

  /**
   * GET /api/v1/employee/reports/rooms/availability
   * Check room availability at specific time
   */
  async checkRoomAvailability(
    filters: RoomAvailabilityFilters
  ): Promise<RoomAvailabilityResult> {
    const params = new URLSearchParams();
    params.append('checkInDate', filters.checkInDate);
    params.append('checkOutDate', filters.checkOutDate);
    if (filters.roomTypeId) params.append('roomTypeId', filters.roomTypeId);
    if (filters.capacity) params.append('capacity', filters.capacity.toString());
    if (filters.floor) params.append('floor', filters.floor.toString());
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

    const response = await apiFetch(`/employee/reports/rooms/availability?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/rooms/occupancy-forecast
   * Get room occupancy forecast
   */
  async getOccupancyForecast(
    filters: OccupancyForecastFilters
  ): Promise<OccupancyForecastResult> {
    const params = new URLSearchParams();
    params.append('startDate', filters.startDate);
    params.append('endDate', filters.endDate);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);

    console.log('📡 [reportsApi.getOccupancyForecast] Calling:', `/employee/reports/rooms/occupancy-forecast?${params}`);
    const response = await apiFetch(`/employee/reports/rooms/occupancy-forecast?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    console.log('📡 [reportsApi.getOccupancyForecast] Raw response:', response);
    console.log('📡 [reportsApi.getOccupancyForecast] Response keys:', Object.keys(response || {}));
    console.log('📡 [reportsApi.getOccupancyForecast] response.data:', (response as any)?.data);
    const result = (response as any)?.data || response;
    console.log('📡 [reportsApi.getOccupancyForecast] Final result:', result);
    return result;
  },

  // ==================== CUSTOMER REPORTS ====================

  /**
   * GET /api/v1/employee/reports/customers/stay-history
   * Get customer stay history
   */
  async getCustomerStayHistory(
    filters: CustomerStayHistoryFilters
  ): Promise<CustomerStayHistoryResult> {
    const params = new URLSearchParams();
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.rankId) params.append('rankId', filters.rankId);
    if (filters.minStays) params.append('minStays', filters.minStays.toString());
    if (filters.minTotalSpent) params.append('minTotalSpent', filters.minTotalSpent.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiFetch(`/employee/reports/customers/stay-history?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/customers/first-time-guests
   * Get first-time guests
   */
  async getFirstTimeGuests(
    filters: FirstTimeGuestsFilters
  ): Promise<CustomerStayHistoryResult> {
    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiFetch(`/employee/reports/customers/first-time-guests?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/customers/lifetime-value
   * Get customer lifetime value
   */
  async getCustomerLifetimeValue(
    options?: CustomerLifetimeValueOptions
  ): Promise<CustomerLifetimeValueResult> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await apiFetch(`/employee/reports/customers/lifetime-value?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/customers/rank-distribution
   * Get customer rank distribution
   */
  async getCustomerRankDistribution(): Promise<CustomerRankDistributionResult> {
    const response = await apiFetch('/employee/reports/customers/rank-distribution', {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  // ==================== EMPLOYEE REPORTS ====================

  /**
   * GET /api/v1/employee/reports/employees/booking-performance
   * Get employee booking performance
   */
  async getEmployeeBookingPerformance(
    filters: EmployeeBookingPerformanceFilters
  ): Promise<EmployeeBookingPerformanceResult> {
    const params = new URLSearchParams();
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiFetch(`/employee/reports/employees/booking-performance?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/employees/service-performance
   * Get employee service performance
   */
  async getEmployeeServicePerformance(
    filters: EmployeeServicePerformanceFilters
  ): Promise<EmployeeServicePerformanceResult> {
    const params = new URLSearchParams();
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);

    const response = await apiFetch(`/employee/reports/employees/service-performance?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/employees/activity-summary
   * Get employee activity summary
   */
  async getEmployeeActivitySummary(
    filters?: EmployeeActivitySummaryFilters
  ): Promise<EmployeeActivitySummaryResult> {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.activityTypes) {
      params.append('activityTypes', filters.activityTypes.join(','));
    }

    const response = await apiFetch(`/employee/reports/employees/activity-summary?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  // ==================== SERVICE REPORTS ====================

  /**
   * GET /api/v1/employee/reports/services/usage-statistics
   * Get service usage statistics
   */
  async getServiceUsageStatistics(
    filters: ServiceUsageStatisticsFilters
  ): Promise<ServiceUsageStatisticsResult> {
    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    if (filters.status) params.append('status', filters.status);

    const response = await apiFetch(`/employee/reports/services/usage-statistics?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/services/top-by-revenue
   * Get top services by revenue
   */
  async getTopServicesByRevenue(
    filters: TopServicesByRevenueFilters
  ): Promise<TopServicesByRevenueResult> {
    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiFetch(`/employee/reports/services/top-by-revenue?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/services/trend
   * Get service performance trend
   */
  async getServicePerformanceTrend(
    filters: ServicePerformanceTrendFilters
  ): Promise<ServicePerformanceTrendResult> {
    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);

    const response = await apiFetch(`/employee/reports/services/trend?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  // ==================== REVENUE REPORTS ====================

  /**
   * GET /api/v1/employee/reports/revenue/summary
   * Get revenue summary
   */
  async getRevenueSummary(
    filters: RevenueSummaryFilters
  ): Promise<RevenueSummaryResult> {
    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);

    console.log('📡 [reportsApi.getRevenueSummary] Calling:', `/employee/reports/revenue/summary?${params}`);
    const response = await apiFetch(`/employee/reports/revenue/summary?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    console.log('📡 [reportsApi.getRevenueSummary] Raw response:', response);
    console.log('📡 [reportsApi.getRevenueSummary] Response keys:', Object.keys(response || {}));
    console.log('📡 [reportsApi.getRevenueSummary] response.data:', (response as any)?.data);
    const result = (response as any)?.data || response;
    console.log('📡 [reportsApi.getRevenueSummary] Final result:', result);
    return result;
  },

  /**
   * GET /api/v1/employee/reports/revenue/by-room-type
   * Get revenue by room type
   */
  async getRevenueByRoomType(
    filters: RevenueByRoomTypeFilters
  ): Promise<RevenueByRoomTypeResult> {
    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);

    const response = await apiFetch(`/employee/reports/revenue/by-room-type?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/revenue/payment-methods
   * Get payment method distribution
   */
  async getPaymentMethodDistribution(
    filters: PaymentMethodDistributionFilters
  ): Promise<PaymentMethodDistributionResult> {
    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);

    const response = await apiFetch(`/employee/reports/revenue/payment-methods?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },

  /**
   * GET /api/v1/employee/reports/revenue/promotions
   * Get promotion effectiveness
   */
  async getPromotionEffectiveness(
    filters: PromotionEffectivenessFilters
  ): Promise<PromotionEffectivenessResult> {
    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate);
    params.append('toDate', filters.toDate);

    const response = await apiFetch(`/employee/reports/revenue/promotions?${params}`, {
      method: 'GET',
      requiresAuth: true,
    });

    return (response as any)?.data || response;
  },
};
