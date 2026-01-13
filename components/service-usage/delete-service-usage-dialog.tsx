"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import { serviceUsageService } from "@/lib/services";
import type { ServiceUsage } from "@/lib/types/service-usage.types";

interface DeleteServiceUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceUsage: ServiceUsage;
  onSuccess: () => void;
}

export function DeleteServiceUsageDialog({
  open,
  onOpenChange,
  serviceUsage,
  onSuccess,
}: DeleteServiceUsageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsLoading(true);
    setError("");

    try {
      await serviceUsageService.deleteServiceUsage(serviceUsage.id);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to delete service usage:", err);
      setError(
        err.message ||
          "Không thể xóa dịch vụ. Vui lòng kiểm tra điều kiện xóa."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <span className="w-5 h-5">{ICONS.ALERT_CIRCLE}</span>
            Xóa dịch vụ?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Bạn có chắc chắn muốn xóa dịch vụ này không? Hành động này không
              thể hoàn tác.
            </p>

            {/* Service Info */}
            <div className="rounded-lg bg-gray-50 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Dịch vụ:</span>
                <span className="font-semibold text-gray-900">
                  {serviceUsage.service?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Số lượng:</span>
                <span className="font-semibold text-gray-900">
                  {serviceUsage.quantity} {serviceUsage.service?.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tổng tiền:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(serviceUsage.totalPrice)}
                </span>
              </div>
            </div>

            {/* Conditions */}
            <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="font-semibold mb-1">Điều kiện xóa:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Chưa thanh toán (totalPaid = 0)</li>
                <li>Trạng thái khác COMPLETED</li>
              </ul>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 mr-2 animate-spin">
                  {ICONS.LOADER}
                </span>
                Đang xóa...
              </>
            ) : (
              <>
                <span className="w-4 h-4 mr-2">{ICONS.TRASH}</span>
                Xóa dịch vụ
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
