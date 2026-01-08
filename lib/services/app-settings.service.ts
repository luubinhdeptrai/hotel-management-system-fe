/**
 * App Settings Service
 * Handles all app settings-related API calls
 */

import { apiFetch } from "./api";
import type {
  AppSetting,
  CheckInTimeConfig,
  CheckOutTimeConfig,
  UpdateTimeConfigRequest,
  UpdateDepositPercentageRequest,
} from "@/lib/types/app-settings";

const BASE_PATH = "/employee/app-settings";

export const appSettingsService = {
  /**
   * Get all app settings
   * GET /employee/app-settings
   */
  async getAllSettings(): Promise<AppSetting[]> {
    const response = await apiFetch<{ data: AppSetting[] }>(BASE_PATH, {
      requiresAuth: true,
    });
    return response.data;
  },

  /**
   * Get check-in time configuration
   * GET /employee/app-settings/checkin-time
   */
  async getCheckInTime(): Promise<CheckInTimeConfig> {
    const response = await apiFetch<{ data: CheckInTimeConfig }>(
      `${BASE_PATH}/checkin-time`,
      { requiresAuth: true }
    );
    return response.data;
  },

  /**
   * Update check-in time configuration
   * PUT /employee/app-settings/checkin-time
   */
  async updateCheckInTime(
    config: UpdateTimeConfigRequest
  ): Promise<CheckInTimeConfig> {
    const response = await apiFetch<{ data: CheckInTimeConfig }>(
      `${BASE_PATH}/checkin-time`,
      {
        method: "PUT",
        body: JSON.stringify(config),
        requiresAuth: true,
      }
    );
    return response.data;
  },

  /**
   * Get check-out time configuration
   * GET /employee/app-settings/checkout-time
   */
  async getCheckOutTime(): Promise<CheckOutTimeConfig> {
    const response = await apiFetch<{ data: CheckOutTimeConfig }>(
      `${BASE_PATH}/checkout-time`,
      { requiresAuth: true }
    );
    return response.data;
  },

  /**
   * Update check-out time configuration
   * PUT /employee/app-settings/checkout-time
   */
  async updateCheckOutTime(
    config: UpdateTimeConfigRequest
  ): Promise<CheckOutTimeConfig> {
    const response = await apiFetch<{ data: CheckOutTimeConfig }>(
      `${BASE_PATH}/checkout-time`,
      {
        method: "PUT",
        body: JSON.stringify(config),
        requiresAuth: true,
      }
    );
    return response.data;
  },

  /**
   * Get deposit percentage configuration
   * GET /employee/app-settings/deposit-percentage
   * 
   * NOTE: This endpoint is not yet implemented in the backend.
   * Returns default value until backend implements it.
   */
  async getDepositPercentage(): Promise<number> {
    try {
      const response = await apiFetch<{ data: { percentage: number } }>(
        `${BASE_PATH}/deposit-percentage`,
        { requiresAuth: true }
      );
      return response.data.percentage;
    } catch (error) {
      // Backend endpoint not implemented yet - return default
      console.warn("Deposit percentage endpoint not available, using default 50%");
      return 50;
    }
  },

  /**
   * Update deposit percentage configuration
   * PUT /employee/app-settings/deposit-percentage
   * 
   * NOTE: This endpoint may not be implemented in the backend yet.
   * Try to call it, but provide helpful error message if it fails.
   */
  async updateDepositPercentage(
    config: UpdateDepositPercentageRequest
  ): Promise<number> {
    try {
      const response = await apiFetch<{ data: { percentage: number } }>(
        `${BASE_PATH}/deposit-percentage`,
        {
          method: "PUT",
          body: JSON.stringify(config),
          requiresAuth: true,
        }
      );
      return response.data.percentage;
    } catch (error) {
      // Provide helpful error message
      const errorMsg = error instanceof Error ? error.message : "Failed to update deposit percentage";
      
      // Check if it's a 404 (endpoint not found)
      if (errorMsg.includes("404") || errorMsg.includes("not found")) {
        throw new Error(
          "Tính năng Tỷ lệ đặt cọc chưa được kích hoạt trên server. Vui lòng liên hệ quản trị viên."
        );
      }
      
      throw error;
    }
  },
};
