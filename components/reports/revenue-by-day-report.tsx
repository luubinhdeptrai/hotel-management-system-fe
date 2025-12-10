"use client";

import { Card } from "@/components/ui/card";
import { RevenueChart } from "./revenue-chart";
import { RevenueByDayTable } from "./revenue-by-day-table";
import { RevenueStatisticsCard } from "./revenue-statistics-card";
import type { RevenueByDayData, ReportSummary } from "@/lib/types/reports";

interface RevenueByDayReportProps {
  filteredRevenueByDayData: RevenueByDayData[];
  summary: ReportSummary;
}

export function RevenueByDayReport({
  filteredRevenueByDayData,
  summary,
}: RevenueByDayReportProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={filteredRevenueByDayData} />
        <RevenueStatisticsCard
          summary={summary}
          filteredRevenueByDayData={filteredRevenueByDayData}
        />
      </div>
      <RevenueByDayTable data={filteredRevenueByDayData} />
    </div>
  );
}
