"use client";

import { Card } from "@/components/ui/card";
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

  return (
    <Card className="p-5">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        Thống kê công suất
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">Công suất TB:</span>
          <span className="font-medium text-gray-900">
            {summary.averageOccupancy.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Công suất cao nhất:</span>
          <span className="font-medium text-gray-900">
            {maxOccupancy.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Công suất thấp nhất:</span>
          <span className="font-medium text-gray-900">
            {minOccupancy.toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
