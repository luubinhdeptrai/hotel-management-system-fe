"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDashboardData,
  type DashboardData,
} from "@/lib/services/dashboard.service";
import { ApiError } from "@/lib/services/api";

// ============================================================================
// Dashboard Data Hook (without React Query)
// ============================================================================

interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all dashboard data from the API
 * Uses the same pattern as other hooks in the project (without React Query)
 */
export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu dashboard");
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      }
      console.error("Dashboard data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export default useDashboardData;
