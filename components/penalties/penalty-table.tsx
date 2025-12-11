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
import { PenaltyItem } from "@/lib/types/penalty";

interface PenaltyTableProps {
  penalties: PenaltyItem[];
  onEdit: (penalty: PenaltyItem) => void;
  onDelete: (id: string) => void;
}

export function PenaltyTable({
  penalties,
  onEdit,
  onDelete,
}: PenaltyTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyItem | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleDeleteClick = (penalty: PenaltyItem) => {
    setSelectedPenalty(penalty);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPenalty) {
      onDelete(selectedPenalty.penaltyID);
    }
    setDeleteDialogOpen(false);
    setSelectedPenalty(null);
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

  // Filter penalties
  const filteredPenalties = penalties.filter((penalty) => {
    return (
      penalty.penaltyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      penalty.penaltyID.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã phí phạt..."
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
                Tên phí phạt
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
            {filteredPenalties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    {ICONS.INFO}
                    <p className="mt-2">
                      {searchTerm
                        ? "Không tìm thấy phí phạt nào"
                        : "Chưa có phí phạt nào"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPenalties.map((penalty) => (
                <TableRow key={penalty.penaltyID} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {penalty.penaltyID}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {penalty.penaltyName}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {penalty.isOpenPrice ? (
                      <span className="text-warning-600 italic">
                        Nhập khi post
                      </span>
                    ) : (
                      formatCurrency(penalty.price)
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate">
                    {penalty.description || "-"}
                  </TableCell>
                  <TableCell>
                    {penalty.isActive ? (
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
                    {formatDate(penalty.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(penalty)}
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                      >
                        {ICONS.EDIT}
                        <span className="ml-1">Sửa</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(penalty)}
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
              Bạn có chắc chắn muốn xóa phí phạt{" "}
              <span className="font-semibold">
                {selectedPenalty?.penaltyName}
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
