/**
 * Service Management Service
 * Handles all hotel service-related API calls
 */

import { api } from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  GetServicesParams,
} from "@/lib/types/api";

export const serviceManagementService = {
  /**
   * Get all services with pagination and filters
   * GET /employee/services
   */
  async getServices(
    params?: GetServicesParams
  ): Promise<PaginatedResponse<Service>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const endpoint = `/employee/services${query ? `?${query}` : ""}`;

    const response = await api.get<ApiResponse<PaginatedResponse<Service>>>(
      endpoint,
      { requiresAuth: true }
    );

    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Get service by ID
   * GET /employee/services/{serviceId}
   */
  async getServiceById(serviceId: string): Promise<Service> {
    const response = await api.get<ApiResponse<Service>>(
      `/employee/services/${serviceId}`,
      { requiresAuth: true }
    );
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Create a new service
   * POST /employee/services
   */
  async createService(data: CreateServiceRequest): Promise<Service> {
    const response = await api.post<ApiResponse<Service>>(
      "/employee/services",
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Update service
   * PUT /employee/services/{serviceId}
   */
  async updateService(
    serviceId: string,
    data: UpdateServiceRequest
  ): Promise<Service> {
    const response = await api.put<ApiResponse<Service>>(
      `/employee/services/${serviceId}`,
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Delete service
   * DELETE /employee/services/{serviceId}
   */
  async deleteService(serviceId: string): Promise<void> {
    await api.delete(`/employee/services/${serviceId}`, {
      requiresAuth: true,
    });
  },
};
