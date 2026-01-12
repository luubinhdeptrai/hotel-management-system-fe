"use client";

import { useState, useEffect } from "react";
import { PenaltyItem, PenaltyFormData } from "@/lib/types/penalty";
import { penaltyAPI } from "@/lib/services/service-unified.service";

interface Notification {
  type: "success" | "error";
  message: string;
}

export function usePenaltyPage() {
  const [penalties, setPenalties] = useState<PenaltyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyItem | undefined>();

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Load penalty usages on mount
  useEffect(() => {
    loadPenaltyUsages();
  }, []);

  const loadPenaltyUsages = async () => {
    try {
      setLoading(true);
      console.log('📡 [usePenaltyPage] Loading penalty usages...');
      
      // Get all penalty service usages from Backend
      const penaltyUsages = await penaltyAPI.getPenaltyUsages();
      console.log('✅ [usePenaltyPage] Penalty usages loaded:', penaltyUsages);
      
      // Map ServiceUsage to PenaltyItem for display
      const items: PenaltyItem[] = penaltyUsages.map((usage) => ({
        id: usage.id,
        bookingId: usage.bookingId || undefined,
        bookingRoomId: usage.bookingRoomId || undefined,
        serviceId: usage.serviceId,
        serviceName: usage.service?.name || 'Phạt',
        quantity: usage.quantity,
        unitPrice: parseFloat(usage.unitPrice?.toString() || '0'),
        customPrice: parseFloat(usage.customPrice?.toString() || '0'),
        totalPrice: parseFloat(usage.totalPrice?.toString() || '0'),
        note: usage.note || '',
        status: usage.status as 'PENDING' | 'TRANSFERRED' | 'COMPLETED',
        employeeId: usage.employeeId,
        createdAt: new Date(usage.createdAt),
        updatedAt: new Date(usage.updatedAt),
      }));
      
      setPenalties(items);
    } catch (error) {
      console.error('❌ [usePenaltyPage] Failed to load penalties:', error);
      setNotification({
        type: "error",
        message: "Không thể tải danh sách phạt"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddPenalty = () => {
    setModalMode("create");
    setSelectedPenalty(undefined);
    setModalOpen(true);
  };

  const handleEditPenalty = (penalty: PenaltyItem) => {
    setModalMode("edit");
    setSelectedPenalty(penalty);
    setModalOpen(true);
  };

  const handlePenaltySubmit = async (data: PenaltyFormData) => {
    try {
      setLoading(true);
      
      if (modalMode === "create") {
        // Create new penalty
        console.log('📝 [usePenaltyPage] Creating penalty:', data);
        await penaltyAPI.applyPenalty(data);
        
        setNotification({
          type: "success",
          message: "Thêm phạt thành công"
        });
      } else if (selectedPenalty && modalMode === "edit") {
        // Update penalty status
        console.log('✏️ [usePenaltyPage] Updating penalty:', selectedPenalty.id);
        await penaltyAPI.updatePenalty(selectedPenalty.id, {
          quantity: data.quantity,
          status: 'PENDING'
        });
        
        setNotification({
          type: "success",
          message: "Cập nhật phạt thành công"
        });
      }
      
      setModalOpen(false);
      setSelectedPenalty(undefined);
      await loadPenaltyUsages();
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
    try {
      setLoading(true);
      console.log('🗑️ [usePenaltyPage] Deleting penalty:', penaltyID);
      
      await penaltyAPI.deletePenalty(penaltyID);
      
      setNotification({
        type: "success",
        message: "Xóa phạt thành công"
      });
      
      await loadPenaltyUsages();
    } catch (error) {
      console.error('❌ [usePenaltyPage] Error deleting penalty:', error);
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Không thể xóa phạt"
      });
    } finally {
      setLoading(false);
    }
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
