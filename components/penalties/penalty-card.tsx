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

  const imageUrl = PENALTY_ITEM_IMAGES[penalty.penaltyID] || PENALTY_ITEM_IMAGES.DEFAULT;

  const handleDeleteConfirm = () => {
    onDelete(penalty.penaltyID);
    setDeleteConfirm(false);
  };

  return (
    <>
      <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-error-200 transition-all duration-300">
        {/* Image Header */}
        <div className="relative h-32 overflow-hidden">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={penalty.penaltyName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-error-50 to-error-100 flex items-center justify-center">
              <span className="w-12 h-12 text-error-300">{ICONS.PENALTY}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <Badge className={penalty.isActive 
              ? "bg-success-500 text-white text-xs" 
              : "bg-gray-400 text-white text-xs"
            }>
              {penalty.isActive ? "Hoạt động" : "Tạm ngưng"}
            </Badge>
          </div>

          {/* Type indicator */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-error-100 text-error-700 text-xs">
              Phí phạt
            </Badge>
          </div>

          {/* Open price indicator */}
          {penalty.isOpenPrice && (
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
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-error-600 transition-colors">
                {penalty.penaltyName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Mã: {penalty.penaltyID}
              </p>
            </div>
          </div>

          {penalty.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {penalty.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-error-600">
                {penalty.isOpenPrice ? "Tùy chỉnh" : formatCurrency(penalty.price)}
              </span>
            </div>
            {onToggleActive && (
              <Switch
                checked={penalty.isActive}
                onCheckedChange={(checked) => onToggleActive(penalty.penaltyID, checked)}
                className="data-[state=checked]:bg-success-500"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(penalty)}
              className="flex-1 h-8 text-xs text-error-600 border-error-200 hover:bg-error-50"
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
            <DialogTitle>Xác nhận xóa phí phạt</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-error-100 flex items-center justify-center shrink-0">
                <span className="w-6 h-6 text-error-500">{ICONS.PENALTY}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{penalty.penaltyName}</p>
                <p className="text-sm text-error-600">
                  {penalty.isOpenPrice ? "Giá tùy chỉnh" : formatCurrency(penalty.price)}
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
