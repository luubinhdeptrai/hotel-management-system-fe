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
      <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">
                Mã loại
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Tên loại dịch vụ
              </TableHead>
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
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    {ICONS.INFO}
                    <p className="mt-2">Chưa có loại dịch vụ nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow
                  key={category.categoryID}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="font-medium">
                    {category.categoryID}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {category.categoryName}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>
                    {category.isActive ? (
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
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(category)}
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                      >
                        {ICONS.EDIT}
                        <span className="ml-1">Sửa</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
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
              Bạn có chắc chắn muốn xóa loại dịch vụ{" "}
              <span className="font-semibold">
                {selectedCategory?.categoryName}
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
