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
    return reservation.status === "Đã đặt";
  };

  const canCancel = (reservation: Reservation) => {
    return reservation.status === "Đã đặt";
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">
                Mã đặt phòng
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Khách hàng
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Ngày đặt
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Ngày đến/đi
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Số phòng
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Tổng tiền
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  Không tìm thấy đặt phòng nào
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => {
                const firstDetail = reservation.details[0];
                const statusColor = STATUS_COLORS[reservation.status];

                return (
                  <TableRow
                    key={reservation.reservationID}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onViewDetails?.(reservation)}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {reservation.reservationID}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {reservation.customer.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.customer.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {formatDate(reservation.reservationDate)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {formatDate(firstDetail.checkInDate)}
                        </div>
                        <div className="text-gray-500">
                          {formatDate(firstDetail.checkOutDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {reservation.totalRooms} phòng
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {formatCurrency(reservation.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border",
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
                            className="hover:bg-primary-50"
                          >
                            <span className="mr-1">{ICONS.EDIT}</span>
                            Sửa
                          </Button>
                        )}
                        {canCancel(reservation) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCancel?.(reservation)}
                            className="hover:bg-red-50 text-red-600 border-red-300"
                          >
                            <span className="mr-1">{ICONS.X_CIRCLE}</span>
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
