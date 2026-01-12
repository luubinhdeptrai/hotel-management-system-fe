"use client";

import { logger } from "@/lib/utils/logger";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { ReportType } from "@/lib/types/reports";
import { reportsApi, type RevenueSummaryResult } from "@/lib/api/reports.api";
import { toast } from "sonner";

export function useReports() {
  const [reportType, setReportType] = useState<ReportType>("revenue-by-day");
  const [startDate, setStartDate] = useState<string>(() => {
    // Query from tomorrow onwards to match seeded booking data
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    // Query 30 days from tomorrow
    const date = new Date();
    date.setDate(date.getDate() + 31);
    return date.toISOString().split("T")[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [revenueSummaryData, setRevenueSummaryData] = useState<RevenueSummaryResult | null>(null);
  const [occupancyData, setOccupancyData] = useState<any>(null);

  // Fetch revenue summary when dates change
  useEffect(() => {
    if (reportType.includes('revenue')) {
      fetchRevenueSummary();
    } else if (reportType === 'occupancy-rate') {
      fetchOccupancyForecast();
    }
  }, [startDate, endDate, reportType]);

  const fetchRevenueSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const groupBy = reportType === 'revenue-by-month' ? 'month' : 'day';
      console.log('📊 Fetching revenue summary...', { reportType, startDate, endDate, groupBy });
      
      const result = await reportsApi.getRevenueSummary({
        fromDate: startDate,
        toDate: endDate,
        groupBy,
      });
      
      console.log('✅ Revenue Summary Result:', result);
      setRevenueSummaryData(result);
    } catch (error: any) {
      console.error('❌ Failed to fetch revenue summary:', error);
      logger.error('Failed to fetch revenue summary:', error);
      toast.error('Không thể tải báo cáo doanh thu', {
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setIsLoading(false);
    }
  }, [reportType, startDate, endDate]);

  const fetchOccupancyForecast = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('📈 Fetching occupancy forecast...', { startDate, endDate });
      
      const result = await reportsApi.getOccupancyForecast({
        startDate,
        endDate,
        groupBy: 'day',
      });
      
      console.log('✅ Occupancy Forecast Result:', result);
      setOccupancyData(result);
    } catch (error: any) {
      console.error('❌ Failed to fetch occupancy forecast:', error);
      logger.error('Failed to fetch occupancy forecast:', error);
      toast.error('Không thể tải báo cáo công suất', {
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Transform data for charts
  const filteredRevenueByDayData = useMemo(() => {
    if (!revenueSummaryData?.breakdown) return [];
    return revenueSummaryData.breakdown.map((item) => ({
      date: item.date,
      period: item.period,
      revenue: item.revenue,
      bookings: item.bookings,
    }));
  }, [revenueSummaryData]);

  const filteredRevenueByMonthData = useMemo(() => {
    if (!revenueSummaryData?.breakdown) return [];
    return revenueSummaryData.breakdown.map((item) => ({
      date: item.date,
      period: item.period,
      revenue: item.revenue,
      bookings: item.bookings,
    }));
  }, [revenueSummaryData]);

  const filteredOccupancyData = useMemo(() => {
    if (!occupancyData?.forecast) return [];
    return occupancyData.forecast.map((item: any) => ({
      date: item.date,
      occupancyRate: item.occupancyRate,
      occupiedRooms: item.occupiedRooms,
      totalRooms: item.totalRooms,
    }));
  }, [occupancyData]);

  const summary = useMemo(() => {
    if (!revenueSummaryData?.summary) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        averageOccupancyRate: 0,
        totalCustomers: 0,
        averageOccupancy: 0,
        topRoomType: "",
      };
    }

    const { summary: backendSummary } = revenueSummaryData;
    return {
      totalRevenue: backendSummary.totalRevenue,
      totalBookings: backendSummary.totalBookings,
      averageOccupancyRate: backendSummary.occupancyRate,
      totalCustomers: 0, // TODO: Fetch from customer report
      averageOccupancy: backendSummary.occupancyRate,
      topRoomType: "", // TODO: Fetch from room type report
    };
  }, [revenueSummaryData]);

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
    if (reportType.includes('revenue')) {
      fetchRevenueSummary();
    } else if (reportType === 'occupancy-rate') {
      fetchOccupancyForecast();
    }
  }, [reportType, fetchRevenueSummary, fetchOccupancyForecast]);

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
