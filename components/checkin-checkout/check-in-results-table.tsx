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
import type { Reservation } from "@/lib/types/reservation";

interface CheckInResultsTableProps {
  reservations: Reservation[];
  onCheckIn: (reservation: Reservation) => void;
}

export function CheckInResultsTable({
  reservations,
  onCheckIn,
}: CheckInResultsTableProps) {
  if (reservations.length === 0) {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 text-gray-300">{ICONS.SEARCH}</div>
          <div>
            <p className="text-base font-medium text-gray-600">
              Không tìm thấy đặt phòng nào
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
            <TableHead className="font-bold text-gray-900 h-12">
              Khách hàng
            </TableHead>
            <TableHead className="font-bold text-gray-900 h-12">
              Số điện thoại
            </TableHead>
            <TableHead className="font-bold text-gray-900 h-12">
              Ngày nhận phòng
            </TableHead>
            <TableHead className="font-bold text-gray-900 h-12">
              Số phòng
            </TableHead>
            <TableHead className="font-bold text-gray-900 h-12">
              Tổng tiền
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
          {reservations.map((reservation) => {
            const firstDetail = reservation.details[0];
            return (
              <TableRow
                key={reservation.reservationID}
                className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                <TableCell className="font-semibold text-primary-600 py-4">
                  {reservation.reservationID}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      {reservation.customer.customerName}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      CMND: {reservation.customer.identityCard}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 font-medium py-4">
                  {reservation.customer.phoneNumber}
                </TableCell>
                <TableCell className="text-gray-700 font-medium py-4">
                  {formatDate(firstDetail.checkInDate)}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    {reservation.details.map((detail) => (
                      <span
                        key={detail.detailID}
                        className="text-sm font-medium text-gray-700"
                      >
                        {detail.roomName} ({detail.roomTypeName})
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-gray-900 py-4">
                  {formatCurrency(reservation.totalAmount)}
                </TableCell>
                <TableCell className="py-4">
                  {reservation.status === "Đã đặt" ? (
                    <Badge className="bg-info-100 text-info-700 hover:bg-info-100 font-semibold px-3 py-1">
                      Chưa nhận
                    </Badge>
                  ) : (
                    <Badge className="bg-success-100 text-success-700 hover:bg-success-100 font-semibold px-3 py-1">
                      {reservation.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right py-4">
                  {reservation.status === "Đã đặt" && (
                    <Button
                      onClick={() => onCheckIn(reservation)}
                      size="sm"
                      className="h-9 px-4 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      {ICONS.CHECK}
                      <span className="ml-1.5">Check-in</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

