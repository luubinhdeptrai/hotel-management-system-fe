/**
 * Calendar Event Form Component
 * 
 * Form for creating and editing calendar events
 */

"use client";

import { useState } from "react";
import { CalendarEvent, EventType, CreateCalendarEventRequest, UpdateCalendarEventRequest } from "@/lib/types/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CalendarEventFormProps {
  event?: CalendarEvent; // If provided, form is in edit mode
  onSubmit: (data: CreateCalendarEventRequest | UpdateCalendarEventRequest) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function CalendarEventForm({ event, onSubmit, onCancel, loading = false }: CalendarEventFormProps) {
  const [formData, setFormData] = useState({
    name: event?.name || "",
    description: event?.description || "",
    type: event?.type || EventType.SPECIAL_EVENT,
    startDate: event?.startDate ? event.startDate.split('T')[0] : "",
    endDate: event?.endDate ? event.endDate.split('T')[0] : "",
    rrule: event?.rrule || "none",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common RRule patterns
  const rrulePatterns = [
    { value: "none", label: "Không lặp lại" },
    { value: "FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1", label: "Hàng năm (1/1)" },
    { value: "FREQ=YEARLY", label: "Hàng năm (same date)" },
    { value: "FREQ=MONTHLY;BYMONTHDAY=1", label: "Hàng tháng (ngày 1)" },
    { value: "FREQ=WEEKLY;BYDAY=MO", label: "Hàng tuần (Thứ 2)" },
    { value: "FREQ=WEEKLY;BYDAY=SA,SU", label: "Cuối tuần (T7, CN)" },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên sự kiện là bắt buộc";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Convert date strings (YYYY-MM-DD) to ISO DateTime (YYYY-MM-DDTHH:mm:ss.000Z)
    const startDateTime = formData.startDate ? new Date(formData.startDate + "T00:00:00").toISOString() : "";
    const endDateTime = formData.endDate ? new Date(formData.endDate + "T23:59:59").toISOString() : "";

    const submitData: CreateCalendarEventRequest | UpdateCalendarEventRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      type: formData.type,
      startDate: startDateTime,
      endDate: endDateTime,
      rrule: formData.rrule === "none" ? null : (formData.rrule || null),
    };

    const success = await onSubmit(submitData);
    if (!success) {
      // Error will be handled by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Name */}
      <div className="space-y-2.5">
        <Label htmlFor="name" className="text-base font-semibold text-gray-800">
          Tên Sự Kiện <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="VD: Tết Nguyên Đán 2026, Mùa Hè 2026"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`h-11 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 transition-all ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
        />
        {errors.name && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2.5">
        <Label htmlFor="description" className="text-base font-semibold text-gray-800">
          Mô Tả
        </Label>
        <Textarea
          id="description"
          placeholder="Mô tả chi tiết về sự kiện..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 transition-all"
        />
      </div>

      {/* Event Type */}
      <div className="space-y-2.5">
        <Label htmlFor="type" className="text-base font-semibold text-gray-800">
          Loại Sự Kiện <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value as EventType })}
        >
          <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EventType.HOLIDAY}>🎉 Ngày Lễ (Tết, 30/4, Quốc Khánh)</SelectItem>
            <SelectItem value={EventType.SEASONAL}>☀️ Mùa Vụ (Hè, Đông)</SelectItem>
            <SelectItem value={EventType.SPECIAL_EVENT}>🎭 Sự Kiện Đặc Biệt (Concert, Festival)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2.5">
          <Label htmlFor="startDate" className="text-base font-semibold text-gray-800">
            Ngày Bắt Đầu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className={`h-11 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 transition-all ${errors.startDate ? "border-red-500" : ""}`}
          />
          {errors.startDate && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.startDate}</p>}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="endDate" className="text-base font-semibold text-gray-800">
            Ngày Kết Thúc <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className={`h-11 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 transition-all ${errors.endDate ? "border-red-500" : ""}`}
          />
          {errors.endDate && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.endDate}</p>}
        </div>
      </div>

      {/* RRule (Recurrence Pattern) */}
      <div className="space-y-2.5">
        <Label htmlFor="rrule" className="text-base font-semibold text-gray-800">
          Lặp Lại (RRule Pattern)
        </Label>
        <Select
          value={formData.rrule || "none"}
          onValueChange={(value) => setFormData({ ...formData, rrule: value === "none" ? "" : value })}
        >
          <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white">
            <SelectValue placeholder="Chọn mẫu lặp lại..." />
          </SelectTrigger>
          <SelectContent>
            {rrulePatterns.map((pattern) => (
              <SelectItem key={pattern.value} value={pattern.value}>
                {pattern.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Alert className="mt-3 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-700">
            RRule cho phép sự kiện lặp lại theo chu kỳ (hàng năm, tháng, tuần). Để rỗng nếu sự kiện chỉ diễn ra một lần.
          </AlertDescription>
        </Alert>
      </div>

      {/* Custom RRule */}
      {formData.rrule && !rrulePatterns.some(p => p.value === formData.rrule) && (
        <div className="space-y-2.5">
          <Label htmlFor="customRRule" className="text-base font-semibold text-gray-800">
            Custom RRule (RFC 5545)
          </Label>
          <Input
            id="customRRule"
            placeholder="FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=17"
            value={formData.rrule}
            onChange={(e) => setFormData({ ...formData, rrule: e.target.value })}
            className="h-11 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 transition-all"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="h-11 px-6 border-gray-200 hover:bg-gray-50"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 px-6 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {loading ? "Đang lưu..." : event ? "Cập Nhật" : "Tạo Sự Kiện"}
        </Button>
      </div>
    </form>
  );
}
