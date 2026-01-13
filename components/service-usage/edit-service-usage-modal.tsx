"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import { serviceUsageService } from "@/lib/services";
import type {
  ServiceUsage,
  ServiceUsageStatus,
} from "@/lib/types/service-usage.types";
import {
  canEditQuantity,
  getNextValidStatuses,
  SERVICE_USAGE_STATUS_LABELS,
} from "@/lib/types/service-usage.types";

interface EditServiceUsageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceUsage: ServiceUsage;
  onSuccess: () => void;
}

export function EditServiceUsageModal({
  open,
  onOpenChange,
  serviceUsage,
  onSuccess,
}: EditServiceUsageModalProps) {
  const [quantity, setQuantity] = useState(serviceUsage.quantity);
  const [status, setStatus] = useState<ServiceUsageStatus>(serviceUsage.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canEditQty = canEditQuantity(serviceUsage);
  const validStatuses = getNextValidStatuses(serviceUsage.status);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const updates: any = {};

      // Only include quantity if it changed and is editable
      if (canEditQty && quantity !== serviceUsage.quantity) {
        updates.quantity = quantity;
      }

      // Only include status if it changed
      if (status !== serviceUsage.status) {
        updates.status = status;
      }

      // Don't call API if nothing changed
      if (Object.keys(updates).length === 0) {
        onOpenChange(false);
        return;
      }

      await serviceUsageService.updateServiceUsage(serviceUsage.id, updates);

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to update service usage:", err);
      setError(err.message || "Không thể cập nhật dịch vụ. Vui lòng thử lại.");
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

  // Calculate preview total
  const previewTotal = serviceUsage.unitPrice * quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Sửa dịch vụ
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Cập nhật số lượng hoặc trạng thái dịch vụ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Dịch vụ:</span>
                <span className="font-semibold text-gray-900">
                  {serviceUsage.service?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Đơn giá:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(serviceUsage.unitPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                {ICONS.ALERT_CIRCLE}
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Số lượng <span className="text-error-600">*</span>
            </Label>
            {canEditQty ? (
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="h-10 border-gray-300 focus:ring-primary-500"
              />
            ) : (
              <div className="text-sm text-gray-600">
                <p className="font-medium">{serviceUsage.quantity} {serviceUsage.service?.unit}</p>
                <p className="text-xs text-orange-600 mt-1">
                  Không thể sửa số lượng khi trạng thái = {SERVICE_USAGE_STATUS_LABELS[serviceUsage.status]}
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          {validStatuses.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Trạng thái
              </Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ServiceUsageStatus)}>
                <SelectTrigger id="status" className="h-10 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={serviceUsage.status}>
                    {SERVICE_USAGE_STATUS_LABELS[serviceUsage.status]} (hiện tại)
                  </SelectItem>
                  {validStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SERVICE_USAGE_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview Total */}
          {canEditQty && quantity !== serviceUsage.quantity && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Tổng tiền cũ:</span>
                  <span className="font-semibold text-blue-900">
                    {formatCurrency(serviceUsage.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-300 pt-2">
                  <span className="text-blue-700 font-semibold">Tổng tiền mới:</span>
                  <span className="font-bold text-blue-900">
                    {formatCurrency(previewTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="w-4 h-4 mr-2 animate-spin">
                  {ICONS.LOADER}
                </span>
                Đang lưu...
              </>
            ) : (
              <>
                <span className="w-4 h-4 mr-2">{ICONS.CHECK}</span>
                Lưu thay đổi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
