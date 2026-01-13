"use client";

import { useState, useEffect } from "react";
import { reportsApi } from "@/lib/api/reports.api";
import type { OccupancyForecastResponse } from "@/lib/types/report";

interface UseRoomReportsParams {
  startDate: string;
  endDate: string;
  groupBy: "day" | "week" | "month";
}

export function useRoomReports(params: UseRoomReportsParams) {
  const [occupancyForecast, setOccupancyForecast] = useState<OccupancyForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.startDate || !params.endDate) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const forecast = await reportsApi.getOccupancyForecast(params);
        setOccupancyForecast(forecast);
      } catch (err: Error | unknown) {
        console.error("Error fetching room reports:", err);
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu báo cáo phòng");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.startDate, params.endDate, params.groupBy]);

  return {
    occupancyForecast,
    loading,
    error,
  };
}
