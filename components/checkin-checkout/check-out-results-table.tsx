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
import type { RentalReceipt } from "@/lib/types/checkin-checkout";

interface CheckOutResultsTableProps {
  rentals: RentalReceipt[];
  onSelectRental: (rental: RentalReceipt) => void;
}

export function CheckOutResultsTable({
  rentals,
  onSelectRental,
}: CheckOutResultsTableProps) {
  if (rentals.length === 0) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-gray-400">{ICONS.SEARCH}</div>
          <p className="text-sm text-gray-500">
            Không tìm thấy phòng đang thuê nào. Vui lòng thử lại với từ khóa
            khác.
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
              Mã phiếu thuê
            </TableHead>
            <TableHead className="font-semibold text-gray-900">Phòng</TableHead>
            <TableHead className="font-semibold text-gray-900">
              Khách hàng
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Số điện thoại
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Ngày nhận
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Ngày trả
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              Tiền phòng
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
          {rentals.map((rental) => (
            <TableRow key={rental.receiptID} className="hover:bg-gray-50">
              <TableCell className="font-medium text-primary-600">
                {rental.receiptID}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {rental.roomName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {rental.roomTypeName}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {rental.customerName}
                  </span>
                  <span className="text-xs text-gray-500">
                    CMND: {rental.identityCard}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-gray-700">
                {rental.phoneNumber}
              </TableCell>
              <TableCell className="text-gray-700">
                {formatDate(rental.checkInDate)}
              </TableCell>
              <TableCell className="text-gray-700">
                {formatDate(rental.checkOutDate)}
              </TableCell>
              <TableCell className="font-semibold text-gray-900">
                {formatCurrency(rental.roomTotal)}
              </TableCell>
              <TableCell>
                <Badge className="bg-info-100 text-info-600 hover:bg-info-100">
                  {rental.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() => onSelectRental(rental)}
                  size="sm"
                  className="h-8 bg-primary-600 hover:bg-primary-500 text-white"
                >
                  {ICONS.DOOR_OPEN}
                  <span className="ml-1">Check-out</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
