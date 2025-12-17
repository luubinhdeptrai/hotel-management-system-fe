"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ICONS } from "@/src/constants/icons.enum";

interface StatsCardsProps {
  totalRoomTypes: number;
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
  mostPopularRoomType: { name: string; count: number } | null;
}

export function StatsCards({
  totalRoomTypes,
  minPrice,
  maxPrice,
  avgPrice,
  mostPopularRoomType,
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200/30 rounded-full blur-2xl"></div>
        <CardContent className="px-4 md:px-6 py-4 md:py-6 relative">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Tổng</p>
                <p className="text-3xl md:text-4xl font-extrabold text-gray-900">
                  {totalRoomTypes}
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-6 h-6 text-white inline-flex items-center justify-center">
                  {ICONS.BED_DOUBLE}
                </span>
              </div>
            </div>
            <p className="text-xs text-primary-600 font-semibold">loại phòng hoạt động</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-success-200/30 rounded-full blur-2xl"></div>
        <CardContent className="px-4 md:px-6 py-4 md:py-6 relative">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Giá thấp nhất</p>
                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 line-clamp-2">
                  {minPrice !== null ? formatCurrency(minPrice) : "0 ₫"}
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-linear-to-br from-success-400 to-success-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-6 h-6 text-white inline-flex items-center justify-center">
                  {ICONS.DOLLAR_SIGN}
                </span>
              </div>
            </div>
            <p className="text-xs text-success-600 font-semibold">cơ bản thấp nhất</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-warning-200/30 rounded-full blur-2xl"></div>
        <CardContent className="px-4 md:px-6 py-4 md:py-6 relative">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Giá cao nhất</p>
                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 line-clamp-2">
                  {maxPrice !== null ? formatCurrency(maxPrice) : "0 ₫"}
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-linear-to-br from-warning-400 to-warning-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-6 h-6 text-white inline-flex items-center justify-center">
                  {ICONS.TRENDING_UP}
                </span>
              </div>
            </div>
            <p className="text-xs text-warning-600 font-semibold">premium cao nhất</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200/30 rounded-full blur-2xl"></div>
        <CardContent className="px-4 md:px-6 py-4 md:py-6 relative">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Giá TB</p>
                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 line-clamp-2">
                  {avgPrice !== null ? formatCurrency(avgPrice) : "0 ₫"}
                </p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-linear-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-6 h-6 text-white inline-flex items-center justify-center">
                  {ICONS.BAR_CHART}
                </span>
              </div>
            </div>
            <p className="text-xs text-primary-600 font-semibold">trung bình tất cả</p>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hidden xl:block">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl"></div>
        <CardContent className="px-4 md:px-6 py-4 md:py-6 relative">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Phổ biến</p>
                {mostPopularRoomType ? (
                  <p className="text-xl font-extrabold text-gray-900 line-clamp-2">
                    {mostPopularRoomType.name}
                  </p>
                ) : (
                  <p className="text-xl font-extrabold text-gray-900">-</p>
                )}
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-linear-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-6 h-6 text-white inline-flex items-center justify-center">
                  {ICONS.TRENDING_UP}
                </span>
              </div>
            </div>
            <p className="text-xs text-purple-600 font-semibold">loại phòng hàng đầu</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
