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
import { PenaltyItem } from "@/lib/types/penalty";
import { ICONS } from "@/src/constants/icons.enum";
import { formatCurrency } from "@/lib/utils";

// Specific images for each penalty item
const PENALTY_ITEM_IMAGES: Record<string, string> = {
  "PEN001": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=80", // Hư hỏng thiết bị - broken equipment
  "PEN002": "https://images.unsplash.com/photo-1582735689482-52b939db3e1e?w=400&q=80", // Mất khăn tắm - towel
  "PEN003": "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400&q=80", // Mất áo choàng tắm - bathrobe
  "PEN004": "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&q=80", // Hút thuốc - no smoking sign (changed)
  "PEN005": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80", // Bồi thường khác - damage/compensation
  DEFAULT: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
};

interface PenaltyCardProps {
  penalty: PenaltyItem;
  onEdit: (penalty: PenaltyItem) => void;
  onDelete: (penaltyID: string) => void;
  onToggleActive?: (penaltyID: string, isActive: boolean) => void;
}

export function PenaltyCard({
  penalty,
  onEdit,
  onDelete,
  onToggleActive,
}: PenaltyCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(
    PENALTY_ITEM_IMAGES[penalty.penaltyID] || PENALTY_ITEM_IMAGES.DEFAULT
  );

  // Alternate images to try when primary remote image fails (helps with flaky external hosts)
  const PENALTY_ITEM_ALT_IMAGES: Record<string, string> = {
    PEN002: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80",
  };

  const handleDeleteConfirm = () => {
    onDelete(penalty.penaltyID);
    setDeleteConfirm(false);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image Header */}
        <div className="relative h-40 overflow-hidden">
          {!imageError ? (
            <Image
              src={currentImageUrl}
              alt={penalty.penaltyName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              onError={() => {
                const alt = PENALTY_ITEM_ALT_IMAGES[penalty.penaltyID as keyof typeof PENALTY_ITEM_ALT_IMAGES];
                if (alt && currentImageUrl !== alt) {
                  setCurrentImageUrl(alt);
                } else {
                  setImageError(true);
                }
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-error-100 via-error-50 to-error-100 flex items-center justify-center">
              <span className="w-14 h-14 text-error-400">{ICONS.PENALTY}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Badge className={penalty.isActive 
              ? "bg-linear-to-r from-success-600 to-success-500 text-white text-xs font-semibold shadow-lg border-0" 
              : "bg-linear-to-r from-gray-600 to-gray-500 text-white text-xs font-semibold shadow-lg border-0"
            }>
              {penalty.isActive ? "Hoạt động" : "Tạm ngưng"}
            </Badge>
          </div>

          {/* Open price indicator */}
          {penalty.isOpenPrice && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-linear-to-r from-error-500 to-error-600 text-white text-xs font-semibold shadow-lg border-0">
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
              <h3 className="font-bold text-base text-gray-900 truncate group-hover:text-error-600 transition-colors mb-1">
                {penalty.penaltyName}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Mã: {penalty.penaltyID}
              </p>
            </div>
          </div>

          {penalty.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {penalty.description}
            </p>
          )}

          {/* Price Section */}
          <div className="bg-linear-to-br from-error-50 to-error-100/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-error-700 font-medium mb-1">Giá phí phạt</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-error-700">
                    {penalty.isOpenPrice ? "Tùy chỉnh" : formatCurrency(penalty.price)}
                  </span>
                </div>
              </div>
              {onToggleActive && (
                <Switch
                  checked={penalty.isActive}
                  onCheckedChange={(checked) => onToggleActive(penalty.penaltyID, checked)}
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
                  <p className="font-bold text-gray-900 text-base mb-1">{penalty.penaltyName}</p>
                  <p className="text-sm text-error-700 font-semibold">
                    {penalty.isOpenPrice ? "Giá tùy chỉnh" : formatCurrency(penalty.price)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Mã: {penalty.penaltyID}
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
