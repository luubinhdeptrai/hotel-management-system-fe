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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICONS } from "@/src/constants/icons.enum";
import { ServiceCategory } from "@/lib/types/service";

interface ServiceCategoryTableProps {
  categories: ServiceCategory[];
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
}

export function ServiceCategoryTable({
  categories,
  onEdit,
  onDelete,
}: ServiceCategoryTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);

  const handleDeleteClick = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      onDelete(selectedCategory.categoryID);
    }
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <>
      <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-600 hover:to-blue-500">
              <TableHead className="font-bold text-white text-base h-14">
                Mã loại
              </TableHead>
              <TableHead className="font-bold text-white text-base">
                Tên loại dịch vụ
              </TableHead>
              <TableHead className="font-bold text-white text-base">
                Mô tả
              </TableHead>
              <TableHead className="font-bold text-white text-base">
                Trạng thái
              </TableHead>
              <TableHead className="font-bold text-white text-base">
                Ngày tạo
              </TableHead>
              <TableHead className="text-right font-bold text-white text-base">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-50 rounded-full">
                      <div className="w-10 h-10 text-gray-400 flex items-center justify-center">{ICONS.INFO}</div>
                    </div>
                    <p className="text-lg font-bold text-gray-700">Chưa có loại dịch vụ nào</p>
                    <p className="text-sm text-gray-500 mt-1">Thêm loại dịch vụ mới để bắt đầu</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow
                  key={category.categoryID}
                  className="hover:bg-blue-50 transition-colors border-b border-gray-200"
                >
                  <TableCell className="font-bold text-blue-600 py-4">
                    {category.categoryID}
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 text-base">
                    {category.categoryName}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>
                    {category.isActive ? (
                      <Badge className="bg-linear-to-r from-success-600 to-success-500 text-white hover:from-success-500 hover:to-success-600 font-bold shadow-sm">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge className="bg-linear-to-r from-gray-500 to-gray-400 text-white hover:from-gray-400 hover:to-gray-500 font-bold shadow-sm">
                        Ngừng hoạt động
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700 font-medium">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(category)}
                        className="h-9 px-4 text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 font-bold transition-all"
                      >
                        <div className="w-4 h-4 mr-1.5 flex items-center justify-center">{ICONS.EDIT}</div>
                        <span>Sửa</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
                        className="h-9 px-4 text-error-600 border-2 border-error-200 hover:bg-error-50 hover:border-error-400 font-bold transition-all"
                      >
                        <div className="w-4 h-4 mr-1.5 flex items-center justify-center">{ICONS.TRASH}</div>
                        <span>Xóa</span>
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
            <DialogTitle className="text-xl font-bold">Xác nhận xóa loại dịch vụ</DialogTitle>
            <DialogDescription className="text-base">
              Bạn có chắc chắn muốn xóa loại dịch vụ{" "}
              <span className="font-bold text-blue-600">
                {selectedCategory?.categoryName}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <div className="p-4 bg-linear-to-br from-red-50 to-white rounded-xl border-2 border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-linear-to-br from-red-100 to-red-50 rounded-full shrink-0">
                  <div className="w-6 h-6 text-red-500 flex items-center justify-center">{ICONS.PENALTY}</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Cảnh báo</p>
                  <p className="text-xs text-gray-600 mt-0.5">Dữ liệu sẽ bị xóa vĩnh viễn</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-11 px-6 border-2 font-bold"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="h-11 px-6 bg-linear-to-r from-error-600 to-error-500 hover:from-error-500 hover:to-error-600 font-bold shadow-lg"
            >
              Xóa loại dịch vụ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

