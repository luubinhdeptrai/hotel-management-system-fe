"use client";

import { useState, useEffect } from "react";
import { servicesApi, type GetServicesParams } from "@/lib/api/services.api";
import type { Service } from "@/lib/types/api";
import { logger } from "@/lib/utils/logger";

/**
 * useServices Hook
 * 
 * ✅ Backend-compatible implementation
 * - Uses new services API directly
 * - No local state for categories (Backend doesn't support)
 * - Direct API calls for all operations
 * - Proper error handling and loading states
 */

export interface UseServicesReturn {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  
  // CRUD operations
  createService: (data: { name: string; price: number; unit?: string; isActive?: boolean }) => Promise<Service>;
  getServices: (params?: GetServicesParams) => Promise<void>;
  updateService: (serviceId: string, data: { name?: string; price?: number; unit?: string; isActive?: boolean }) => Promise<Service>;
  deleteService: (serviceId: string) => Promise<void>;
  
  // Utilities
  refresh: () => Promise<void>;
  clearError: () => void;
  getActiveServices: () => Service[];
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<GetServicesParams>({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  // Load services on mount
  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadServices = async (params?: GetServicesParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const finalParams = params || searchParams;
      const result = await servicesApi.getServices(finalParams);
      
      setServices(result.data);
      setSearchParams(finalParams);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách dịch vụ";
      setError(message);
      logger.error("Failed to load services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createService = async (data: {
    name: string;
    price: number;
    unit?: string;
    isActive?: boolean;
  }): Promise<Service> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newService = await servicesApi.createService(data);
      
      // Add to local state
      setServices([...services, newService]);
      
      return newService;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo dịch vụ";
      setError(message);
      logger.error("Failed to create service:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getServices = async (params?: GetServicesParams) => {
    await loadServices(params);
  };

  const updateService = async (
    serviceId: string,
    data: { name?: string; price?: number; unit?: string; isActive?: boolean }
  ): Promise<Service> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updated = await servicesApi.updateService(serviceId, data);
      
      // Update local state
      setServices(
        services.map((s) => (s.id === serviceId ? updated : s))
      );
      
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật dịch vụ";
      setError(message);
      logger.error("Failed to update service:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await servicesApi.deleteService(serviceId);
      
      // Remove from local state
      setServices(services.filter((s) => s.id !== serviceId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể xóa dịch vụ";
      setError(message);
      logger.error("Failed to delete service:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await loadServices(searchParams);
  };

  const clearError = () => {
    setError(null);
  };

  const getActiveServices = () => {
    return services.filter((s) => s.isActive);
  };

  return {
    services,
    isLoading,
    error,
    createService,
    getServices,
    updateService,
    deleteService,
    refresh,
    clearError,
    getActiveServices,
  };
}
