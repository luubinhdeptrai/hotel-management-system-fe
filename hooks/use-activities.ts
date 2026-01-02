/**
 * useActivities Hook
 * Custom hook for managing activity logs with filters and pagination
 */

import { useState, useEffect, useCallback } from "react";
import { activityService } from "@/lib/services/activity.service";
import type {
  Activity,
  ActivityFilters,
  PaginationOptions,
} from "@/lib/types/activity";

export function useActivities(
  initialFilters: ActivityFilters = {},
  initialPagination: PaginationOptions = { page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" }
) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await activityService.getActivities(filters, pagination);
      setActivities(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch activities";
      setError(errorMessage);
      setActivities([]);
      console.error("Error fetching activities:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await activityService.getActivityStats();
      setStats(statsData || {});
    } catch (err) {
      console.error("Error fetching activity stats:", err);
      setStats({});
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Fetch stats only once on component mount (not on filter changes)
  useEffect(() => {
    fetchStats();
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ActivityFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationOptions>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination({ ...initialPagination, page: 1 });
  }, [initialPagination]);

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    activities,
    total,
    totalPages,
    isLoading,
    error,
    filters,
    pagination,
    stats,
    updateFilters,
    updatePagination,
    clearFilters,
    goToPage,
    changePageSize,
    refetch: fetchActivities,
  };
}
