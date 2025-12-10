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
import type { SpecialPriceDate } from "@/lib/types/pricing";

interface SpecialDatesTableProps {
  specialDates: SpecialPriceDate[];
}

export function SpecialDatesTable({ specialDates }: SpecialDatesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getRoomTypeColor = (roomTypeID: string) => {
    const colors: Record<string, string> = {
      STD: "bg-blue-100 text-blue-800",
      DLX: "bg-purple-100 text-purple-800",
      SUT: "bg-amber-100 text-amber-800",
      PRES: "bg-red-100 text-red-800",
    };
    return colors[roomTypeID] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead>Loại Phòng</TableHead>
            <TableHead className="text-right">Giá đặc biệt</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specialDates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                Chưa có ngày đặc biệt nào
              </TableCell>
            </TableRow>
          ) : (
            specialDates.map((date) => (
              <TableRow key={date.dateID}>
                <TableCell className="font-medium">
                  {new Date(date.date).toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Badge className={getRoomTypeColor(date.roomTypeID)}>
                    {date.roomTypeName}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-primary-600">
                  {formatCurrency(date.specialPrice)}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">{date.reason}</span>
                </TableCell>
                <TableCell>
                  {date.isActive ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Đang áp dụng
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Không hoạt động</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
