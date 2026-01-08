/**
 * App Settings Types
 * Types for application settings management
 */

export enum FeeType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
  HOURLY = "HOURLY",
}

export interface TimeConfig {
  hour: number;
  minute: number;
  gracePeriodMinutes: number;
}

export interface FeeConfig {
  enabled: boolean;
  type: FeeType;
  amount: number;
  applyAfterGracePeriod: boolean;
}

export type CheckInTimeConfig = TimeConfig;
export type CheckOutTimeConfig = TimeConfig;
export type EarlyCheckInFeeConfig = FeeConfig;
export type LateCheckOutFeeConfig = FeeConfig;

export interface DepositPercentageConfig {
  percentage: number; // 0-100, e.g., 50 = 50%
}

export interface AppSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const APP_SETTING_KEYS = {
  CHECKIN_TIME: "checkin_time",
  CHECKOUT_TIME: "checkout_time",
  DEPOSIT_PERCENTAGE: "deposit_percentage",
} as const;

export type AppSettingKey =
  (typeof APP_SETTING_KEYS)[keyof typeof APP_SETTING_KEYS];

export interface UpdateTimeConfigRequest {
  hour: number;
  minute: number;
  gracePeriodMinutes: number;
}

export interface UpdateDepositPercentageRequest {
  percentage: number;
}
