"use client";

import { useInvoicePrint } from "@/hooks/use-invoice-print";
import { InvoicePrint } from "@/components/payments/invoice-print";

export default function PrintInvoiceContent() {
  const { receiptID, summary, goBack, reprint } = useInvoicePrint();

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border border-gray-300 bg-white p-6 text-center">
          <p className="text-gray-700 font-medium">
            Không tìm thấy dữ liệu hóa đơn
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Mã phiếu: {receiptID || "(trống)"}
          </p>
          <button
            className="mt-4 h-10 px-4 rounded-md bg-primary-600 text-white hover:bg-primary-500"
            onClick={goBack}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return <InvoicePrint summary={summary} onBack={goBack} onPrint={reprint} />;
}
