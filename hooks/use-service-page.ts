"use client";

import { useState } from "react";
import { useServices } from "@/hooks/use-services";
import { servicesApi } from "@/lib/api/services.api";
import type { Service } from "@/lib/types/api";

interface Notification {
  type: "success" | "error";
  message: string;
}

interface ServiceFormData {
  name: string;
  price: number;
  unit?: string;
  isActive?: boolean;
}

/**
 * useServicePage Hook
 * 
 * ✅ Backend-compatible implementation
 * - No categories support (Backend doesn't have this)
 * - Direct service CRUD operations
 * - Automatic filtering of penalty/surcharge services
 * - Simple notification system
 * - Image upload to Cloudinary via Backend
 */
export function useServicePage() {
  const { services, isLoading, error, createService, updateService, deleteService, refresh } =
    useServices();

  // Filter out "Phạt" and "Phụ thu" services (hard-coded names in Backend)
  const filteredServices = services.filter(
    (svc) => svc.name !== "Phạt" && svc.name !== "Phụ thu"
  );
  // Service Modal State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState<"create" | "edit">("create");
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Service Handlers
  const handleAddService = () => {
    setSelectedService(undefined);
    setServiceModalMode("create");
    setServiceModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setServiceModalMode("edit");
    setServiceModalOpen(true);
  };

  const handleServiceSubmit = async (data: ServiceFormData, files?: File[]) => {
    try {
      let serviceId: string;
      
      if (serviceModalMode === "create") {
        const newService = await createService(data);
        serviceId = newService.id;
      } else if (selectedService) {
        await updateService(selectedService.id, data);
        serviceId = selectedService.id;
      } else {
        throw new Error("Lỗi: không tìm thấy dịch vụ");
      }

      // Upload images if provided
      let hasImages = false;
      if (files && files.length > 0) {
        hasImages = true;
        for (const file of files) {
          try {
            const uploadResponse = await servicesApi.uploadServiceImage(serviceId, file);
            console.log("✅ Image uploaded:", uploadResponse);
          } catch (uploadError) {
            console.error("❌ Lỗi upload ảnh:", uploadError);
          }
        }
        
        // After uploading images, fetch the service detail to get the images
        // This ensures serviceImages array is populated
        try {
          console.log("🔄 Fetching service detail after upload...");
          const updatedService = await servicesApi.getServiceById(serviceId);
          console.log("✅ Service detail fetched:", updatedService);
          // Update the service in the local list with the one that has images
          await refresh();
        } catch (err) {
          console.error("❌ Lỗi fetch service sau upload:", err);
          await refresh();
        }
      } else {
        // If no images, just refresh normally
        await refresh();
      }

      // Show success notification
      setNotification({
        type: "success",
        message: serviceModalMode === "create" 
          ? "Thêm dịch vụ thành công" + (hasImages ? " và upload ảnh thành công" : "")
          : "Cập nhật dịch vụ thành công" + (hasImages ? " và upload ảnh thành công" : ""),
      });

      setServiceModalOpen(false);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id);
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
    activeServicesCount: filteredServices.filter((svc) => svc.isActive).length,
    totalServicesCount: filteredServices.length,
  };

  return {
    // Data
    services: filteredServices,
    statistics,
    notification,
    isLoading,

    // Service Modal State
    serviceModalOpen,
    serviceModalMode,
    selectedService,

    // Service Handlers
    handleAddService,
    handleEditService,
    handleServiceSubmit,
    handleDeleteService,
    handleCloseServiceModal,

    // Notification Handlers
    handleDismissNotification,

    // Utilities
    refresh,
  };
}
