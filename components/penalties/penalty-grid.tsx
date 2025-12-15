"use client";

import { useState, useMemo } from "react";
import { PenaltyCard } from "./penalty-card";
import { PenaltyItem } from "@/lib/types/penalty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICONS } from "@/src/constants/icons.enum";

interface PenaltyGridProps {
  penalties: PenaltyItem[];
  onEdit: (penalty: PenaltyItem) => void;
  onDelete: (penaltyID: string) => void;
  onToggleActive?: (penaltyID: string, isActive: boolean) => void;
  onCreate?: () => void;
}

export function PenaltyGrid({
  penalties,
  onEdit,
  onDelete,
  onToggleActive,
  onCreate,
}: PenaltyGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const filteredPenalties = useMemo(() => {
    return penalties.filter((penalty) => {
      // Search filter
      const matchesSearch = penalty.penaltyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        penalty.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Active filter
      const matchesActive = activeFilter === null || 
        penalty.isActive === activeFilter;

      return matchesSearch && matchesActive;
    });
  }, [penalties, searchTerm, activeFilter]);

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
              placeholder="Tìm kiếm phí phạt..."
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
            <Button onClick={onCreate} className="bg-error-600 hover:bg-error-700">
              <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
              Thêm phí phạt
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
          Tất cả ({penalties.length})
        </Button>
        <Button
          variant={activeFilter === true ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(true)}
          className={activeFilter === true ? "bg-success-600 hover:bg-success-700" : "text-success-600 border-success-200 hover:bg-success-50"}
        >
          <span className="w-3 h-3 mr-1">{ICONS.CHECK_CIRCLE}</span>
          Hoạt động ({penalties.filter(p => p.isActive).length})
        </Button>
        <Button
          variant={activeFilter === false ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(false)}
          className={activeFilter === false ? "bg-gray-600" : "text-gray-600 border-gray-200 hover:bg-gray-50"}
        >
          <span className="w-3 h-3 mr-1">{ICONS.PAUSE}</span>
          Tạm ngưng ({penalties.filter(p => !p.isActive).length})
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Hiển thị {filteredPenalties.length} / {penalties.length} phí phạt
        </span>
      </div>

      {/* Penalty Grid */}
      {filteredPenalties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-50 flex items-center justify-center">
            <span className="w-8 h-8 text-error-400">{ICONS.PENALTY}</span>
          </div>
          <p className="text-gray-500 text-lg">Không tìm thấy phí phạt phù hợp</p>
          <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm</p>
          {hasFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-4 text-error-600">
              Xóa tất cả bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPenalties.map((penalty) => (
            <PenaltyCard
              key={penalty.penaltyID}
              penalty={penalty}
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
