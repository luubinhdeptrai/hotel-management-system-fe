/**
 * Promotion Filters Component
 * Provides filtering options for promotion list
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Filter,
  X,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GetPromotionsParams } from "@/lib/types/promotion";

export type PromotionStatusFilter = "all" | "active" | "inactive" | "disabled";

interface PromotionFiltersProps {
  onFilter: (params: GetPromotionsParams & { statusFilter?: PromotionStatusFilter }) => void;
  onReset: () => void;
}

export function PromotionFilters({
  onFilter,
  onReset,
}: PromotionFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<PromotionStatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilter = () => {
    const params: GetPromotionsParams & { statusFilter?: PromotionStatusFilter } = {};

    // Search term is used for both code and description
    if (searchTerm.trim()) {
      params.code = searchTerm.trim();
      params.description = searchTerm.trim();
    }
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    if (statusFilter !== "all") params.statusFilter = statusFilter;

    onFilter(params);
  };

  // Auto-filter when search term changes (with debounce)
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timeout for debounced search
    debounceTimerRef.current = setTimeout(() => {
      handleFilter();
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, startDate, endDate]);

  const handleReset = () => {
    setSearchTerm("");
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("all");
    onReset();
  };

  const hasActiveFilters =
    searchTerm || startDate || endDate || statusFilter !== "all";

  return (
    <div className="space-y-5">
      {/* Main Search Box */}
      <div className="relative">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            <Input
              placeholder="Search by description or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 h-12 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base shadow-sm hover:border-slate-300 transition-colors"
            />
          </div>
          <Button 
            onClick={handleFilter} 
            size="default"
            className="h-12 px-6 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
            title="Search immediately (or wait 300ms for auto-search)"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-12 w-12 rounded-xl border-2 transition-all font-semibold",
              hasActiveFilters 
                ? "border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100" 
                : "border-slate-200 hover:border-slate-300"
            )}
            title="Toggle advanced filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center px-2">
          {searchTerm && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Search className="h-4 w-4" />
              <span>&quot;{searchTerm}&quot;</span>
              <button 
                onClick={() => setSearchTerm("")}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {startDate && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              <span>From {startDate.toLocaleDateString()}</span>
              <button 
                onClick={() => setStartDate(undefined)}
                className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {endDate && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              <span>Until {endDate.toLocaleDateString()}</span>
              <button 
                onClick={() => setEndDate(undefined)}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {statusFilter !== "all" && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
              <span className="capitalize">{statusFilter}</span>
              <button 
                onClick={() => setStatusFilter("all")}
                className="ml-1 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <button 
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 ml-2 px-2 py-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-2 border-slate-200 rounded-2xl p-6 bg-linear-to-br from-slate-50 to-slate-100/50 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-md">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <span>Advanced Filters</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Start Date Filter */}
            <div className="space-y-2.5">
              <Label htmlFor="startDate" className="font-semibold text-slate-700">Start Date From</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : undefined;
                  setStartDate(newDate);
                  
                  // Trigger filter immediately
                  const params: GetPromotionsParams & { statusFilter?: PromotionStatusFilter } = {};
                  if (searchTerm.trim()) {
                    params.code = searchTerm.trim();
                    params.description = searchTerm.trim();
                  }
                  if (newDate) params.startDate = newDate.toISOString();
                  if (endDate) params.endDate = endDate.toISOString();
                  if (statusFilter !== "all") params.statusFilter = statusFilter;
                  
                  onFilter(params);
                }}
                className="h-11 border-2 border-slate-200 rounded-xl hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-2.5">
              <Label htmlFor="endDate" className="font-semibold text-slate-700">End Date Until</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : undefined;
                  setEndDate(newDate);
                  
                  // Trigger filter immediately
                  const params: GetPromotionsParams & { statusFilter?: PromotionStatusFilter } = {};
                  if (searchTerm.trim()) {
                    params.code = searchTerm.trim();
                    params.description = searchTerm.trim();
                  }
                  if (startDate) params.startDate = startDate.toISOString();
                  if (newDate) params.endDate = newDate.toISOString();
                  if (statusFilter !== "all") params.statusFilter = statusFilter;
                  
                  onFilter(params);
                }}
                className="h-11 border-2 border-slate-200 rounded-xl hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2.5 md:col-span-2">
              <Label htmlFor="status" className="font-semibold text-slate-700">Status</Label>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  const newStatus = value as PromotionStatusFilter;
                  setStatusFilter(newStatus);
                  
                  // Trigger filter immediately
                  const params: GetPromotionsParams & { statusFilter?: PromotionStatusFilter } = {};
                  if (searchTerm.trim()) {
                    params.code = searchTerm.trim();
                    params.description = searchTerm.trim();
                  }
                  if (startDate) params.startDate = startDate.toISOString();
                  if (endDate) params.endDate = endDate.toISOString();
                  if (newStatus !== "all") params.statusFilter = newStatus;
                  
                  onFilter(params);
                }}
              >
                <SelectTrigger id="status" className="h-11 border-2 border-slate-200 rounded-xl hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="all">All Promotions</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="disabled">Disabled Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-slate-200">
            <Button 
              variant="outline" 
              onClick={handleReset} 
              className="px-6 h-10 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
