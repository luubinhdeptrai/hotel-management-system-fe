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
      surchargeName: surcharge.surchargeName,
      price: surcharge.price,
      description: surcharge.description || "",
      imageUrl: surcharge.imageUrl || "",
      isOpenPrice: surcharge.isOpenPrice || false,
    };
  }
  return {
    surchargeName: "",
    price: 0,
    description: "",
    imageUrl: "",
    isOpenPrice: false,
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

    if (!formData.surchargeName.trim()) {
      newErrors.surchargeName = "Tên phụ thu không được để trống";
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
      key={surcharge?.surchargeID || "new"}
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
          {/* Tên phụ thu */}
          <div className="space-y-2">
            <Label htmlFor="surchargeName" className="text-sm font-semibold text-gray-700">
              Tên phụ thu <span className="text-error-600">*</span>
            </Label>
            <Input
              id="surchargeName"
              value={formData.surchargeName}
              onChange={(e) =>
                handleInputChange("surchargeName", e.target.value)
              }
              placeholder="VD: Check-in sớm, Check-out muộn, Thú cưng..."
              className={`h-11 ${errors.surchargeName ? "border-error-600 focus:ring-error-500" : "focus:ring-warning-500"}`}
            />
            {errors.surchargeName && (
              <p className="text-sm text-error-600 font-medium">{errors.surchargeName}</p>
            )}
          </div>

          {/* Giá cố định checkbox */}
          <div className="bg-linear-to-br from-warning-50 to-warning-100/30 rounded-xl p-4 border border-warning-200">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="isOpenPrice"
                checked={formData.isOpenPrice}
                onCheckedChange={(checked: boolean) =>
                  handleInputChange("isOpenPrice", checked === true)
                }
                className="data-[state=checked]:bg-warning-600 data-[state=checked]:border-warning-600"
              />
              <div>
                <Label htmlFor="isOpenPrice" className="cursor-pointer font-semibold text-gray-900">
                  Giá linh hoạt (nhập khi áp dụng)
                </Label>
                <p className="text-xs text-gray-600 mt-0.5">
                  Bật tùy chọn này nếu giá phụ thu thay đổi tùy theo từng trường hợp
                </p>
              </div>
            </div>
          </div>

          {/* Giá */}
          {!formData.isOpenPrice && (
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                Giá phụ thu <span className="text-error-600">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    handleInputChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="Nhập giá phụ thu (VNĐ)"
                  min="0"
                  step="1000"
                  className={`h-11 pr-12 ${errors.price ? "border-error-600 focus:ring-error-500" : "focus:ring-warning-500"}`}
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
              placeholder="Mô tả chi tiết về phụ thu, điều kiện áp dụng..."
              rows={4}
              className="resize-none focus:ring-warning-500"
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
              placeholder="https://example.com/surcharge.jpg"
              className="h-11 focus:ring-warning-500"
            />
            <p className="text-xs text-gray-500">
              Nhập đường dẫn URL của hình ảnh phụ thu (không bắt buộc)
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

