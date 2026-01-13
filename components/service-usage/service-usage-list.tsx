"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import { serviceUsageService } from "@/lib/services";
import type {
  ServiceUsage,
  GetServiceUsagesParams,
} from "@/lib/types/service-usage.types";
import {
  calculateBalance,
} from "@/lib/types/service-usage.types";
import { ServiceUsageTable } from "@/components/service-usage/service-usage-table";
import { EditServiceUsageModal } from "@/components/service-usage/edit-service-usage-modal";
import { DeleteServiceUsageDialog } from "@/components/service-usage/delete-service-usage-dialog";

interface ServiceUsageListProps {
  bookingId?: string; // Filter by booking
  bookingRoomId?: string; // Filter by room
  onAddService?: () => void; // Callback to open add service modal
  onRefresh?: () => void; // Callback after data changes
  readonly?: boolean; // If true, disable edit/delete actions
  showTitle?: boolean; // Show card title
}

export function ServiceUsageList({
  bookingId,
  bookingRoomId,
  onAddService,
  onRefresh,
  readonly = false,
  showTitle = true,
}: ServiceUsageListProps) {
  const [serviceUsages, setServiceUsages] = useState<ServiceUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUsage, setSelectedUsage] = useState<ServiceUsage | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load service usages
  const loadServiceUsages = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params: GetServiceUsagesParams = {
        limit: 100, // Get all for this booking/room
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (bookingId) params.bookingId = bookingId;
      if (bookingRoomId) params.bookingRoomId = bookingRoomId;

      const response = await serviceUsageService.getServiceUsages(params);
      setServiceUsages(response.data || []);
    } catch (err) {
      console.error("Failed to load service usages:", err);
      setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServiceUsages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, bookingRoomId]);

  // Handle edit
  const handleEdit = (usage: ServiceUsage) => {
    setSelectedUsage(usage);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (usage: ServiceUsage) => {
    setSelectedUsage(usage);
    setShowDeleteDialog(true);
  };

  // Handle cancel
  const handleCancel = async (usageId: string) => {
    try {
      await serviceUsageService.cancelServiceUsage(usageId);
      await loadServiceUsages();
      onRefresh?.();
    } catch (err) {
      console.error("Failed to cancel service usage:", err);
      const errorMsg = err instanceof Error ? err.message : "Không thể hủy dịch vụ. Vui lòng thử lại.";
      alert(errorMsg);
    }
  };

  // Success callbacks
  const handleEditSuccess = async () => {
    await loadServiceUsages();
    onRefresh?.();
  };

  const handleDeleteSuccess = async () => {
    await loadServiceUsages();
    onRefresh?.();
  };

  // Calculate totals
  const totalAmount = serviceUsages.reduce(
    (sum, usage) => sum + usage.totalPrice,
    0
  );
  const totalPaid = serviceUsages.reduce(
    (sum, usage) => sum + usage.totalPaid,
    0
  );
  const totalBalance = serviceUsages.reduce(
    (sum, usage) => sum + calculateBalance(usage),
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <>
      <Card className="border-2 border-gray-100 shadow-md">
        {showTitle && (
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="w-5 h-5 text-white">{ICONS.PACKAGE}</span>
                </div>
                <span>Dịch vụ đã sử dụng</span>
              </CardTitle>
              {onAddService && !readonly && (
                <Button
                  onClick={onAddService}
                  size="sm"
                  className="gap-2"
                >
                  <span className="w-4 h-4">{ICONS.PLUS}</span>
                  Thêm dịch vụ
                </Button>
              )}
            </div>
          </CardHeader>
        )}

        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin w-6 h-6 mx-auto text-primary-600">
                  {ICONS.LOADER}
                </div>
                <p className="text-sm text-gray-600">Đang tải dịch vụ...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                {ICONS.ALERT_CIRCLE}
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && serviceUsages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                {ICONS.PACKAGE}
              </div>
              <p className="text-gray-500 mb-4">
                Chưa có dịch vụ nào được sử dụng
              </p>
              {onAddService && !readonly && (
                <Button onClick={onAddService} size="sm" variant="outline">
                  <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
                  Thêm dịch vụ đầu tiên
                </Button>
              )}
            </div>
          )}

          {/* Service Usages Table */}
          {!isLoading && !error && serviceUsages.length > 0 && (
            <div className="space-y-4">
              <ServiceUsageTable
                serviceUsages={serviceUsages}
                onEdit={readonly ? undefined : handleEdit}
                onCancel={readonly ? undefined : handleCancel}
                onDelete={readonly ? undefined : handleDelete}
                showActions={!readonly}
              />

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng tiền dịch vụ:</span>
                  <span className="font-semibold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-base border-t pt-2">
                  <span className="font-semibold text-gray-900">
                    Còn lại:
                  </span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(totalBalance)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {selectedUsage && (
        <EditServiceUsageModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          serviceUsage={selectedUsage}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Dialog */}
      {selectedUsage && (
        <DeleteServiceUsageDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          serviceUsage={selectedUsage}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
