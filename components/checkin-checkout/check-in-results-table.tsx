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
      <div className="rounded-lg border border-gray-300 bg-white p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-gray-400">{ICONS.SEARCH}</div>
          <p className="text-sm text-gray-500">
            Không tìm thấy đặt phòng nào. Vui lòng thử lại với từ khóa khác.
          </p>
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
    <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold text-gray-900">
              Mã đặt phòng
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Khách hàng
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Số điện thoại
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Ngày nhận phòng
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Số phòng
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Tổng tiền
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Trạng thái
            </TableHead>
            <TableHead className="text-right font-semibold text-gray-900">
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
                className="hover:bg-gray-50"
              >
                <TableCell className="font-medium text-primary-600">
                  {reservation.reservationID}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {reservation.customer.customerName}
                    </span>
                    <span className="text-xs text-gray-500">
                      CMND: {reservation.customer.identityCard}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">
                  {reservation.customer.phoneNumber}
                </TableCell>
                <TableCell className="text-gray-700">
                  {formatDate(firstDetail.checkInDate)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {reservation.details.map((detail) => (
                      <span
                        key={detail.detailID}
                        className="text-sm text-gray-700"
                      >
                        {detail.roomName} ({detail.roomTypeName})
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {formatCurrency(reservation.totalAmount)}
                </TableCell>
                <TableCell>
                  {reservation.status === "Đã đặt" ? (
                    <Badge className="bg-info-100 text-info-600 hover:bg-info-100">
                      Chưa nhận
                    </Badge>
                  ) : (
                    <Badge className="bg-success-100 text-success-600 hover:bg-success-100">
                      {reservation.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {reservation.status === "Đã đặt" && (
                    <Button
                      onClick={() => onCheckIn(reservation)}
                      size="sm"
                      className="h-8 bg-primary-600 hover:bg-primary-500 text-white"
                    >
                      {ICONS.CHECK}
                      <span className="ml-1">Check-in</span>
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
