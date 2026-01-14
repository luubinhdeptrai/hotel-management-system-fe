/**
 * Activity Service
 * API client for employee activity logs
 */

import { apiFetch } from "./api";
import type {
  Activity,
  ActivityFilters,
  ActivityListResponse,
  PaginationOptions,
} from "@/lib/types/activity";

const BASE_PATH = "/employee/activities";

export const activityService = {
  /**
   * Get all activities with filters and pagination
   */
  async getActivities(
    filters: ActivityFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ActivityListResponse> {
    const params = new URLSearchParams();

    // Add filters
    if (filters.type) params.append("type", filters.type);
    if (filters.customerId) params.append("customerId", filters.customerId);
    if (filters.employeeId) params.append("employeeId", filters.employeeId);
    if (filters.bookingRoomId)
      params.append("bookingRoomId", filters.bookingRoomId);
    if (filters.serviceUsageId)
      params.append("serviceUsageId", filters.serviceUsageId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);

    // Add pagination
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());
    if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
    if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

    const response = await apiFetch<{ data: ActivityListResponse }>(
      `${BASE_PATH}?${params.toString()}`,
      { requiresAuth: true }
    );
    // Unwrap nested response structure
    return response.data;
  },

  /**
   * Get activity by ID
   */
  async getActivityById(id: string): Promise<Activity> {
    return apiFetch<Activity>(`${BASE_PATH}/${id}`, { requiresAuth: true });
  },

  /**
   * Get activity stats (counts by type) - unfiltered
   */
  async getActivityStats(): Promise<Record<string, number>> {
    try {
      const response = await apiFetch<Record<string, number>>(
        `${BASE_PATH}/stats/counts`,
        { requiresAuth: true }
      );
      return response;
    } catch (err) {
      console.error("Stats endpoint not available:", err);
      // Return empty stats instead of potentially heavy client-side calculation
      return {};
    }
  },
};
