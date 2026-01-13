import { useState, useEffect } from "react";
import { reportApi } from "@/lib/api/reports.api";
import type {
  EmployeeBookingPerformanceResponse,
  EmployeeServicePerformanceResponse,
  EmployeeActivitySummaryResponse,
} from "@/lib/types/report";

interface UseEmployeeReportsParams {
  fromDate: string;
  toDate: string;
  employeeId?: string;
}

export function useEmployeeReports(params: UseEmployeeReportsParams) {
  const [bookingPerformance, setBookingPerformance] = useState<EmployeeBookingPerformanceResponse | null>(null);
  const [servicePerformance, setServicePerformance] = useState<EmployeeServicePerformanceResponse | null>(null);
  const [activitySummary, setActivitySummary] = useState<EmployeeActivitySummaryResponse | null>(null);
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

        const [booking, service, activity] = await Promise.all([
          reportApi.getEmployeeBookingPerformance(params),
          reportApi.getEmployeeServicePerformance(params),
          reportApi.getEmployeeActivitySummary({
            fromDate: params.fromDate,
            toDate: params.toDate,
            employeeId: params.employeeId,
          }),
        ]);

        setBookingPerformance(booking);
        setServicePerformance(service);
        setActivitySummary(activity);
      } catch (err: any) {
        console.error("Error fetching employee reports:", err);
        setError(err?.message || "Không thể tải dữ liệu báo cáo nhân viên");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.fromDate, params.toDate, params.employeeId]);

  return {
    bookingPerformance,
    servicePerformance,
    activitySummary,
    loading,
    error,
  };
}
