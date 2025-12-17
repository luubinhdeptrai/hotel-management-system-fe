"use client";
import { useRecentInvoices } from "@/hooks/use-payments";
import { RecentInvoicesTable } from "@/components/payments/recent-invoices-table";
import { formatCurrency } from "@/lib/utils";

export default function PaymentsPage() {
  const samples = useRecentInvoices();

  const stats = {
    total: samples.length,
    totalAmount: samples.reduce((sum, s) => sum + s.grandTotal, 0),
    avgAmount: samples.length > 0 ? samples.reduce((sum, s) => sum + s.grandTotal, 0) / samples.length : 0,
  };

  return (
    <div className="space-y-6">
      {/* Modern Header Card */}
      <div className="bg-linear-to-br from-primary-600 via-primary-500 to-primary-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Quản lý Thanh toán & Hóa đơn</h2>
          <p className="text-primary-50 text-sm">Xử lý thanh toán (qua modal từ Check-out) và tra cứu/in lại hóa đơn đã phát hành.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">Tổng hóa đơn</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">Tổng doanh thu</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">Trung bình/đơn</div>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgAmount)}</div>
          </div>
        </div>
      </div>

      <RecentInvoicesTable items={samples} />
    </div>
  );
}
