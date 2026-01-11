/**
 * useCustomerRanks Hook
 * Custom hook for managing customer ranks
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { customerRankService } from "@/lib/services/customer-rank.service";
import type {
  CustomerRank,
  CreateCustomerRankRequest,
  UpdateCustomerRankRequest,
  CustomerRankStatistics,
} from "@/lib/types/customer-rank";
import { useNotification } from "./use-notification";

export function useCustomerRanks() {
  const { showSuccess, showError } = useNotification();

  const [ranks, setRanks] = useState<CustomerRank[]>([]);
  const [statistics, setStatistics] = useState<CustomerRankStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load ranks from backend
  const loadRanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerRankService.getRanks();
      setRanks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải danh sách hạng";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const data = await customerRankService.getRankStatistics();
      setStatistics(data);
    } catch (err) {
      console.error("Failed to load rank statistics:", err);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadRanks();
    loadStatistics();
  }, [loadRanks, loadStatistics]);

  // Create rank
  const createRank = useCallback(
    async (data: CreateCustomerRankRequest): Promise<CustomerRank | null> => {
      setLoading(true);
      setError(null);
      try {
        const newRank = await customerRankService.createRank(data);
        setRanks((prev) => [...prev, newRank]);
        showSuccess(`Đã tạo hạng "${newRank.displayName}" thành công!`);
        
        // Reload statistics
        await loadStatistics();
        
        return newRank;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể tạo hạng";
        setError(message);
        showError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError, loadStatistics]
  );

  // Update rank
  const updateRank = useCallback(
    async (
      id: string,
      data: UpdateCustomerRankRequest
    ): Promise<CustomerRank | null> => {
      setLoading(true);
      setError(null);
      try {
        const updatedRank = await customerRankService.updateRank(id, data);
        setRanks((prev) =>
          prev.map((rank) => (rank.id === id ? updatedRank : rank))
        );
        showSuccess(`Đã cập nhật hạng "${updatedRank.displayName}" thành công!`);
        
        // Reload statistics
        await loadStatistics();
        
        return updatedRank;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể cập nhật hạng";
        setError(message);
        showError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError, loadStatistics]
  );

  // Delete rank
  const deleteRank = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await customerRankService.deleteRank(id);
        setRanks((prev) => prev.filter((rank) => rank.id !== id));
        showSuccess("Đã xóa hạng thành công!");
        
        // Reload statistics
        await loadStatistics();
        
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể xóa hạng";
        setError(message);
        showError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError, loadStatistics]
  );

  // Set customer rank manually
  const setCustomerRank = useCallback(
    async (customerId: string, rankId: string | null): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await customerRankService.setCustomerRank(customerId, rankId);
        showSuccess("Đã cập nhật hạng khách hàng thành công!");
        
        // Reload statistics
        await loadStatistics();
        
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể cập nhật hạng khách hàng";
        setError(message);
        showError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError, loadStatistics]
  );

  // Get rank by ID
  const getRankById = useCallback(
    (id: string): CustomerRank | null => {
      return ranks.find((rank) => rank.id === id) || null;
    },
    [ranks]
  );

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([loadRanks(), loadStatistics()]);
  }, [loadRanks, loadStatistics]);

  return {
    ranks,
    statistics,
    loading,
    error,
    createRank,
    updateRank,
    deleteRank,
    setCustomerRank,
    getRankById,
    refetch,
  };
}
