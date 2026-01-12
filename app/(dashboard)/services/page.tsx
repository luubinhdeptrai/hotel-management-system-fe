"use client";

import { useServicePage } from "@/hooks/use-service-page";
import { NotificationBanner } from "@/components/services/notification-banner";
import { ServiceStatistics } from "@/components/services/service-statistics";
import { ServiceItemFormModal } from "@/components/services/service-item-form-modal";
import { ServiceGrid } from "@/components/services/service-grid";
import { ICONS } from "@/src/constants/icons.enum";

export default function ServicesPage() {
  const {
    services,
    statistics,
    notification,
    serviceModalOpen,
    serviceModalMode,
    selectedService,
    handleAddService,
    handleEditService,
    handleServiceSubmit,
    handleDeleteService,
    handleCloseServiceModal,
    handleDismissNotification,
  } = useServicePage();

  return (
    <div className="space-y-6 pb-8">
      {/* Modern Header with Gradient */}
      <div className="bg-linear-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 flex items-center justify-center text-white">{ICONS.CLIPBOARD_LIST}</div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Quản lý Dịch vụ
            </h1>
            <p className="text-sm text-white/90 mt-1 font-medium">
              Quản lý dịch vụ khách sạn (Giặt ủi, Massage, v.v...)
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={handleDismissNotification}
        />
      )}

      {/* Statistics Cards */}
      <ServiceStatistics
        activeServicesCount={statistics.activeServicesCount}
        totalServicesCount={statistics.totalServicesCount}
      />

      {/* Services Grid */}
      <ServiceGrid
        services={services}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
        onCreate={handleAddService}
      />

      {/* Modals */}
      <ServiceItemFormModal
        isOpen={serviceModalOpen}
        onClose={handleCloseServiceModal}
        onSubmit={handleServiceSubmit}
        service={selectedService}
        mode={serviceModalMode}
      />
    </div>
  );
}

