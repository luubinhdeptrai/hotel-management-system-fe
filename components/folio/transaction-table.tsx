"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử giao dịch</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ngày</TableHead>
                <TableHead className="w-[80px]">Giờ</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Diễn giải</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead>Người tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    Chưa có giao dịch nào
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map((txn) => (
                  <TableRow
                    key={txn.transactionID}
                    className={txn.isVoided ? "opacity-50 line-through" : ""}
                  >
                    <TableCell className="font-medium">
                      {formatDate(txn.date)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {txn.time.substring(0, 5)}
                    </TableCell>
                    <TableCell>
                      <Badge className={TRANSACTION_TYPE_COLORS[txn.type]}>
                        {TRANSACTION_TYPE_LABELS[txn.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-gray-900">{txn.description}</p>
                      {txn.isVoided && (
                        <p className="text-xs text-red-600 mt-1">
                          ❌ Đã hủy bởi {txn.voidedBy}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {txn.debit > 0 && (
                        <span className="font-semibold text-red-600">
                          {formatCurrency(txn.debit)}
                        </span>
                      )}
                      {txn.debit === 0 && (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {txn.credit > 0 && (
                        <span className="font-semibold text-green-600">
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
      </CardContent>
    </Card>
  );
}
