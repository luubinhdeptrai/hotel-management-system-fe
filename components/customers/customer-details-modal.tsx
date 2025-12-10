"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerRecord } from "@/lib/types/customer";
import { ICONS } from "@/src/constants/icons.enum";

interface CustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerRecord | null;
}

export function CustomerDetailsModal({
  open,
  onOpenChange,
  customer,
}: CustomerDetailsModalProps) {
  if (!customer) return null;

  const contactInfo = [
    { label: "Mã khách", value: customer.customerId },
    { label: "Số điện thoại", value: customer.phoneNumber },
    { label: "Email", value: customer.email },
    { label: "CCCD / MST", value: customer.identityCard },
    { label: "Quốc tịch", value: customer.nationality },
    { label: "Địa chỉ", value: customer.address, fullWidth: true },
  ];

  const bookingInfo = [
    { label: "Trạng thái", value: customer.status },
    { label: "Tổng số lần đặt", value: `${customer.totalBookings} lần` },
    { label: "Tổng chi tiêu", value: formatCurrency(customer.totalSpent) },
    { label: "Lần ghé gần nhất", value: customer.lastVisit || "Chưa có" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-fit max-w-7xl sm:max-w-none max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pr-12">
          <DialogTitle className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {customer.customerName}
              </h3>
              <p className="text-gray-600 mt-1">
                Khách {customer.customerType.toLowerCase()}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary-100 text-primary-700 border-0">
                  {customer.customerType}
                </Badge>
                {customer.isVip && (
                  <Badge className="bg-warning-100 text-warning-700 border-0">
                    VIP
                  </Badge>
                )}
              </div>
              <Badge
                className={`${
                  CUSTOMER_STATUS_COLORS[customer.status]
                } border-0 text-sm`}
              >
                {customer.status}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Hồ sơ khách hàng và lịch sử đặt phòng gần nhất
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <Separator />

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {ICONS.USER}
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  className={item.fullWidth ? "sm:col-span-2" : undefined}
                >
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="font-medium text-gray-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {ICONS.CLIPBOARD_LIST}
              Thông tin đặt phòng
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {bookingInfo.map((item) => (
                <div key={item.label}>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  {item.label === "Trạng thái" ? (
                    <Badge
                      className={`${
                        CUSTOMER_STATUS_COLORS[customer.status]
                      } border-0 mt-1`}
                    >
                      {item.value}
                    </Badge>
                  ) : (
                    <p className="font-medium text-gray-900 mt-1">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {customer.notes && (
            <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
              <h4 className="text-sm font-semibold text-primary-700">
                Ghi chú
              </h4>
              <p className="text-sm text-primary-900 mt-1">{customer.notes}</p>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Lịch sử đặt phòng
            </h3>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Mã đặt phòng</TableHead>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Khoảng thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.history.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-6 text-center text-gray-500"
                        >
                          Chưa có dữ liệu lịch sử
                        </TableCell>
                      </TableRow>
                    ) : (
                      customer.history.map((item) => (
                        <TableRow key={item.reservationId}>
                          <TableCell className="font-medium">
                            {item.reservationId}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-gray-900">
                                {item.roomName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.roomTypeName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.checkInDate} - {item.checkOutDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${statusBadge(item.status)} border-0`}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const CUSTOMER_STATUS_COLORS: Record<CustomerRecord["status"], string> = {
  "Hoạt động": "bg-success-100 text-success-700",
  "Đã vô hiệu": "bg-gray-100 text-gray-700",
};

const statusStyles: Record<string, string> = {
  "Đã đặt": "bg-info-100 text-info-700",
  "Đã nhận": "bg-success-100 text-success-700",
  "Đã hủy": "bg-error-100 text-error-700",
  "Không đến": "bg-warning-100 text-warning-700",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const statusBadge = (status: string) =>
  statusStyles[status] ?? "bg-gray-100 text-gray-700";
