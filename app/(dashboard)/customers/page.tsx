"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CustomerDetailsModal,
  CustomerFilters,
  CustomerFormModal,
  CustomerStatistics,
  CustomerTable,
} from "@/components/customers";
import { useCustomerPage } from "@/hooks/use-customer-page";
import { ICONS } from "@/src/constants/icons.enum";

export default function CustomersPage() {
  const {
    customers,
    filteredCustomers,
    statistics,
    filters,
    loading,
    hasFilters,
    updateFilter,
    clearFilters,
    formOpen,
    setFormOpen,
    detailsOpen,
    setDetailsOpen,
    selectedCustomer,
    confirmActionOpen,
    setConfirmActionOpen,
    pendingStatusAction,
    cancelStatusChange,
    loadCustomers,
    handleAddCustomer,
    handleEditCustomer,
    handleViewDetails,
    handleSaveCustomer,
    requestStatusChange,
    confirmStatusChange,
  } = useCustomerPage();

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Modern Header with Stats */}
      <CustomerStatistics statistics={statistics} />

      <CustomerFilters
        searchQuery={filters.searchQuery}
        typeFilter={filters.typeFilter}
        vipFilter={filters.vipFilter}
        onSearchChange={(value) => updateFilter("searchQuery", value)}
        onTypeChange={(value) => updateFilter("typeFilter", value)}
        onVipChange={(value) => updateFilter("vipFilter", value)}
        onAddCustomer={handleAddCustomer}
      />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Hiển thị{" "}
          <span className="font-semibold">{filteredCustomers.length}</span>/
          {customers.length} khách hàng
        </p>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            {ICONS.FILTER}
            <span>Xóa bộ lọc</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center text-gray-500">
          Đang tải dữ liệu khách hàng...
        </div>
      ) : (
        <CustomerTable
          customers={filteredCustomers}
          onViewDetails={handleViewDetails}
          onEdit={handleEditCustomer}
          onRequestStatusChange={requestStatusChange}
        />
      )}

      <CustomerFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />

      <CustomerDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        customer={selectedCustomer}
      />

      <AlertDialog
        open={confirmActionOpen}
        onOpenChange={(open) => {
          if (open) {
            setConfirmActionOpen(true);
          } else {
            cancelStatusChange();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatusAction === "deactivate"
                ? "Vô hiệu hóa khách hàng"
                : "Kích hoạt lại khách hàng"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusAction === "deactivate"
                ? "Khách hàng sẽ không thể được chọn khi tạo đặt phòng. Bạn vẫn có thể kích hoạt lại sau."
                : "Khách hàng sẽ được kích hoạt và xuất hiện trong danh sách tìm kiếm đặt phòng."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={
                pendingStatusAction === "deactivate"
                  ? "bg-error-600 hover:bg-error-700"
                  : "bg-success-600 hover:bg-success-700"
              }
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
