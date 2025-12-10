"use client";
import { useRecentInvoices } from "@/hooks/use-payments";
import { RecentInvoicesTable } from "@/components/payments/recent-invoices-table";

export default function PaymentsPage() {
  const samples = useRecentInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý Thanh toán & Hóa đơn
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Xử lý thanh toán (qua modal từ Check-out) và tra cứu/in lại hóa đơn đã
          phát hành.
        </p>
      </div>
      <RecentInvoicesTable items={samples} />
    </div>
  );
}
