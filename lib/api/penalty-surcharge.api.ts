/**
 * Penalty & Surcharge API
 * 
 * Backend endpoints:
 * - POST /employee/service/penalty     # Create penalty (custom price)
 * - POST /employee/service/surcharge   # Create surcharge (custom price)
 */

import { apiFetch } from "../services/api";
import type { ServiceUsage } from "./service-usage.api";

export interface CreatePenaltySurchargeRequest {
  bookingId?: string;
  bookingRoomId?: string;
  customPrice: number; // Required: custom price for this penalty/surcharge
  quantity: number;
  reason: string; // Required: reason/description
}

/**
 * Penalty API Client
 */
export const penaltyApi = {
  /**
   * Create penalty (phí phạt)
   * POST /employee/service/penalty
   * 
   * Backend automatically uses penalty service ID from app-settings
   */
  async createPenalty(data: CreatePenaltySurchargeRequest): Promise<ServiceUsage> {
    const response = await apiFetch("/employee/service/penalty", {
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
};

/**
 * Surcharge API Client
 */
export const surchargeApi = {
  /**
   * Create surcharge (phụ thu)
   * POST /employee/service/surcharge
   * 
   * Backend automatically uses surcharge service ID from app-settings
   */
  async createSurcharge(data: CreatePenaltySurchargeRequest): Promise<ServiceUsage> {
    const response = await apiFetch("/employee/service/surcharge", {
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
};
