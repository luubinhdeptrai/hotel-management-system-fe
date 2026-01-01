/**
 * Promotion Filters Component
 * Provides filtering options for promotion list
 */

"use client";

import { useState } from "react";
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
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<PromotionStatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilter = () => {
    const params: GetPromotionsParams & { statusFilter?: PromotionStatusFilter } = {};

    if (code.trim()) params.code = code.trim();
    if (description.trim()) params.description = description.trim();
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    if (statusFilter !== "all") params.statusFilter = statusFilter;

    onFilter(params);
  };

  const handleReset = () => {
    setCode("");
    setDescription("");
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("all");
    onReset();
  };

  const hasActiveFilters =
    code || description || startDate || endDate || statusFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleFilter} size="default">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            hasActiveFilters && "border-primary bg-primary/5"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  const newStatus = value as PromotionStatusFilter;
                  setStatusFilter(newStatus);
                  
                  // Trigger filter immediately
                  const params: GetPromotionsParams & { statusFilter?: PromotionStatusFilter } = {};
                  if (code.trim()) params.code = code.trim();
                  if (description.trim()) params.description = description.trim();
                  if (startDate) params.startDate = startDate.toISOString();
                  if (endDate) params.endDate = endDate.toISOString();
                  if (newStatus !== "all") params.statusFilter = newStatus;
                  
                  onFilter(params);
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Promotions</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="disabled">Disabled Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description Search */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Search in description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Start Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date From</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setStartDate(new Date(e.target.value));
                  } else {
                    setStartDate(undefined);
                  }
                }}
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date Until</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setEndDate(new Date(e.target.value));
                  } else {
                    setEndDate(undefined);
                  }
                }}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleReset} size="sm">
              Reset
            </Button>
            <Button onClick={handleFilter} size="sm">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
