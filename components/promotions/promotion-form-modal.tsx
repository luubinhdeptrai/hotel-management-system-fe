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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONS } from "@/src/constants/icons.enum";
import type {
  Promotion,
  PromotionType,
  PromotionScope,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "@/lib/types/promotion";

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromotionRequest | UpdatePromotionRequest) => void;
  promotion?: Promotion;
  mode: "create" | "edit";
  isLoading?: boolean;
}

interface FormData {
  code: string;
  description: string;
  type: PromotionType;
  scope: PromotionScope;
  value: string;
  maxDiscount: string;
  minBookingAmount: string;
  startDate: string;
  endDate: string;
  totalQty: string;
  perCustomerLimit: string;
}

const initialFormData: FormData = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  scope: "ALL",
  value: "",
  maxDiscount: "",
  minBookingAmount: "0",
  startDate: "",
  endDate: "",
  totalQty: "",
  perCustomerLimit: "1",
};

export function PromotionFormModal({
  isOpen,
  onClose,
  onSubmit,
  promotion,
  mode,
  isLoading = false,
}: PromotionFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function - defined before useEffect
  // Convert ISO date string to datetime-local format for HTML input
  const formatDateForInput = (dateString: string): string => {
    // dateString from backend is ISO string (e.g., "2026-01-02T00:00:00.000Z")
    // datetime-local input expects "YYYY-MM-DDTHH:mm" format
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert datetime-local string to ISO string in UTC
  const dateToISO = (dateString: string): string => {
    // dateString from HTML input is in format "YYYY-MM-DDTHH:mm" (local datetime, no timezone)
    // We treat it as UTC and convert to ISO
    const [dateOnly, timeOnly] = dateString.split("T");
    const [year, month, day] = dateOnly.split("-").map(Number);
    const [hours, minutes] = timeOnly ? timeOnly.split(":").map(Number) : [0, 0];
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    return date.toISOString();
  };

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && promotion) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          code: promotion.code,
          description: promotion.description || "",
          type: promotion.type,
          scope: promotion.scope,
          value: promotion.value,
          maxDiscount: promotion.maxDiscount || "",
          minBookingAmount: promotion.minBookingAmount,
          startDate: formatDateForInput(promotion.startDate),
          endDate: formatDateForInput(promotion.endDate),
          totalQty: promotion.totalQty?.toString() || "",
          perCustomerLimit: promotion.perCustomerLimit.toString(),
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, mode, promotion]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Mã khuyến mãi không được để trống";
    } else if (formData.code.length < 3) {
      newErrors.code = "Mã khuyến mãi phải có ít nhất 3 ký tự";
    }

    // Value validation
    const value = parseFloat(formData.value);
    if (!formData.value || isNaN(value) || value <= 0) {
      newErrors.value = "Giá trị phải là số dương";
    } else if (formData.type === "PERCENTAGE" && value > 100) {
      newErrors.value = "Phần trăm giảm giá không được vượt quá 100%";
    }

    // Date validation
    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    }
    if (formData.startDate && formData.endDate) {
      // Parse datetime-local strings as UTC to avoid timezone issues
      const [startDateOnly, startTimeOnly] = formData.startDate.split("T");
      const [startYear, startMonth, startDay] = startDateOnly.split("-").map(Number);
      const [startHours, startMinutes] = startTimeOnly ? startTimeOnly.split(":").map(Number) : [0, 0];
      const start = new Date(Date.UTC(startYear, startMonth - 1, startDay, startHours, startMinutes));

      const [endDateOnly, endTimeOnly] = formData.endDate.split("T");
      const [endYear, endMonth, endDay] = endDateOnly.split("-").map(Number);
      const [endHours, endMinutes] = endTimeOnly ? endTimeOnly.split(":").map(Number) : [0, 0];
      const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, endHours, endMinutes));

      if (end <= start) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    // Max discount validation (optional but must be positive if provided, and only for PERCENTAGE)
    if (formData.maxDiscount && formData.type === "PERCENTAGE") {
      const maxDiscount = parseFloat(formData.maxDiscount);
      if (isNaN(maxDiscount) || maxDiscount <= 0) {
        newErrors.maxDiscount = "Giảm tối đa phải là số dương";
      }
    }

    // Min booking amount validation
    if (formData.minBookingAmount) {
      const minBooking = parseFloat(formData.minBookingAmount);
      if (isNaN(minBooking) || minBooking < 0) {
        newErrors.minBookingAmount = "Đơn tối thiểu phải >= 0";
      }
    }

    // Total quantity validation (optional but must be positive if provided)
    if (formData.totalQty) {
      const qty = parseInt(formData.totalQty);
      if (isNaN(qty) || qty <= 0) {
        newErrors.totalQty = "Số lượng phải là số nguyên dương";
      }
    }

    // Per customer limit validation
    if (formData.perCustomerLimit) {
      const limit = parseInt(formData.perCustomerLimit);
      if (isNaN(limit) || limit <= 0) {
        newErrors.perCustomerLimit = "Giới hạn phải là số nguyên dương";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (mode === "create") {
      const createData: CreatePromotionRequest = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        scope: formData.scope,
        value: parseFloat(formData.value),
        startDate: dateToISO(formData.startDate),
        endDate: dateToISO(formData.endDate),
        ...(formData.description && { description: formData.description.trim() }),
        // Only send maxDiscount for PERCENTAGE type
        ...(formData.maxDiscount && formData.type === "PERCENTAGE" && { maxDiscount: parseFloat(formData.maxDiscount) }),
        ...(formData.minBookingAmount && { minBookingAmount: parseFloat(formData.minBookingAmount) }),
        ...(formData.totalQty && { totalQty: parseInt(formData.totalQty) }),
        ...(formData.perCustomerLimit && { perCustomerLimit: parseInt(formData.perCustomerLimit) }),
      };
      onSubmit(createData);
    } else {
      // Edit mode: type and scope cannot be changed
      const updateData: UpdatePromotionRequest = {
        code: formData.code.trim().toUpperCase(),
        value: parseFloat(formData.value),
        startDate: dateToISO(formData.startDate),
        endDate: dateToISO(formData.endDate),
        description: formData.description.trim() || undefined,
        // Only send maxDiscount for PERCENTAGE type
        ...(formData.maxDiscount && formData.type === "PERCENTAGE" && { maxDiscount: parseFloat(formData.maxDiscount) }),
        minBookingAmount: formData.minBookingAmount ? parseFloat(formData.minBookingAmount) : undefined,
        totalQty: formData.totalQty ? parseInt(formData.totalQty) : undefined,
        perCustomerLimit: formData.perCustomerLimit ? parseInt(formData.perCustomerLimit) : undefined,
      };
      onSubmit(updateData);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-amber-500">{ICONS.TAG}</span>
            {mode === "create" ? "Tạo khuyến mãi mới" : "Chỉnh sửa khuyến mãi"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === "create"
              ? "Nhập thông tin khuyến mãi mới cho khách sạn"
              : "Cập nhật thông tin khuyến mãi"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Code and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã khuyến mãi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="VD: SUMMER2024, NEWUSER..."
                className={errors.code ? "border-red-500" : ""}
                maxLength={50}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả ngắn về khuyến mãi..."
              />
            </div>
          </div>

          {/* Row 2: Type and Scope */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Loại giảm giá <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: PromotionType) =>
                  setFormData({ ...formData, type: value })
                }
                disabled={mode === "edit"} // Cannot change type after creation
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">%</span>
                      Phần trăm
                    </div>
                  </SelectItem>
                  <SelectItem value="FIXED_AMOUNT">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">₫</span>
                      Số tiền cố định
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {mode === "edit" && (
                <p className="text-xs text-gray-500">Không thể thay đổi loại sau khi tạo</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Phạm vi áp dụng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.scope}
                onValueChange={(value: PromotionScope) =>
                  setFormData({ ...formData, scope: value })
                }
                disabled={mode === "edit"} // Cannot change scope after creation
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn phạm vi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      Tất cả (Phòng + Dịch vụ)
                    </div>
                  </SelectItem>
                  <SelectItem value="ROOM">
                    <div className="flex items-center gap-2">
                      <span>🛏️</span>
                      Chỉ tiền phòng
                    </div>
                  </SelectItem>
                  <SelectItem value="SERVICE">
                    <div className="flex items-center gap-2">
                      <span>🍽️</span>
                      Chỉ dịch vụ
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {mode === "edit" && (
                <p className="text-xs text-gray-500">Không thể thay đổi phạm vi sau khi tạo</p>
              )}
            </div>
          </div>

          {/* Row 3: Value, Max Discount, Min Booking */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                Giá trị {formData.type === "PERCENTAGE" ? "(%)" : "(VND)"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                step={formData.type === "PERCENTAGE" ? "0.1" : "1000"}
                min="0"
                max={formData.type === "PERCENTAGE" ? "100" : undefined}
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder={formData.type === "PERCENTAGE" ? "10" : "100000"}
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-sm text-red-500">{errors.value}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Giảm tối đa (VND) {formData.type === "PERCENTAGE" ? "" : "(Không áp dụng cho cố định)"}</Label>
              <Input
                id="maxDiscount"
                type="number"
                step="1000"
                min="0"
                value={formData.maxDiscount}
                onChange={(e) =>
                  setFormData({ ...formData, maxDiscount: e.target.value })
                }
                placeholder="500000"
                disabled={formData.type === "FIXED_AMOUNT"} // Disable for fixed amount
                className={`${errors.maxDiscount ? "border-red-500" : ""} ${formData.type === "FIXED_AMOUNT" ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
              />
              {formData.type === "FIXED_AMOUNT" && (
                <p className="text-xs text-amber-600 font-medium"></p>
              )}
              {formData.maxDiscount && formData.type === "PERCENTAGE" && (
                <p className="text-xs text-gray-500">
                  {formatCurrency(formData.maxDiscount)} VND
                </p>
              )}
              {errors.maxDiscount && (
                <p className="text-sm text-red-500">{errors.maxDiscount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minBookingAmount">Đơn tối thiểu (VND)</Label>
              <Input
                id="minBookingAmount"
                type="number"
                step="1000"
                min="0"
                value={formData.minBookingAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minBookingAmount: e.target.value })
                }
                placeholder="0"
                className={errors.minBookingAmount ? "border-red-500" : ""}
              />
              {formData.minBookingAmount && parseFloat(formData.minBookingAmount) > 0 && (
                <p className="text-xs text-gray-500">
                  {formatCurrency(formData.minBookingAmount)} VND
                </p>
              )}
              {errors.minBookingAmount && (
                <p className="text-sm text-red-500">{errors.minBookingAmount}</p>
              )}
            </div>
          </div>

          {/* Row 4: Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                Ngày kết thúc <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={formData.startDate}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Row 5: Quantity limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalQty">Số lượng (để trống = không giới hạn)</Label>
              <Input
                id="totalQty"
                type="number"
                min="1"
                value={formData.totalQty}
                onChange={(e) =>
                  setFormData({ ...formData, totalQty: e.target.value })
                }
                placeholder="Không giới hạn"
                className={errors.totalQty ? "border-red-500" : ""}
              />
              {errors.totalQty && (
                <p className="text-sm text-red-500">{errors.totalQty}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perCustomerLimit">Giới hạn mỗi khách</Label>
              <Input
                id="perCustomerLimit"
                type="number"
                min="1"
                value={formData.perCustomerLimit}
                onChange={(e) =>
                  setFormData({ ...formData, perCustomerLimit: e.target.value })
                }
                placeholder="1"
                className={errors.perCustomerLimit ? "border-red-500" : ""}
              />
              {errors.perCustomerLimit && (
                <p className="text-sm text-red-500">{errors.perCustomerLimit}</p>
              )}
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">Xem trước</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {formData.code || "MÃ_CODE"}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Giảm{" "}
                {formData.value
                  ? formData.type === "PERCENTAGE"
                    ? `${formData.value}%`
                    : `${formatCurrency(formData.value)} VND`
                  : "???"}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {formData.scope === "ALL"
                  ? "Tất cả"
                  : formData.scope === "ROOM"
                  ? "Tiền phòng"
                  : "Dịch vụ"}
              </span>
              {formData.maxDiscount && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Tối đa {formatCurrency(formData.maxDiscount)} VND
                </span>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="h-11 px-6 border-2 font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                <>
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    {ICONS.SAVE}
                  </div>
                  <span>{mode === "create" ? "Tạo khuyến mãi" : "Cập nhật"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
