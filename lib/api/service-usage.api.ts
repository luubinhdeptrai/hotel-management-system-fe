/**
 * Service Usage API - Service usage management
 * 
 * Backend endpoints:
 * - GET    /employee/service/service-usage
 * - POST   /employee/service/service-usage
 * - PATCH  /employee/service/service-usage/{id}
 * - DELETE /employee/service/service-usage/{id}
 */

import { apiFetch } from "../services/api";

export type ServiceUsageStatus = "PENDING" | "TRANSFERRED" | "COMPLETED" | "CANCELLED";

export interface ServiceUsage {
  id: string;
  bookingId?: string | null;
  bookingRoomId?: string | null;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  customPrice?: number | null;
  totalPrice: number;
  totalPaid: number;
  note?: string | null;
  status: ServiceUsageStatus;
  employeeId: string;
  createdAt: string;
  updatedAt: string;
  // Relations (optional)
  service?: {
    id: string;
    name: string;
    price: number;
    unit: string;
  };
  employee?: {
    id: string;
    name: string;
  };
}

export interface GetServiceUsagesParams {
  bookingId?: string;
  bookingRoomId?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateServiceUsageRequest {
  bookingId?: string;
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
  note?: string;
}

export interface UpdateServiceUsageRequest {
  quantity?: number;
  status?: ServiceUsageStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Service Usage API Client
 */
export const serviceUsageApi = {
  /**
   * Get service usages with filters and pagination
   * GET /employee/service/service-usage
   */
  async getServiceUsages(
    params?: GetServiceUsagesParams
  ): Promise<PaginatedResponse<ServiceUsage>> {
    const queryParams = new URLSearchParams();

    if (params?.bookingId) queryParams.append("bookingId", params.bookingId);
    if (params?.bookingRoomId) queryParams.append("bookingRoomId", params.bookingRoomId);
    if (params?.serviceId) queryParams.append("serviceId", params.serviceId);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const endpoint = `/employee/service/service-usage${query ? `?${query}` : ""}`;

    const response = await apiFetch(endpoint, {
      method: "GET",
      requiresAuth: true,
    });

    const responseData = (response as any)?.data || response;
    return responseData as PaginatedResponse<ServiceUsage>;
  },

  /**
   * Create service usage (add service to booking/room)
   * POST /employee/service/service-usage
   */
  async createServiceUsage(data: CreateServiceUsageRequest): Promise<ServiceUsage> {
    const response = await apiFetch("/employee/service/service-usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      requiresAuth: true,
    });

    const responseData = (response as any)?.data || response;
    return responseData as ServiceUsage;
  },

  /**
   * Update service usage (quantity or status)
   * PATCH /employee/service/service-usage/{id}
   */
  async updateServiceUsage(
    id: string,
    data: UpdateServiceUsageRequest
  ): Promise<ServiceUsage> {
    const response = await apiFetch(`/employee/service/service-usage/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      requiresAuth: true,
    });

    const responseData = (response as any)?.data || response;
    return responseData as ServiceUsage;
  },

  /**
   * Delete service usage
   * DELETE /employee/service/service-usage/{id}
   */
  async deleteServiceUsage(id: string): Promise<void> {
    await apiFetch(`/employee/service/service-usage/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },
};
