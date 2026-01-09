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
   * GET /employee/app-settings/deposit_percentage (uses generic key-based endpoint)
   */
  async getDepositPercentage(): Promise<number> {
    const response = await apiFetch<{ 
      data: { key: string; value: { percentage: number } } 
    }>(
      `${BASE_PATH}/deposit_percentage`,
      { requiresAuth: true }
    );
    return response.data.value.percentage;
  },

  /**
   * Update deposit percentage configuration
   * PUT /employee/app-settings/deposit_percentage (uses generic key-based endpoint)
   */
  async updateDepositPercentage(
    config: UpdateDepositPercentageRequest
  ): Promise<number> {
    const response = await apiFetch<{ 
      data: { key: string; value: { percentage: number } } 
    }>(
      `${BASE_PATH}/deposit_percentage`,
      {
        method: "PUT",
        body: JSON.stringify({ value: { percentage: config.percentage } }),
        requiresAuth: true,
      }
    );
    return response.data.value.percentage;
  },
};
