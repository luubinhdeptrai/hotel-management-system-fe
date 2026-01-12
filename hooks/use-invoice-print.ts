"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CheckoutSummary } from "@/lib/types/checkin-checkout";

export function useInvoicePrint() {
  const params = useSearchParams();
  const router = useRouter();
  const receiptID = params.get("receiptID") ?? "";

  const summary: CheckoutSummary | null = useMemo(() => {
    // TODO: Fetch checkout summary from API using receiptID
    if (!receiptID) return null;
    return null; // Placeholder until API is implemented
  }, [receiptID]);

  useEffect(() => {
    if (summary) {
      const t = setTimeout(() => window.print(), 150);
      return () => clearTimeout(t);
    }
  }, [summary]);

  const goBack = () => router.back();
  const reprint = () => window.print();

  return { receiptID, summary, goBack, reprint };
}
