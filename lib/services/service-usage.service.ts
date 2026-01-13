/**
 * Service Usage Service
 * Handles all API calls related to service usages
 * 
 * Based on Backend API:
 * - GET /employee/service/service-usage
 * - POST /employee/service/service-usage
 * - PATCH /employee/service/service-usage/:id
 * - DELETE /employee/service/service-usage/:id
 */

import { api } from "./api";
import type { ApiResponse } from "@/lib/types/api";
import type {
  ServiceUsage,
  CreateServiceUsageRequest,
  UpdateServiceUsageRequest,
  GetServiceUsagesParams,
  GetServiceUsagesResponse,
} from "@/lib/types/service-usage.types";

export const serviceUsageService = {
  /**
   * Get service usages with filters
   * GET /employee/service/service-usage
   */
  async getServiceUsages(
    params?: GetServiceUsagesParams
  ): Promise<GetServiceUsagesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.bookingId) queryParams.append("bookingId", params.bookingId);
    if (params?.bookingRoomId) queryParams.append("bookingRoomId", params.bookingRoomId);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const url = `/employee/service/service-usage${query ? `?${query}` : ""}`;

    const response = await api.get<ApiResponse<GetServiceUsagesResponse>>(
      url,
      { requiresAuth: true }
    );

    // Backend wraps response in { data: {...actual response...} }
    if (response && typeof response === "object" && "data" in response) {
      // response.data = { data: [...], pagination: {...} }
      return (response as ApiResponse<GetServiceUsagesResponse>).data as GetServiceUsagesResponse;
    }

    // Fallback: response might already be the actual response
    return response as unknown as GetServiceUsagesResponse;
  },

  /**
   * Create service usage
   * POST /employee/service/service-usage
   * 
   * Backend automatically calculates totalPrice = unitPrice × quantity
   */
  async createServiceUsage(
    data: CreateServiceUsageRequest
  ): Promise<ServiceUsage> {
    const response = await api.post<ApiResponse<ServiceUsage>>(
      "/employee/service/service-usage",
      data,
      { requiresAuth: true }
    );

    // Handle both wrapped and unwrapped responses
    if (response && typeof response === "object" && "data" in response) {
      return (response as ApiResponse<ServiceUsage>).data;
    }

    return response as unknown as ServiceUsage;
  },

  /**
   * Update service usage (quantity or status)
   * PATCH /employee/service/service-usage/:id
   * 
   * Rules:
   * - quantity: Only editable when status = PENDING
   * - status: Must follow valid transitions
   * 
   * Backend re-calculates totalPrice when quantity changes
   */
  async updateServiceUsage(
    id: string,
    data: UpdateServiceUsageRequest
  ): Promise<ServiceUsage> {
    const response = await api.patch<ApiResponse<ServiceUsage>>(
      `/employee/service/service-usage/${id}`,
      data,
      { requiresAuth: true }
    );

    // Handle both wrapped and unwrapped responses
    if (response && typeof response === "object" && "data" in response) {
      return (response as ApiResponse<ServiceUsage>).data;
    }

    return response as unknown as ServiceUsage;
  },

  /**
   * Delete service usage
   * DELETE /employee/service/service-usage/:id
   * 
   * Rules:
   * - Only deletable when: totalPaid = 0 AND status != COMPLETED
   * - Backend validates and returns error if not allowed
   */
  async deleteServiceUsage(id: string): Promise<void> {
    await api.delete(`/employee/service/service-usage/${id}`, {
      requiresAuth: true,
    });
  },

  /**
   * Cancel service usage (shorthand for update status to CANCELLED)
   * PATCH /employee/service/service-usage/:id with status: CANCELLED
   * 
   * When cancelled, Backend sets totalPrice = 0
   */
  async cancelServiceUsage(id: string): Promise<ServiceUsage> {
    return this.updateServiceUsage(id, { status: "CANCELLED" });
  },

  /**
   * Get single service usage by ID
   * Note: Backend doesn't have dedicated endpoint, use getServiceUsages with filter
   */
  async getServiceUsageById(id: string): Promise<ServiceUsage | null> {
    try {
      // Workaround: Get all and filter by ID
      // TODO: Add backend endpoint GET /employee/service/service-usage/:id
      const response = await this.getServiceUsages();
      return response.data.find((usage) => usage.id === id) || null;
    } catch (error) {
      console.error("Failed to get service usage by ID:", error);
      return null;
    }
  },
};

export default serviceUsageService;
