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
  "Hoạt động": "bg-success-100 text-success-700",
  "Đã vô hiệu": "bg-gray-100 text-gray-600",
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
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Mã KH</TableHead>
            <TableHead className="font-semibold">Khách hàng</TableHead>
            <TableHead className="font-semibold">Loại</TableHead>
            <TableHead className="font-semibold">Số điện thoại</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">CCCD/Tax</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold text-right">
              Tổng chi tiêu
            </TableHead>
            <TableHead className="font-semibold text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empty ? (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-gray-500">
                Không tìm thấy khách hàng phù hợp
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow
                key={customer.customerId}
                className="hover:bg-gray-50 cursor-pointer"
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
                    <Badge className="bg-primary-100 text-primary-700 border-0">
                      {customer.customerType}
                    </Badge>
                    {customer.isVip && (
                      <Badge className="bg-warning-100 text-warning-700 border-0">
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
                      >
                        <span className="mr-2">{ICONS.INFO}</span>
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(customer);
                        }}
                      >
                        <span className="mr-2">{ICONS.EDIT}</span>
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
