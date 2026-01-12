/**
 * Customer Rank Service
 * Handles all customer rank-related API calls
 * 
 * Backend APIs:
 * - GET    /employee/ranks                - Get all ranks
 * - POST   /employee/ranks                - Create rank
 * - GET    /employee/ranks/:id            - Get rank by ID
 * - PUT    /employee/ranks/:id            - Update rank
 * - DELETE /employee/ranks/:id            - Delete rank
 * - GET    /employee/ranks/statistics     - Get rank statistics
 * - PUT    /employee/customers/:id/rank   - Set customer rank manually
 */

import { api } from "./api";
import type { ApiResponse } from "@/lib/types/api";
import type {
  CustomerRank,
  CreateCustomerRankRequest,
  UpdateCustomerRankRequest,
  CustomerRankStatistics,
  SetCustomerRankRequest,
} from "@/lib/types/customer-rank";

export const customerRankService = {
  /**
   * Get all customer ranks
   * GET /employee/ranks
   */
  async getRanks(): Promise<CustomerRank[]> {
    const response = await api.get<ApiResponse<CustomerRank[]>>(
      "/employee/ranks",
      { requiresAuth: true }
    );
    const data =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<CustomerRank[]>).data
        : (response as unknown as CustomerRank[]);
    return data;
  },

  /**
   * Get rank by ID
   * GET /employee/ranks/:id
   */
  async getRankById(id: string): Promise<CustomerRank> {
    const response = await api.get<ApiResponse<CustomerRank>>(
      `/employee/ranks/${id}`,
      { requiresAuth: true }
    );
    const data =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<CustomerRank>).data
        : (response as unknown as CustomerRank);
    return data;
  },

  /**
   * Create new customer rank
   * POST /employee/ranks
   */
  async createRank(
    data: CreateCustomerRankRequest
  ): Promise<CustomerRank> {
    const response = await api.post<ApiResponse<CustomerRank>>(
      "/employee/ranks",
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<CustomerRank>).data
        : (response as unknown as CustomerRank);
    return unwrappedData;
  },

  /**
   * Update customer rank
   * PUT /employee/ranks/:id
   */
  async updateRank(
    id: string,
    data: UpdateCustomerRankRequest
  ): Promise<CustomerRank> {
    const response = await api.put<ApiResponse<CustomerRank>>(
      `/employee/ranks/${id}`,
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<CustomerRank>).data
        : (response as unknown as CustomerRank);
    return unwrappedData;
  },

  /**
   * Delete customer rank
   * DELETE /employee/ranks/:id
   */
  async deleteRank(id: string): Promise<void> {
    await api.delete(`/employee/ranks/${id}`, { requiresAuth: true });
  },

  /**
   * Get rank statistics
   * GET /employee/ranks/statistics
   */
  async getRankStatistics(): Promise<CustomerRankStatistics> {
    const response = await api.get<ApiResponse<CustomerRankStatistics>>(
      "/employee/ranks/statistics",
      { requiresAuth: true }
    );
    const data =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<CustomerRankStatistics>).data
        : (response as unknown as CustomerRankStatistics);
    return data;
  },

  /**
   * Set customer rank manually (employee action)
   * PUT /employee/customers/:customerId/rank
   * 
   * Note: This is for manual rank assignment by employees.
   * Normally, rank is auto-updated by backend when customer's totalSpent changes.
   */
  async setCustomerRank(
    customerId: string,
    rankId: string | null
  ): Promise<void> {
    await api.put(
      `/employee/customers/${customerId}/rank`,
      { rankId } as SetCustomerRankRequest,
      { requiresAuth: true }
    );
  },
};
