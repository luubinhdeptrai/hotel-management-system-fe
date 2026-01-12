"use client";

import { RevenueByMonthTable } from "./revenue-by-month-table";
import { ICONS } from "@/src/constants/icons.enum";
import type { RevenueByMonthData } from "@/lib/types/reports";

interface RevenueByMonthReportProps {
  filteredRevenueByMonthData: RevenueByMonthData[];
}

export function RevenueByMonthReport({
  filteredRevenueByMonthData,
}: RevenueByMonthReportProps) {
  const totalRevenue = filteredRevenueByMonthData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = filteredRevenueByMonthData.length > 0 ? totalRevenue / filteredRevenueByMonthData.length : 0;
  const maxMonth = filteredRevenueByMonthData.reduce((max, item) => 
    item.revenue > max.revenue ? item : max, 
    filteredRevenueByMonthData[0] || { revenue: 0, date: "", bookings: 0 }
  );
  
  // Parse month from string format "MM/YYYY" or "YYYY-MM"
  const parseMonthYear = (monthStr: string) => {
    if (!monthStr) return { month: "", year: "" };
    if (monthStr.includes("/")) {
      const [m, y] = monthStr.split("/");
      return { month: m, year: y };
    } else if (monthStr.includes("-")) {
      const [y, m] = monthStr.split("-");
      return { month: m, year: y };
    }
    return { month: monthStr, year: "" };
  };
  
  const maxMonthParsed = parseMonthYear(maxMonth.date);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-6 h-6 text-white">{ICONS.DOLLAR_SIGN}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">Tổng doanh thu</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {new Intl.NumberFormat("vi-VN").format(totalRevenue)} ₫
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {filteredRevenueByMonthData.length} tháng
          </p>
        </div>

        <div className="bg-linear-to-br from-info-50 to-info-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-6 h-6 text-white">{ICONS.TRENDING_UP}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">TB/Tháng</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {new Intl.NumberFormat("vi-VN").format(Math.round(avgRevenue))} ₫
          </p>
        </div>

        <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-6 h-6 text-white">{ICONS.CALENDAR}</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">Tháng cao nhất</span>
          </div>
          <p className="text-xl font-extrabold text-gray-900">
            {new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(maxMonth.revenue)} ₫
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Tháng {maxMonthParsed.month}/{maxMonthParsed.year}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="w-5 h-5 text-white">{ICONS.BAR_CHART}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Biểu đồ doanh thu theo tháng
          </h3>
        </div>

        <div className="space-y-3">
          {filteredRevenueByMonthData.slice(-12).reverse().map((item, index) => {
            const barWidth = maxMonth.revenue > 0 ? (item.revenue / maxMonth.revenue) * 100 : 0;
            const isMax = item.revenue === maxMonth.revenue;
            const monthParsed = parseMonthYear(item.date);
            
            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 min-w-[100px]">
                      Tháng {monthParsed.month}/{monthParsed.year}
                    </span>
                    {isMax && (
                      <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs font-bold rounded-full">
                        CAO NHẤT
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">
                    {new Intl.NumberFormat("vi-VN").format(item.revenue)} ₫
                  </span>
                </div>
                <div className="h-10 w-full overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className={`h-full rounded-lg transition-all duration-300 ${
                      isMax 
                        ? "bg-linear-to-r from-success-600 to-success-500" 
                        : "bg-linear-to-r from-primary-600 to-primary-500"
                    }`}
                    style={{ width: `${Math.max(barWidth, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RevenueByMonthTable data={filteredRevenueByMonthData} />
    </div>
  );
}
