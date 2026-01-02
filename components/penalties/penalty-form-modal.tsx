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
      penaltyName: penalty.penaltyName,
      price: penalty.price,
      description: penalty.description || "",
      imageUrl: penalty.imageUrl || "",
      isOpenPrice: penalty.isOpenPrice || false,
    };
  }
  return {
    penaltyName: "",
    price: 0,
    description: "",
    imageUrl: "",
    isOpenPrice: false,
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

    if (!formData.penaltyName.trim()) {
      newErrors.penaltyName = "Tên phí phạt không được để trống";
    }

    if (!formData.isOpenPrice && formData.price <= 0) {
      newErrors.price = "Giá phải lớn hơn 0";
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
      key={penalty?.penaltyID || "new"}
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
          {/* Tên phí phạt */}
          <div className="space-y-2">
            <Label htmlFor="penaltyName" className="text-sm font-semibold text-gray-700">
              Tên phí phạt <span className="text-error-600">*</span>
            </Label>
            <Input
              id="penaltyName"
              value={formData.penaltyName}
              onChange={(e) => handleInputChange("penaltyName", e.target.value)}
              placeholder="VD: Hư hỏng thiết bị, Mất đồ, Vi phạm quy định..."
              className={`h-11 ${errors.penaltyName ? "border-error-600 focus:ring-error-500" : "focus:ring-error-500"}`}
            />
            {errors.penaltyName && (
              <p className="text-sm text-error-600 font-medium">{errors.penaltyName}</p>
            )}
          </div>

          {/* Giá cố định checkbox */}
          <div className="bg-linear-to-br from-error-50 to-error-100/30 rounded-xl p-4 border border-error-200">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="isOpenPrice"
                checked={formData.isOpenPrice}
                onCheckedChange={(checked: boolean) =>
                  handleInputChange("isOpenPrice", checked === true)
                }
                className="data-[state=checked]:bg-error-600 data-[state=checked]:border-error-600"
              />
              <div>
                <Label htmlFor="isOpenPrice" className="cursor-pointer font-semibold text-gray-900">
                  Giá linh hoạt (nhập khi áp dụng)
                </Label>
                <p className="text-xs text-gray-600 mt-0.5">
                  Bật tùy chọn này nếu giá phí phạt thay đổi tùy theo từng trường hợp
                </p>
              </div>
            </div>
          </div>

          {/* Giá */}
          {!formData.isOpenPrice && (
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                Giá phí phạt <span className="text-error-600">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    handleInputChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="Nhập giá phí phạt (VNĐ)"
                  min="0"
                  step="1000"
                  className={`h-11 pr-12 ${errors.price ? "border-error-600 focus:ring-error-500" : "focus:ring-error-500"}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                  VNĐ
                </div>
              </div>
              {errors.price && (
                <p className="text-sm text-error-600 font-medium">{errors.price}</p>
              )}
            </div>
          )}

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về phí phạt, điều kiện áp dụng..."
              rows={4}
              className="resize-none focus:ring-error-500"
            />
          </div>

          {/* URL Hình ảnh */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-semibold text-gray-700">URL Hình ảnh</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              placeholder="https://example.com/penalty.jpg"
              className="h-11 focus:ring-error-500"
            />
            <p className="text-xs text-gray-500">
              Nhập đường dẫn URL của hình ảnh phí phạt (không bắt buộc)
            </p>
          </div>

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
