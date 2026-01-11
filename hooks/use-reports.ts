"use client";

import { logger } from "@/lib/utils/logger";
import { useState, useCallback, useMemo } from "react";
import type { ReportType } from "@/lib/types/reports";

export function useReports() {
  const [reportType, setReportType] = useState<ReportType>("revenue-by-day");
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Fetch report data from API
  const filteredRevenueByDayData: any[] = [];
  const filteredRevenueByMonthData: any[] = [];
  const filteredOccupancyData: any[] = [];

  const summary = {
    totalRevenue: 0,
    totalBookings: 0,
    averageOccupancyRate: 0,
    totalCustomers: 0,
    averageOccupancy: 0,
    topRoomType: "",
  };

  // Get current report data based on selected type
  const currentReportData = useMemo(() => {
    switch (reportType) {
      case "revenue-by-day":
        return filteredRevenueByDayData;
      case "revenue-by-month":
        return filteredRevenueByMonthData;
      case "occupancy-rate":
        return filteredOccupancyData;
      case "room-availability":
        return [];
      case "customer-list":
        return [];
      case "service-revenue":
        return [];
      default:
        return [];
    }
  }, [
    reportType,
    filteredRevenueByDayData,
    filteredRevenueByMonthData,
    filteredOccupancyData,
  ]);

  const handleGenerateReport = useCallback(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const handleExportPdf = useCallback(() => {
    // BACKEND INTEGRATION: Implement PDF export using jsPDF or server-side PDF generation
    // Expected endpoint: POST /api/reports/export/pdf with { reportType, startDate, endDate, filters }
    logger.log("Exporting to PDF...", {
      reportType,
      startDate,
      endDate,
      data: currentReportData,
    });
    alert("Chức năng xuất PDF đang được phát triển");
  }, [reportType, startDate, endDate, currentReportData]);

  const handleExportExcel = useCallback(() => {
    // BACKEND INTEGRATION: Implement Excel export using xlsx library or server-side generation
    // Expected endpoint: POST /api/reports/export/excel with { reportType, startDate, endDate, filters }
    logger.log("Exporting to Excel...", {
      reportType,
      startDate,
      endDate,
      data: currentReportData,
    });
    alert("Chức năng xuất Excel đang được phát triển");
  }, [reportType, startDate, endDate, currentReportData]);

  return {
    reportType,
    setReportType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    summary,
    currentReportData,
    filteredRevenueByDayData,
    filteredRevenueByMonthData,
    filteredOccupancyData,
    roomAvailabilityData: [],
    customerReportData: [],
    serviceRevenueData: [],
    handleGenerateReport,
    handleExportPdf,
    handleExportExcel,
  };
}
