"use client";

import { useState } from "react";
import { useServices } from "@/hooks/use-services";
import {
  ServiceCategory,
  ServiceItem,
  ServiceCategoryFormData,
  ServiceItemFormData,
} from "@/lib/types/service";

interface Notification {
  type: "success" | "error";
  message: string;
}

export function useServicePage() {
  const {
    categories,
    services,
    addCategory,
    updateCategory,
    softDeleteCategory,
    addService,
    updateService,
    softDeleteService,
  } = useServices();

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedCategory, setSelectedCategory] = useState<
    ServiceCategory | undefined
  >();

  // Service Modal State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedService, setSelectedService] = useState<
    ServiceItem | undefined
  >();

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Category Handlers
  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setCategoryModalMode("create");
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setCategoryModalMode("edit");
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = (data: ServiceCategoryFormData) => {
    try {
      if (categoryModalMode === "create") {
        addCategory(data);
        setNotification({
          type: "success",
          message: "Thêm loại dịch vụ thành công",
        });
      } else if (selectedCategory) {
        updateCategory(selectedCategory.categoryID, data);
        setNotification({
          type: "success",
          message: "Cập nhật loại dịch vụ thành công",
        });
      }
      setCategoryModalOpen(false);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    try {
      softDeleteCategory(id);
      setNotification({
        type: "success",
        message: "Xóa loại dịch vụ thành công",
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
  };

  // Service Handlers
  const handleAddService = () => {
    setSelectedService(undefined);
    setServiceModalMode("create");
    setServiceModalOpen(true);
  };

  const handleEditService = (service: ServiceItem) => {
    setSelectedService(service);
    setServiceModalMode("edit");
    setServiceModalOpen(true);
  };

  const handleServiceSubmit = (data: ServiceItemFormData) => {
    try {
      if (serviceModalMode === "create") {
        addService(data);
        setNotification({
          type: "success",
          message: "Thêm dịch vụ thành công",
        });
      } else if (selectedService) {
        updateService(selectedService.serviceID, data);
        setNotification({
          type: "success",
          message: "Cập nhật dịch vụ thành công",
        });
      }
      setServiceModalOpen(false);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  };

  const handleDeleteService = (id: string) => {
    try {
      softDeleteService(id);
      setNotification({
        type: "success",
        message: "Xóa dịch vụ thành công",
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  };

  const handleCloseServiceModal = () => {
    setServiceModalOpen(false);
  };

  const handleDismissNotification = () => {
    setNotification(null);
  };

  // Statistics
  const statistics = {
    activeCategoriesCount: categories.filter((cat) => cat.isActive).length,
    activeServicesCount: services.filter((srv) => srv.isActive).length,
  };

  return {
    // Data
    categories,
    services,
    statistics,
    notification,

    // Category Modal State
    categoryModalOpen,
    categoryModalMode,
    selectedCategory,

    // Service Modal State
    serviceModalOpen,
    serviceModalMode,
    selectedService,

    // Category Handlers
    handleAddCategory,
    handleEditCategory,
    handleCategorySubmit,
    handleDeleteCategory,
    handleCloseCategoryModal,

    // Service Handlers
    handleAddService,
    handleEditService,
    handleServiceSubmit,
    handleDeleteService,
    handleCloseServiceModal,

    // Notification Handlers
    handleDismissNotification,
  };
}
