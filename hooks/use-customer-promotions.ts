/**
 * Custom Hook for Customer Promotions
 * Provides state management for customer-facing promotion features
 */

"use client";

import { useState, useCallback } from "react";
import { promotionService } from "@/lib/services/promotion.service";
import type {
  Promotion,
  CustomerPromotion,
  GetPromotionsParams,
} from "@/lib/types/promotion";
import type { PaginatedResponse } from "@/lib/types/api";
import { useNotification } from "./use-notification";

interface UseCustomerPromotionsResult {
  // Available promotions to claim
  availablePromotions: Promotion[];
  availableTotal: number;
  availableLoading: boolean;

  // My claimed promotions
  myPromotions: CustomerPromotion[];
  myTotal: number;
  myLoading: boolean;

  // Shared
  error: string | null;

  // Actions
  fetchAvailablePromotions: (params?: GetPromotionsParams) => Promise<void>;
  fetchMyPromotions: (params?: GetPromotionsParams) => Promise<void>;
  claimPromotion: (code: string) => Promise<CustomerPromotion | null>;
  refetch: () => Promise<void>;
}

export function useCustomerPromotions(): UseCustomerPromotionsResult {
  const { showSuccess } = useNotification();

  const showError = useCallback((msg: string) => {
    console.error(msg);
  }, []);

  // Available promotions state
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>(
    []
  );
  const [availableTotal, setAvailableTotal] = useState(0);
  const [availableLoading, setAvailableLoading] = useState(false);

  // My promotions state
  const [myPromotions, setMyPromotions] = useState<CustomerPromotion[]>([]);
  const [myTotal, setMyTotal] = useState(0);
  const [myLoading, setMyLoading] = useState(false);

  // Shared state
  const [error, setError] = useState<string | null>(null);

  // Fetch available promotions to claim
  const fetchAvailablePromotions = useCallback(
    async (params?: GetPromotionsParams) => {
      setAvailableLoading(true);
      setError(null);

      try {
        const response: PaginatedResponse<Promotion> =
          await promotionService.getAvailablePromotions(params);
        const promotionData = Array.isArray(response.data) 
          ? response.data 
          : response.data && typeof response.data === 'object' && 'data' in response.data
          ? ((response.data as unknown as { data: unknown }).data as Promotion[])
          : [];

        setAvailablePromotions(promotionData);
        setAvailableTotal(response.total);
      } catch (err: unknown) {
        const errorMsg =
          ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) ||
          "Failed to fetch available promotions";
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setAvailableLoading(false);
      }
    },
    [showError]
  );

  // Fetch my claimed promotions
  const fetchMyPromotions = useCallback(
    async (params?: GetPromotionsParams) => {
      setMyLoading(true);
      setError(null);

      try {
        const response: PaginatedResponse<CustomerPromotion> =
          await promotionService.getMyPromotions(params);

        const myPromotionData = Array.isArray(response.data) 
          ? response.data 
          : response.data && typeof response.data === 'object' && 'data' in response.data
          ? ((response.data as unknown as { data: unknown }).data as CustomerPromotion[])
          : [];

        setMyPromotions(myPromotionData);
        setMyTotal(response.total);
      } catch (err: unknown) {
        const errorMsg =
          ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to fetch my promotions";
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setMyLoading(false);
      }
    },
    [showError]
  );

  // Claim a promotion
  const claimPromotion = useCallback(
    async (code: string): Promise<CustomerPromotion | null> => {
      setError(null);

      try {
        const claimedPromotion = await promotionService.claimPromotion({
          promotionCode: code,
        });

        showSuccess(
          `Promotion "${code}" claimed successfully! 🎉 Check "My Promotions" to use it.`
        );

        // Refetch both lists
        await Promise.all([fetchAvailablePromotions(), fetchMyPromotions()]);

        return claimedPromotion;
      } catch (err: unknown) {
        const errorMsg =
          ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || "Failed to claim promotion";
        setError(errorMsg);

        // Show friendly error messages
        if (errorMsg.includes("not found")) {
          showError("Promotion code not found. Please check and try again.");
        } else if (errorMsg.includes("expired")) {
          showError("This promotion has expired.");
        } else if (errorMsg.includes("limit")) {
          showError("You have already claimed this promotion.");
        } else if (errorMsg.includes("remaining")) {
          showError("This promotion is sold out.");
        } else {
          showError(errorMsg);
        }

        return null;
      }
    },
    [fetchAvailablePromotions, fetchMyPromotions, showSuccess, showError]
  );

  // Refetch all
  const refetch = useCallback(async () => {
    await Promise.all([fetchAvailablePromotions(), fetchMyPromotions()]);
  }, [fetchAvailablePromotions, fetchMyPromotions]);

  return {
    // Available promotions
    availablePromotions,
    availableTotal,
    availableLoading,

    // My promotions
    myPromotions,
    myTotal,
    myLoading,

    // Shared
    error,

    // Actions
    fetchAvailablePromotions,
    fetchMyPromotions,
    claimPromotion,
    refetch,
  };
}
