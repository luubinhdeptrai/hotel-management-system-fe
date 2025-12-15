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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/30 rounded-full blur-3xl"></div>
        <CardContent className="px-8 py-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Tổng</p>
              <p className="text-5xl font-extrabold text-gray-900 mt-1">
                {totalRoomTypes}
              </p>
              <p className="text-sm text-primary-600 font-semibold mt-2">loại phòng đang hoạt động</p>
            </div>
            <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="w-8 h-8 text-white">
                {ICONS.BED_DOUBLE}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-success-200/30 rounded-full blur-3xl"></div>
        <CardContent className="px-8 py-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Giá thấp nhất</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {minPrice !== null ? formatCurrency(minPrice) : "0 ₫"}
              </p>
              <p className="text-sm text-success-600 font-semibold mt-2">giá cơ bản thấp nhất</p>
            </div>
            <div className="w-16 h-16 bg-linear-to-br from-success-400 to-success-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="w-8 h-8 text-white">
                {ICONS.DOLLAR_SIGN}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-warning-200/30 rounded-full blur-3xl"></div>
        <CardContent className="px-8 py-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Giá cao nhất</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {maxPrice !== null ? formatCurrency(maxPrice) : "0 ₫"}
              </p>
              <p className="text-sm text-warning-600 font-semibold mt-2">giá premium cao nhất</p>
            </div>
            <div className="w-16 h-16 bg-linear-to-br from-warning-400 to-warning-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="w-8 h-8 text-white">
                {ICONS.TRENDING_UP}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
        <CardContent className="px-8 py-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Giá trung bình</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {avgPrice !== null ? formatCurrency(avgPrice) : "0 ₫"}
              </p>
              <p className="text-sm text-blue-600 font-semibold mt-2">trung bình tất cả loại</p>
            </div>
            <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="w-8 h-8 text-white">
                {ICONS.BAR_CHART}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl"></div>
        <CardContent className="px-8 py-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Phổ biến nhất</p>
              {mostPopularRoomType ? (
                <>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1 leading-tight">
                    {mostPopularRoomType.name}
                  </p>
                  <p className="text-sm text-purple-600 font-semibold mt-2">
                    {mostPopularRoomType.count} phòng đang sử dụng
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold text-gray-400 mt-1">Chưa có dữ liệu</p>
              )}
            </div>
            <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shrink-0">
              <span className="w-8 h-8 text-white">
                {ICONS.TRENDING_UP}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
