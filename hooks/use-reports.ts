"use client";

import { useState, useCallback, useMemo } from "react";
import type { ReportType } from "@/lib/types/reports";
import {
  mockRevenueByDayData,
  mockRevenueByMonthData,
  mockOccupancyRateData,
  mockRoomAvailabilityData,
  mockCustomerReportData,
  mockServiceRevenueData,
  filterDataByDateRange,
  calculateSummary,
} from "@/lib/mock-reports";

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

  // Filter data based on date range
  const filteredRevenueByDayData = useMemo(() => {
    return filterDataByDateRange(
      mockRevenueByDayData,
      new Date(startDate),
      new Date(endDate),
      "date"
    );
  }, [startDate, endDate]);

  const filteredRevenueByMonthData = useMemo(() => {
    return filterDataByDateRange(
      mockRevenueByMonthData,
      new Date(startDate),
      new Date(endDate),
      "month"
    );
  }, [startDate, endDate]);

  const filteredOccupancyData = useMemo(() => {
    return filterDataByDateRange(
      mockOccupancyRateData,
      new Date(startDate),
      new Date(endDate),
      "date"
    );
  }, [startDate, endDate]);

  // Calculate summary
  const summary = useMemo(() => {
    return calculateSummary(filteredRevenueByDayData, filteredOccupancyData);
  }, [filteredRevenueByDayData, filteredOccupancyData]);

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
        return mockRoomAvailabilityData;
      case "customer-list":
        return mockCustomerReportData;
      case "service-revenue":
        return mockServiceRevenueData;
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
    // TODO: Implement PDF export functionality
    console.log("Exporting to PDF...", {
      reportType,
      startDate,
      endDate,
      data: currentReportData,
    });
    alert("Chức năng xuất PDF đang được phát triển");
  }, [reportType, startDate, endDate, currentReportData]);

  const handleExportExcel = useCallback(() => {
    // TODO: Implement Excel export functionality
    console.log("Exporting to Excel...", {
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
    roomAvailabilityData: mockRoomAvailabilityData,
    customerReportData: mockCustomerReportData,
    serviceRevenueData: mockServiceRevenueData,
    handleGenerateReport,
    handleExportPdf,
    handleExportExcel,
  };
}
