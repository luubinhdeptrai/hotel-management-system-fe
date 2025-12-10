"use client";

import {
  ReportSummaryCards,
  ReportFilters,
  ReportContent,
} from "@/components/reports";
import { useReports } from "@/hooks/use-reports";

export default function ReportsPage() {
  const {
    reportType,
    setReportType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    summary,
    filteredRevenueByDayData,
    filteredRevenueByMonthData,
    filteredOccupancyData,
    roomAvailabilityData,
    customerReportData,
    serviceRevenueData,
    handleGenerateReport,
    handleExportPdf,
    handleExportExcel,
  } = useReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Báo Cáo & Thống Kê
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Xem các báo cáo về doanh thu, công suất phòng và các thống kê khác
        </p>
      </div>

      <ReportSummaryCards
        totalRevenue={summary.totalRevenue}
        totalBookings={summary.totalBookings}
        averageOccupancy={summary.averageOccupancy}
        totalCustomers={summary.totalCustomers}
      />

      <ReportFilters
        reportType={reportType}
        onReportTypeChange={setReportType}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onGenerateReport={handleGenerateReport}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
      />

      <ReportContent
        reportType={reportType}
        isLoading={isLoading}
        summary={summary}
        filteredRevenueByDayData={filteredRevenueByDayData}
        filteredRevenueByMonthData={filteredRevenueByMonthData}
        filteredOccupancyData={filteredOccupancyData}
        roomAvailabilityData={roomAvailabilityData}
        customerReportData={customerReportData}
        serviceRevenueData={serviceRevenueData}
      />
    </div>
  );
}
