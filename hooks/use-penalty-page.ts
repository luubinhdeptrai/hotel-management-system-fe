"use client";

import { useState } from "react";
import { mockPenaltyItems } from "@/lib/mock-penalties";
import { PenaltyItem, PenaltyFormData } from "@/lib/types/penalty";

interface Notification {
  type: "success" | "error";
  message: string;
}

export function usePenaltyPage() {
  // Local state for penalties (in real app, this would come from API)
  const [penalties, setPenalties] = useState<PenaltyItem[]>(mockPenaltyItems);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPenalty, setSelectedPenalty] = useState<
    PenaltyItem | undefined
  >();

  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Handlers
  const handleAddPenalty = () => {
    setSelectedPenalty(undefined);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditPenalty = (penalty: PenaltyItem) => {
    setSelectedPenalty(penalty);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handlePenaltySubmit = (data: PenaltyFormData) => {
    try {
      if (modalMode === "create") {
        const newPenalty: PenaltyItem = {
          penaltyID: `PEN${String(penalties.length + 1).padStart(3, "0")}`,
          ...data,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setPenalties([...penalties, newPenalty]);
        setNotification({
          type: "success",
          message: "Thêm phí phạt thành công",
        });
      } else if (selectedPenalty) {
        setPenalties(
          penalties.map((p) =>
            p.penaltyID === selectedPenalty.penaltyID
              ? { ...p, ...data, updatedAt: new Date() }
              : p
          )
        );
        setNotification({
          type: "success",
          message: "Cập nhật phí phạt thành công",
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

  const handleDeletePenalty = (id: string) => {
    try {
      setPenalties(penalties.filter((p) => p.penaltyID !== id));
      setNotification({
        type: "success",
        message: "Xóa phí phạt thành công",
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
    activeCount: penalties.filter((p) => p.isActive).length,
    totalCount: penalties.length,
  };

  return {
    // Data
    penalties,
    statistics,
    notification,

    // Modal State
    modalOpen,
    modalMode,
    selectedPenalty,

    // Handlers
    handleAddPenalty,
    handleEditPenalty,
    handlePenaltySubmit,
    handleDeletePenalty,
    handleCloseModal,
    handleDismissNotification,
  };
}
