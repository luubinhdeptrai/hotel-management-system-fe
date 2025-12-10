"use client";

import { Card } from "@/components/ui/card";
import type { OccupancyRateData } from "@/lib/types/reports";

interface OccupancyChartProps {
  data: OccupancyRateData[];
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Biểu đồ công suất phòng
        </h3>
        <div className="flex h-64 items-center justify-center text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Biểu đồ công suất phòng
      </h3>
      <div className="space-y-2">
        {data.slice(-7).map((item, index) => {
          const barWidth = item.occupancyRate;
          const colorClass =
            item.occupancyRate >= 80
              ? "from-success-600 to-success-500"
              : item.occupancyRate >= 50
              ? "from-warning-600 to-warning-500"
              : "from-error-600 to-error-500";

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
                  {item.occupancyRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-md bg-gray-100">
                <div
                  className={`h-full rounded-md bg-linear-to-r ${colorClass} transition-all`}
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
