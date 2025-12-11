"use client";

import { useState } from "react";
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
      isOpenPrice: surcharge.isOpenPrice || false,
    };
  }
  return {
    surchargeName: "",
    price: 0,
    description: "",
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
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm Phụ Thu Mới" : "Chỉnh Sửa Phụ Thu"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Nhập thông tin phụ thu mới vào form bên dưới"
              : "Cập nhật thông tin phụ thu"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên phụ thu */}
          <div className="space-y-2">
            <Label htmlFor="surchargeName">
              Tên phụ thu <span className="text-error-600">*</span>
            </Label>
            <Input
              id="surchargeName"
              value={formData.surchargeName}
              onChange={(e) =>
                handleInputChange("surchargeName", e.target.value)
              }
              placeholder="VD: Check-in sớm, Check-out muộn..."
              className={errors.surchargeName ? "border-error-600" : ""}
            />
            {errors.surchargeName && (
              <p className="text-sm text-error-600">{errors.surchargeName}</p>
            )}
          </div>

          {/* Giá cố định checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOpenPrice"
              checked={formData.isOpenPrice}
              onCheckedChange={(checked: boolean) =>
                handleInputChange("isOpenPrice", checked === true)
              }
            />
            <Label htmlFor="isOpenPrice" className="cursor-pointer">
              Giá mở (nhập khi post)
            </Label>
          </div>

          {/* Giá */}
          {!formData.isOpenPrice && (
            <div className="space-y-2">
              <Label htmlFor="price">
                Giá <span className="text-error-600">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseFloat(e.target.value) || 0)
                }
                placeholder="VD: 100000"
                min="0"
                step="1000"
                className={errors.price ? "border-error-600" : ""}
              />
              {errors.price && (
                <p className="text-sm text-error-600">{errors.price}</p>
              )}
            </div>
          )}

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về phụ thu..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700"
            >
              {mode === "create" ? "Thêm" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
