"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerReportData } from "@/lib/types/reports";

interface CustomerListTableProps {
  data: CustomerReportData[];
}

export function CustomerListTable({ data }: CustomerListTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Họ tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CCCD</TableHead>
              <TableHead className="text-right">Số lần đặt</TableHead>
              <TableHead className="text-right">Tổng chi tiêu</TableHead>
              <TableHead className="text-right">Lần ghé cuối</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {item.customerName}
                  </TableCell>
                  <TableCell>{item.phoneNumber}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.identityCard}</TableCell>
                  <TableCell className="text-right">
                    {item.totalBookings}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.totalSpent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(item.lastVisit).toLocaleDateString("vi-VN")}
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
