"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PenaltyItem } from "@/lib/types/penalty";
import { ICONS } from "@/src/constants/icons.enum";
import { formatCurrency } from "@/lib/utils";

interface PenaltyCardProps {
  penalty: PenaltyItem;
  onEdit: (penalty: PenaltyItem) => void;
  onDelete: (penaltyID: string) => void;
}

export function PenaltyCard({
  penalty,
  onEdit,
  onDelete,
}: PenaltyCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete(penalty.id);
    setDeleteConfirm(false);
  };

  const statusBadgeColor = {
    'PENDING': 'bg-error-100 text-error-700 border-error-200',
    'TRANSFERRED': 'bg-info-100 text-info-700 border-info-200',
    'COMPLETED': 'bg-success-100 text-success-700 border-success-200',
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Header with Status */}
        <div className="bg-linear-to-r from-error-50 to-error-100 p-5 border-b border-error-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">
                {penalty.serviceName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {penalty.bookingId && `Booking: ${penalty.bookingId}`}
                {penalty.bookingRoomId && ` | Room: ${penalty.bookingRoomId}`}
              </p>
            </div>
            <Badge className={`${statusBadgeColor[penalty.status]} border`}>
              {penalty.status}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="space-y-3">
            {/* Reason */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Lý do</p>
              <p className="text-sm text-gray-900">{penalty.note}</p>
            </div>

            {/* Price Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Giá/Đơn vị</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(penalty.unitPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Số lượng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {penalty.quantity}
                </p>
              </div>
            </div>

            {/* Custom Price if different */}
            {penalty.customPrice && penalty.customPrice !== penalty.unitPrice && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Giá tùy chỉnh</p>
                <p className="text-sm font-bold text-error-600">
                  {formatCurrency(penalty.customPrice)}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tổng cộng</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(penalty.totalPrice)}
              </p>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500">
              Tạo: {new Date(penalty.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(penalty)}
              className="flex-1 h-9 text-sm font-medium text-error-600 border-error-300 hover:bg-linear-to-r hover:from-error-50 hover:to-error-100 transition-all"
            >
              <span className="w-4 h-4 mr-1.5">{ICONS.EDIT}</span>
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="h-9 px-3 font-medium text-error-600 border-error-300 hover:bg-linear-to-r hover:from-error-50 hover:to-error-100 transition-all"
            >
              <span className="w-4 h-4">{ICONS.TRASH}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Xác nhận xóa phí phạt</DialogTitle>
            <DialogDescription className="text-base">
              Hành động này không thể hoàn tác. Phí phạt sẽ bị xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-linear-to-br from-error-50 to-error-100/50 border-2 border-error-200 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-error-500 to-error-600 flex items-center justify-center shrink-0 shadow-lg">
                  <span className="w-7 h-7 text-white">{ICONS.PENALTY}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base mb-1">{penalty.serviceName}</p>
                  <p className="text-sm text-error-700 font-semibold">
                    {formatCurrency(penalty.totalPrice)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {penalty.note}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirm(false)}
              className="h-10 font-medium"
            >
              Hủy bỏ
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              className="h-10 font-medium bg-linear-to-r from-error-600 to-error-500 hover:from-error-700 hover:to-error-600"
            >
              <span className="w-4 h-4 mr-2">{ICONS.TRASH}</span>
              Xóa phí phạt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
