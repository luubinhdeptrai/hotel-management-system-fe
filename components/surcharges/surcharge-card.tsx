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
  onToggleActive?: (surchargeID: string, isActive: boolean) => void;
}

export function SurchargeCard({
  surcharge,
  onEdit,
  onDelete,
  onToggleActive,
}: SurchargeCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = SURCHARGE_ITEM_IMAGES[surcharge.surchargeID] || SURCHARGE_ITEM_IMAGES.DEFAULT;

  const handleDeleteConfirm = () => {
    onDelete(surcharge.surchargeID);
    setDeleteConfirm(false);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image Header */}
        <div className="relative h-40 overflow-hidden">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={surcharge.surchargeName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-warning-100 via-warning-50 to-warning-100 flex items-center justify-center">
              <span className="w-14 h-14 text-warning-400">{ICONS.SURCHARGE}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Badge className={surcharge.isActive 
              ? "bg-linear-to-r from-success-600 to-success-500 text-white text-xs font-semibold shadow-lg border-0" 
              : "bg-linear-to-r from-gray-600 to-gray-500 text-white text-xs font-semibold shadow-lg border-0"
            }>
              {surcharge.isActive ? "Hoạt động" : "Tạm ngưng"}
            </Badge>
          </div>

          {/* Open price indicator */}
          {surcharge.isOpenPrice && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-linear-to-r from-warning-500 to-warning-600 text-white text-xs font-semibold shadow-lg border-0">
                <span className="w-3 h-3 mr-1">{ICONS.PERCENT}</span>
                Giá linh hoạt
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-gray-900 truncate group-hover:text-warning-600 transition-colors mb-1">
                {surcharge.surchargeName}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Mã: {surcharge.surchargeID}
              </p>
            </div>
          </div>

          {surcharge.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {surcharge.description}
            </p>
          )}

          {/* Price Section */}
          <div className="bg-linear-to-br from-warning-50 to-warning-100/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-warning-700 font-medium mb-1">Giá phụ thu</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-warning-700">
                    {surcharge.isOpenPrice ? "Tùy chỉnh" : formatCurrency(surcharge.price)}
                  </span>
                </div>
              </div>
              {onToggleActive && (
                <Switch
                  checked={surcharge.isActive}
                  onCheckedChange={(checked) => onToggleActive(surcharge.surchargeID, checked)}
                  className="data-[state=checked]:bg-success-600"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
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
                  <p className="font-bold text-gray-900 text-base mb-1">{surcharge.surchargeName}</p>
                  <p className="text-sm text-warning-700 font-semibold">
                    {surcharge.isOpenPrice ? "Giá tùy chỉnh" : formatCurrency(surcharge.price)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Mã: {surcharge.surchargeID}
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

