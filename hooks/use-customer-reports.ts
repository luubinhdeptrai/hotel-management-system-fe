"use client";

import { useState, useEffect } from "react";
import { reportApi } from "@/lib/api/reports.api";
import type { CustomerLifetimeValueResponse, CustomerRankDistributionResponse } from "@/lib/types/report";

export function useCustomerReports() {
  const [lifetimeValue, setLifetimeValue] = useState<CustomerLifetimeValueResponse | null>(null);
  const [rankDistribution, setRankDistribution] = useState<CustomerRankDistributionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [clv, ranks] = await Promise.all([
          reportApi.getCustomerLifetimeValue(),
          reportApi.getCustomerRankDistribution(),
        ]);

        setLifetimeValue(clv);
        setRankDistribution(ranks);
      } catch (err: Error | unknown) {
        console.error("Error fetching customer reports:", err);
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu báo cáo khách hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { lifetimeValue, rankDistribution, loading, error };
}
