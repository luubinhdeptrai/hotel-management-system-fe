"use client";

import { ICONS } from "@/src/constants/icons.enum";
import type { RevenueByDayData, ReportSummary } from "@/lib/types/reports";

interface RevenueStatisticsCardProps {
  summary: ReportSummary;
  filteredRevenueByDayData: RevenueByDayData[];
}

export function RevenueStatisticsCard({
  summary,
  filteredRevenueByDayData,
}: RevenueStatisticsCardProps) {
  const avgPerDay = filteredRevenueByDayData.length > 0
    ? summary.totalRevenue / filteredRevenueByDayData.length
    : 0;

  const avgPerBooking = summary.totalBookings > 0
    ? summary.totalRevenue / summary.totalBookings
    : 0;

  const stats = [
    {
      label: "Tổng doanh thu",
      value: new Intl.NumberFormat("vi-VN").format(summary.totalRevenue) + " ₫",
      icon: ICONS.DOLLAR_SIGN,
      color: "from-primary-600 to-primary-500",
      bgColor: "from-primary-50 to-primary-100/30",
    },
    {
      label: "Số booking",
      value: summary.totalBookings.toString(),
      icon: ICONS.CALENDAR_CHECK,
      color: "from-success-600 to-success-500",
      bgColor: "from-success-50 to-success-100/30",
    },
    {
      label: "TB/Ngày",
      value: new Intl.NumberFormat("vi-VN").format(Math.round(avgPerDay)) + " ₫",
      icon: ICONS.TRENDING_UP,
      color: "from-info-600 to-info-500",
      bgColor: "from-info-50 to-info-100/30",
    },
    {
      label: "TB/Booking",
      value: new Intl.NumberFormat("vi-VN").format(Math.round(avgPerBooking)) + " ₫",
      icon: ICONS.PIE_CHART,
      color: "from-warning-600 to-warning-500",
      bgColor: "from-warning-50 to-warning-100/30",
    },
  ];

  return (
    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md">
          <span className="w-5 h-5 text-white">{ICONS.PIE_CHART}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          Thống kê chi tiết
        </h3>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-linear-to-br ${stat.bgColor} rounded-xl p-4 border border-white/50`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-linear-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md shrink-0`}>
                <span className="w-6 h-6 text-white">{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  {stat.label}
                </p>
                <p className="text-lg font-extrabold text-gray-900 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional insights */}
      <div className="mt-6 pt-4 border-t-2 border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-4 h-4">{ICONS.INFO}</span>
          <span className="font-medium">
            Phân tích {filteredRevenueByDayData.length} ngày
          </span>
        </div>
      </div>
    </div>
  );
}
