/**
 * Services API - Match Backend exactly
 * 
 * Backend endpoints:
 * - POST   /employee/services
 * - GET    /employee/services
 * - GET    /employee/services/{serviceId}
 * - PUT    /employee/services/{serviceId}
 * - DELETE /employee/services/{serviceId}
 * - POST   /employee/services/{serviceId}/images
 */

import { apiFetch } from "../services/api";
import type { Service } from "@/lib/types/api";

export interface GetServicesParams {
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "unit" | "isActive" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateServiceRequest {
  name?: string;
  price?: number;
  unit?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Services API Client
 * All endpoints match Backend API exactly
 */
export const servicesApi = {
  /**
   * Get all services with pagination and filters
   * GET /employee/services
   */
  async getServices(params?: GetServicesParams): Promise<PaginatedResponse<Service>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const endpoint = `/employee/services${query ? `?${query}` : ""}`;

    const response = await apiFetch(endpoint, {
      method: "GET",
      requiresAuth: true,
    });

    // Extract data from response wrapper
    const responseData = (response as any)?.data || response;
    return responseData as PaginatedResponse<Service>;
  },

  /**
   * Get service by ID
   * GET /employee/services/{serviceId}
   */
  async getServiceById(serviceId: string): Promise<Service> {
    const response = await apiFetch(`/employee/services/${serviceId}`, {
      method: "GET",
      requiresAuth: true,
    });

    // Extract data from response wrapper
    const data = (response as any)?.data || response;
    return data as Service;
  },

  /**
   * Create a new service
   * POST /employee/services
   */
  async createService(data: CreateServiceRequest): Promise<Service> {
    const response = await apiFetch("/employee/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      requiresAuth: true,
    });

    // Extract data from response wrapper
    const responseData = (response as any)?.data || response;
    return responseData as Service;
  },

  /**
   * Update service
   * PUT /employee/services/{serviceId}
   */
  async updateService(
    serviceId: string,
    data: UpdateServiceRequest
  ): Promise<Service> {
    const response = await apiFetch(`/employee/services/${serviceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      requiresAuth: true,
    });

    // Extract data from response wrapper
    const responseData = (response as any)?.data || response;
    return responseData as Service;
  },

  /**
   * Delete service
   * DELETE /employee/services/{serviceId}
   */
  async deleteService(serviceId: string): Promise<void> {
    await apiFetch(`/employee/services/${serviceId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  /**
   * Upload image for service
   * POST /employee/services/{serviceId}/images
   */
  async uploadServiceImage(
    serviceId: string,
    file: File
  ): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiFetch(`/employee/services/${serviceId}/images`, {
      method: "POST",
      body: formData,
      requiresAuth: true,
    });

    // Extract data from response wrapper
    const data = (response as any)?.data || response;
    return data as { url: string; id: string };
  },
};
