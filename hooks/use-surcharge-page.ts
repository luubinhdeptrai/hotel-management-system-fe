"use client";

import { useState } from "react";
import { SurchargeItem, SurchargeFormData } from "@/lib/types/surcharge";

interface Notification {
  type: "success" | "error";
  message: string;
}

export function useSurchargePage() {
  // Local state for surcharges (in real app, this would come from API)
  const [surcharges, setSurcharges] =
    useState<SurchargeItem[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSurcharge, setSelectedSurcharge] = useState<
    SurchargeItem | undefined
  >();

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Handlers
  const handleAddSurcharge = () => {
    setSelectedSurcharge(undefined);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditSurcharge = (surcharge: SurchargeItem) => {
    setSelectedSurcharge(surcharge);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSurchargeSubmit = (data: SurchargeFormData) => {
    try {
      if (modalMode === "create") {
        const newSurcharge: SurchargeItem = {
          surchargeID: `SUR${String(surcharges.length + 1).padStart(3, "0")}`,
          ...data,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSurcharges([...surcharges, newSurcharge]);
        setNotification({
          type: "success",
          message: "Thêm phụ thu thành công",
        });
      } else if (selectedSurcharge) {
        setSurcharges(
          surcharges.map((s) =>
            s.surchargeID === selectedSurcharge.surchargeID
              ? { ...s, ...data, updatedAt: new Date() }
              : s
          )
        );
        setNotification({
          type: "success",
          message: "Cập nhật phụ thu thành công",
        });
      }
      setModalOpen(false);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  };

  const handleDeleteSurcharge = (id: string) => {
    try {
      setSurcharges(surcharges.filter((s) => s.surchargeID !== id));
      setNotification({
        type: "success",
        message: "Xóa phụ thu thành công",
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleDismissNotification = () => {
    setNotification(null);
  };

  // Statistics
  const statistics = {
    activeCount: surcharges.filter((s) => s.isActive).length,
    totalCount: surcharges.length,
  };

  return {
    // Data
    surcharges,
    statistics,
    notification,

    // Modal State
    modalOpen,
    modalMode,
    selectedSurcharge,

    // Handlers
    handleAddSurcharge,
    handleEditSurcharge,
    handleSurchargeSubmit,
    handleDeleteSurcharge,
    handleCloseModal,
    handleDismissNotification,
  };
}
