"use client";

import {
  ReportSummaryCards,
  ReportFilters,
  ReportContent,
} from "@/components/reports";
import { useReports } from "@/hooks/use-reports";
import { ICONS } from "@/src/constants/icons.enum";

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
    <div className="space-y-6 pb-8">
      {/* Modern Header with Gradient */}
      <div className="bg-linear-to-br from-primary-600 via-primary-500 to-primary-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <span className="w-8 h-8 text-white">{ICONS.BAR_CHART}</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Báo Cáo & Thống Kê
            </h1>
            <p className="text-sm text-white/90 mt-1 font-medium">
              Xem các báo cáo về doanh thu, công suất phòng và các thống kê khác
            </p>
          </div>
        </div>
      </div>

      <ReportSummaryCards
        totalRevenue={summary.totalRevenue}
        totalBookings={summary.totalBookings}
        averageOccupancy={summary.averageOccupancyRate}
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
