import type { InvoiceSummary } from "@/lib/types/payment";
import { mockCheckoutSummary } from "@/lib/mock-checkin-checkout";

// Mock list of issued invoices (reuse checkout summaries for demo)
export const mockInvoices: InvoiceSummary[] = [...mockCheckoutSummary];

export function getRecentInvoices(): InvoiceSummary[] {
  return mockInvoices;
}

export function getInvoiceSummary(receiptID: string): InvoiceSummary | null {
  return mockInvoices.find((i) => i.receiptID === receiptID) ?? null;
}
