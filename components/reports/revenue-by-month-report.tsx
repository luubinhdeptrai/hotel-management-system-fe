"use client";

import { RevenueByMonthTable } from "./revenue-by-month-table";
import type { RevenueByMonthData } from "@/lib/types/reports";

interface RevenueByMonthReportProps {
  filteredRevenueByMonthData: RevenueByMonthData[];
}

export function RevenueByMonthReport({
  filteredRevenueByMonthData,
}: RevenueByMonthReportProps) {
  return (
    <div className="space-y-6">
      <RevenueByMonthTable data={filteredRevenueByMonthData} />
    </div>
  );
}
