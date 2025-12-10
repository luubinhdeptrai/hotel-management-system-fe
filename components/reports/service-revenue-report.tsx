"use client";

import { ServiceRevenueTable } from "./service-revenue-table";
import type { ServiceRevenueData } from "@/lib/types/reports";

interface ServiceRevenueReportProps {
  serviceRevenueData: ServiceRevenueData[];
}

export function ServiceRevenueReport({
  serviceRevenueData,
}: ServiceRevenueReportProps) {
  return (
    <div className="space-y-6">
      <ServiceRevenueTable data={serviceRevenueData} />
    </div>
  );
}
