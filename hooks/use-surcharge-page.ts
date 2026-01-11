"use client";

import { useState, useEffect } from "react";
import { SurchargeItem } from "@/lib/types/surcharge";
import { surchargeAPI, serviceAPI } from "@/lib/services/service-unified.service";

interface Notification {
  type: "success" | "error";
  message: string;
}

export function useSurchargePage() {
  // Load surcharge service info
  const [surcharges, setSurcharges] = useState<SurchargeItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSurcharge, setSelectedSurcharge] = useState<
    SurchargeItem | undefined
  >();

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Load surcharge service info on mount
  useEffect(() => {
    loadSurchargeInfo();
  }, []);

  const loadSurchargeInfo = async () => {
    try {
      setLoading(true);
      console.log('📡 [useSurchargePage] Loading surcharge service info...');
      
      const surchargeService = await serviceAPI.getSurchargeService();
      console.log('✅ [useSurchargePage] Surcharge service loaded:', surchargeService);
      
      if (surchargeService) {
        const surchargeItem: SurchargeItem = {
          surchargeID: surchargeService.id,
          surchargeName: surchargeService.name,
          price: parseFloat(surchargeService.price as any),
          description: `Dịch vụ phụ thu hệ thống - Giá mặc định: ${surchargeService.price} VND`,
          isActive: surchargeService.isActive,
          createdAt: new Date(surchargeService.createdAt),
          updatedAt: new Date(surchargeService.updatedAt),
        };
        setSurcharges([surchargeItem]);
      }
    } catch (error) {
      console.error('❌ [useSurchargePage] Failed to load surcharge info:', error);
      setNotification({
        type: "error",
        message: "Không thể tải thông tin phụ thu"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddSurcharge = () => {
    setSelectedSurcharge(undefined);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditSurcharge = (surcharge: SurchargeItem) => {
    // Edit không được support khi chỉ hiển thị service info
    console.warn('⚠️ [useSurchargePage] Edit not supported for service info. Need booking context to edit usage records.');
    setNotification({
      type: "error",
      message: "Chỉnh sửa chỉ có sẵn khi xem lịch sử phụ thu trong booking."
    });
  };

  const handleSurchargeSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Convert form data to Backend format
      const backendData = {
        bookingRoomId: "DEFAULT",  // TODO: Get from booking context
        customPrice: data.price,
        reason: data.surchargeName || data.description,
        quantity: 1,
        employeeId: "current-user"  // TODO: Get from auth context
      };
      
      if (modalMode === "create") {
        console.log('📡 [useSurchargePage] Creating surcharge:', backendData);
        await surchargeAPI.applySurcharge(backendData);
        setNotification({
          type: "success",
          message: "Thêm phụ thu thành công"
        });
      } else {
        console.log('📡 [useSurchargePage] Updating surcharge:', backendData);
        await surchargeAPI.updateSurcharge(selectedSurcharge!.surchargeID, {
          quantity: backendData.quantity,
          status: "PENDING"
        });
        setNotification({
          type: "success",
          message: "Cập nhật phụ thu thành công"
        });
      }

      setModalOpen(false);
      await loadSurchargeInfo();
    } catch (error) {
      console.error('❌ [useSurchargePage] Error:', error);
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurcharge = async (surchargeID: string) => {
    // Delete không được support khi chỉ hiển thị service info
    console.warn('⚠️ [useSurchargePage] Delete not supported for service info. Need booking context to delete usage records.');
    setNotification({
      type: "error",
      message: "Xóa chỉ có sẵn khi xem lịch sử phụ thu trong booking."
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSurcharge(undefined);
  };

  const handleDismissNotification = () => {
    setNotification(null);
  };

  return {
    surcharges,
    loading,
    notification,
    modalOpen,
    modalMode,
    selectedSurcharge,
    handleAddSurcharge,
    handleEditSurcharge,
    handleSurchargeSubmit,
    handleDeleteSurcharge,
    handleCloseModal,
    handleDismissNotification,
  };
}
