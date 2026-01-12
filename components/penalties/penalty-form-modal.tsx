"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PenaltyItem, PenaltyFormData } from "@/lib/types/penalty";

interface PenaltyFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  penalty?: PenaltyItem;
  onClose: () => void;
  onSubmit: (data: PenaltyFormData) => void;
}

const getInitialFormData = (
  mode: "create" | "edit",
  penalty?: PenaltyItem
): PenaltyFormData => {
  if (mode === "edit" && penalty) {
    return {
      customPrice: penalty.customPrice || 0,
      quantity: penalty.quantity || 1,
      reason: penalty.note || "",
      bookingId: penalty.bookingId || "",
      bookingRoomId: penalty.bookingRoomId || "",
    };
  }
  return {
    customPrice: 0,
    quantity: 1,
    reason: "",
    bookingId: "",
    bookingRoomId: "",
  };
};

export function PenaltyFormModal({
  open,
  mode,
  penalty,
  onClose,
  onSubmit,
}: PenaltyFormModalProps) {
  const [formData, setFormData] = useState<PenaltyFormData>(() =>
    getInitialFormData(mode, penalty)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when penalty or mode changes
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setFormData(getInitialFormData(mode, penalty));
        setErrors({});
      }, 0);
    }
  }, [open, mode, penalty]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.customPrice <= 0) {
      newErrors.customPrice = "Giá phạt phải lớn hơn 0";
    }

    if (formData.quantity < 1) {
      newErrors.quantity = "Số lượng phải từ 1 trở lên";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Lý do phạt không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (
    field: keyof PenaltyFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
      key={penalty?.id || "new"}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader className="bg-linear-to-br from-error-600 to-error-500 -m-6 mb-0 p-6 rounded-t-xl">
          <DialogTitle className="text-2xl font-bold text-white">
            {mode === "create" ? "Thêm Phí Phạt Mới" : "Chỉnh Sửa Phí Phạt"}
          </DialogTitle>
          <DialogDescription className="text-error-50 text-base">
            {mode === "create"
              ? "Nhập thông tin phí phạt mới vào form bên dưới"
              : "Cập nhật thông tin phí phạt đã chọn"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Giá phạt */}
          <div className="space-y-2">
            <Label htmlFor="customPrice" className="text-sm font-semibold text-gray-700">
              Giá phạt <span className="text-error-600">*</span>
            </Label>
            <div className="relative">
              <Input
                id="customPrice"
                type="number"
                value={formData.customPrice}
                onChange={(e) =>
                  handleInputChange("customPrice", parseFloat(e.target.value) || 0)
                }
                placeholder="Nhập giá phạt (VNĐ)"
                min="0"
                step="10000"
                className={`h-11 pr-12 ${errors.customPrice ? "border-error-600 focus:ring-error-500" : "focus:ring-error-500"}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                VNĐ
              </div>
            </div>
            {errors.customPrice && (
              <p className="text-sm text-error-600 font-medium">{errors.customPrice}</p>
            )}
          </div>

          {/* Số lượng */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
              Số lượng <span className="text-error-600">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                handleInputChange("quantity", parseInt(e.target.value) || 1)
              }
              placeholder="Nhập số lượng"
              min="1"
              className={`h-11 ${errors.quantity ? "border-error-600 focus:ring-error-500" : "focus:ring-error-500"}`}
            />
            {errors.quantity && (
              <p className="text-sm text-error-600 font-medium">{errors.quantity}</p>
            )}
          </div>

          {/* Lý do phạt */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold text-gray-700">
              Lý do phạt <span className="text-error-600">*</span>
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              placeholder="VD: Hư hỏng thiết bị phòng, Vi phạm quy định không hút thuốc..."
              className={`min-h-24 resize-none ${errors.reason ? "border-error-600 focus:ring-error-500" : "focus:ring-error-500"}`}
            />
            {errors.reason && (
              <p className="text-sm text-error-600 font-medium">{errors.reason}</p>
            )}
          </div>

          {/* Booking ID */}
          <div className="space-y-2">
            <Label htmlFor="bookingId" className="text-sm font-semibold text-gray-700">
              Booking ID (tùy chọn)
            </Label>
            <Input
              id="bookingId"
              value={formData.bookingId}
              onChange={(e) => handleInputChange("bookingId", e.target.value)}
              placeholder="Nhập Booking ID"
              className="h-11 focus:ring-error-500"
            />
          </div>

          {/* Booking Room ID */}
          <div className="space-y-2">
            <Label htmlFor="bookingRoomId" className="text-sm font-semibold text-gray-700">
              Booking Room ID (tùy chọn)
            </Label>
            <Input
              id="bookingRoomId"
              value={formData.bookingRoomId}
              onChange={(e) => handleInputChange("bookingRoomId", e.target.value)}
              placeholder="Nhập Booking Room ID"
              className="h-11 focus:ring-error-500"
            />
          </div>


          {/* Form Actions */}
          <DialogFooter className="gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-11 px-6 font-medium"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 font-semibold bg-linear-to-r from-error-600 to-error-500 hover:from-error-700 hover:to-error-600 shadow-lg"
            >
              {mode === "create" ? "Thêm phí phạt" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
