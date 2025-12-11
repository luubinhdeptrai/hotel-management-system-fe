"use client";

import { usePenaltyPage } from "@/hooks/use-penalty-page";
import { PageHeader } from "@/components/services/page-header";
import { NotificationBanner } from "@/components/services/notification-banner";
import { PenaltyTable } from "@/components/penalties/penalty-table";
import { PenaltyFormModal } from "@/components/penalties/penalty-form-modal";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

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

      {/* Section Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Danh sách Phí Phạt
        </h2>
        <Button
          onClick={handleAddPenalty}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          {ICONS.PLUS}
          <span className="ml-2">Thêm Phí Phạt</span>
        </Button>
      </div>

      {/* Penalty Table */}
      <PenaltyTable
        penalties={penalties}
        onEdit={handleEditPenalty}
        onDelete={handleDeletePenalty}
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
