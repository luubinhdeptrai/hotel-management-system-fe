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
      <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-warning-200 transition-all duration-300">
        {/* Image Header */}
        <div className="relative h-32 overflow-hidden">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={surcharge.surchargeName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-warning-50 to-warning-100 flex items-center justify-center">
              <span className="w-12 h-12 text-warning-300">{ICONS.SURCHARGE}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <Badge className={surcharge.isActive 
              ? "bg-success-500 text-white text-xs" 
              : "bg-gray-400 text-white text-xs"
            }>
              {surcharge.isActive ? "Hoạt động" : "Tạm ngưng"}
            </Badge>
          </div>

          {/* Type indicator */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-warning-100 text-warning-700 text-xs">
              Phụ thu
            </Badge>
          </div>

          {/* Open price indicator */}
          {surcharge.isOpenPrice && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="bg-white/90 text-gray-700 text-xs backdrop-blur-sm">
                Giá linh hoạt
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-warning-600 transition-colors">
                {surcharge.surchargeName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Mã: {surcharge.surchargeID}
              </p>
            </div>
          </div>

          {surcharge.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {surcharge.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-warning-600">
                {surcharge.isOpenPrice ? "Tùy chỉnh" : formatCurrency(surcharge.price)}
              </span>
            </div>
            {onToggleActive && (
              <Switch
                checked={surcharge.isActive}
                onCheckedChange={(checked) => onToggleActive(surcharge.surchargeID, checked)}
                className="data-[state=checked]:bg-success-500"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(surcharge)}
              className="flex-1 h-8 text-xs text-warning-600 border-warning-200 hover:bg-warning-50"
            >
              <span className="w-3.5 h-3.5 mr-1">{ICONS.EDIT}</span>
              Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="h-8 px-2.5 text-error-600 border-error-200 hover:bg-error-50"
            >
              <span className="w-3.5 h-3.5">{ICONS.TRASH}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa phụ thu</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-warning-100 flex items-center justify-center shrink-0">
                <span className="w-6 h-6 text-warning-500">{ICONS.SURCHARGE}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{surcharge.surchargeName}</p>
                <p className="text-sm text-warning-600">
                  {surcharge.isOpenPrice ? "Giá tùy chỉnh" : formatCurrency(surcharge.price)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
