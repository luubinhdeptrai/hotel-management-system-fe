import { useMemo } from "react";
import type { InvoiceSummary } from "@/lib/types/payment";

export function useRecentInvoices(): InvoiceSummary[] {
  // In real app, replace with API call
  return useMemo(() => [], []);
}
