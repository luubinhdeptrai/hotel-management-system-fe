"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import type { FolioTransaction } from "@/lib/types/folio";
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
} from "@/lib/types/folio";

interface TransactionTableProps {
  transactions: FolioTransaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const formatCurrency = (amount: number) => {
    if (amount === 0) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Sort transactions by date/time (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
          <span className="inline-flex items-center justify-center w-5 h-5 text-white">{ICONS.CLIPBOARD_LIST}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Lịch sử giao dịch</h2>
          <p className="text-xs text-gray-500">{sortedTransactions.length} giao dịch</p>
        </div>
      </div>

      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[100px] font-bold">Ngày</TableHead>
              <TableHead className="w-20 font-bold">Giờ</TableHead>
              <TableHead className="font-bold">Loại</TableHead>
              <TableHead className="font-bold">Diễn giải</TableHead>
              <TableHead className="text-right font-bold">Debit</TableHead>
              <TableHead className="text-right font-bold">Credit</TableHead>
              <TableHead className="font-bold">Người tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 text-gray-400">{ICONS.CLIPBOARD_LIST}</span>
                  </div>
                  <p className="text-gray-500 font-medium">Chưa có giao dịch nào</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((txn) => (
                <TableRow
                  key={txn.transactionID}
                  className={txn.isVoided ? "opacity-50 bg-gray-50" : "hover:bg-gray-50"}
                >
                  <TableCell className="font-medium">
                    {formatDate(txn.date)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {txn.time.substring(0, 5)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${TRANSACTION_TYPE_COLORS[txn.type]} inline-flex items-center gap-2`}>
                      {TRANSACTION_TYPE_LABELS[txn.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className={`text-sm ${txn.isVoided ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {txn.description}
                    </p>
                    {txn.isVoided && (
                      <div className="mt-1 inline-flex items-center gap-2 bg-error-50 border border-error-200 rounded-full px-2 py-0.5">
                        <span className="inline-flex items-center justify-center w-3 h-3 text-error-600">{ICONS.X_CIRCLE}</span>
                        <p className="text-xs text-error-700 font-semibold">
                          Đã hủy bởi {txn.voidedBy}
                        </p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {txn.debit > 0 && (
                      <span className="font-bold text-error-600 bg-error-50 px-2 py-1 rounded">
                        {formatCurrency(txn.debit)}
                      </span>
                    )}
                    {txn.debit === 0 && (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {txn.credit > 0 && (
                      <span className="font-bold text-success-600 bg-success-50 px-2 py-1 rounded">
                        {formatCurrency(txn.credit)}
                      </span>
                    )}
                    {txn.credit === 0 && (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {txn.createdBy}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
