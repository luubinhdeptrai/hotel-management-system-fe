/**
 * Custom Hook for Promotion Management (Employee)
 * Provides state management and API calls for promotion CRUD operations
 */

"use client";

import { useState, useCallback } from "react";
import { promotionService } from "@/lib/services/promotion.service";
import type {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  GetPromotionsParams,
} from "@/lib/types/promotion";
import type { PaginatedResponse } from "@/lib/types/api";
import { useNotification } from "./use-notification";

export type PromotionStatusFilter = "all" | "active" | "inactive" | "disabled";

interface UsePromotionsParams extends GetPromotionsParams {
  statusFilter?: PromotionStatusFilter;
}

interface UsePromotionsResult {
  promotions: Promotion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchPromotions: (params?: UsePromotionsParams) => Promise<void>;
  createPromotion: (data: CreatePromotionRequest) => Promise<Promotion | null>;
  updatePromotion: (
    id: string,
    data: UpdatePromotionRequest
  ) => Promise<Promotion | null>;
  disablePromotion: (id: string) => Promise<boolean>;
  enablePromotion: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function usePromotions(
  initialParams?: UsePromotionsParams
): UsePromotionsResult {
  const { showSuccess } = useNotification();

  const showError = useCallback((msg: string) => {
    // Temporary implementation - will use proper toast/notification later
    console.error(msg);
  }, []);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]); // Track all promotions including disabled
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialParams?.page || 1);
  const [limit, setLimit] = useState(initialParams?.limit || 10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<UsePromotionsParams | undefined>(
    initialParams
  );

  // Fetch promotions with filters
  const fetchPromotions = useCallback(
    async (params?: UsePromotionsParams) => {
      setLoading(true);
      setError(null);

      try {
        const mergedParams = { ...initialParams, ...params };
        const { statusFilter, ...apiParams } = mergedParams;
        
        setLastParams(mergedParams);
        const response: PaginatedResponse<Promotion> =
          await promotionService.getPromotions(apiParams);

        // Ensure response.data is an array
        let promotionData = Array.isArray(response.data) 
          ? response.data 
          : response.data && typeof response.data === 'object' && 'data' in response.data
          ? ((response.data as unknown as { data: unknown }).data as Promotion[])
          : [];

        // Merge with disabled promotions from allPromotions
        // This is necessary because backend filters out disabledAt promotions
        const previousDisabled = allPromotions.filter(p => p.disabledAt);
        const apiPromotionIds = new Set(promotionData.map(p => p.id));
        
        // Add back any disabled promotions that existed before
        const mergedPromotions = [
          ...promotionData,
          ...previousDisabled.filter(p => !apiPromotionIds.has(p.id))
        ];
        
        setAllPromotions(mergedPromotions);

        // Apply client-side status filter
        let filteredData = mergedPromotions;
        if (statusFilter && statusFilter !== "all") {
          console.log(`[Promotion Filter] Filtering by status: ${statusFilter}`);
          console.log(`[Promotion Filter] Total promotions before filter: ${filteredData.length}`);
          
          filteredData = filteredData.filter((promo) => {
            const status = promotionService.getPromotionStatusType(promo);
            const matches = status === statusFilter;
            
            if (!matches) {
              console.debug(`[Promotion Filter] Filtered out: ${promo.code} (status: ${status})`);
            }
            
            return matches;
          });
          
          console.log(`[Promotion Filter] Total promotions after filter: ${filteredData.length}`);
        }

        setPromotions(filteredData);
        setTotal(response.total);
        setPage(response.page);
        setLimit(response.limit);
        setTotalPages(Math.ceil(response.total / response.limit));
      } catch (err: unknown) {
        const errorMsg =
          ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to fetch promotions";
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [initialParams, showError]
  );

  // Create promotion
  const createPromotion = useCallback(
    async (data: CreatePromotionRequest): Promise<Promotion | null> => {
      setLoading(true);
      setError(null);

      try {
        const newPromotion = await promotionService.createPromotion(data);
        showSuccess(
          `Promotion "${newPromotion.code}" created successfully! 🎉`
        );

        // Refetch to update list
        await fetchPromotions(lastParams);

        return newPromotion;
      } catch (err: unknown) {
        const errorMsg =
          ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to create promotion";
        setError(errorMsg);
        showError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchPromotions, lastParams, showSuccess, showError]
  );

  // Update promotion
  const updatePromotion = useCallback(
    async (
      id: string,
      data: UpdatePromotionRequest
    ): Promise<Promotion | null> => {
      setLoading(true);
      setError(null);

      try {
        const updatedPromotion = await promotionService.updatePromotion(
          id,
          data
        );
        showSuccess(
          `Promotion "${updatedPromotion.code}" updated successfully! ✅`
        );

        // Update local state
        setPromotions((prev) =>
          prev.map((p) => (p.id === id ? updatedPromotion : p))
        );
        setAllPromotions((prev) =>
          prev.map((p) => (p.id === id ? updatedPromotion : p))
        );

        return updatedPromotion;
      } catch (err: unknown) {
        const errorMsg =
          ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to update promotion";
        console.error("Update promotion error:", { error: err, errorMsg });
        setError(errorMsg);
        showError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Disable promotion (soft delete)
  const disablePromotion = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const updatedPromotion = await promotionService.disablePromotion(id);
        showSuccess(
          `Promotion "${updatedPromotion.code}" disabled successfully! 🚫`
        );

        // Update local state - keep both active and disabled
        setPromotions((prev) =>
          prev.map((p) => (p.id === id ? updatedPromotion : p))
        );
        setAllPromotions((prev) => {
          const existing = prev.find(p => p.id === id);
          if (existing) {
            return prev.map((p) => (p.id === id ? updatedPromotion : p));
          } else {
            // If not found, add it to allPromotions
            return [...prev, updatedPromotion];
          }
        });

        return true;
      } catch (err: unknown) {
        const errorMsg =
          ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to disable promotion";
        setError(errorMsg);
        showError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Enable promotion
  const enablePromotion = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const updatedPromotion = await promotionService.enablePromotion(id);
        showSuccess(
          `Promotion "${updatedPromotion.code}" enabled successfully! ✅`
        );

        // Update local state
        setPromotions((prev) =>
          prev.map((p) => (p.id === id ? updatedPromotion : p))
        );
        setAllPromotions((prev) =>
          prev.map((p) => (p.id === id ? updatedPromotion : p))
        );

        return true;
      } catch (err: unknown) {
        const errorMsg =
          ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to enable promotion";
        setError(errorMsg);
        showError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Refetch with last params
  const refetch = useCallback(async () => {
    await fetchPromotions(lastParams);
  }, [fetchPromotions, lastParams]);

  return {
    promotions,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,

    // Actions
    fetchPromotions,
    createPromotion,
    updatePromotion,
    disablePromotion,
    enablePromotion,
    refetch,
  };
}
