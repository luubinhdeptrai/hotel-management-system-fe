"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SurchargeItem } from "@/lib/types/surcharge";
import { ICONS } from "@/src/constants/icons.enum";
import { formatCurrency } from "@/lib/utils";

// Specific images for each surcharge item
const SURCHARGE_ITEM_IMAGES: Record<string, string> = {
  "SUR001": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80", // Check-in sớm - early morning
  "SUR002": "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=400&q=80", // Check-out muộn - late afternoon
  "SUR003": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&q=80", // Người thêm - extra person
  "SUR004": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80", // Thú cưng - cute dog
  DEFAULT: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
};

interface SurchargeCardProps {
  surcharge: SurchargeItem;
  onEdit: (surcharge: SurchargeItem) => void;
  onDelete: (surchargeID: string) => void;
  onToggleActive?: (surchargeID: string, status: string) => void;
}

export function SurchargeCard({
  surcharge,
  onEdit,
  onDelete,
  onToggleActive,
}: SurchargeCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete(surcharge.id);
    setDeleteConfirm(false);
  };

  const statusBadgeColor = {
    'PENDING': 'bg-warning-100 text-warning-700 border-warning-200',
    'TRANSFERRED': 'bg-info-100 text-info-700 border-info-200',
    'COMPLETED': 'bg-success-100 text-success-700 border-success-200',
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Header with Status */}
        <div className="bg-linear-to-r from-warning-50 to-warning-100 p-5 border-b border-warning-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">
                {surcharge.serviceName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {surcharge.bookingId && `Booking: ${surcharge.bookingId}`}
                {surcharge.bookingRoomId && ` | Room: ${surcharge.bookingRoomId}`}
              </p>
            </div>
            <Badge className={`${statusBadgeColor[surcharge.status]} border`}>
              {surcharge.status}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="space-y-3">
            {/* Reason */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Lý do</p>
              <p className="text-sm text-gray-900">{surcharge.note}</p>
            </div>

            {/* Price Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Giá/Đơn vị</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(surcharge.unitPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Số lượng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {surcharge.quantity}
                </p>
              </div>
            </div>

            {/* Custom Price if different */}
            {surcharge.customPrice && surcharge.customPrice !== surcharge.unitPrice && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Giá tùy chỉnh</p>
                <p className="text-sm font-bold text-warning-600">
                  {formatCurrency(surcharge.customPrice)}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tổng cộng</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(surcharge.totalPrice)}
              </p>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500">
              Tạo: {new Date(surcharge.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(surcharge)}
              className="flex-1 h-9 text-sm font-medium text-warning-600 border-warning-300 hover:bg-linear-to-r hover:from-warning-50 hover:to-warning-100 transition-all"
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
            <DialogTitle className="text-xl font-bold">Xác nhận xóa phụ thu</DialogTitle>
            <DialogDescription className="text-base">
              Hành động này không thể hoàn tác. Phụ thu sẽ bị xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-linear-to-br from-warning-50 to-warning-100/50 border-2 border-warning-200 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-warning-500 to-warning-600 flex items-center justify-center shrink-0 shadow-lg">
                  <span className="w-7 h-7 text-white">{ICONS.SURCHARGE}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base mb-1">{surcharge.serviceName}</p>
                  <p className="text-sm text-warning-700 font-semibold">
                    {formatCurrency(surcharge.totalPrice)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {surcharge.note}
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
              Xóa phụ thu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

