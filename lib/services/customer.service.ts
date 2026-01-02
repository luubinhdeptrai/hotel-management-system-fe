/**
 * Customer Service
 * Handles all customer-related API calls
 */

import { api } from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  GetCustomersParams,
} from "@/lib/types/api";

export const customerService = {
  /**
   * Get all customers with pagination and filters
   * GET /employee/customers
   */
  async getCustomers(
    params?: GetCustomersParams
  ): Promise<PaginatedResponse<Customer>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const endpoint = `/employee/customers${query ? `?${query}` : ""}`;

    const response = await api.get<ApiResponse<PaginatedResponse<Customer>>>(
      endpoint,
      { requiresAuth: true }
    );

    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Get customer by ID
   * GET /employee/customers/{customerId}
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await api.get<ApiResponse<Customer>>(
      `/employee/customers/${customerId}`,
      { requiresAuth: true }
    );
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Create a new customer
   * POST /employee/customers
   */
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const response = await api.post<ApiResponse<Customer>>(
      "/employee/customers",
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Update customer
   * PUT /employee/customers/{customerId}
   */
  async updateCustomer(
    customerId: string,
    data: UpdateCustomerRequest
  ): Promise<Customer> {
    const response = await api.put<ApiResponse<Customer>>(
      `/employee/customers/${customerId}`,
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Delete customer
   * DELETE /employee/customers/{customerId}
   */
  async deleteCustomer(customerId: string): Promise<void> {
    await api.delete(`/employee/customers/${customerId}`, {
      requiresAuth: true,
    });
  },
};
