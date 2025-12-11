"use client";

import { useSurchargePage } from "@/hooks/use-surcharge-page";
import { PageHeader } from "@/components/services/page-header";
import { NotificationBanner } from "@/components/services/notification-banner";
import { SurchargeTable } from "@/components/surcharges/surcharge-table";
import { SurchargeFormModal } from "@/components/surcharges/surcharge-form-modal";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

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
      {/* Header */}
      <PageHeader
        title="Quản lý Phụ Thu"
        description="Quản lý các khoản phụ thu như check-in sớm, check-out muộn, người thêm, thú cưng..."
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
          Danh sách Phụ Thu
        </h2>
        <Button
          onClick={handleAddSurcharge}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          {ICONS.PLUS}
          <span className="ml-2">Thêm Phụ Thu</span>
        </Button>
      </div>

      {/* Surcharge Table */}
      <SurchargeTable
        surcharges={surcharges}
        onEdit={handleEditSurcharge}
        onDelete={handleDeleteSurcharge}
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
