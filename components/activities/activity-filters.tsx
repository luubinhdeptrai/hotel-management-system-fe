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

  // Helper: Format date to YYYY-MM-DD
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper: Get today's date in YYYY-MM-DD format
  const getTodayDate = () => formatDateForInput(new Date());

  // Handle start date change - auto-set end date if not set
  const handleStartDateChange = (value: string) => {
    const newFilters: Partial<ActivityFilters> = { startDate: value || undefined };
    // If start date is set and end date is not set, auto-set end date to today
    if (value && !filters.endDate) {
      newFilters.endDate = getTodayDate();
    }
    onFilterChange(newFilters);
  };

  // Handle end date change - auto-set start date if not set
  const handleEndDateChange = (value: string) => {
    const newFilters: Partial<ActivityFilters> = { endDate: value || undefined };
    // If end date is set and start date is not set, auto-set start date to 30 days ago
    if (value && !filters.startDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      newFilters.startDate = formatDateForInput(thirtyDaysAgo);
    }
    onFilterChange(newFilters);
  };

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
      {/* Header with Gradient */}
      <div className="flex items-center justify-between bg-linear-to-r from-primary-600 via-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="w-7 h-7 text-white">{ICONS.FILTER}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Bộ Lọc Hoạt Động</h3>
            <p className="text-sm text-white/90 mt-1">
              {activeFiltersCount > 0
                ? `✨ ${activeFiltersCount} bộ lọc đang áp dụng`
                : "🔍 Tìm kiếm và lọc nhật ký hoạt động"}
            </p>
          </div>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/30"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">✕</span> Xóa Lọc
            </span>
          </button>
        )}
      </div>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-3 p-5 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-primary-200 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          {filters.type && (
            <button
              onClick={() => onFilterChange({ type: undefined })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            >
              <span className="text-sm">🏷️ {selectedTypeLabel}</span>
              <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold group-hover:bg-white/50 transition-colors">×</span>
            </button>
          )}
          {filters.startDate && (
            <button
              onClick={() => onFilterChange({ startDate: undefined })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            >
              <span className="text-sm">📅 Từ {new Date(filters.startDate).toLocaleDateString("vi-VN")}</span>
              <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold group-hover:bg-white/50 transition-colors">×</span>
            </button>
          )}
          {filters.endDate && (
            <button
              onClick={() => onFilterChange({ endDate: undefined })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            >
              <span className="text-sm">📅 Đến {new Date(filters.endDate).toLocaleDateString("vi-VN")}</span>
              <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold group-hover:bg-white/50 transition-colors">×</span>
            </button>
          )}
          {filters.search && (
            <button
              onClick={() => {
                setLocalSearch("");
                onFilterChange({ search: undefined });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            >
              <span className="text-sm">🔍 &quot;{filters.search}&quot;</span>
              <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold group-hover:bg-white/50 transition-colors">×</span>
            </button>
          )}
        </div>
      )}

      {/* Filter Form */}
      <div className="p-6 bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl border-2 border-primary-200 shadow-lg space-y-6">
        {/* Search */}
        <div className="space-y-3">
          <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <span className="text-primary-600">🔍</span> Tìm Kiếm
          </Label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 group-focus-within:text-primary-600 transition-colors">
              {ICONS.SEARCH}
            </span>
            <Input
              type="text"
              placeholder="Tìm kiếm trong mô tả hoạt động..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 shadow-sm hover:shadow-md transition-all bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Activity Type */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <span className="text-purple-600">📋</span> Loại Hoạt Động
            </Label>
            <Select
              value={filters.type || "ALL"}
              onValueChange={(value) =>
                onFilterChange({ type: value === "ALL" ? undefined : (value as ActivityType) })
              }
            >
              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 shadow-sm hover:shadow-md transition-all bg-white">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="ALL">✨ Tất cả loại</SelectItem>
                {ACTIVITY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-${option.color}-500`}></span>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <span className="text-green-600">📅</span> Từ Ngày
            </Label>
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="h-12 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 shadow-sm hover:shadow-md transition-all bg-white"
            />
          </div>

          {/* End Date */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <span className="text-orange-600">📅</span> Đến Ngày
            </Label>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="h-12 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 shadow-sm hover:shadow-md transition-all bg-white"
            />
          </div>
        </div>

        {/* Date Range Hint */}
        {filters.startDate && filters.endDate && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border-2 border-emerald-300 shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 text-sm text-emerald-800 font-semibold">
              <span className="text-xl">⏰</span>
              <span>
                Đang lọc từ <span className="text-emerald-600 font-bold">{new Date(filters.startDate).toLocaleDateString("vi-VN")}</span>
                {" "}đến{" "}
                <span className="text-emerald-600 font-bold">{new Date(filters.endDate).toLocaleDateString("vi-VN")}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
