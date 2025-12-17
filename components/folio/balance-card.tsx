"use client";

import { ICONS } from "@/src/constants/icons.enum";
import type { Folio } from "@/lib/types/folio";

interface BalanceCardProps {
  folio: Folio;
}

export function BalanceCard({ folio }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const balanceColor =
    folio.balance > 0
      ? "from-error-50 to-error-100/30"
      : folio.balance < 0
      ? "from-success-50 to-success-100/30"
      : "from-gray-50 to-gray-100/30";

  const balanceTextColor =
    folio.balance > 0
      ? "text-error-700"
      : folio.balance < 0
      ? "text-success-700"
      : "text-gray-700";

  const balanceIcon =
    folio.balance > 0
      ? ICONS.ALERT_CIRCLE
      : folio.balance < 0
      ? ICONS.CHECK_CIRCLE
      : ICONS.CHECK_CIRCLE;

  const balanceIconBg =
    folio.balance > 0
      ? "from-error-600 to-error-500"
      : folio.balance < 0
      ? "from-success-600 to-success-500"
      : "from-gray-600 to-gray-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Total Debit */}
      <div className="bg-linear-to-br from-error-50 to-error-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-2">Tổng Debit (Nợ)</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {formatCurrency(folio.totalDebit)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Các khoản phí phải trả</p>
          </div>
          <div className="w-12 h-12 bg-linear-to-br from-error-600 to-error-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <span className="inline-flex items-center justify-center w-6 h-6 text-white">{ICONS.ARROW_UP_DOWN}</span>
          </div>
        </div>
      </div>

      {/* Total Credit */}
      <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-2">Tổng Credit (Có)</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {formatCurrency(folio.totalCredit)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Số tiền đã thanh toán</p>
          </div>
          <div className="w-12 h-12 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <span className="inline-flex items-center justify-center w-6 h-6 text-white">{ICONS.CREDIT_CARD}</span>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className={`bg-linear-to-br ${balanceColor} rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10" />
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-2">Số dư (Balance)</p>
            <p className={`text-3xl font-extrabold ${balanceTextColor}`}>
              {formatCurrency(Math.abs(folio.balance))}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {folio.balance > 0
                ? "Khách cần thanh toán"
                : folio.balance < 0
                ? "Cần hoàn tiền"
                : "Đã thanh toán đủ"}
            </p>
          </div>
          <div className={`w-12 h-12 bg-linear-to-br ${balanceIconBg} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
            <span className="inline-flex items-center justify-center w-6 h-6 text-white">{balanceIcon}</span>
          </div>
        </div>
      </div>

      {/* Calculation Formula */}
      <div className="col-span-1 md:col-span-3 bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
        <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
          <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.INFO}</span>
          <span className="font-mono font-semibold">Balance = Debit - Credit</span>
          <span className="mx-1">→</span>
          <span className="font-mono">
            {formatCurrency(folio.balance)} ={" "}
            {formatCurrency(folio.totalDebit)} -{" "}
            {formatCurrency(folio.totalCredit)}
          </span>
        </p>
      </div>
    </div>
  );
}
