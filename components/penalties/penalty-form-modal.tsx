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
      isOpenPrice: penalty.isOpenPrice || false,
    };
  }
  return {
    penaltyName: "",
    price: 0,
    description: "",
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
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm Phí Phạt Mới" : "Chỉnh Sửa Phí Phạt"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Nhập thông tin phí phạt mới vào form bên dưới"
              : "Cập nhật thông tin phí phạt"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên phí phạt */}
          <div className="space-y-2">
            <Label htmlFor="penaltyName">
              Tên phí phạt <span className="text-error-600">*</span>
            </Label>
            <Input
              id="penaltyName"
              value={formData.penaltyName}
              onChange={(e) => handleInputChange("penaltyName", e.target.value)}
              placeholder="VD: Hư hỏng thiết bị, Mất đồ..."
              className={errors.penaltyName ? "border-error-600" : ""}
            />
            {errors.penaltyName && (
              <p className="text-sm text-error-600">{errors.penaltyName}</p>
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
                placeholder="VD: 500000"
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
              placeholder="Mô tả chi tiết về phí phạt..."
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
