"use client";

import { Card } from "@/components/ui/card";
import { RevenueByDayReport } from "./revenue-by-day-report";
import { RevenueByMonthReport } from "./revenue-by-month-report";
import { OccupancyRateReport } from "./occupancy-rate-report";
import { RoomAvailabilityReport } from "./room-availability-report";
import { CustomerListReport } from "./customer-list-report";
import { ServiceRevenueReport } from "./service-revenue-report";
import type {
  ReportType,
  RevenueByDayData,
  RevenueByMonthData,
  OccupancyRateData,
  RoomAvailabilityData,
  CustomerReportData,
  ServiceRevenueData,
  ReportSummary,
} from "@/lib/types/reports";

interface ReportContentProps {
  reportType: ReportType;
  isLoading: boolean;
  summary: ReportSummary;
  filteredRevenueByDayData: RevenueByDayData[];
  filteredRevenueByMonthData: RevenueByMonthData[];
  filteredOccupancyData: OccupancyRateData[];
  roomAvailabilityData: RoomAvailabilityData[];
  customerReportData: CustomerReportData[];
  serviceRevenueData: ServiceRevenueData[];
}

export function ReportContent({
  reportType,
  isLoading,
  summary,
  filteredRevenueByDayData,
  filteredRevenueByMonthData,
  filteredOccupancyData,
  roomAvailabilityData,
  customerReportData,
  serviceRevenueData,
}: ReportContentProps) {
  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </Card>
    );
  }

  switch (reportType) {
    case "revenue-by-day":
      return (
        <RevenueByDayReport
          filteredRevenueByDayData={filteredRevenueByDayData}
          summary={summary}
        />
      );

    case "revenue-by-month":
      return (
        <RevenueByMonthReport
          filteredRevenueByMonthData={filteredRevenueByMonthData}
        />
      );

    case "occupancy-rate":
      return (
        <OccupancyRateReport
          filteredOccupancyData={filteredOccupancyData}
          summary={summary}
        />
      );

    case "room-availability":
      return (
        <RoomAvailabilityReport roomAvailabilityData={roomAvailabilityData} />
      );

    case "customer-list":
      return <CustomerListReport customerReportData={customerReportData} />;

    case "service-revenue":
      return <ServiceRevenueReport serviceRevenueData={serviceRevenueData} />;

    default:
      return (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Vui lòng chọn loại báo cáo</p>
        </Card>
      );
  }
}
