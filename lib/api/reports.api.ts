import { api } from "@/lib/services/api";
import type {
  RoomAvailabilityFilters,
  RoomAvailabilityResponse,
  OccupancyForecastResponse,
  CustomerStayHistoryFilters,
  CustomerStayHistoryResponse,
  FirstTimeGuestsResponse,
  CustomerLifetimeValueResponse,
  CustomerRankDistributionResponse,
  EmployeePerformanceFilters,
  EmployeeBookingPerformanceResponse,
  EmployeeServicePerformanceResponse,
  EmployeeActivitySummaryResponse,
  ServiceUsageStatisticsFilters,
  ServiceUsageStatisticsResponse,
  TopServicesByRevenueResponse,
  ServicePerformanceTrendResponse,
  RevenueSummaryFilters,
  RevenueSummaryResponse,
  RevenueByRoomTypeResponse,
  PaymentMethodDistributionResponse,
  PromotionEffectivenessResponse,
} from "@/lib/types/report";

const BASE_URL = "/employee/reports";

/**
 * Helper function to unwrap Backend response format: { data: {...} }
 */
function unwrapResponse<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
}

export const reportApi = {
  // ==================== ROOM AVAILABILITY REPORTS ====================

  /**
   * GET /api/v1/employee/reports/rooms/availability
   * Check room availability at specific time
   */
  checkRoomAvailability: async (
    filters: RoomAvailabilityFilters
  ): Promise<RoomAvailabilityResponse> => {
    const params = new URLSearchParams();
    params.append("checkInDate", filters.checkInDate);
    params.append("checkOutDate", filters.checkOutDate);
    if (filters.roomTypeId) params.append("roomTypeId", filters.roomTypeId);
    if (filters.capacity) params.append("capacity", filters.capacity.toString());
    if (filters.floor !== undefined) params.append("floor", filters.floor.toString());
    if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

    const response = await api.get<any>(`${BASE_URL}/rooms/availability?${params.toString()}`, { requiresAuth: true });
    return unwrapResponse<RoomAvailabilityResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/rooms/occupancy-forecast
   * Get room occupancy forecast
   */
  getOccupancyForecast: async (params: {
    startDate: string;
    endDate: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<OccupancyForecastResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", params.startDate);
    queryParams.append("endDate", params.endDate);
    queryParams.append("groupBy", params.groupBy || "day");

    const response = await api.get<any>(`${BASE_URL}/rooms/occupancy-forecast?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<OccupancyForecastResponse>(response);
  },

  // ==================== CUSTOMER REPORTS ====================

  /**
   * GET /api/v1/employee/reports/customers/stay-history
   * Get customer stay history
   */
  getCustomerStayHistory: async (
    filters: CustomerStayHistoryFilters
  ): Promise<CustomerStayHistoryResponse> => {
    const params = new URLSearchParams();
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);
    if (filters.rankId) params.append("rankId", filters.rankId);
    if (filters.minStays) params.append("minStays", filters.minStays.toString());
    if (filters.minTotalSpent) params.append("minTotalSpent", filters.minTotalSpent.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 20).toString());

    const response = await api.get<any>(`${BASE_URL}/customers/stay-history?${params.toString()}`, { requiresAuth: true });
    return unwrapResponse<CustomerStayHistoryResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/customers/first-time-guests
   * Get first-time guests
   */
  getFirstTimeGuests: async (params: {
    fromDate: string;
    toDate: string;
    page?: number;
    limit?: number;
  }): Promise<FirstTimeGuestsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("fromDate", params.fromDate);
    queryParams.append("toDate", params.toDate);
    queryParams.append("page", (params.page || 1).toString());
    queryParams.append("limit", (params.limit || 20).toString());

    const response = await api.get<any>(`${BASE_URL}/customers/first-time-guests?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<FirstTimeGuestsResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/customers/lifetime-value
   * Get customer lifetime value
   */
  getCustomerLifetimeValue: async (params?: {
    minSpent?: number;
    minBookings?: number;
  }): Promise<CustomerLifetimeValueResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.minSpent) queryParams.append("minSpent", params.minSpent.toString());
    if (params?.minBookings) queryParams.append("minBookings", params.minBookings.toString());

    const response = await api.get<any>(`${BASE_URL}/customers/lifetime-value?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<CustomerLifetimeValueResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/customers/rank-distribution
   * Get customer rank distribution
   */
  getCustomerRankDistribution: async (): Promise<CustomerRankDistributionResponse> => {
    const response = await api.get<any>(`${BASE_URL}/customers/rank-distribution`, { requiresAuth: true });
    return unwrapResponse<CustomerRankDistributionResponse>(response);
  },

  // ==================== EMPLOYEE REPORTS ====================

  /**
   * GET /api/v1/employee/reports/employees/booking-performance
   * Get employee booking performance
   */
  getEmployeeBookingPerformance: async (
    filters: EmployeePerformanceFilters
  ): Promise<EmployeeBookingPerformanceResponse> => {
    const params = new URLSearchParams();
    if (filters.employeeId) params.append("employeeId", filters.employeeId);
    params.append("fromDate", filters.fromDate);
    params.append("toDate", filters.toDate);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await api.get<any>(`${BASE_URL}/employees/booking-performance?${params.toString()}`, { requiresAuth: true });
    return unwrapResponse<EmployeeBookingPerformanceResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/employees/service-performance
   * Get employee service performance
   */
  getEmployeeServicePerformance: async (params: {
    employeeId?: string;
    fromDate: string;
    toDate: string;
  }): Promise<EmployeeServicePerformanceResponse> => {
    const queryParams = new URLSearchParams();
    if (params.employeeId) queryParams.append("employeeId", params.employeeId);
    queryParams.append("fromDate", params.fromDate);
    queryParams.append("toDate", params.toDate);

    const response = await api.get<any>(`${BASE_URL}/employees/service-performance?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<EmployeeServicePerformanceResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/employees/activity-summary
   * Get employee activity summary
   */
  getEmployeeActivitySummary: async (params?: {
    employeeId?: string;
    fromDate?: string;
    toDate?: string;
    activityTypes?: string[];
  }): Promise<EmployeeActivitySummaryResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.employeeId) queryParams.append("employeeId", params.employeeId);
    if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params?.toDate) queryParams.append("toDate", params.toDate);
    if (params?.activityTypes && params.activityTypes.length > 0) {
      queryParams.append("activityTypes", params.activityTypes.join(","));
    }

    const response = await api.get<any>(`${BASE_URL}/employees/activity-summary?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<EmployeeActivitySummaryResponse>(response);
  },

  // ==================== SERVICE REPORTS ====================

  /**
   * GET /api/v1/employee/reports/services/usage-statistics
   * Get service usage statistics
   */
  getServiceUsageStatistics: async (
    filters: ServiceUsageStatisticsFilters
  ): Promise<ServiceUsageStatisticsResponse> => {
    const params = new URLSearchParams();
    params.append("fromDate", filters.fromDate);
    params.append("toDate", filters.toDate);
    if (filters.serviceId) params.append("serviceId", filters.serviceId);
    if (filters.status) params.append("status", filters.status);

    const response = await api.get<any>(`${BASE_URL}/services/usage-statistics?${params.toString()}`, { requiresAuth: true });
    return unwrapResponse<ServiceUsageStatisticsResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/services/top-by-revenue
   * Get top services by revenue
   */
  getTopServicesByRevenue: async (params: {
    fromDate: string;
    toDate: string;
    limit?: number;
  }): Promise<TopServicesByRevenueResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("fromDate", params.fromDate);
    queryParams.append("toDate", params.toDate);
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get<any>(`${BASE_URL}/services/top-by-revenue?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<TopServicesByRevenueResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/services/trend
   * Get service performance trend
   */
  getServicePerformanceTrend: async (params: {
    fromDate: string;
    toDate: string;
    serviceId?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<ServicePerformanceTrendResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("fromDate", params.fromDate);
    queryParams.append("toDate", params.toDate);
    if (params.serviceId) queryParams.append("serviceId", params.serviceId);
    if (params.groupBy) queryParams.append("groupBy", params.groupBy);

    const response = await api.get<any>(`${BASE_URL}/services/trend?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<ServicePerformanceTrendResponse>(response);
  },

  // ==================== REVENUE REPORTS ====================

  /**
   * GET /api/v1/employee/reports/revenue/summary
   * Get revenue summary
   */
  getRevenueSummary: async (
    filters: RevenueSummaryFilters
  ): Promise<RevenueSummaryResponse> => {
    const params = new URLSearchParams();
    params.append("fromDate", filters.fromDate);
    params.append("toDate", filters.toDate);
    if (filters.groupBy) params.append("groupBy", filters.groupBy);

    const response = await api.get<any>(`${BASE_URL}/revenue/summary?${params.toString()}`, { requiresAuth: true });
    return unwrapResponse<RevenueSummaryResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/revenue/by-room-type
   * Get revenue by room type
   */
  getRevenueByRoomType: async (params: {
    fromDate: string;
    toDate: string;
  }): Promise<RevenueByRoomTypeResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("fromDate", params.fromDate);
    queryParams.append("toDate", params.toDate);

    const response = await api.get<any>(`${BASE_URL}/revenue/by-room-type?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<RevenueByRoomTypeResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/revenue/payment-methods
   * Get payment method distribution
   */
  getPaymentMethodDistribution: async (params: {
    fromDate: string;
    toDate: string;
  }): Promise<PaymentMethodDistributionResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("fromDate", params.fromDate);
    queryParams.append("toDate", params.toDate);

    const response = await api.get<any>(`${BASE_URL}/revenue/payment-methods?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<PaymentMethodDistributionResponse>(response);
  },

  /**
   * GET /api/v1/employee/reports/revenue/promotions
   * Get promotion effectiveness
   */
  getPromotionEffectiveness: async (params: {
    fromDate: string;
    toDate: string;
  }): Promise<PromotionEffectivenessResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("fromDate", params.fromDate);
    queryParams.append("toDate", params.toDate);

    const response = await api.get<any>(`${BASE_URL}/revenue/promotions?${queryParams.toString()}`, { requiresAuth: true });
    return unwrapResponse<PromotionEffectivenessResponse>(response);
  },
};
