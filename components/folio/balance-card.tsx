"use client";

import { Card, CardContent } from "@/components/ui/card";
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
      ? "text-red-600" // Customer owes money
      : folio.balance < 0
      ? "text-green-600" // Hotel owes refund
      : "text-gray-600"; // Balanced

  return (
    <Card className="bg-linear-to-br from-primary-50 to-blue-50 border-2 border-primary-200">
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Total Debit */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Tổng Debit (Nợ)
            </p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(folio.totalDebit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Các khoản phí phải trả</p>
          </div>

          {/* Total Credit */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Tổng Credit (Có)
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(folio.totalCredit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Số tiền đã thanh toán</p>
          </div>

          {/* Balance */}
          <div className="border-l-2 border-gray-300 pl-6">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Số dư (Balance)
            </p>
            <p className={`text-3xl font-bold ${balanceColor}`}>
              {formatCurrency(Math.abs(folio.balance))}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {folio.balance > 0
                ? "Khách cần thanh toán"
                : folio.balance < 0
                ? "Cần hoàn tiền"
                : "Đã thanh toán đủ"}
            </p>
          </div>
        </div>

        {/* Calculation Formula */}
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-mono">Balance = Debit - Credit</span>
            <span className="mx-2">→</span>
            <span className="font-mono">
              {formatCurrency(folio.balance)} ={" "}
              {formatCurrency(folio.totalDebit)} -{" "}
              {formatCurrency(folio.totalCredit)}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
