"use client";

import { OccupancyChart } from "./occupancy-chart";
import { OccupancyRateTable } from "./occupancy-rate-table";
import { OccupancyStatisticsCard } from "./occupancy-statistics-card";
import { ICONS } from "@/src/constants/icons.enum";
import type { OccupancyRateData, ReportSummary } from "@/lib/types/reports";

interface OccupancyRateReportProps {
  filteredOccupancyData: OccupancyRateData[];
  summary: ReportSummary;
}

export function OccupancyRateReport({
  filteredOccupancyData,
  summary,
}: OccupancyRateReportProps) {
  const totalDays = filteredOccupancyData.length;
  const avgOccupancy = filteredOccupancyData.length > 0
    ? filteredOccupancyData.reduce((sum, d) => sum + d.occupancyRate, 0) / filteredOccupancyData.length
    : 0;
  
  const peakDay = filteredOccupancyData.reduce((max, d) =>
    d.occupancyRate > max.occupancyRate ? d : max,
    filteredOccupancyData[0] || { occupancyRate: 0, date: "", totalRooms: 0, occupiedRooms: 0, availableRooms: 0 }
  );
  
  const lowDay = filteredOccupancyData.reduce((min, d) =>
    d.occupancyRate < min.occupancyRate ? d : min,
    filteredOccupancyData[0] || { occupancyRate: 0, date: "", totalRooms: 0, occupiedRooms: 0, availableRooms: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-linear-to-br from-info-50 to-info-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Số ngày phân tích
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {totalDays}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tổng số ngày trong kỳ
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.CALENDAR}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Công suất trung bình
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {avgOccupancy.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tỷ lệ phòng được sử dụng
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.PIE_CHART}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Ngày cao điểm
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {peakDay.occupancyRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(peakDay.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.TRENDING_UP}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-error-50 to-error-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Ngày thấp điểm
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {lowDay.occupancyRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(lowDay.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-error-600 to-error-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.ALERT_CIRCLE}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OccupancyChart data={filteredOccupancyData} />
        </div>
        <div className="lg:col-span-1">
          <OccupancyStatisticsCard
            summary={summary}
            filteredOccupancyData={filteredOccupancyData}
          />
        </div>
      </div>
      <OccupancyRateTable data={filteredOccupancyData} />
    </div>
  );
}
