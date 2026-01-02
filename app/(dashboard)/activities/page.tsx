/**
 * Activities Page
 * Employee activity log viewer with advanced filtering and pagination
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONS } from "@/src/constants/icons.enum";
import { useActivities } from "@/hooks/use-activities";
import { ActivityFilters } from "@/components/activities/activity-filters";
import { ActivityList } from "@/components/activities/activity-list";

export default function ActivitiesPage() {
  const {
    activities,
    total,
    totalPages,
    isLoading,
    error,
    filters,
    pagination,
    stats,
    updateFilters,
    clearFilters,
    goToPage,
    changePageSize,
  } = useActivities();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-primary-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-linear-to-br from-primary-600 to-blue-600 shadow-lg">
              <span className="w-8 h-8 text-white">{ICONS.ACTIVITY}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nhật Ký Hoạt Động
              </h1>
              <p className="text-gray-600 mt-1">
                Theo dõi và quản lý tất cả hoạt động của nhân viên trong hệ thống
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng Hoạt Động</p>
            <p className="text-3xl font-bold text-primary-600">{total}</p>
          </div>
        </div>

        {/* Stats Cards - Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-400">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="w-6 h-6 text-white">{ICONS.CALENDAR}</span>
              </div>
              <p className="text-sm text-white/90 font-semibold">Bookings</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {(stats?.BOOKING || 0) + (stats?.BOOKING_ROOM || 0)}
            </p>
            <p className="text-xs text-white/80 mt-2">Hoạt động đặt phòng</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-emerald-400">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="w-6 h-6 text-white">{ICONS.WALLET}</span>
              </div>
              <p className="text-sm text-white/90 font-semibold">Thanh Toán</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {stats?.TRANSACTION || 0}
            </p>
            <p className="text-xs text-white/80 mt-2">Giao dịch thanh toán</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-400">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="w-6 h-6 text-white">{ICONS.SERVICE}</span>
              </div>
              <p className="text-sm text-white/90 font-semibold">Dịch Vụ</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {stats?.SERVICE_USAGE || 0}
            </p>
            <p className="text-xs text-white/80 mt-2">Sử dụng dịch vụ</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-pink-400">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="w-6 h-6 text-white">{ICONS.USER}</span>
              </div>
              <p className="text-sm text-white/90 font-semibold">Khách Hàng</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {stats?.CUSTOMER || 0}
            </p>
            <p className="text-xs text-white/80 mt-2">Quản lý khách hàng</p>
          </div>
        </div>

        {/* Filters */}
        <ActivityFilters
          filters={filters}
          onFilterChange={updateFilters}
          onClearFilters={clearFilters}
        />

        {/* Error Message */}
        {error && (
          <div className="p-6 bg-error-50 border-2 border-error-300 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error-100">
                <span className="w-6 h-6 text-error-600">{ICONS.ERROR}</span>
              </div>
              <div>
                <h3 className="font-bold text-error-900">Lỗi Tải Dữ Liệu</h3>
                <p className="text-error-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Danh Sách Hoạt Động
              <span className="text-primary-600 ml-2">({total})</span>
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">
                Hiển thị:
              </span>
              <Select
                value={pagination.limit?.toString() || "10"}
                onValueChange={(value) => changePageSize(parseInt(value))}
              >
                <SelectTrigger className="w-24 h-10 rounded-lg border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">
                {activities.length > 0
                  ? `${((pagination.page || 1) - 1) * (pagination.limit || 10) + 1}-${Math.min(
                      (pagination.page || 1) * (pagination.limit || 10),
                      total
                    )} của ${total}`
                  : "0 của 0"}
              </span>
            </div>
          </div>

          <ActivityList activities={activities} isLoading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 bg-white rounded-xl border-2 border-gray-200">
              <div className="text-sm text-gray-600">
                Trang {pagination.page || 1} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={(pagination.page || 1) === 1 || isLoading}
                  className="hover:bg-primary-50"
                >
                  <span className="w-4 h-4">{ICONS.CHEVRON_DOUBLE_LEFT}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage((pagination.page || 1) - 1)}
                  disabled={(pagination.page || 1) === 1 || isLoading}
                  className="hover:bg-primary-50"
                >
                  <span className="w-4 h-4">{ICONS.CHEVRON_LEFT}</span>
                  Trước
                </Button>
                
                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    const currentPage = pagination.page || 1;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={(pagination.page || 1) === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        disabled={isLoading}
                        className={
                          (pagination.page || 1) === pageNum
                            ? "bg-linear-to-r from-primary-600 to-blue-600 text-white"
                            : "hover:bg-primary-50"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage((pagination.page || 1) + 1)}
                  disabled={(pagination.page || 1) === totalPages || isLoading}
                  className="hover:bg-primary-50"
                >
                  Sau
                  <span className="w-4 h-4">{ICONS.CHEVRON_RIGHT}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={(pagination.page || 1) === totalPages || isLoading}
                  className="hover:bg-primary-50"
                >
                  <span className="w-4 h-4">{ICONS.CHEVRON_DOUBLE_RIGHT}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
