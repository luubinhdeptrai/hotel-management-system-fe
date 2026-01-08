/**
 * useAppSettings Hook
 * Custom hook for managing application settings
 */

import { useState, useEffect, useCallback } from "react";
import { appSettingsService } from "@/lib/services/app-settings.service";
import type {
  CheckInTimeConfig,
  CheckOutTimeConfig,
  UpdateTimeConfigRequest,
  UpdateDepositPercentageRequest,
} from "@/lib/types/app-settings";

export function useAppSettings() {
  const [checkInTime, setCheckInTime] = useState<CheckInTimeConfig | null>(
    null
  );
  const [checkOutTime, setCheckOutTime] = useState<CheckOutTimeConfig | null>(
    null
  );
  const [depositPercentage, setDepositPercentage] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all settings
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [checkIn, checkOut, deposit] = await Promise.all([
        appSettingsService.getCheckInTime(),
        appSettingsService.getCheckOutTime(),
        appSettingsService.getDepositPercentage(),
      ]);

      setCheckInTime(checkIn);
      setCheckOutTime(checkOut);
      setDepositPercentage(deposit);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load settings";
      setError(message);
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update check-in time
  const updateCheckInTime = async (config: UpdateTimeConfigRequest) => {
    setLoading(true);
    try {
      const updated = await appSettingsService.updateCheckInTime(config);
      setCheckInTime(updated);
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update check-in time";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update check-out time
  const updateCheckOutTime = async (config: UpdateTimeConfigRequest) => {
    setLoading(true);
    try {
      const updated = await appSettingsService.updateCheckOutTime(config);
      setCheckOutTime(updated);
      return updated;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update check-out time";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update deposit percentage
  const updateDepositPercentage = async (
    config: UpdateDepositPercentageRequest
  ) => {
    setLoading(true);
    try {
      const updated = await appSettingsService.updateDepositPercentage(config);
      setDepositPercentage(updated);
      return updated;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update deposit percentage";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    checkInTime,
    checkOutTime,
    depositPercentage,
    loading,
    error,
    loadSettings,
    updateCheckInTime,
    updateCheckOutTime,
    updateDepositPercentage,
  };
}
