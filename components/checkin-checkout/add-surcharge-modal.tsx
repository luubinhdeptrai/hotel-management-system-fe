"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ICONS } from "@/src/constants/icons.enum";

interface AddSurchargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: AddSurchargeFormData) => void;
}

export interface AddSurchargeFormData {
  surchargeName: string;
  rate: number; // Percentage
  amount: number;
  description?: string;
}

export function AddSurchargeModal({
  open,
  onOpenChange,
  onConfirm,
}: AddSurchargeModalProps) {
  const [formData, setFormData] = useState<AddSurchargeFormData>({
    surchargeName: "",
    rate: 0,
    amount: 0,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof AddSurchargeFormData, value: string | number) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.surchargeName.trim()) {
      newErrors.surchargeName = "Vui lòng nhập tên phụ thu";
    }

    if (formData.rate <= 0) {
      newErrors.rate = "Tỷ lệ phải lớn hơn 0";
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        surchargeName: "",
        rate: 0,
        amount: 0,
        description: "",
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-linear-to-br from-white via-yellow-50/30 to-white">
        <DialogHeader className="border-b-2 border-yellow-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-yellow-600 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="w-6 h-6 text-white">{ICONS.PERCENT}</span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-gray-900">
                Thêm phụ thu
              </DialogTitle>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Thêm phí phụ thu cho phiếu thuê phòng
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div>
            <Label htmlFor="surchargeName" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Tên phụ thu <span className="text-red-600">*</span>
            </Label>
            <Input
              id="surchargeName"
              value={formData.surchargeName}
              onChange={(e) => handleChange("surchargeName", e.target.value)}
              placeholder="VD: Phụ thu cuối tuần, Phụ thu giờ cao điểm..."
              className={`h-11 mt-2 border-2 rounded-lg font-medium ${
                errors.surchargeName ? "border-red-600" : "border-gray-300"
              }`}
            />
            {errors.surchargeName && (
              <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.surchargeName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label htmlFor="rate" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Tỷ lệ phụ thu (%) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.1"
                value={formData.rate}
                onChange={(e) => handleChange("rate", parseFloat(e.target.value) || 0)}
                placeholder="10"
                className={`h-11 mt-2 border-2 rounded-lg font-medium ${
                  errors.rate ? "border-red-600" : "border-gray-300"
                }`}
              />
              {errors.rate && (
                <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.rate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="amount" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Số tiền (₫) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", parseInt(e.target.value) || 0)}
                placeholder="100000"
                className={`h-11 mt-2 border-2 rounded-lg font-medium ${
                  errors.amount ? "border-red-600" : "border-gray-300"
                }`}
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.amount}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Ghi chú thêm về phụ thu..."
              rows={3}
              className="mt-2 border-2 border-gray-300 rounded-lg font-medium"
            />
          </div>

          {/* Preview */}
          {formData.amount > 0 && (
            <div className="p-5 bg-linear-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">Tổng phụ thu:</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.surchargeName || "Chưa đặt tên"} • {formData.rate}%
                  </p>
                </div>
                <span className="text-2xl font-extrabold text-yellow-600">
                  {formData.amount.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t-2 border-yellow-200 pt-5 bg-yellow-50/50">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 border-2 border-gray-300 font-bold hover:bg-gray-100"
            >
              <span className="w-4 h-4 mr-2">{ICONS.X}</span>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-11 px-6 bg-linear-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 font-bold shadow-lg text-white"
            >
              <span className="w-4 h-4 mr-2">{ICONS.CHECK}</span>
              Xác nhận thêm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

