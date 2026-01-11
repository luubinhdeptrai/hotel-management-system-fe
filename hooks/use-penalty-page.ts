"use client";

import { useState, useEffect } from "react";
import { PenaltyItem } from "@/lib/types/penalty";
import { penaltyAPI, serviceAPI } from "@/lib/services/service-unified.service";

interface Notification {
  type: "success" | "error";
  message: string;
}

export function usePenaltyPage() {
  // Load penalty service info
  const [penalties, setPenalties] = useState<PenaltyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPenalty, setSelectedPenalty] = useState<
    PenaltyItem | undefined
  >();

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Load penalty service info on mount
  useEffect(() => {
    loadPenaltyInfo();
  }, []);

  const loadPenaltyInfo = async () => {
    try {
      setLoading(true);
      console.log('📡 [usePenaltyPage] Loading penalty service info...');
      
      const penaltyService = await serviceAPI.getPenaltyService();
      console.log('✅ [usePenaltyPage] Penalty service loaded:', penaltyService);
      
      if (penaltyService) {
        const penaltyItem: PenaltyItem = {
          penaltyID: penaltyService.id,
          penaltyName: penaltyService.name,
          price: parseFloat(penaltyService.price as any),
          description: `Dịch vụ phạt hệ thống - Giá mặc định: ${penaltyService.price} VND`,
          isActive: penaltyService.isActive,
          createdAt: new Date(penaltyService.createdAt),
          updatedAt: new Date(penaltyService.updatedAt),
        };
        setPenalties([penaltyItem]);
      }
    } catch (error) {
      console.error('❌ [usePenaltyPage] Failed to load penalty info:', error);
      setNotification({
        type: "error",
        message: "Không thể tải thông tin phạt"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddPenalty = () => {
    setSelectedPenalty(undefined);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditPenalty = (penalty: PenaltyItem) => {
    // Edit không được support khi chỉ hiển thị service info
    console.warn('⚠️ [usePenaltyPage] Edit not supported for service info. Need booking context to edit usage records.');
    setNotification({
      type: "error",
      message: "Chỉnh sửa chỉ có sẵn khi xem lịch sử phạt trong booking."
    });
  };

  const handlePenaltySubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Convert form data to Backend format
      const backendData = {
        bookingRoomId: "DEFAULT",  // TODO: Get from booking context
        customPrice: data.price,
        reason: data.penaltyName || data.description,
        quantity: 1,
        employeeId: "current-user"  // TODO: Get from auth context
      };
      
      if (modalMode === "create") {
        console.log('📡 [usePenaltyPage] Creating penalty:', backendData);
        await penaltyAPI.applyPenalty(backendData);
        setNotification({
          type: "success",
          message: "Thêm phạt thành công"
        });
      } else {
        console.log('📡 [usePenaltyPage] Updating penalty:', backendData);
        await penaltyAPI.updatePenalty(selectedPenalty!.penaltyID, {
          quantity: backendData.quantity,
          status: "PENDING"
        });
        setNotification({
          type: "success",
          message: "Cập nhật phạt thành công"
        });
      }

      setModalOpen(false);
      await loadPenaltyInfo();
    } catch (error) {
      console.error('❌ [usePenaltyPage] Error:', error);
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePenalty = async (penaltyID: string) => {
    // Delete không được support khi chỉ hiển thị service info
    console.warn('⚠️ [usePenaltyPage] Delete not supported for service info. Need booking context to delete usage records.');
    setNotification({
      type: "error",
      message: "Xóa chỉ có sẵn khi xem lịch sử phạt trong booking."
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPenalty(undefined);
  };

  const handleDismissNotification = () => {
    setNotification(null);
  };

  return {
    penalties,
    loading,
    notification,
    modalOpen,
    modalMode,
    selectedPenalty,
    handleAddPenalty,
    handleEditPenalty,
    handlePenaltySubmit,
    handleDeletePenalty,
    handleCloseModal,
    handleDismissNotification,
  };
}
