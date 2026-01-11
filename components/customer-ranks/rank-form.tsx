/**
 * RankForm Component
 * Modern, professional form for creating/editing customer ranks
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import type {
  CustomerRank,
  CreateCustomerRankRequest,
  UpdateCustomerRankRequest,
} from "@/lib/types/customer-rank";

interface RankFormProps {
  rank?: CustomerRank; // For edit mode
  onSubmit: (data: CreateCustomerRankRequest | UpdateCustomerRankRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const RANK_COLORS = [
  { value: "bronze", label: "Đồng", color: "bg-gradient-to-br from-orange-400 to-orange-600", lightBg: "bg-orange-100" },
  { value: "silver", label: "Bạc", color: "bg-gradient-to-br from-gray-300 to-gray-500", lightBg: "bg-gray-100" },
  { value: "gold", label: "Vàng", color: "bg-gradient-to-br from-yellow-300 to-yellow-600", lightBg: "bg-yellow-100" },
  { value: "platinum", label: "Bạch kim", color: "bg-gradient-to-br from-cyan-300 to-blue-500", lightBg: "bg-cyan-100" },
  { value: "diamond", label: "Kim cương", color: "bg-gradient-to-br from-purple-300 to-purple-600", lightBg: "bg-purple-100" },
];

const PREDEFINED_BENEFITS = [
  "Giảm giá 10%",
  "Giảm giá 15%",
  "Giảm giá 20%",
  "Hỗ trợ ưu tiên 24/7",
  "Checkout muộn miễn phí",
  "Ăn sáng miễn phí",
  "Nâng cấp phòng miễn phí",
  "Quà sinh nhật",
  "Wifi ưu tiên",
  "Minibar miễn phí",
];

interface FormError {
  field: string;
  message: string;
  type?: "error" | "warning";
}

export function RankForm({ rank, onSubmit, onCancel, loading }: RankFormProps) {
  // Parse benefits from rank (can be string or object)
  const parseBenefits = (benefits: any): string[] => {
    try {
      let parsed = benefits;
      if (typeof benefits === 'string') {
        parsed = JSON.parse(benefits);
      }
      if (typeof parsed === 'object' && parsed) {
        // Filter out falsy values and description, get keys as benefit names
        return Object.entries(parsed)
          .filter(([key, value]) => value && key !== 'description')
          .map(([key]) => {
            // Map BE field names to predefined benefits
            const benefitMap: Record<string, string> = {
              discount: (parsed.discount ? `Giảm giá ${parsed.discount}%` : ""),
              prioritySupport: "Hỗ trợ ưu tiên 24/7",
              lateCheckout: "Checkout muộn miễn phí",
              roomUpgrade: "Nâng cấp phòng miễn phí",
            };
            return benefitMap[key] || key;
          })
          .filter(Boolean);
      }
      return [];
    } catch (e) {
      console.error("Error parsing benefits:", e);
      return [];
    }
  };

  const [formData, setFormData] = useState({
    displayName: rank?.displayName || "",
    minSpending: rank?.minSpending?.toString() || "",
    maxSpending: rank?.maxSpending?.toString() || "",
    benefitsList: rank?.benefits ? parseBenefits(rank.benefits) : [],
    color: rank?.color || "bronze",
  });
  const [newBenefit, setNewBenefit] = useState("");

  const [errors, setErrors] = useState<FormError[]>([]);

  const validate = () => {
    const newErrors: FormError[] = [];

    if (!formData.displayName.trim()) {
      newErrors.push({ field: "displayName", message: "Tên hạng là bắt buộc" });
    }

    const minSpending = parseFloat(formData.minSpending);
    if (isNaN(minSpending) || minSpending < 0) {
      newErrors.push({ field: "minSpending", message: "Chi tiêu tối thiểu phải là số dương" });
    }

    if (formData.maxSpending) {
      const maxSpending = parseFloat(formData.maxSpending);
      if (isNaN(maxSpending) || maxSpending < 0) {
        newErrors.push({ field: "maxSpending", message: "Chi tiêu tối đa phải là số dương" });
      } else if (maxSpending <= minSpending) {
        newErrors.push({ field: "maxSpending", message: "Chi tiêu tối đa phải lớn hơn chi tiêu tối thiểu" });
      }
    }

    if (formData.benefitsList.length === 0) {
      newErrors.push({ field: "benefitsList", message: "Vui lòng thêm ít nhất một quyền lợi" });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const benefits = formData.benefitsList.reduce((acc: Record<string, boolean>, benefit: string) => {
      acc[benefit] = true;
      return acc;
    }, {});

    // Generate name from displayName (remove spaces, lowercase)
    const nameValue = formData.displayName.trim().toLowerCase().replace(/\s+/g, '-');

    const data: any = {
      name: nameValue,
      displayName: formData.displayName.trim(),
      minSpending: parseFloat(formData.minSpending),
      benefits: JSON.stringify(benefits),
      color: formData.color,
    };

    // Only include maxSpending if it has a value
    if (formData.maxSpending) {
      data.maxSpending = parseFloat(formData.maxSpending);
    }

    console.log("Submitting rank data:", data);
    await onSubmit(data);
  };

  const getFieldError = (field: string) => errors.find(e => e.field === field);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="displayName" className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Tên hạng <span className="text-red-500">*</span>
          </Label>
        </div>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) =>
            setFormData({ ...formData, displayName: e.target.value })
          }
          placeholder="VD: Khách hàng Vàng, VIP Premium, etc."
          disabled={loading}
          className={`transition-colors ${
            getFieldError("displayName") 
              ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
              : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
          }`}
        />
        {getFieldError("displayName") && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {getFieldError("displayName")?.message}
          </div>
        )}
      </div>

      {/* Spending Range */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="minSpending" className="text-sm font-semibold text-slate-700">
            Chi tiêu tối thiểu <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              ₫
            </div>
            <Input
              id="minSpending"
              type="number"
              step="1000"
              value={formData.minSpending}
              onChange={(e) =>
                setFormData({ ...formData, minSpending: e.target.value })
              }
              placeholder="0"
              disabled={loading}
              className={`pl-7 transition-colors ${
                getFieldError("minSpending")
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
              }`}
            />
          </div>
          {getFieldError("minSpending") && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {getFieldError("minSpending")?.message}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxSpending" className="text-sm font-semibold text-slate-700">
            Chi tiêu tối đa
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              ₫
            </div>
            <Input
              id="maxSpending"
              type="number"
              step="1000"
              value={formData.maxSpending}
              onChange={(e) =>
                setFormData({ ...formData, maxSpending: e.target.value })
              }
              placeholder="Để trống = Không giới hạn"
              disabled={loading}
              className={`pl-7 transition-colors ${
                getFieldError("maxSpending")
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
              }`}
            />
          </div>
          {getFieldError("maxSpending") && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {getFieldError("maxSpending")?.message}
            </div>
          )}
          <p className="text-xs text-slate-500">Để trống nếu không có giới hạn trên</p>
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <Label htmlFor="color" className="text-sm font-semibold text-slate-700">
          Màu sắc hạng
        </Label>
        <Select
          value={formData.color}
          onValueChange={(value) => setFormData({ ...formData, color: value })}
          disabled={loading}
        >
          <SelectTrigger className="transition-colors border-slate-200 focus:border-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANK_COLORS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full shadow-md ${color.color}`} />
                  <span className="font-medium">{color.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Benefits */}
      <div className="space-y-3 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 rounded-lg border border-indigo-200">
        <div>
          <Label className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Quyền lợi <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-slate-600 mt-1">Chọn các quyền lợi cho hạng này ({formData.benefitsList.length} quyền lợi)</p>
        </div>

        {/* Benefits Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {PREDEFINED_BENEFITS.map((benefit) => {
            const isSelected = formData.benefitsList.includes(benefit);
            return (
              <button
                key={benefit}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setFormData({
                      ...formData,
                      benefitsList: formData.benefitsList.filter(b => b !== benefit)
                    });
                  } else {
                    setFormData({
                      ...formData,
                      benefitsList: [...formData.benefitsList, benefit]
                    });
                  }
                }}
                disabled={loading}
                className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-all border-2 ${
                  isSelected 
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white border-indigo-600 shadow-md hover:shadow-lg" 
                    : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:text-indigo-600"
                }`}
              >
                {isSelected ? "✓ " : "+ "}{benefit}
              </button>
            );
          })}
        </div>

        {getFieldError("benefitsList") && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {getFieldError("benefitsList")?.message}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end pt-6 border-t border-slate-200">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={loading}
            className="px-6 transition-all hover:bg-slate-100 border-slate-300 hover:border-slate-400"
          >
            Hủy
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={loading}
          className="px-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
        >
          {loading && <span className="mr-2 inline-block animate-spin">⟳</span>}
          {loading ? "Đang xử lý..." : rank ? "Cập nhật hạng" : "Tạo hạng mới"}
        </Button>
      </div>
    </form>
  );
}
