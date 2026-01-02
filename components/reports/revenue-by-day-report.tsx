"use client";

import { RevenueChart } from "./revenue-chart";
import { RevenueByDayTable } from "./revenue-by-day-table";
import { RevenueStatisticsCard } from "./revenue-statistics-card";
import { ICONS } from "@/src/constants/icons.enum";
import type { RevenueByDayData, ReportSummary } from "@/lib/types/reports";

interface RevenueByDayReportProps {
  filteredRevenueByDayData: RevenueByDayData[];
  summary: ReportSummary;
}

export function RevenueByDayReport({
  filteredRevenueByDayData,
  summary,
}: RevenueByDayReportProps) {
  // Calculate additional statistics
  const avgRevenue = filteredRevenueByDayData.length > 0
    ? summary.totalRevenue / filteredRevenueByDayData.length
    : 0;
  
  const maxDay = filteredRevenueByDayData.reduce((max, item) => 
    item.totalRevenue > max.totalRevenue ? item : max, 
    filteredRevenueByDayData[0] || { totalRevenue: 0, date: "" }
  );

  const minDay = filteredRevenueByDayData.reduce((min, item) => 
    item.totalRevenue < min.totalRevenue ? item : min, 
    filteredRevenueByDayData[0] || { totalRevenue: 0, date: "" }
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-5 border-2 border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-5 h-5 text-white">{ICONS.DOLLAR_SIGN}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">Tổng doanh thu</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {new Intl.NumberFormat("vi-VN").format(summary.totalRevenue)} ₫
          </p>
        </div>

        {/* Average Revenue */}
        <div className="bg-linear-to-br from-info-50 to-info-100/30 rounded-2xl p-5 border-2 border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-5 h-5 text-white">{ICONS.TRENDING_UP}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">TB/Ngày</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {new Intl.NumberFormat("vi-VN").format(Math.round(avgRevenue))} ₫
          </p>
        </div>

        {/* Max Day */}
        <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-5 border-2 border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-5 h-5 text-white">{ICONS.ARROW_UP_DOWN}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">Cao nhất</span>
          </div>
          <p className="text-lg font-extrabold text-gray-900">
            {new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(maxDay.totalRevenue)} ₫
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {maxDay.date ? new Date(maxDay.date).toLocaleDateString("vi-VN") : "-"}
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-linear-to-br from-warning-50 to-warning-100/30 rounded-2xl p-5 border-2 border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-5 h-5 text-white">{ICONS.CALENDAR_CHECK}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">Số booking</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {summary.totalBookings}
          </p>
        </div>
      </div>

      {/* Chart and Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={filteredRevenueByDayData} />
        </div>
        <div className="lg:col-span-1">
          <RevenueStatisticsCard
            summary={summary}
            filteredRevenueByDayData={filteredRevenueByDayData}
          />
        </div>
      </div>

      <RevenueByDayTable data={filteredRevenueByDayData} />
    </div>
  );
}
