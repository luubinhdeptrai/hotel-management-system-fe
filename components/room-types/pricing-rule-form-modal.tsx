import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { PricingRule, CreatePricingRuleRequest, UpdatePricingRuleRequest, CalendarEvent } from "@/lib/types/pricing";
import type { RoomType } from "@/lib/types/room";
import { useState, useEffect } from "react";
import { AlertCircle, TrendingUp, DollarSign } from "lucide-react";

interface PricingRuleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: PricingRule | null;
  roomTypes: RoomType[];
  calendarEvents: CalendarEvent[];
  onSave: (data: CreatePricingRuleRequest | UpdatePricingRuleRequest) => void;
}

export function PricingRuleFormModal({
  open,
  onOpenChange,
  rule,
  roomTypes,
  calendarEvents,
  onSave,
}: PricingRuleFormModalProps) {
  const [name, setName] = useState("");
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("PERCENTAGE");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or rule changes
  useEffect(() => {
    if (open && rule) {
      setName(rule.name || "");
      setAdjustmentValue(String(rule.adjustmentValue) || "");
      setAdjustmentType(rule.adjustmentType || "PERCENTAGE");
    } else if (open && !rule) {
      setName("");
      setAdjustmentValue("");
      setAdjustmentType("PERCENTAGE");
    }
    setErrors({});
  }, [open, rule]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Tên quy tắc không được để trống";
    }
    
    if (!adjustmentValue) {
      newErrors.adjustmentValue = "Giá trị không được để trống";
    } else if (isNaN(parseFloat(adjustmentValue))) {
      newErrors.adjustmentValue = "Giá trị phải là số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data: CreatePricingRuleRequest = {
      name: name.trim(),
      roomTypeIds: [],
      adjustmentType: adjustmentType as any,
      adjustmentValue: parseFloat(adjustmentValue),
    };
    
    onSave(data);
    setName("");
    setAdjustmentValue("");
    setAdjustmentType("PERCENTAGE");
  };

  const previewValue = adjustmentType === "PERCENTAGE" 
    ? `${adjustmentValue}%`
    : `${adjustmentValue} VND`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-8">
          <DialogTitle className="text-2xl font-bold text-white">
            {rule ? "✏️ Chỉnh sửa quy tắc" : "➕ Thêm quy tắc mới"}
          </DialogTitle>
          <p className="text-violet-100 mt-2 text-sm">
            {rule 
              ? "Cập nhật thông tin quy tắc động định giá"
              : "Tạo một quy tắc mới để điều chỉnh giá phòng"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
              Tên quy tắc
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="Ví dụ: Giảm giá cuối tuần, Tăng giá mùa cao điểm"
              className={`h-11 ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.name && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {errors.name}
              </div>
            )}
          </div>

          {/* Type and Value in Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Adjustment Type */}
            <div className="space-y-2">
              <Label htmlFor="adjustmentType" className="text-sm font-semibold text-gray-700">
                Loại điều chỉnh
              </Label>
              <select
                id="adjustmentType"
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
                className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-700 font-medium"
              >
                <option value="PERCENTAGE">📊 Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">💰 Số tiền cố định</option>
              </select>
            </div>

            {/* Adjustment Value */}
            <div className="space-y-2">
              <Label htmlFor="adjustmentValue" className="text-sm font-semibold text-gray-700">
                Giá trị điều chỉnh
              </Label>
              <Input
                id="adjustmentValue"
                type="number"
                value={adjustmentValue}
                onChange={(e) => {
                  setAdjustmentValue(e.target.value);
                  if (errors.adjustmentValue) setErrors({ ...errors, adjustmentValue: "" });
                }}
                placeholder={adjustmentType === "PERCENTAGE" ? "Ví dụ: 20 hoặc -10" : "Ví dụ: 50000 hoặc -100000"}
                step="0.01"
                className={`h-11 ${errors.adjustmentValue ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.adjustmentValue && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {errors.adjustmentValue}
                </div>
              )}
            </div>
          </div>

          {/* Preview Card */}
          {adjustmentValue && (
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Bản xem trước</p>
                  <p className="text-gray-700">
                    {name || "Quy tắc"}{" "}
                    <span className="font-bold">
                      {adjustmentType === "PERCENTAGE" ? (
                        <>
                          <TrendingUp className="inline mr-1 text-violet-600" size={16} />
                          {adjustmentValue}%
                        </>
                      ) : (
                        <>
                          <DollarSign className="inline mr-1 text-green-600" size={16} />
                          {Number(adjustmentValue).toLocaleString("vi-VN")} VND
                        </>
                      )}
                    </span>
                  </p>
                </div>
                <div className={`px-3 py-2 rounded-lg font-semibold text-sm ${
                  parseFloat(adjustmentValue) >= 0 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {parseFloat(adjustmentValue) >= 0 ? "📈 Tăng" : "📉 Giảm"}
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 border-gray-300 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="h-11 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-lg"
            >
              {rule ? "✅ Lưu thay đổi" : "✅ Tạo quy tắc"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
