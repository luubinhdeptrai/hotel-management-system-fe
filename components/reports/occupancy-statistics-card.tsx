"use client";

import { ICONS } from "@/src/constants/icons.enum";
import type { OccupancyRateData, ReportSummary } from "@/lib/types/reports";

interface OccupancyStatisticsCardProps {
  summary: ReportSummary;
  filteredOccupancyData: OccupancyRateData[];
}

export function OccupancyStatisticsCard({
  summary,
  filteredOccupancyData,
}: OccupancyStatisticsCardProps) {
  const maxOccupancy =
    filteredOccupancyData.length > 0
      ? Math.max(...filteredOccupancyData.map((d) => d.occupancyRate))
      : 0;

  const minOccupancy =
    filteredOccupancyData.length > 0
      ? Math.min(...filteredOccupancyData.map((d) => d.occupancyRate))
      : 0;
      
  const avgRoomsOccupied = filteredOccupancyData.length > 0
    ? filteredOccupancyData.reduce((sum, d) => sum + d.occupiedRooms, 0) / filteredOccupancyData.length
    : 0;

  const stats = [
    {
      label: "Công suất trung bình",
      value: `${summary.averageOccupancy.toFixed(1)}%`,
      icon: ICONS.PIE_CHART,
      bgColor: "from-info-50 to-info-100/30",
      iconColor: "from-info-600 to-info-500",
    },
    {
      label: "TB phòng đang thuê",
      value: avgRoomsOccupied.toFixed(0),
      icon: ICONS.BED_DOUBLE,
      bgColor: "from-primary-50 to-primary-100/30",
      iconColor: "from-primary-600 to-primary-500",
    },
    {
      label: "Công suất cao nhất",
      value: `${maxOccupancy.toFixed(1)}%`,
      icon: ICONS.TRENDING_UP,
      bgColor: "from-success-50 to-success-100/30",
      iconColor: "from-success-600 to-success-500",
    },
    {
      label: "Công suất thấp nhất",
      value: `${minOccupancy.toFixed(1)}%`,
      icon: ICONS.ALERT_CIRCLE,
      bgColor: "from-error-50 to-error-100/30",
      iconColor: "from-error-600 to-error-500",
    },
  ];

  return (
    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md">
          <span className="w-5 h-5 text-white">{ICONS.BAR_CHART}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Thống kê công suất
          </h3>
          <p className="text-xs text-gray-500">Phân tích chi tiết</p>
        </div>
      </div>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-linear-to-br ${stat.bgColor} rounded-xl p-4 border-2 border-white/50`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-linear-to-br ${stat.iconColor} rounded-lg flex items-center justify-center shadow-md shrink-0`}>
                <span className="w-5 h-5 text-white">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                <p className="text-xl font-extrabold text-gray-900 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
