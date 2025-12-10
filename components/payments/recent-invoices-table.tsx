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
    <div className="rounded-lg border border-gray-300 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Hóa đơn gần đây (mẫu dữ liệu)
        </h2>
        <p className="text-sm text-gray-500">
          Danh sách minh họa để in lại hóa đơn.
        </p>
      </div>
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold text-gray-900">
              Mã phiếu
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Khách hàng
            </TableHead>
            <TableHead className="font-semibold text-gray-900">Phòng</TableHead>
            <TableHead className="font-semibold text-gray-900">
              Tổng tiền
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-900">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.receiptID} className="hover:bg-gray-50">
              <TableCell className="font-medium text-primary-600">
                {s.receiptID}
              </TableCell>
              <TableCell className="text-gray-900">
                {s.receipt.customerName}
              </TableCell>
              <TableCell className="text-gray-900">
                {s.receipt.roomName}
              </TableCell>
              <TableCell className="font-semibold text-gray-900">
                {formatCurrency(s.grandTotal)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  className="h-8 bg-primary-600 text-white hover:bg-primary-500"
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
