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
import { SurchargeItem, SurchargeFormData } from "@/lib/types/surcharge";

interface SurchargeFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  surcharge?: SurchargeItem;
  onClose: () => void;
  onSubmit: (data: SurchargeFormData) => void;
}

const getInitialFormData = (
  mode: "create" | "edit",
  surcharge?: SurchargeItem
): SurchargeFormData => {
  if (mode === "edit" && surcharge) {
    return {
      customPrice: surcharge.customPrice || 0,
      quantity: surcharge.quantity || 1,
      reason: surcharge.note || "",
      bookingId: surcharge.bookingId || "",
      bookingRoomId: surcharge.bookingRoomId || "",
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

export function SurchargeFormModal({
  open,
  mode,
  surcharge,
  onClose,
  onSubmit,
}: SurchargeFormModalProps) {
  const [formData, setFormData] = useState<SurchargeFormData>(() =>
    getInitialFormData(mode, surcharge)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when modal opens - deferred to avoid sync setState in effect
  useEffect(() => {
    if (!open) return;

    const timeoutId = setTimeout(() => {
      setFormData(getInitialFormData(mode, surcharge));
      setErrors({});
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [open, mode, surcharge]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.customPrice <= 0) {
      newErrors.customPrice = "Giá phụ thu phải lớn hơn 0";
    }

    if (formData.quantity < 1) {
      newErrors.quantity = "Số lượng phải từ 1 trở lên";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Lý do phụ thu không được để trống";
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
    field: keyof SurchargeFormData,
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
      key={surcharge?.id || "new"}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader className="bg-linear-to-br from-warning-600 to-warning-500 -m-6 mb-0 p-6 rounded-t-xl">
          <DialogTitle className="text-2xl font-bold text-white">
            {mode === "create" ? "Thêm Phụ Thu Mới" : "Chỉnh Sửa Phụ Thu"}
          </DialogTitle>
          <DialogDescription className="text-warning-50 text-base">
            {mode === "create"
              ? "Nhập thông tin phụ thu mới vào form bên dưới"
              : "Cập nhật thông tin phụ thu đã chọn"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Giá phụ thu */}
          <div className="space-y-2">
            <Label htmlFor="customPrice" className="text-sm font-semibold text-gray-700">
              Giá phụ thu <span className="text-error-600">*</span>
            </Label>
            <div className="relative">
              <Input
                id="customPrice"
                type="number"
                value={formData.customPrice}
                onChange={(e) =>
                  handleInputChange("customPrice", parseFloat(e.target.value) || 0)
                }
                placeholder="Nhập giá phụ thu (VNĐ)"
                min="0"
                step="10000"
                className={`h-11 pr-12 ${errors.customPrice ? "border-error-600 focus:ring-error-500" : "focus:ring-warning-500"}`}
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
              className={`h-11 ${errors.quantity ? "border-error-600 focus:ring-error-500" : "focus:ring-warning-500"}`}
            />
            {errors.quantity && (
              <p className="text-sm text-error-600 font-medium">{errors.quantity}</p>
            )}
          </div>

          {/* Lý do phụ thu */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold text-gray-700">
              Lý do phụ thu <span className="text-error-600">*</span>
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              placeholder="VD: Check-in sớm, Người thêm, Yêu cầu đặc biệt..."
              className={`min-h-24 resize-none ${errors.reason ? "border-error-600 focus:ring-error-500" : "focus:ring-warning-500"}`}
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
              className="h-11 focus:ring-warning-500"
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
              className="h-11 focus:ring-warning-500"
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
              className="h-11 px-6 font-semibold bg-linear-to-r from-warning-600 to-warning-500 hover:from-warning-700 hover:to-warning-600 shadow-lg"
            >
              {mode === "create" ? "Thêm phụ thu" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

