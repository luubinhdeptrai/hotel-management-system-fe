"use client";

import { Card } from "@/components/ui/card";
import type { RevenueByDayData } from "@/lib/types/reports";

interface RevenueChartProps {
  data: RevenueByDayData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Biểu đồ doanh thu
        </h3>
        <div className="flex h-64 items-center justify-center text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue));

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Biểu đồ doanh thu
      </h3>
      <div className="space-y-2">
        {data.slice(-7).map((item, index) => {
          const barWidth = (item.totalRevenue / maxRevenue) * 100;
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {new Date(item.date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
                <span className="font-medium text-gray-900">
                  {new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(item.totalRevenue)}{" "}
                  ₫
                </span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-md bg-gray-100">
                <div
                  className="h-full rounded-md bg-linear-to-r from-primary-blue-600 to-primary-blue-400 transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
