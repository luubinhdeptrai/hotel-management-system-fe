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
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import type { Booking } from "@/lib/types/api";

interface CheckOutResultsTableProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
}

export function CheckOutResultsTable({
  bookings,
  onSelectBooking,
}: CheckOutResultsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 text-gray-300">{ICONS.SEARCH}</div>
          <div>
            <p className="text-base font-medium text-gray-600">
              Không tìm thấy phòng đang thuê nào
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Vui lòng thử lại với từ khóa khác
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <TableRow>
            <TableHead className="font-bold text-gray-900 h-12">
              Mã đặt phòng
            </TableHead>
            <TableHead className="font-bold text-gray-900 h-12">Phòng</TableHead>
            <TableHead className="font-bold text-gray-900 h-12">
              Khách hàng chính
            </TableHead>
            <TableHead className="font-bold text-gray-900 h-12">
              Số điện thoại
            </TableHead>
            <TableHead className="font-bold text-gray-900 h-12">
              Ngày nhận
            </TableHead>
            <TableHead className="font-bold text-gray-900 h-12">
              Trạng thái
            </TableHead>
            <TableHead className="text-right font-bold text-gray-900 h-12">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const roomNumbers = (booking.bookingRooms || [])
              .map(br => br.room?.roomNumber)
              .filter(Boolean)
              .join(", ");

            return (
              <TableRow 
                key={booking.id} 
                className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                <TableCell className="font-semibold text-primary-600 py-4">
                  {booking.bookingCode}
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm font-medium text-gray-700">
                    {roomNumbers}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      {booking.primaryCustomer?.fullName || "N/A"}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      ID: {booking.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 font-medium py-4">
                  {booking.primaryCustomer?.phone || "N/A"}
                </TableCell>
                <TableCell className="text-gray-700 font-medium py-4">
                  {formatDate(booking.checkInDate)}
                </TableCell>
                <TableCell className="py-4">
                  <Badge className="bg-info-100 text-info-700 hover:bg-info-100 font-semibold px-3 py-1">
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button
                    onClick={() => onSelectBooking(booking)}
                    size="sm"
                    className="h-9 px-4 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <span className="w-4 h-4 mr-2">{ICONS.DOOR_OPEN}</span>
                    <span className="ml-1.5">Check-out</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

