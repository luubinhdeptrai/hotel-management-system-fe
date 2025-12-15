"use client";

import { useState, useMemo } from "react";
import { SurchargeCard } from "./surcharge-card";
import { SurchargeItem } from "@/lib/types/surcharge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICONS } from "@/src/constants/icons.enum";

interface SurchargeGridProps {
  surcharges: SurchargeItem[];
  onEdit: (surcharge: SurchargeItem) => void;
  onDelete: (surchargeID: string) => void;
  onToggleActive?: (surchargeID: string, isActive: boolean) => void;
  onCreate?: () => void;
}

export function SurchargeGrid({
  surcharges,
  onEdit,
  onDelete,
  onToggleActive,
  onCreate,
}: SurchargeGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const filteredSurcharges = useMemo(() => {
    return surcharges.filter((surcharge) => {
      // Search filter
      const matchesSearch = surcharge.surchargeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        surcharge.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Active filter
      const matchesActive = activeFilter === null || 
        surcharge.isActive === activeFilter;

      return matchesSearch && matchesActive;
    });
  }, [surcharges, searchTerm, activeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter(null);
  };

  const hasFilters = searchTerm || activeFilter !== null;

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">
              {ICONS.SEARCH}
            </span>
            <Input
              placeholder="Tìm kiếm phụ thu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="w-4 h-4 mr-1">{ICONS.X}</span>
              Xóa bộ lọc
            </Button>
          )}
          {onCreate && (
            <Button onClick={onCreate} className="bg-warning-600 hover:bg-warning-700">
              <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
              Thêm phụ thu
            </Button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <Button
          variant={activeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(null)}
          className={activeFilter === null ? "bg-gray-800" : ""}
        >
          Tất cả ({surcharges.length})
        </Button>
        <Button
          variant={activeFilter === true ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(true)}
          className={activeFilter === true ? "bg-success-600 hover:bg-success-700" : "text-success-600 border-success-200 hover:bg-success-50"}
        >
          <span className="w-3 h-3 mr-1">{ICONS.CHECK_CIRCLE}</span>
          Hoạt động ({surcharges.filter(s => s.isActive).length})
        </Button>
        <Button
          variant={activeFilter === false ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(false)}
          className={activeFilter === false ? "bg-gray-600" : "text-gray-600 border-gray-200 hover:bg-gray-50"}
        >
          <span className="w-3 h-3 mr-1">{ICONS.PAUSE}</span>
          Tạm ngưng ({surcharges.filter(s => !s.isActive).length})
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Hiển thị {filteredSurcharges.length} / {surcharges.length} phụ thu
        </span>
      </div>

      {/* Surcharge Grid */}
      {filteredSurcharges.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning-50 flex items-center justify-center">
            <span className="w-8 h-8 text-warning-400">{ICONS.SURCHARGE}</span>
          </div>
          <p className="text-gray-500 text-lg">Không tìm thấy phụ thu phù hợp</p>
          <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm</p>
          {hasFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-4 text-warning-600">
              Xóa tất cả bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSurcharges.map((surcharge) => (
            <SurchargeCard
              key={surcharge.surchargeID}
              surcharge={surcharge}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
