"use client";

import { OccupancyChart } from "./occupancy-chart";
import { OccupancyRateTable } from "./occupancy-rate-table";
import { OccupancyStatisticsCard } from "./occupancy-statistics-card";
import type { OccupancyRateData, ReportSummary } from "@/lib/types/reports";

interface OccupancyRateReportProps {
  filteredOccupancyData: OccupancyRateData[];
  summary: ReportSummary;
}

export function OccupancyRateReport({
  filteredOccupancyData,
  summary,
}: OccupancyRateReportProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OccupancyChart data={filteredOccupancyData} />
        <OccupancyStatisticsCard
          summary={summary}
          filteredOccupancyData={filteredOccupancyData}
        />
      </div>
      <OccupancyRateTable data={filteredOccupancyData} />
    </div>
  );
}
