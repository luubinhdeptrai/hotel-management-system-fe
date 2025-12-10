"use client";

import { CustomerListTable } from "./customer-list-table";
import type { CustomerReportData } from "@/lib/types/reports";

interface CustomerListReportProps {
  customerReportData: CustomerReportData[];
}

export function CustomerListReport({
  customerReportData,
}: CustomerListReportProps) {
  return (
    <div className="space-y-6">
      <CustomerListTable data={customerReportData} />
    </div>
  );
}
