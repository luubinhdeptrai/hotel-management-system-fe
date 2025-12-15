"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServicePage } from "@/hooks/use-service-page";
import { PageHeader } from "@/components/services/page-header";
import { NotificationBanner } from "@/components/services/notification-banner";
import { ServiceStatistics } from "@/components/services/service-statistics";
import { CategoriesSectionHeader } from "@/components/services/categories-section-header";
import { ServiceCategoryFormModal } from "@/components/services/service-category-form-modal";
import { ServiceItemFormModal } from "@/components/services/service-item-form-modal";
import { ServiceCategoryTable } from "@/components/services/service-category-table";
import { ServiceGrid } from "@/components/services/service-grid";

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
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Quản lý Dịch Vụ"
        description="Quản lý danh mục dịch vụ và giá dịch vụ của khách sạn"
      />

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

      {/* Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="services">Quản lý Dịch vụ</TabsTrigger>
          <TabsTrigger value="categories">Quản lý Loại Dịch vụ</TabsTrigger>
        </TabsList>

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
