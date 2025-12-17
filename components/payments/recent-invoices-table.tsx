"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CheckoutSummary } from "@/lib/types/checkin-checkout";
import { formatCurrency } from "@/lib/utils";

interface RecentInvoicesTableProps {
  items: CheckoutSummary[];
}

export function RecentInvoicesTable({ items }: RecentInvoicesTableProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
      <div className="bg-linear-to-r from-primary-600 to-primary-500 p-5">
        <h2 className="text-xl font-bold text-white mb-1">
          Hóa đơn gần đây
        </h2>
        <p className="text-sm text-primary-50">
          Danh sách minh họa để in lại hóa đơn đã phát hành.
        </p>
      </div>
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="border-b border-gray-200">
            <TableHead className="font-bold text-gray-900 py-4">
              Mã phiếu
            </TableHead>
            <TableHead className="font-bold text-gray-900">
              Khách hàng
            </TableHead>
            <TableHead className="font-bold text-gray-900">Phòng</TableHead>
            <TableHead className="font-bold text-gray-900">
              Tổng tiền
            </TableHead>
            <TableHead className="text-right font-bold text-gray-900">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.receiptID} className="hover:bg-primary-50/30 transition-colors border-b border-gray-100 last:border-0">
              <TableCell className="font-bold text-primary-600 py-4">
                {s.receiptID}
              </TableCell>
              <TableCell className="font-medium text-gray-900">
                {s.receipt.customerName}
              </TableCell>
              <TableCell className="font-medium text-gray-700">
                {s.receipt.roomName}
              </TableCell>
              <TableCell className="font-bold text-gray-900">
                {formatCurrency(s.grandTotal)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  className="h-9 px-5 font-semibold bg-linear-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-md transition-all"
                  onClick={() =>
                    window.open(
                      `/payments/print?receiptID=${s.receiptID}`,
                      "_blank"
                    )
                  }
                >
                  In Hóa đơn
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
