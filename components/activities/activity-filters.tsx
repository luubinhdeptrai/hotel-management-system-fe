/**
 * Activity Filters Component
 * Advanced filtering for activity logs with type, date range, and search
 */

"use client";

import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import { ActivityType, type ActivityFilters } from "@/lib/types/activity";

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onFilterChange: (filters: Partial<ActivityFilters>) => void;
  onClearFilters: () => void;
}

const ACTIVITY_TYPE_OPTIONS = [
  { value: ActivityType.CREATE_BOOKING, label: "Tạo Booking", color: "blue" },
  { value: ActivityType.UPDATE_BOOKING, label: "Cập Nhật Booking", color: "blue" },
  { value: ActivityType.CHECKED_IN, label: "Check-In", color: "green" },
  { value: ActivityType.CHECKED_OUT, label: "Check-Out", color: "orange" },
  { value: ActivityType.CREATE_SERVICE_USAGE, label: "Tạo Dịch Vụ", color: "purple" },
  { value: ActivityType.UPDATE_SERVICE_USAGE, label: "Cập Nhật Dịch Vụ", color: "purple" },
  { value: ActivityType.CREATE_TRANSACTION, label: "Tạo Thanh Toán", color: "emerald" },
  { value: ActivityType.UPDATE_TRANSACTION, label: "Cập Nhật Thanh Toán", color: "emerald" },
  { value: ActivityType.CREATE_CUSTOMER, label: "Tạo Khách Hàng", color: "pink" },
  { value: ActivityType.CREATE_PROMOTION, label: "Tạo Khuyến Mại", color: "amber" },
  { value: ActivityType.UPDATE_PROMOTION, label: "Cập Nhật Khuyến Mại", color: "amber" },
  { value: ActivityType.CLAIM_PROMOTION, label: "Nhận Khuyến Mại", color: "rose" },
];

export function ActivityFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ActivityFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onFilterChange({ search: localSearch || undefined });
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localSearch, onFilterChange]);

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof ActivityFilters]
  ).length;

  const selectedTypeLabel = ACTIVITY_TYPE_OPTIONS.find(
    (opt) => opt.value === filters.type
  )?.label;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-primary-100 to-blue-100">
            <span className="w-6 h-6 text-primary-600">{ICONS.FILTER}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Bộ Lọc Hoạt Động</h3>
            <p className="text-sm text-gray-600">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} bộ lọc đang áp dụng`
                : "Tìm kiếm và lọc nhật ký hoạt động"}
            </p>
          </div>
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="border-error-300 text-error-600 hover:bg-error-50 hover:border-error-400"
          >
            <span className="w-4 h-4 mr-2">{ICONS.X}</span>
            Xóa Lọc
          </Button>
        )}
      </div>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-primary-50 rounded-lg border border-primary-200">
          {filters.type && (
            <Badge
              variant="secondary"
              className="bg-primary-600 text-white font-semibold px-3 py-1.5 hover:bg-primary-700 cursor-pointer"
              onClick={() => onFilterChange({ type: undefined })}
            >
              Loại: {selectedTypeLabel}
              <span className="w-4 h-4 ml-2">{ICONS.X}</span>
            </Badge>
          )}
          {filters.startDate && (
            <Badge
              variant="secondary"
              className="bg-success-600 text-white font-semibold px-3 py-1.5 hover:bg-success-700 cursor-pointer"
              onClick={() => onFilterChange({ startDate: undefined })}
            >
              Từ: {new Date(filters.startDate).toLocaleDateString("vi-VN")}
              <span className="w-4 h-4 ml-2">{ICONS.X}</span>
            </Badge>
          )}
          {filters.endDate && (
            <Badge
              variant="secondary"
              className="bg-error-600 text-white font-semibold px-3 py-1.5 hover:bg-error-700 cursor-pointer"
              onClick={() => onFilterChange({ endDate: undefined })}
            >
              Đến: {new Date(filters.endDate).toLocaleDateString("vi-VN")}
              <span className="w-4 h-4 ml-2">{ICONS.X}</span>
            </Badge>
          )}
          {filters.search && (
            <Badge
              variant="secondary"
              className="bg-info-600 text-white font-semibold px-3 py-1.5 hover:bg-info-700 cursor-pointer"
              onClick={() => {
                setLocalSearch("");
                onFilterChange({ search: undefined });
              }}
            >
              Tìm: &quot;{filters.search}&quot;
              <span className="w-4 h-4 ml-2">{ICONS.X}</span>
            </Badge>
          )}
        </div>
      )}

      {/* Filter Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        {/* Search */}
        <div className="md:col-span-3 space-y-2">
          <Label className="text-sm font-semibold text-gray-900">
            Tìm Kiếm
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
              {ICONS.SEARCH}
            </span>
            <Input
              type="text"
              placeholder="Tìm kiếm trong mô tả hoạt động..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Activity Type */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">
            Loại Hoạt Động
          </Label>
          <Select
            value={filters.type || "ALL"}
            onValueChange={(value) =>
              onFilterChange({ type: value === "ALL" ? undefined : (value as ActivityType) })
            }
          >
            <SelectTrigger className="h-11 rounded-lg border-gray-300 focus:border-primary-500">
              <SelectValue placeholder="Tất cả loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${option.color}-600`}></span>
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">
            Từ Ngày
          </Label>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => onFilterChange({ startDate: e.target.value || undefined })}
            className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">
            Đến Ngày
          </Label>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => onFilterChange({ endDate: e.target.value || undefined })}
            className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
