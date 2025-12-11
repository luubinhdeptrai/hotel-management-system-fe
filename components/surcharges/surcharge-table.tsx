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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICONS } from "@/src/constants/icons.enum";
import { SurchargeItem } from "@/lib/types/surcharge";

interface SurchargeTableProps {
  surcharges: SurchargeItem[];
  onEdit: (surcharge: SurchargeItem) => void;
  onDelete: (id: string) => void;
}

export function SurchargeTable({
  surcharges,
  onEdit,
  onDelete,
}: SurchargeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSurcharge, setSelectedSurcharge] =
    useState<SurchargeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDeleteClick = (surcharge: SurchargeItem) => {
    setSelectedSurcharge(surcharge);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSurcharge) {
      onDelete(selectedSurcharge.surchargeID);
    }
    setDeleteDialogOpen(false);
    setSelectedSurcharge(null);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Filter surcharges
  const filteredSurcharges = surcharges.filter((surcharge) => {
    return (
      surcharge.surchargeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      surcharge.surchargeID.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã phụ thu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Mã</TableHead>
              <TableHead className="font-semibold text-gray-900">
                Tên phụ thu
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Giá</TableHead>
              <TableHead className="font-semibold text-gray-900">
                Mô tả
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Ngày tạo
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-900">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSurcharges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    {ICONS.INFO}
                    <p className="mt-2">
                      {searchTerm
                        ? "Không tìm thấy phụ thu nào"
                        : "Chưa có phụ thu nào"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSurcharges.map((surcharge) => (
                <TableRow
                  key={surcharge.surchargeID}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="font-medium">
                    {surcharge.surchargeID}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {surcharge.surchargeName}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {surcharge.isOpenPrice ? (
                      <span className="text-warning-600 italic">
                        Nhập khi post
                      </span>
                    ) : (
                      formatCurrency(surcharge.price)
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate">
                    {surcharge.description || "-"}
                  </TableCell>
                  <TableCell>
                    {surcharge.isActive ? (
                      <Badge className="bg-success-100 text-success-700 hover:bg-success-100">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        Ngừng hoạt động
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {formatDate(surcharge.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(surcharge)}
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                      >
                        {ICONS.EDIT}
                        <span className="ml-1">Sửa</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(surcharge)}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        {ICONS.TRASH}
                        <span className="ml-1">Xóa</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phụ thu{" "}
              <span className="font-semibold">
                {selectedSurcharge?.surchargeName}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-error-600 hover:bg-error-700"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
