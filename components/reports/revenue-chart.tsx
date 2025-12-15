"use client";

import { ICONS } from "@/src/constants/icons.enum";
import type { RevenueByDayData } from "@/lib/types/reports";

interface RevenueChartProps {
  data: RevenueByDayData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="w-5 h-5 text-white">{ICONS.BAR_CHART}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Biểu đồ doanh thu theo ngày
          </h3>
        </div>
        <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="w-8 h-8 text-gray-400">{ICONS.BAR_CHART}</span>
            </div>
            <p className="text-gray-500 font-medium">Không có dữ liệu để hiển thị</p>
          </div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue));
  const minRevenue = Math.min(...data.map((d) => d.totalRevenue));
  const avgRevenue = data.reduce((sum, d) => sum + d.totalRevenue, 0) / data.length;

  return (
    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
          <span className="w-5 h-5 text-white">{ICONS.BAR_CHART}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">
            Biểu đồ doanh thu theo ngày
          </h3>
          <p className="text-xs text-gray-500">Hiển thị {Math.min(data.length, 10)} ngày gần nhất</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.slice(-10).reverse().map((item, index) => {
          const barWidth = maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0;
          const isMax = item.totalRevenue === maxRevenue;
          const isMin = item.totalRevenue === minRevenue;
          
          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">
                    {new Date(item.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  {isMax && (
                    <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs font-bold rounded-full">
                      CAO NHẤT
                    </span>
                  )}
                  {isMin && data.length > 1 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                      THẤP NHẤT
                    </span>
                  )}
                </div>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat("vi-VN").format(item.totalRevenue)} ₫
                </span>
              </div>
              <div className="h-10 w-full overflow-hidden rounded-lg bg-gray-100 relative">
                <div
                  className={`h-full rounded-lg transition-all duration-300 ${
                    isMax 
                      ? "bg-linear-to-r from-success-600 to-success-500" 
                      : "bg-linear-to-r from-primary-600 to-primary-500"
                  }`}
                  style={{ width: `${Math.max(barWidth, 2)}%` }}
                />
                {item.totalRevenue > avgRevenue && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="text-xs font-bold text-white">
                      +{Math.round(((item.totalRevenue - avgRevenue) / avgRevenue) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Average line indicator */}
      <div className="mt-4 pt-4 border-t-2 border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-linear-to-r from-primary-600 to-primary-500 rounded-full"></div>
            <span className="text-gray-600 font-medium">Trung bình:</span>
          </div>
          <span className="font-bold text-gray-900">
            {new Intl.NumberFormat("vi-VN").format(Math.round(avgRevenue))} ₫
          </span>
        </div>
      </div>
    </div>
  );
}
