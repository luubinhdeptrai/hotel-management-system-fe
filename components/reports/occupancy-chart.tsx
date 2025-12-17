"use client";

import { ICONS } from "@/src/constants/icons.enum";
import type { OccupancyRateData } from "@/lib/types/reports";

interface OccupancyChartProps {
  data: OccupancyRateData[];
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="w-5 h-5 text-white">{ICONS.PIE_CHART}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Biểu đồ công suất phòng
          </h3>
        </div>
        <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="w-8 h-8 text-gray-400">{ICONS.PIE_CHART}</span>
            </div>
            <p className="text-gray-500 font-medium">Không có dữ liệu để hiển thị</p>
          </div>
        </div>
      </div>
    );
  }

  const avgOccupancy = data.reduce((sum, d) => sum + d.occupancyRate, 0) / data.length;
  const maxOccupancy = Math.max(...data.map((d) => d.occupancyRate));
  const minOccupancy = Math.min(...data.map((d) => d.occupancyRate));

  return (
    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md">
          <span className="w-5 h-5 text-white">{ICONS.PIE_CHART}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">
            Biểu đồ công suất phòng
          </h3>
          <p className="text-xs text-gray-500">Tỷ lệ phòng được sử dụng theo ngày</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.slice(-10).reverse().map((item, index) => {
          const barWidth = item.occupancyRate;
          const colorClass =
            item.occupancyRate >= 80
              ? "from-success-600 to-success-500"
              : item.occupancyRate >= 50
              ? "from-warning-600 to-warning-500"
              : "from-error-600 to-error-500";

          const bgColorClass =
            item.occupancyRate >= 80
              ? "bg-success-100"
              : item.occupancyRate >= 50
              ? "bg-warning-100"
              : "bg-error-100";

          const statusLabel =
            item.occupancyRate >= 80
              ? "CAO"
              : item.occupancyRate >= 50
              ? "TRUNG BÌNH"
              : "THẤP";

          const statusColor =
            item.occupancyRate >= 80
              ? "text-success-700"
              : item.occupancyRate >= 50
              ? "text-warning-700"
              : "text-error-700";

          const isMax = item.occupancyRate === maxOccupancy;
          const isMin = item.occupancyRate === minOccupancy && data.length > 1;

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
                  {isMin && (
                    <span className="px-2 py-0.5 bg-error-100 text-error-700 text-xs font-bold rounded-full">
                      THẤP NHẤT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 ${bgColorClass} ${statusColor} text-xs font-bold rounded-full`}>
                    {statusLabel}
                  </span>
                  <span className="font-bold text-gray-900">
                    {item.occupancyRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-10 w-full overflow-hidden rounded-lg bg-gray-100 relative">
                <div
                  className={`h-full rounded-lg bg-linear-to-r ${colorClass} transition-all duration-300`}
                  style={{ width: `${Math.max(barWidth, 2)}%` }}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <span className="text-xs font-bold text-white">
                    {item.occupiedRooms}/{item.totalRooms} phòng
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t-2 border-gray-100 grid grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-linear-to-r from-success-600 to-success-500 rounded-full"></div>
          <span className="text-gray-600 font-medium">≥ 80%: Cao</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-linear-to-r from-warning-600 to-warning-500 rounded-full"></div>
          <span className="text-gray-600 font-medium">50-79%: TB</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-linear-to-r from-error-600 to-error-500 rounded-full"></div>
          <span className="text-gray-600 font-medium">&lt; 50%: Thấp</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">Công suất TB:</span>
        <span className="font-bold text-gray-900">{avgOccupancy.toFixed(1)}%</span>
      </div>
    </div>
  );
}
