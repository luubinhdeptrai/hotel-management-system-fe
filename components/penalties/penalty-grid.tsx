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
  const [activeFilter, setActiveFilter] = useState<boolean | null | "openPrice">(null);

  const filteredPenalties = useMemo(() => {
    return penalties.filter((penalty) => {
      // Search filter
      const matchesSearch = penalty.penaltyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        penalty.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Active / Open price filter
      let matchesFilter = true;
      if (activeFilter === true) {
        matchesFilter = penalty.isActive === true;
      } else if (activeFilter === false) {
        matchesFilter = penalty.isActive === false;
      } else if (activeFilter === "openPrice") {
        matchesFilter = penalty.isOpenPrice === true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [penalties, searchTerm, activeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter(null);
  };

  const stats = {
    total: penalties.length,
    active: penalties.filter(p => p.isActive).length,
    inactive: penalties.filter(p => !p.isActive).length,
    openPrice: penalties.filter(p => p.isOpenPrice).length,
  };

  return (
    <div className="space-y-6">
      {/* Modern Header Card */}
      <div className="bg-linear-to-br from-error-600 via-error-500 to-error-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Quản lý Phí Phạt</h2>
            <p className="text-error-50 text-sm">Quản lý các khoản phí phạt như hư hỏng thiết bị, mất đồ, vi phạm quy định...</p>
          </div>
          {onCreate && (
            <Button 
              onClick={onCreate} 
              className="bg-white text-error-600 hover:bg-error-50 shadow-lg h-11 px-6 font-semibold"
            >
              <span className="w-5 h-5 mr-2">{ICONS.PLUS}</span>
              Thêm Phí Phạt
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-error-100 text-sm mb-1">Tổng số</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-error-100 text-sm mb-1">Hoạt động</div>
            <div className="text-3xl font-bold">{stats.active}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-error-100 text-sm mb-1">Tạm ngưng</div>
            <div className="text-3xl font-bold">{stats.inactive}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-error-100 text-sm mb-1">Giá linh hoạt</div>
            <div className="text-3xl font-bold">{stats.openPrice}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5">
            {ICONS.SEARCH}
          </span>
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả phí phạt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors w-full"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-semibold">Lọc:</span>
            <button
              onClick={clearFilters}
              className={`min-w-max px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeFilter === null
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveFilter(true)}
              className={`min-w-max px-5 py-2.5 rounded-full text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 ${
                activeFilter === true
                  ? "bg-success-600 text-white shadow-md"
                  : "bg-success-50 text-success-700 hover:bg-success-100"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.CHECK_CIRCLE}</span>
              <span>Hoạt động</span>
            </button>
            <button
              onClick={() => setActiveFilter(false)}
              className={`min-w-max px-5 py-2.5 rounded-full text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 ${
                activeFilter === false
                  ? "bg-gray-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.PAUSE}</span>
              <span>Tạm ngưng</span>
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'openPrice' ? null : 'openPrice')}
              className={`min-w-max px-5 py-2.5 rounded-full text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 ${
                activeFilter === 'openPrice'
                  ? "bg-error-600 text-white shadow-md"
                  : "bg-error-50 text-error-700 hover:bg-error-100"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.PERCENT}</span>
              <span>Giá linh hoạt</span>
            </button>
          </div>
          {/* Removed duplicate "Xóa lọc" button — "Tất cả" clears filters now */}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{filteredPenalties.length}</span> / {penalties.length} phí phạt
        </div>
        {filteredPenalties.length > 0 && (
          <div className="text-sm text-gray-500">
            Sắp xếp theo: <span className="font-medium text-gray-700">Mới nhất</span>
          </div>
        )}
      </div>

      {/* Penalty Grid */}
      {filteredPenalties.length === 0 ? (
        <div className="text-center py-20 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-br from-error-100 to-error-50 flex items-center justify-center shadow-lg">
            <span className="w-10 h-10 text-error-500 flex items-center justify-center">{ICONS.PENALTY}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy phí phạt</h3>
          <p className="text-gray-500 mb-6">Không có phí phạt nào phù hợp với bộ lọc hiện tại</p>
          {/* "Tất cả" clears filters now; removed duplicate clear button */}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
