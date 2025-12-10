"use client";

import { Card } from "@/components/ui/card";
import type { RevenueByDayData, ReportSummary } from "@/lib/types/reports";

interface RevenueStatisticsCardProps {
  summary: ReportSummary;
  filteredRevenueByDayData: RevenueByDayData[];
}

export function RevenueStatisticsCard({
  summary,
  filteredRevenueByDayData,
}: RevenueStatisticsCardProps) {
  return (
    <Card className="p-5">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        Thống kê tổng quan
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">Tổng doanh thu:</span>
          <span className="font-medium text-gray-900">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(summary.totalRevenue)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Số booking:</span>
          <span className="font-medium text-gray-900">
            {summary.totalBookings}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Doanh thu TB/ngày:</span>
          <span className="font-medium text-gray-900">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(
              filteredRevenueByDayData.length > 0
                ? summary.totalRevenue / filteredRevenueByDayData.length
                : 0
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}
