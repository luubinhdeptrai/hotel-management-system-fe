"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServicePage } from "@/hooks/use-service-page";
import { NotificationBanner } from "@/components/services/notification-banner";
import { ServiceStatistics } from "@/components/services/service-statistics";
import { CategoriesSectionHeader } from "@/components/services/categories-section-header";
import { ServiceCategoryFormModal } from "@/components/services/service-category-form-modal";
import { ServiceItemFormModal } from "@/components/services/service-item-form-modal";
import { ServiceCategoryTable } from "@/components/services/service-category-table";
import { ServiceGrid } from "@/components/services/service-grid";
import { ICONS } from "@/src/constants/icons.enum";

export default function ServicesPage() {
  const {
    categories,
    services,
    statistics,
    notification,
    categoryModalOpen,
    categoryModalMode,
    selectedCategory,
    serviceModalOpen,
    serviceModalMode,
    selectedService,
    handleAddCategory,
    handleEditCategory,
    handleCategorySubmit,
    handleDeleteCategory,
    handleCloseCategoryModal,
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
              Quản lý danh mục dịch vụ và giá dịch vụ của khách sạn
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
        activeCategoriesCount={statistics.activeCategoriesCount}
        activeServicesCount={statistics.activeServicesCount}
      />

      {/* Modern Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-2 w-full max-w-8xl gap-0 h-16 rounded-2xl bg-linear-to-br from-white via-gray-50 to-white p-1.5 shadow-lg border-2 border-gray-200/50">
            <TabsTrigger
              value="services"
              className="flex items-center justify-center gap-3 h-full px-6 data-[state=active]:bg-linear-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:shadow-lg data-[state=active]:text-white font-bold text-base transition-all hover:scale-105 rounded-l-2xl w-full"
            >
              <div className="w-5 h-5 flex items-center justify-center">{ICONS.CLIPBOARD_LIST}</div>
              Quản lý Dịch vụ
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center justify-center gap-3 h-full px-6 data-[state=active]:bg-linear-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:shadow-lg data-[state=active]:text-white font-bold text-base transition-all hover:scale-105 rounded-r-2xl w-full"
            >
              <div className="w-5 h-5 flex items-center justify-center">{ICONS.FOLDER}</div>
              Quản lý Loại Dịch vụ
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <ServiceGrid
            services={services}
            categories={categories}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
            onCreate={handleAddService}
          />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <CategoriesSectionHeader onAddCategory={handleAddCategory} />

          <ServiceCategoryTable
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ServiceCategoryFormModal
        isOpen={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        onSubmit={handleCategorySubmit}
        category={selectedCategory}
        mode={categoryModalMode}
      />

      <ServiceItemFormModal
        isOpen={serviceModalOpen}
        onClose={handleCloseServiceModal}
        onSubmit={handleServiceSubmit}
        service={selectedService}
        categories={categories}
        mode={serviceModalMode}
      />
    </div>
  );
}

