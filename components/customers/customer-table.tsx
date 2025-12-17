"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CustomerRecord } from "@/lib/types/customer";
import { ICONS } from "@/src/constants/icons.enum";

interface CustomerTableProps {
  customers: CustomerRecord[];
  onViewDetails: (customer: CustomerRecord) => void;
  onEdit: (customer: CustomerRecord) => void;
  onRequestStatusChange: (customer: CustomerRecord) => void;
}

const STATUS_STYLES = {
  "Hoạt động": "bg-linear-to-r from-success-500 to-success-600 text-white font-semibold",
  "Đã vô hiệu": "bg-linear-to-r from-gray-500 to-gray-600 text-white font-semibold",
};

export function CustomerTable({
  customers,
  onViewDetails,
  onEdit,
  onRequestStatusChange,
}: CustomerTableProps) {
  const empty = useMemo(() => customers.length === 0, [customers]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <TableHead className="font-bold text-gray-700">Mã KH</TableHead>
            <TableHead className="font-bold text-gray-700">Khách hàng</TableHead>
            <TableHead className="font-bold text-gray-700">Loại</TableHead>
            <TableHead className="font-bold text-gray-700">Số điện thoại</TableHead>
            <TableHead className="font-bold text-gray-700">Email</TableHead>
            <TableHead className="font-bold text-gray-700">CCCD/Tax</TableHead>
            <TableHead className="font-bold text-gray-700">Trạng thái</TableHead>
            <TableHead className="font-bold text-gray-700 text-right">
              Tổng chi tiêu
            </TableHead>
            <TableHead className="font-bold text-gray-700 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empty ? (
            <TableRow>
              <TableCell colSpan={9} className="py-16">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                    <span className="w-8 h-8 text-primary-500">{ICONS.USERS}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Không tìm thấy khách hàng</h3>
                  <p className="text-gray-500 text-sm">Không có khách hàng nào phù hợp với bộ lọc hiện tại</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow
                key={customer.customerId}
                className="hover:bg-linear-to-r hover:from-primary-50/30 hover:to-transparent cursor-pointer transition-all"
                onClick={() => onViewDetails(customer)}
              >
                <TableCell className="font-medium text-gray-900">
                  {customer.customerId}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {customer.customerName}
                    </span>
                    <span className="text-xs text-gray-500">
                      Lần ghé cuối: {customer.lastVisit || "Chưa có"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className={`border-0 font-semibold ${
                      customer.customerType === "Doanh nghiệp"
                        ? "bg-linear-to-r from-info-500 to-info-600 text-white"
                        : "bg-linear-to-r from-primary-500 to-primary-600 text-white"
                    }`}>
                      {customer.customerType}
                    </Badge>
                    {customer.isVip && (
                      <Badge className="bg-linear-to-r from-warning-500 to-warning-600 text-white border-0 font-semibold">
                        VIP
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {customer.phoneNumber}
                </TableCell>
                <TableCell className="text-gray-600">
                  {customer.email}
                </TableCell>
                <TableCell className="text-gray-600">
                  {customer.identityCard}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${STATUS_STYLES[customer.status]} border-0`}
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {ICONS.MORE}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(customer);
                        }}
                        className="cursor-pointer"
                      >
                        <span className="mr-2 w-4 h-4">{ICONS.INFO}</span>
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(customer);
                        }}
                        className="cursor-pointer"
                      >
                        <span className="mr-2 w-4 h-4">{ICONS.EDIT}</span>
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestStatusChange(customer);
                        }}
                        className={
                          customer.status === "Hoạt động"
                            ? "text-error-600"
                            : "text-success-600"
                        }
                      >
                        <span className="mr-2">
                          {customer.status === "Hoạt động"
                            ? ICONS.TRASH
                            : ICONS.CHECK}
                        </span>
                        {customer.status === "Hoạt động"
                          ? "Vô hiệu hóa"
                          : "Kích hoạt lại"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
