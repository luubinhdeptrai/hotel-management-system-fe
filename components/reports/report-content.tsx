"use client";

import { RevenueByDayReport } from "./revenue-by-day-report";
import { RevenueByMonthReport } from "./revenue-by-month-report";
import { OccupancyRateReport } from "./occupancy-rate-report";
import { RoomAvailabilityReport } from "./room-availability-report";
import { CustomerListReport } from "./customer-list-report";
import { ServiceRevenueReport } from "./service-revenue-report";
import { ICONS } from "@/src/constants/icons.enum";
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
      <div className="flex items-center justify-center py-16 rounded-2xl bg-linear-to-br from-gray-50 to-white border-2 border-gray-100 shadow-md">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center animate-spin">
            <span className="w-6 h-6 text-white">{ICONS.LOADER}</span>
          </div>
          <p className="text-gray-600 font-semibold">Đang tải dữ liệu...</p>
        </div>
      </div>
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
        <div className="py-16 px-8 text-center rounded-2xl bg-linear-to-br from-gray-50 to-white border-2 border-gray-100 shadow-md">
          <p className="text-gray-600 font-semibold">Vui lòng chọn loại báo cáo</p>
        </div>
      );
  }
}
