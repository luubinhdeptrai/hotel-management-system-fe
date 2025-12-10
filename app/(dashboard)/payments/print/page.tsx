import { Suspense } from "react";
import PrintInvoiceContent from "./print-content";

export const dynamic = "force-dynamic";

export default function PrintInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintInvoiceContent />
    </Suspense>
  );
}
