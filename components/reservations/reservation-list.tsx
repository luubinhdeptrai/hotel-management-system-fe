"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ICONS } from "@/src/constants/icons.enum";
import { Reservation, ReservationStatus } from "@/lib/types/reservation";
import { cn } from "@/lib/utils";

interface ReservationListProps {
  reservations: Reservation[];
  onEdit?: (reservation: Reservation) => void;
  onCancel?: (reservation: Reservation) => void;
  onViewDetails?: (reservation: Reservation) => void;
}

const STATUS_COLORS: Record<
  ReservationStatus,
  { bg: string; text: string; border: string }
> = {
  // New status values
  "Chờ xác nhận": {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  "Đã xác nhận": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  "Đã nhận phòng": {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  "Trả phòng một phần": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  "Đã trả phòng": {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
  "Đã hủy": {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
  "Không đến": {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  // Legacy values for backward compatibility
  "Đã đặt": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  "Đã nhận": {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
};

export function ReservationList({
  reservations,
  onEdit,
  onCancel,
  onViewDetails,
}: ReservationListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  const canEdit = (reservation: Reservation) => {
    // Backend constraint: Cannot update if CANCELLED or CHECKED_OUT
    // Can update: PENDING, CONFIRMED, CHECKED_IN, PARTIALLY_CHECKED_OUT
    const cannotEditStatuses: ReservationStatus[] = [
      "Đã hủy",       // CANCELLED
      "Đã trả phòng", // CHECKED_OUT
    ];
    return !cannotEditStatuses.includes(reservation.status);
  };

  const canCancel = (reservation: Reservation) => {
    // Backend constraint: Cannot cancel if CANCELLED, CHECKED_IN, or CHECKED_OUT
    const cannotCancelStatuses: ReservationStatus[] = [
      "Đã hủy",       // CANCELLED
      "Đã nhận phòng", // CHECKED_IN
      "Đã trả phòng", // CHECKED_OUT
    ];
    return !cannotCancelStatuses.includes(reservation.status);
  };

  return (
    <Card className="overflow-hidden border-2 border-gray-200 shadow-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-linear-to-r from-gray-50 to-gray-100">
            <TableRow className="border-b-2">
              <TableHead className="font-extrabold text-gray-900">
                Mã đặt phòng
              </TableHead>
              <TableHead className="font-extrabold text-gray-900">
                Khách hàng
              </TableHead>
              <TableHead className="font-extrabold text-gray-900">
                Ngày đặt
              </TableHead>
              <TableHead className="font-extrabold text-gray-900">
                Ngày đến/đi
              </TableHead>
              <TableHead className="font-extrabold text-gray-900">
                Số phòng
              </TableHead>
              <TableHead className="font-extrabold text-gray-900 text-right">
                Tổng tiền
              </TableHead>
              <TableHead className="font-extrabold text-gray-900 text-center">
                Trạng thái
              </TableHead>
              <TableHead className="font-extrabold text-gray-900 text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">
                        {ICONS.CALENDAR}
                      </span>
                    </div>
                    <p className="text-gray-500 font-semibold text-base">
                      Không tìm thấy đặt phòng nào
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation, index) => {
                const firstDetail = reservation.details[0];
                const statusColor = STATUS_COLORS[reservation.status];

                return (
                  <TableRow
                    key={reservation.reservationID}
                    className={`hover:bg-blue-50 cursor-pointer transition-all hover:shadow-md ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                    onClick={() => onViewDetails?.(reservation)}
                  >
                    <TableCell className="font-bold text-gray-900 text-base">
                      #{reservation.reservationID}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-bold text-gray-900 text-base">
                          {reservation.customer.customerName}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {reservation.customer.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 font-semibold">
                      {formatDate(reservation.reservationDate)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-success-600">
                            {ICONS.CALENDAR}
                          </span>
                          <span className="text-gray-900 font-bold">
                            {formatDate(firstDetail.checkInDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-4 h-4 text-error-600">
                            {ICONS.CALENDAR_CHECK}
                          </span>
                          <span className="text-gray-600 font-semibold">
                            {formatDate(firstDetail.checkOutDate)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-primary-600">
                          {ICONS.BED_DOUBLE}
                        </span>
                        <span className="text-gray-700 font-bold">
                          {reservation.totalRooms} phòng
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-extrabold text-primary-600 text-base text-right">
                      {formatCurrency(reservation.totalAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "border-2 font-bold text-sm px-3 py-1",
                          statusColor.bg,
                          statusColor.text,
                          statusColor.border
                        )}
                      >
                        {reservation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canEdit(reservation) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit?.(reservation)}
                            className="h-9 px-4 bg-blue-50 border-2 border-blue-300 text-blue-700 font-bold hover:bg-blue-600 hover:text-white hover:border-blue-700 hover:scale-110 transition-all shadow-sm"
                          >
                            <span className="w-4 h-4 mr-1.5">{ICONS.EDIT}</span>
                            Sửa
                          </Button>
                        )}
                        {canCancel(reservation) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCancel?.(reservation)}
                            className="h-9 px-4 bg-error-50 border-2 border-error-300 text-error-700 font-bold hover:bg-error-600 hover:text-white hover:border-error-700 hover:scale-110 transition-all shadow-sm"
                          >
                            <span className="w-4 h-4 mr-1.5">
                              {ICONS.X_CIRCLE}
                            </span>
                            Hủy
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
