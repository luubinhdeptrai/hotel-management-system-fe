"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Reservation } from "@/lib/types/reservation";
import { ICONS } from "@/src/constants/icons.enum";
import { cn } from "@/lib/utils";

interface CancelReservationDialogProps {
  isOpen: boolean;
  reservation: Reservation | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function CancelReservationDialog({
  isOpen,
  reservation,
  onConfirm,
  onCancel,
}: CancelReservationDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirm = async () => {
    setIsCancelling(true);
    try {
      await onConfirm("");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const firstDetail = reservation?.details?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-error-600">
            <span className="w-5 h-5">{ICONS.X_CIRCLE}</span>
            Hủy đặt phòng
          </DialogTitle>
          <DialogDescription>
            Vui lòng xác nhận thông tin trước khi hủy đặt phòng
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Mã đặt phòng</p>
                <p className="font-bold text-lg text-gray-900">
                  #{reservation?.reservationID}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {reservation?.status}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Khách hàng</p>
                <p className="font-semibold text-gray-900">
                  {reservation?.customer.customerName}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Số điện thoại</p>
                <p className="font-semibold text-gray-900">
                  {reservation?.customer.phoneNumber}
                </p>
              </div>
              {firstDetail && (
                <>
                  <div>
                    <p className="text-gray-500">Ngày nhận phòng</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(firstDetail.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ngày trả phòng</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(firstDetail.checkOutDate)}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-gray-500">Số phòng</p>
                <p className="font-semibold text-gray-900">
                  {reservation?.totalRooms} phòng
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tổng tiền</p>
                <p className="font-semibold text-primary-600">
                  {formatCurrency(reservation?.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Backend Cancellation Info Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
              <span className="w-4 h-4">{ICONS.ALERT_TRIANGLE}</span>
              Lưu ý về hủy đặt phòng
            </h4>
            <p className="text-sm text-yellow-700">
              • Phòng sẽ được giải phóng và trở về trạng thái có sẵn<br />
              • Không tính phí hủy (Backend không có chính sách phí hủy)<br />
              • Hành động này không thể hoàn tác
            </p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700 flex items-start gap-2">
              <span className="w-4 h-4 mt-0.5 shrink-0">
                {ICONS.ALERT_TRIANGLE}
              </span>
              <span>
                <strong>Cảnh báo:</strong> Sau khi hủy, phòng sẽ được giải phóng
                và có thể được đặt bởi khách khác. Hành động này không thể hoàn tác.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isCancelling}
            className="border-gray-300"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCancelling}
            className={cn(
              "bg-error-600 hover:bg-error-700 text-white",
              isCancelling && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCancelling ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 animate-spin">{ICONS.LOADER}</span>
                Đang hủy...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4">{ICONS.X_CIRCLE}</span>
                Xác nhận hủy đặt phòng
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
