/**
 * Reports Service
 * Handles all report-related API calls for employees
 * Backend: roommaster-be/src/routes/v1/employee/reports.route.ts
 */

import { api } from "./api";
import type { ApiResponse } from "@/lib/types/api";
import type {
  RoomAvailabilityResponse,
  OccupancyForecastResponse,
  CustomerStayHistoryResponse,
  FirstTimeGuestsResponse,
  CustomerLifetimeValue,
  CustomerRankDistributionResponse,
  EmployeeBookingPerformanceResponse,
  EmployeeServicePerformanceResponse,
  EmployeeActivitySummaryResponse,
  ServiceUsageStatisticsResponse,
  TopServicesByRevenueResponse,
  ServicePerformanceTrendResponse,
  RevenueSummaryResponse,
  RevenueByRoomTypeResponse,
  PaymentMethodDistributionResponse,
  PromotionEffectivenessResponse,
  // Params/Filters
  RoomAvailabilityFilters,
  CustomerStayHistoryFilters,
  RevenueSummaryFilters,
  EmployeePerformanceFilters,
  ServiceUsageStatisticsFilters,
} from "@/lib/types/report";

const BASE_PATH = "/employee/reports";

// Helper to safely unwrap response
function unwrap<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
}

// Helper to build query string
function buildQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export const reportsService = {
  // ==================== ROOM AVAILABILITY REPORTS ====================

  /**
   * Check room availability at specific time
   * GET /employee/reports/rooms/availability
   */
  async checkRoomAvailability(
    params: RoomAvailabilityFilters
  ): Promise<RoomAvailabilityResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/rooms/availability${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<RoomAvailabilityResponse>(response);
  },

  /**
   * Get room occupancy forecast
   * GET /employee/reports/rooms/occupancy-forecast
   */
  async getOccupancyForecast(params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
  }): Promise<OccupancyForecastResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/rooms/occupancy-forecast${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<OccupancyForecastResponse>(response);
  },

  // ==================== CUSTOMER REPORTS ====================

  /**
   * Get customer stay history
   * GET /employee/reports/customers/stay-history
   */
  async getCustomerStayHistory(
    params: CustomerStayHistoryFilters
  ): Promise<CustomerStayHistoryResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/customers/stay-history${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<CustomerStayHistoryResponse>(response);
  },

  /**
   * Get first-time guests
   * GET /employee/reports/customers/first-time-guests
   */
  async getFirstTimeGuests(params: {
    fromDate: string;
    toDate: string;
    page?: number;
    limit?: number;
  }): Promise<FirstTimeGuestsResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/customers/first-time-guests${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<FirstTimeGuestsResponse>(response);
  },

  /**
   * Get customer lifetime value (CLV)
   * GET /employee/reports/customers/lifetime-value
   */
  async getCustomerLifetimeValue(params: {
    minStays?: number;
    minSpent?: number;
    limit?: number;
  }): Promise<CustomerLifetimeValue[]> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/customers/lifetime-value${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<CustomerLifetimeValue[]>(response);
  },

  /**
   * Get customer rank distribution
   * GET /employee/reports/customers/rank-distribution
   */
  async getCustomerRankDistribution(): Promise<CustomerRankDistributionResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/customers/rank-distribution`,
      { requiresAuth: true }
    );
    return unwrap<CustomerRankDistributionResponse>(response);
  },

  // ==================== EMPLOYEE REPORTS ====================

  /**
   * Get employee booking performance
   * GET /employee/reports/employees/booking-performance
   */
  async getEmployeeBookingPerformance(
    params: EmployeePerformanceFilters
  ): Promise<EmployeeBookingPerformanceResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/employees/booking-performance${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<EmployeeBookingPerformanceResponse>(response);
  },

  /**
   * Get employee service performance
   * GET /employee/reports/employees/service-performance
   */
  async getEmployeeServicePerformance(
    params: EmployeePerformanceFilters
  ): Promise<EmployeeServicePerformanceResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/employees/service-performance${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<EmployeeServicePerformanceResponse>(response);
  },

  /**
   * Get employee activity summary
   * GET /employee/reports/employees/activity-summary
   */
  async getEmployeeActivitySummary(params: {
    fromDate: string;
    toDate: string;
  }): Promise<EmployeeActivitySummaryResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/employees/activity-summary${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<EmployeeActivitySummaryResponse>(response);
  },

  // ==================== SERVICE REPORTS ====================

  /**
   * Get service usage statistics
   * GET /employee/reports/services/usage-statistics
   */
  async getServiceUsageStatistics(
    params: ServiceUsageStatisticsFilters
  ): Promise<ServiceUsageStatisticsResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/services/usage-statistics${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<ServiceUsageStatisticsResponse>(response);
  },

  /**
   * Get top services by revenue
   * GET /employee/reports/services/top-by-revenue
   */
  async getTopServicesByRevenue(params: {
    fromDate: string;
    toDate: string;
    limit?: number;
  }): Promise<TopServicesByRevenueResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/services/top-by-revenue${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<TopServicesByRevenueResponse>(response);
  },

  /**
   * Get service performance trend
   * GET /employee/reports/services/trend
   */
  async getServicePerformanceTrend(params: {
    fromDate: string;
    toDate: string;
    groupBy?: string;
    serviceId?: string;
  }): Promise<ServicePerformanceTrendResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/services/trend${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<ServicePerformanceTrendResponse>(response);
  },

  // ==================== REVENUE REPORTS ====================

  /**
   * Get revenue summary
   * GET /employee/reports/revenue/summary
   */
  async getRevenueSummary(
    params: RevenueSummaryFilters
  ): Promise<RevenueSummaryResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/revenue/summary${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<RevenueSummaryResponse>(response);
  },

  /**
   * Get revenue by room type
   * GET /employee/reports/revenue/by-room-type
   */
  async getRevenueByRoomType(
    params: RevenueSummaryFilters
  ): Promise<RevenueByRoomTypeResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/revenue/by-room-type${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<RevenueByRoomTypeResponse>(response);
  },

  /**
   * Get payment method distribution
   * GET /employee/reports/revenue/payment-methods
   */
  async getPaymentMethodDistribution(params: {
    fromDate: string;
    toDate: string;
  }): Promise<PaymentMethodDistributionResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/revenue/payment-methods${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<PaymentMethodDistributionResponse>(response);
  },

  /**
   * Get promotion effectiveness
   * GET /employee/reports/revenue/promotions
   */
  async getPromotionEffectiveness(params: {
    fromDate: string;
    toDate: string;
  }): Promise<PromotionEffectivenessResponse> {
    const response = await api.get<unknown>(
      `${BASE_PATH}/revenue/promotions${buildQuery(
        params as Record<string, unknown>
      )}`,
      { requiresAuth: true }
    );
    return unwrap<PromotionEffectivenessResponse>(response);
  },
};
