"use client";

import { useState, useEffect } from "react";
import { SurchargeItem, SurchargeFormData } from "@/lib/types/surcharge";
import { surchargeAPI } from "@/lib/services/service-unified.service";

interface Notification {
  type: "success" | "error";
  message: string;
}

export function useSurchargePage() {
  const [surcharges, setSurcharges] = useState<SurchargeItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSurcharge, setSelectedSurcharge] = useState<SurchargeItem | undefined>();

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Load surcharge usages on mount
  useEffect(() => {
    loadSurchargeUsages();
  }, []);

  const loadSurchargeUsages = async () => {
    try {
      setLoading(true);
      console.log('📡 [useSurchargePage] Loading surcharge usages...');
      
      // Get all surcharge service usages from Backend
      const surchargeUsages = await surchargeAPI.getSurchargeUsages();
      console.log('✅ [useSurchargePage] Surcharge usages loaded:', surchargeUsages);
      
      // Map ServiceUsage to SurchargeItem for display
      const items: SurchargeItem[] = surchargeUsages.map((usage) => ({
        id: usage.id,
        bookingId: usage.bookingId || undefined,
        bookingRoomId: usage.bookingRoomId || undefined,
        serviceId: usage.serviceId,
        serviceName: usage.service?.name || 'Phụ thu',
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
      
      setSurcharges(items);
    } catch (error) {
      console.error('❌ [useSurchargePage] Failed to load surcharges:', error);
      setNotification({
        type: "error",
        message: "Không thể tải danh sách phụ thu"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddSurcharge = () => {
    setModalMode("create");
    setSelectedSurcharge(undefined);
    setModalOpen(true);
  };

  const handleEditSurcharge = (surcharge: SurchargeItem) => {
    setModalMode("edit");
    setSelectedSurcharge(surcharge);
    setModalOpen(true);
  };

  const handleSurchargeSubmit = async (data: SurchargeFormData) => {
    try {
      setLoading(true);
      
      if (modalMode === "create") {
        // Create new surcharge
        console.log('📝 [useSurchargePage] Creating surcharge:', data);
        await surchargeAPI.applySurcharge(data);
        
        setNotification({
          type: "success",
          message: "Thêm phụ thu thành công"
        });
      } else if (selectedSurcharge && modalMode === "edit") {
        // Update surcharge status
        console.log('✏️ [useSurchargePage] Updating surcharge:', selectedSurcharge.id);
        await surchargeAPI.updateSurcharge(selectedSurcharge.id, {
          quantity: data.quantity,
          status: 'PENDING'
        });
        
        setNotification({
          type: "success",
          message: "Cập nhật phụ thu thành công"
        });
      }
      
      setModalOpen(false);
      setSelectedSurcharge(undefined);
      await loadSurchargeUsages();
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
    try {
      setLoading(true);
      console.log('🗑️ [useSurchargePage] Deleting surcharge:', surchargeID);
      
      await surchargeAPI.deleteSurcharge(surchargeID);
      
      setNotification({
        type: "success",
        message: "Xóa phụ thu thành công"
      });
      
      await loadSurchargeUsages();
    } catch (error) {
      console.error('❌ [useSurchargePage] Error deleting surcharge:', error);
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Không thể xóa phụ thu"
      });
    } finally {
      setLoading(false);
    }
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
