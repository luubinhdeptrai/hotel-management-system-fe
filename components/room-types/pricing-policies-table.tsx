"use client";

import { useState } from "react";
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
import { ICONS } from "@/src/constants/icons.enum";
import type { PricingPolicy } from "@/lib/types/pricing";
import { formatCurrency } from "@/lib/utils";

interface PricingPoliciesTableProps {
  policies: PricingPolicy[];
  basePrice?: number; // Giá cơ bản để tính giá cuối cùng
  onEdit?: (policy: PricingPolicy) => void;
  onDelete?: (policyId: string) => void;
}

export function PricingPoliciesTable({
  policies,
  basePrice = 500000,
  onEdit,
  onDelete,
}: PricingPoliciesTableProps) {
  const [sortBy, setSortBy] = useState<"priority" | "date" | "room">("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getDateTypeColor = (kieuNgay: string) => {
    const colors: Record<string, string> = {
      "Ngày thường": "bg-blue-100 text-blue-800 border-blue-300",
      "Cuối tuần": "bg-purple-100 text-purple-800 border-purple-300",
      "Ngày lễ": "bg-amber-100 text-amber-800 border-amber-300",
      "Tất cả": "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[kieuNgay] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return "bg-error-100 text-error-800 border-error-300";
    if (priority >= 3) return "bg-warning-100 text-warning-800 border-warning-300";
    return "bg-success-100 text-success-800 border-success-300";
  };

  const getMultiplierColor = (heSo: number) => {
    if (heSo > 1.5) return "text-error-600 font-extrabold";
    if (heSo > 1.0) return "text-warning-600 font-bold";
    if (heSo < 1.0) return "text-success-600 font-bold";
    return "text-gray-700 font-semibold";
  };

  const sortedPolicies = [...policies].sort((a, b) => {
    const order = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "priority") {
      return (b.MucUuTien - a.MucUuTien) * order;
    }
    if (sortBy === "date") {
      return (new Date(a.TuNgay).getTime() - new Date(b.TuNgay).getTime()) * order;
    }
    return a.MaLoaiPhong.localeCompare(b.MaLoaiPhong) * order;
  });

  const toggleSort = (column: "priority" | "date" | "room") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center gap-4 bg-linear-to-r from-gray-50 via-white to-gray-50 p-5 rounded-xl border-2 border-gray-200 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-primary-600">{ICONS.ARROW_UP_DOWN}</span>
          <span className="text-base font-extrabold text-gray-800">Sắp xếp:</span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("priority")}
            className={`h-10 px-5 font-bold border-2 transition-all hover:scale-105 ${
              sortBy === "priority"
                ? "bg-linear-to-r from-primary-600 to-primary-500 text-white border-primary-700 shadow-lg"
                : "bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600"
            }`}
          >
            <span className="w-4 h-4 mr-2">{ICONS.STAR}</span>
            Ưu tiên
            {sortBy === "priority" && (
              <span className="ml-2 text-lg font-extrabold">{sortOrder === "desc" ? "↓" : "↑"}</span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("date")}
            className={`h-10 px-5 font-bold border-2 transition-all hover:scale-105 ${
              sortBy === "date"
                ? "bg-linear-to-r from-purple-600 to-purple-500 text-white border-purple-700 shadow-lg"
                : "bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-600"
            }`}
          >
            <span className="w-4 h-4 mr-2">{ICONS.CALENDAR}</span>
            Thời gian
            {sortBy === "date" && (
              <span className="ml-2 text-lg font-extrabold">{sortOrder === "desc" ? "↓" : "↑"}</span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("room")}
            className={`h-10 px-5 font-bold border-2 transition-all hover:scale-105 ${
              sortBy === "room"
                ? "bg-linear-to-r from-blue-600 to-blue-500 text-white border-blue-700 shadow-lg"
                : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            <span className="w-4 h-4 mr-2">{ICONS.BED_DOUBLE}</span>
            Loại phòng
            {sortBy === "room" && (
              <span className="ml-2 text-lg font-extrabold">{sortOrder === "desc" ? "↓" : "↑"}</span>
            )}
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg border-2 border-primary-200">
          <span className="text-2xl font-extrabold text-primary-600">{policies.length}</span>
          <span className="text-sm font-semibold text-gray-600">chính sách</span>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 rounded-xl overflow-hidden shadow-lg">
        <Table>
          <TableHeader className="bg-linear-to-r from-gray-50 to-gray-100">
            <TableRow className="border-b-2">
              <TableHead className="font-extrabold text-gray-900">Tên chính sách</TableHead>
              <TableHead className="font-extrabold text-gray-900">Loại phòng</TableHead>
              <TableHead className="font-extrabold text-gray-900">Kiểu ngày</TableHead>
              <TableHead className="font-extrabold text-gray-900">Thời gian áp dụng</TableHead>
              <TableHead className="font-extrabold text-gray-900 text-right">Hệ số</TableHead>
              <TableHead className="font-extrabold text-gray-900 text-right">Giá cuối</TableHead>
              <TableHead className="font-extrabold text-gray-900 text-center">Ưu tiên</TableHead>
              <TableHead className="font-extrabold text-gray-900 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">{ICONS.CALENDAR}</span>
                    </div>
                    <p className="text-gray-500 font-semibold text-base">
                      Chưa có chính sách giá nào
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedPolicies.map((policy, index) => (
                <TableRow
                  key={policy.MaChinhSach}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <TableCell className="font-bold text-gray-900">
                    {policy.TenChinhSach}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary-100 text-primary-800 border-2 border-primary-300 font-bold">
                      {policy.TenLoaiPhong || policy.MaLoaiPhong}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-2 font-bold ${getDateTypeColor(policy.KieuNgay)}`}>
                      {policy.KieuNgay}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-700 font-semibold">
                        {new Date(policy.TuNgay).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="text-gray-500">đến</span>
                      <span className="text-gray-700 font-semibold">
                        {new Date(policy.DenNgay).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-lg ${getMultiplierColor(policy.HeSo)}`}>
                      ×{policy.HeSo.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 text-xs line-through">
                        {formatCurrency(basePrice)}
                      </span>
                      <span className="text-primary-600 font-extrabold text-base">
                        {formatCurrency(basePrice * policy.HeSo)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`border-2 font-extrabold text-base px-3 py-1 ${getPriorityColor(policy.MucUuTien)}`}>
                      {policy.MucUuTien}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(policy)}
                        className="h-9 px-4 bg-primary-50 border-2 border-primary-300 text-primary-700 font-bold hover:bg-primary-600 hover:text-white hover:border-primary-700 hover:scale-110 transition-all shadow-sm"
                      >
                        <span className="w-4 h-4 mr-1.5">{ICONS.EDIT}</span>
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete?.(policy.MaChinhSach)}
                        className="h-9 px-4 bg-error-50 border-2 border-error-300 text-error-700 font-bold hover:bg-error-600 hover:text-white hover:border-error-700 hover:scale-110 transition-all shadow-sm"
                      >
                        <span className="w-4 h-4 mr-1.5">{ICONS.TRASH}</span>
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
