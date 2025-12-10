"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { CustomerRecord } from "@/lib/types/customer";

interface BookingHistoryTabProps {
  customer: CustomerRecord;
}

export function BookingHistoryTab({ customer }: BookingHistoryTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Đã đặt": "bg-blue-100 text-blue-800",
      "Đã xác nhận": "bg-green-100 text-green-800",
      "Đã nhận": "bg-purple-100 text-purple-800",
      "Đã nhận phòng": "bg-purple-100 text-purple-800",
      "Đã trả phòng": "bg-gray-100 text-gray-800",
      "Đã hủy": "bg-red-100 text-red-800",
      "Không đến": "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Sort history by check-in date (newest first)
  const sortedHistory = [...customer.history].sort((a, b) => {
    return (
      new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
    );
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Tổng số lần đặt</p>
            <p className="text-3xl font-bold text-primary-600">
              {customer.totalBookings}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Tổng chi tiêu</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(customer.totalSpent)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Lần đặt gần nhất</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatDate(customer.lastVisit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đặt phòng</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có lịch sử đặt phòng</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đặt phòng</TableHead>
                    <TableHead>Ngày nhận</TableHead>
                    <TableHead>Ngày trả</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Loại phòng</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHistory.map((booking) => (
                    <TableRow key={booking.reservationId}>
                      <TableCell className="font-mono text-sm">
                        {booking.reservationId}
                      </TableCell>
                      <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                      <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                      <TableCell className="font-medium">
                        {booking.roomName}
                      </TableCell>
                      <TableCell>{booking.roomTypeName}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(booking.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
