"use client";

import { usePenaltyPage } from "@/hooks/use-penalty-page";
import { PageHeader } from "@/components/services/page-header";
import { NotificationBanner } from "@/components/services/notification-banner";
import { PenaltyGrid } from "@/components/penalties/penalty-grid";
import { PenaltyFormModal } from "@/components/penalties/penalty-form-modal";

export default function PenaltiesPage() {
  const {
    penalties,
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
  } = usePenaltyPage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Quản lý Phí Phạt"
        description="Quản lý các khoản phí phạt như hư hỏng thiết bị, mất đồ, vi phạm quy định..."
      />

      {/* Notification */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={handleDismissNotification}
        />
      )}

      {/* Penalty Grid */}
      <PenaltyGrid
        penalties={penalties}
        onEdit={handleEditPenalty}
        onDelete={handleDeletePenalty}
        onCreate={handleAddPenalty}
      />

      {/* Penalty Form Modal */}
      <PenaltyFormModal
        open={modalOpen}
        mode={modalMode}
        penalty={selectedPenalty}
        onClose={handleCloseModal}
        onSubmit={handlePenaltySubmit}
      />
    </div>
  );
}
