"use client";

import { useState } from "react";
import {
  ServiceCategory,
  ServiceItem,
  ServiceCategoryFormData,
  ServiceItemFormData,
} from "@/lib/types/service";
import { mockServiceCategories, mockServiceItems } from "@/lib/mock-services";

export function useServices() {
  const [categories, setCategories] = useState<ServiceCategory[]>(
    mockServiceCategories
  );
  const [services, setServices] = useState<ServiceItem[]>(mockServiceItems);
  const [isLoading, setIsLoading] = useState(false);

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
  const addService = (data: ServiceItemFormData) => {
    setIsLoading(true);

    const category = categories.find(
      (cat) => cat.categoryID === data.categoryID
    );

    if (!category) {
      setIsLoading(false);
      throw new Error("Loại dịch vụ không tồn tại");
    }

    const newService: ServiceItem = {
      serviceID: `SRV${String(services.length + 1).padStart(3, "0")}`,
      serviceName: data.serviceName,
      categoryID: data.categoryID,
      category: category,
      price: data.price,
      unit: data.unit,
      description: data.description,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setServices([...services, newService]);
    setIsLoading(false);

    return newService;
  };

  const updateService = (id: string, data: ServiceItemFormData) => {
    setIsLoading(true);

    const category = categories.find(
      (cat) => cat.categoryID === data.categoryID
    );

    if (!category) {
      setIsLoading(false);
      throw new Error("Loại dịch vụ không tồn tại");
    }

    setServices(
      services.map((service) =>
        service.serviceID === id
          ? {
              ...service,
              serviceName: data.serviceName,
              categoryID: data.categoryID,
              category: category,
              price: data.price,
              unit: data.unit,
              description: data.description,
              updatedAt: new Date(),
            }
          : service
      )
    );

    setIsLoading(false);
  };

  const softDeleteService = (id: string) => {
    setIsLoading(true);

    setServices(
      services.map((service) =>
        service.serviceID === id
          ? { ...service, isActive: false, updatedAt: new Date() }
          : service
      )
    );

    setIsLoading(false);
  };

  const deleteService = (id: string) => {
    setIsLoading(true);
    setServices(services.filter((service) => service.serviceID !== id));
    setIsLoading(false);
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
