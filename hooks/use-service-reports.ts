import { useState, useEffect } from "react";
import { reportApi } from "@/lib/api/reports.api";
import type {
  ServiceUsageStatisticsResponse,
  TopServicesByRevenueResponse,
  ServicePerformanceTrendResponse,
} from "@/lib/types/report";

interface UseServiceReportsParams {
  fromDate: string;
  toDate: string;
  serviceId?: string;
  groupBy?: "day" | "week" | "month";
}

export function useServiceReports(params: UseServiceReportsParams) {
  const [usageStatistics, setUsageStatistics] = useState<ServiceUsageStatisticsResponse | null>(null);
  const [topServices, setTopServices] = useState<TopServicesByRevenueResponse | null>(null);
  const [serviceTrend, setServiceTrend] = useState<ServicePerformanceTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.fromDate || !params.toDate) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usage, top, trend] = await Promise.all([
          reportApi.getServiceUsageStatistics({
            fromDate: params.fromDate,
            toDate: params.toDate,
            serviceId: params.serviceId,
          }),
          reportApi.getTopServicesByRevenue({
            fromDate: params.fromDate,
            toDate: params.toDate,
            limit: 10,
          }),
          reportApi.getServicePerformanceTrend({
            fromDate: params.fromDate,
            toDate: params.toDate,
            serviceId: params.serviceId,
            groupBy: params.groupBy || "day",
          }),
        ]);

        setUsageStatistics(usage);
        setTopServices(top);
        setServiceTrend(trend);
      } catch (err: any) {
        console.error("Error fetching service reports:", err);
        setError(err?.message || "Không thể tải dữ liệu báo cáo dịch vụ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.fromDate, params.toDate, params.serviceId, params.groupBy]);

  return {
    usageStatistics,
    topServices,
    serviceTrend,
    loading,
    error,
  };
}
