"use client";

import { useState, useEffect } from "react";
import { reportsApi } from "@/lib/api/reports.api";
import type {
  RevenueSummaryResponse,
  RevenueByRoomTypeResponse,
  PaymentMethodDistributionResponse,
  PromotionEffectivenessResponse,
} from "@/lib/types/report";

interface UseRevenueReportsParams {
  fromDate: string;
  toDate: string;
  groupBy: "day" | "week" | "month" | "quarter" | "year";
}

export function useRevenueReports(params: UseRevenueReportsParams) {
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummaryResponse | null>(null);
  const [revenueByRoomType, setRevenueByRoomType] = useState<RevenueByRoomTypeResponse | null>(null);
  const [paymentMethodDistribution, setPaymentMethodDistribution] = useState<PaymentMethodDistributionResponse | null>(null);
  const [promotionEffectiveness, setPromotionEffectiveness] = useState<PromotionEffectivenessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.fromDate || !params.toDate) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summary, roomType, paymentMethods, promotions] = await Promise.all([
          reportsApi.getRevenueSummary(params),
          reportsApi.getRevenueByRoomType({ fromDate: params.fromDate, toDate: params.toDate }),
          reportsApi.getPaymentMethodDistribution({ fromDate: params.fromDate, toDate: params.toDate }),
          reportsApi.getPromotionEffectiveness({ fromDate: params.fromDate, toDate: params.toDate }),
        ]);

        console.log("Revenue Summary Response:", summary);
        console.log("Revenue By Room Type Response:", roomType);
        console.log("Payment Methods Response:", paymentMethods);
        console.log("Promotions Response:", promotions);

        setRevenueSummary(summary);
        setRevenueByRoomType(roomType);
        setPaymentMethodDistribution(paymentMethods);
        setPromotionEffectiveness(promotions);
      } catch (err: Error | unknown) {
        console.error("Error fetching revenue reports:", err);
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu báo cáo doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.fromDate, params.toDate, params.groupBy]);

  return {
    revenueSummary,
    revenueByRoomType,
    paymentMethodDistribution,
    promotionEffectiveness,
    loading,
    error,
  };
}
