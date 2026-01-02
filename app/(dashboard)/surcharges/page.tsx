"use client";

import { useSurchargePage } from "@/hooks/use-surcharge-page";
import { NotificationBanner } from "@/components/services/notification-banner";
import { SurchargeGrid } from "@/components/surcharges/surcharge-grid";
import { SurchargeFormModal } from "@/components/surcharges/surcharge-form-modal";

export default function SurchargesPage() {
  const {
    surcharges,
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
  } = useSurchargePage();

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={handleDismissNotification}
        />
      )}

      {/* Surcharge Grid */}
      <SurchargeGrid
        surcharges={surcharges}
        onEdit={handleEditSurcharge}
        onDelete={handleDeleteSurcharge}
        onCreate={handleAddSurcharge}
      />

      {/* Surcharge Form Modal */}
      <SurchargeFormModal
        open={modalOpen}
        mode={modalMode}
        surcharge={selectedSurcharge}
        onClose={handleCloseModal}
        onSubmit={handleSurchargeSubmit}
      />
    </div>
  );
}
