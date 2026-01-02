"use client";

import { useState, useEffect } from "react";
import {
  ServiceCategory,
  ServiceItem,
  ServiceCategoryFormData,
  ServiceItemFormData,
  ServiceGroup,
} from "@/lib/types/service";
import { mockServiceCategories } from "@/lib/mock-services";
import { serviceManagementService } from "@/lib/services";
import type { Service as ApiService } from "@/lib/types/api";
import { ApiError } from "@/lib/services/api";

// Map API Service to local ServiceItem format
function mapApiToServiceItem(apiService: ApiService, categories: ServiceCategory[]): ServiceItem {
  // Try to find a matching category or create a default one
  const category = categories[0] || {
    categoryID: "CAT001",
    categoryName: "Dịch vụ chung",
    description: "",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    serviceID: apiService.id,
    serviceName: apiService.name,
    categoryID: category.categoryID,
    category: category,
    serviceGroup: "F&B" as ServiceGroup,
    price: parseFloat(apiService.price),
    unit: apiService.unit || "lần",
    description: "",
    isOpenPrice: false,
    isActive: apiService.isActive,
    createdAt: new Date(apiService.createdAt),
    updatedAt: new Date(apiService.updatedAt),
  };
}

export function useServices() {
  // Note: Categories are not supported by the API, so we keep them as mock data
  const [categories, setCategories] = useState<ServiceCategory[]>(
    mockServiceCategories
  );
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const result = await serviceManagementService.getServices({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      });
      setServices(result.data.map(s => mapApiToServiceItem(s, categories)));
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể tải danh sách dịch vụ";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Category Management
  const addCategory = (data: ServiceCategoryFormData) => {
    setIsLoading(true);

    const newCategory: ServiceCategory = {
      categoryID: `CAT${String(categories.length + 1).padStart(3, "0")}`,
      categoryName: data.categoryName,
      description: data.description,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCategories([...categories, newCategory]);
    setIsLoading(false);

    return newCategory;
  };

  const updateCategory = (id: string, data: ServiceCategoryFormData) => {
    setIsLoading(true);

    setCategories(
      categories.map((cat) =>
        cat.categoryID === id
          ? {
              ...cat,
              categoryName: data.categoryName,
              description: data.description,
              updatedAt: new Date(),
            }
          : cat
      )
    );

    setIsLoading(false);
  };

  const softDeleteCategory = (id: string) => {
    setIsLoading(true);

    // Check if category is being used
    const isUsed = services.some(
      (service) => service.categoryID === id && service.isActive
    );

    if (isUsed) {
      setIsLoading(false);
      throw new Error("Không thể xóa loại dịch vụ đang được sử dụng");
    }

    setCategories(
      categories.map((cat) =>
        cat.categoryID === id
          ? { ...cat, isActive: false, updatedAt: new Date() }
          : cat
      )
    );

    setIsLoading(false);
  };

  const deleteCategory = (id: string) => {
    setIsLoading(true);

    // Check if category is being used
    const isUsed = services.some((service) => service.categoryID === id);

    if (isUsed) {
      setIsLoading(false);
      throw new Error("Không thể xóa loại dịch vụ đang được sử dụng");
    }

    setCategories(categories.filter((cat) => cat.categoryID !== id));
    setIsLoading(false);
  };

  // Service Management
  const addService = async (data: ServiceItemFormData) => {
    try {
      setIsLoading(true);

      const category = categories.find(
        (cat) => cat.categoryID === data.categoryID
      );

      if (!category) {
        throw new Error("Loại dịch vụ không tồn tại");
      }

      const created = await serviceManagementService.createService({
        name: data.serviceName,
        price: data.price,
        unit: data.unit,
        isActive: true,
      });

      const newService = mapApiToServiceItem(created, categories);
      setServices([...services, newService]);
      setError(null);

      return newService;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 
        (err instanceof Error ? err.message : "Không thể thêm dịch vụ");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateService = async (id: string, data: ServiceItemFormData) => {
    try {
      setIsLoading(true);

      const category = categories.find(
        (cat) => cat.categoryID === data.categoryID
      );

      if (!category) {
        throw new Error("Loại dịch vụ không tồn tại");
      }

      const updated = await serviceManagementService.updateService(id, {
        name: data.serviceName,
        price: data.price,
        unit: data.unit,
      });

      setServices(
        services.map((service) =>
          service.serviceID === id
            ? mapApiToServiceItem(updated, categories)
            : service
        )
      );
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể cập nhật dịch vụ";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const softDeleteService = async (id: string) => {
    try {
      setIsLoading(true);
      await serviceManagementService.updateService(id, { isActive: false });
      setServices(
        services.map((service) =>
          service.serviceID === id
            ? { ...service, isActive: false, updatedAt: new Date() }
            : service
        )
      );
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể vô hiệu hóa dịch vụ";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      setIsLoading(true);
      await serviceManagementService.deleteService(id);
      setServices(services.filter((service) => service.serviceID !== id));
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể xóa dịch vụ";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getServicesByCategory = (categoryID: string): ServiceItem[] => {
    return services.filter((service) => service.categoryID === categoryID);
  };

  const getActiveCategories = (): ServiceCategory[] => {
    return categories.filter((cat) => cat.isActive);
  };

  const getActiveServices = (): ServiceItem[] => {
    return services.filter((service) => service.isActive);
  };

  return {
    categories,
    services,
    isLoading,
    error,
    addCategory,
    updateCategory,
    softDeleteCategory,
    deleteCategory,
    addService,
    updateService,
    softDeleteService,
    deleteService,
    getServicesByCategory,
    getActiveCategories,
    getActiveServices,
  };
}
