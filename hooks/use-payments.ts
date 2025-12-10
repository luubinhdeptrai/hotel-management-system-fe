import { useMemo } from "react";
import { getRecentInvoices } from "@/lib/mock-payments";
import type { InvoiceSummary } from "@/lib/types/payment";

export function useRecentInvoices(): InvoiceSummary[] {
  // In real app, replace with API call
  return useMemo(() => getRecentInvoices(), []);
}
