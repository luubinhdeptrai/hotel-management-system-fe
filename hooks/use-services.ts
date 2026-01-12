"use client";

import { useState, useEffect } from "react";
import {
  ServiceCategory,
  ServiceItem,
  ServiceCategoryFormData,
  ServiceItemFormData,
  ServiceGroup,
} from "@/lib/types/service";
import { serviceAPI } from "@/lib/services/service-unified.service";
import type { Service } from "@/lib/types/service-unified";
import { mockServiceCategories } from "@/lib/mock-services";
import { serviceManagementService } from "@/lib/services";
import type { Service as ApiService, ServiceImage } from "@/lib/types/api";
import { ApiError } from "@/lib/services/api";
import { logger } from "@/lib/utils/logger";
import { imageApi } from "@/lib/api/image.api";
import { compressFiles } from "@/lib/utils/image-compression";

// Map API Service to local ServiceItem format
function mapApiToServiceItem(
  apiService: ApiService,
  categories: ServiceCategory[]
): ServiceItem {
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
    price: apiService.price,
    unit: apiService.unit || "lần",
    description: "",
    isOpenPrice: false,
    isActive: apiService.isActive,
    images: apiService.serviceImages || [],
    createdAt: new Date(apiService.createdAt),
    updatedAt: new Date(apiService.updatedAt),
  };
}

export function useServices() {
  // Default empty categories until API is ready
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
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

      const basicServices = result.data.map((s) =>
        mapApiToServiceItem(s, categories)
      );

      // Fetch images in parallel
      const servicesWithImages = await Promise.all(
        basicServices.map(async (service) => {
          try {
            const images = await imageApi.getServiceImages(service.serviceID);
            return {
              ...service,
              images: images || [],
            };
          } catch (err) {
            logger.error(
              `Failed to load images for service ${service.serviceID}`,
              err
            );
            return service;
          }
        })
      );

      setServices(servicesWithImages);
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Không thể tải danh sách dịch vụ";
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
  // Helper to create temp image objects for optimistic UI
  const createTempImages = (files: File[]): ServiceImage[] => {
    return files.map((file) => ({
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      secureUrl: URL.createObjectURL(file),
      cloudinaryId: `temp-${Math.random()}`,
      sortOrder: 0,
      isDefault: false,
      createdAt: new Date().toISOString(),
    }));
  };

  const addService = async (data: ServiceItemFormData, files?: File[]) => {
    try {
      setIsLoading(true);

      const category = categories.find(
        (cat) => cat.categoryID === data.categoryID
      );

      if (!category) {
        throw new Error("Loại dịch vụ không tồn tại");
      }

      const created = await serviceAPI.createService({
        name: data.serviceName,
        price: data.price,
        unit: data.unit,
        isActive: true,
      });

      const newService = mapApiToServiceItem(created, categories);

      // Optimistic UI update
      if (files && files.length > 0) {
        newService.images = createTempImages(files);
      }

      setServices([...services, newService]);
      setError(null);

      // Handle image upload in background
      if (files && files.length > 0) {
        (async () => {
          try {
            const compressedFiles = await compressFiles(files);
            await imageApi.uploadServiceImages(created.id, compressedFiles);
            logger.info(
              `Uploaded ${files.length} images for new service ${created.id}`
            );

            // Fetch fresh images
            const freshImages = await imageApi.getServiceImages(created.id);

            // Update the item in the list with images
            setServices((prev) =>
              prev.map((s) =>
                s.serviceID === created.id
                  ? { ...s, images: freshImages || [] }
                  : s
              )
            );
          } catch (bgError) {
            logger.error("Background upload for new service failed:", bgError);
          }
        })();
      }

      return newService;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Không thể thêm dịch vụ";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateService = async (
    id: string,
    data: ServiceItemFormData,
    files?: File[]
  ) => {
    try {
      setIsLoading(true);

      const category = categories.find(
        (cat) => cat.categoryID === data.categoryID
      );

      if (!category) {
        throw new Error("Loại dịch vụ không tồn tại");
      }

      const updated = await serviceAPI.updateService(id, {
        name: data.serviceName,
        price: data.price,
        unit: data.unit,
      });

      // Update local state immediately (optimistic)
      const updatedLocal = mapApiToServiceItem(updated, categories);

      // Preserve existing images or add temp ones
      const existingService = services.find((s) => s.serviceID === id);
      const newTempImages = files ? createTempImages(files) : [];

      updatedLocal.images = [
        ...(existingService?.images || []),
        ...newTempImages,
      ];

      setServices(
        services.map((service) =>
          service.serviceID === id ? updatedLocal : service
        )
      );
      setError(null);

      // Background upload
      if (files && files.length > 0) {
        (async () => {
          try {
            const compressedFiles = await compressFiles(files);
            await imageApi.uploadServiceImages(id, compressedFiles);
            logger.info(`Uploaded ${files.length} images for service ${id}`);

            // Fetch fresh images
            const freshImages = await imageApi.getServiceImages(id);

            setServices((prev) =>
              prev.map((s) =>
                s.serviceID === id ? { ...s, images: freshImages || [] } : s
              )
            );
          } catch (bgError) {
            logger.error(
              "Background update for service images failed:",
              bgError
            );
          }
        })();
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể cập nhật dịch vụ";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const softDeleteService = async (id: string) => {
    try {
      setIsLoading(true);
      await serviceAPI.updateService(id, { isActive: false });
      setServices(
        services.map((service) =>
          service.serviceID === id
            ? { ...service, isActive: false, updatedAt: new Date() }
            : service
        )
      );
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể vô hiệu hóa dịch vụ";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      setIsLoading(true);
      await serviceAPI.deleteService(id);
      setServices(services.filter((service) => service.serviceID !== id));
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể xóa dịch vụ";
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
