/**
 * Promotion Management Service
 * Handles all promotion-related API calls
 * Compatible with roommaster-be backend
 */

import { api } from "./api";
import type { ApiResponse, PaginatedResponse } from "@/lib/types/api";
import type {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  GetPromotionsParams,
  CustomerPromotion,
  ClaimPromotionRequest,
} from "@/lib/types/promotion";

export const promotionService = {
  // ============================================================================
  // Employee (Admin) Endpoints
  // ============================================================================

  /**
   * Get all promotions with pagination and filters
   * GET /employee/promotions
   * Backend returns: { data: { data: [...], pagination: {...} } }
   * Frontend expects: PaginatedResponse<Promotion> = { data: [...], total, page, limit }
   */
  async getPromotions(
    params?: GetPromotionsParams
  ): Promise<PaginatedResponse<Promotion>> {
    const queryParams = new URLSearchParams();

    if (params?.code) queryParams.append("code", params.code);
    if (params?.description) queryParams.append("description", params.description);
    if (params?.maxDiscount) queryParams.append("maxDiscount", params.maxDiscount.toString());
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/employee/promotions${query ? `?${query}` : ""}`;

    const response = await api.get<Record<string, unknown>>(endpoint, { requiresAuth: true });

    // Handle both wrapped and unwrapped response formats
    const responseData = (response && typeof response === "object" && "data" in response)
      ? (response as { data: unknown }).data
      : response;
    
    // Transform backend response format to frontend expected format
    if (
      responseData &&
      typeof responseData === "object" &&
      "pagination" in responseData &&
      "data" in responseData
    ) {
      // Backend format: { data: [...], pagination: { page, limit, total, totalPages } }
      const backendResponse = responseData as {
        data: Promotion[];
        pagination: { page: number; limit: number; total: number };
      };
      return {
        data: backendResponse.data || [],
        total: backendResponse.pagination.total || 0,
        page: backendResponse.pagination.page || 1,
        limit: backendResponse.pagination.limit || 10,
      };
    }
    
    // Fallback to default
    return { data: [], total: 0, page: 1, limit: 10 };
  },

  /**
   * Get promotion by ID
   * GET /employee/promotions/{promotionId}
   */
  async getPromotionById(promotionId: string): Promise<Promotion> {
    const response = await api.get<ApiResponse<Promotion>>(
      `/employee/promotions/${promotionId}`,
      { requiresAuth: true }
    );
    const data =
      response && typeof response === "object" && "data" in response
        ? (response as { data: Promotion }).data
        : (response as Promotion);
    return data;
  },

  /**
   * Create a new promotion
   * POST /employee/promotions
   */
  async createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
    const response = await api.post<ApiResponse<Promotion>>(
      "/employee/promotions",
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as { data: Promotion }).data
        : (response as Promotion);
    return unwrappedData;
  },

  /**
   * Update promotion
   * PATCH /employee/promotions/{promotionId}
   * Note: type and scope cannot be changed after creation
   */
  async updatePromotion(
    promotionId: string,
    data: UpdatePromotionRequest
  ): Promise<Promotion> {
    const response = await api.patch<ApiResponse<Promotion>>(
      `/employee/promotions/${promotionId}`,
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as { data: Promotion }).data
        : (response as Promotion);
    return unwrappedData;
  },

  /**
   * Disable promotion (soft delete)
   * Sets disabledAt to current time
   */
  async disablePromotion(promotionId: string): Promise<Promotion> {
    return this.updatePromotion(promotionId, {
      disabledAt: new Date().toISOString(),
    });
  },

  /**
   * Enable promotion (restore)
   * Sets disabledAt to null
   */
  async enablePromotion(promotionId: string): Promise<Promotion> {
    return this.updatePromotion(promotionId, {
      disabledAt: null,
    });
  },

  // ============================================================================
  // Customer Endpoints
  // ============================================================================

  /**
   * Get available promotions for customer
   * GET /customer/promotions/available
   */
  async getAvailablePromotions(): Promise<Promotion[]> {
    const response = await api.get<ApiResponse<Promotion[]>>(
      "/customer/promotions/available",
      { requiresAuth: true }
    );
    const data =
      response && typeof response === "object" && "data" in response
        ? (response as { data: Promotion[] }).data
        : (response as Promotion[]);
    return data;
  },

  /**
   * Get customer's claimed promotions
   * GET /customer/promotions/my-promotions
   */
  async getMyPromotions(): Promise<CustomerPromotion[]> {
    const response = await api.get<ApiResponse<CustomerPromotion[]>>(
      "/customer/promotions/my-promotions",
      { requiresAuth: true }
    );
    const data =
      response && typeof response === "object" && "data" in response
        ? (response as { data: CustomerPromotion[] }).data
        : (response as CustomerPromotion[]);
    return data;
  },

  /**
   * Claim a promotion by code
   * POST /customer/promotions/claim
   */
  async claimPromotion(data: ClaimPromotionRequest): Promise<CustomerPromotion> {
    const response = await api.post<ApiResponse<CustomerPromotion>>(
      "/customer/promotions/claim",
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as { data: CustomerPromotion }).data
        : (response as CustomerPromotion);
    return unwrappedData;
  },

  // ============================================================================
  // Statistics Helpers
  // ============================================================================

  /**
   * Get all promotions for statistics calculation
   * Fetches all pages to get complete data
   */
  async getAllPromotionsForStats(): Promise<Promotion[]> {
    const firstPage = await this.getPromotions({ page: 1, limit: 200 });
    const totalPages = Math.ceil(firstPage.total / firstPage.limit);
    
    if (totalPages <= 1) {
      return firstPage.data;
    }

    // Fetch remaining pages if needed
    const allData = [...firstPage.data];
    for (let page = 2; page <= totalPages; page++) {
      const pageData = await this.getPromotions({ page, limit: 200 });
      allData.push(...pageData.data);
    }
    
    return allData;
  },
};

export default promotionService;
