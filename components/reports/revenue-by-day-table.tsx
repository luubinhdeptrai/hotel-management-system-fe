"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RevenueByDayData } from "@/lib/types/reports";

interface RevenueByDayTableProps {
  data: RevenueByDayData[];
}

export function RevenueByDayTable({ data }: RevenueByDayTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Ngày</TableHead>
              <TableHead className="text-right">Doanh thu phòng</TableHead>
              <TableHead className="text-right">Doanh thu dịch vụ</TableHead>
              <TableHead className="text-right">Tổng doanh thu</TableHead>
              <TableHead className="text-right">Số booking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {new Date(item.date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.roomRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.serviceRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.numberOfBookings}
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
