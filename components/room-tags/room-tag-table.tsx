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
import { Edit, Trash2, Tag, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RoomTag } from "@/lib/types/api";

interface RoomTagTableProps {
  tags: RoomTag[];
  onEdit: (tag: RoomTag) => void;
  onDelete: (tagId: string) => void;
  isDeleting: string | null;
}

export function RoomTagTable({ tags, onEdit, onDelete, isDeleting }: RoomTagTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<RoomTag | null>(null);

  const handleDeleteClick = (tag: RoomTag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tagToDelete) {
      onDelete(tagToDelete.id);
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl border-0 overflow-hidden shadow-2xl bg-white">
        {/* Enhanced Table Header Background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 h-1"></div>
        
        <Table>
          <TableHeader className="bg-gradient-to-br from-cyan-50 via-blue-50/30 to-teal-50/30">
            <TableRow className="border-b-2 border-blue-100 hover:bg-transparent">
              <TableHead className="w-[70px] py-5">
                <div className="flex items-center justify-center">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                    <Tag className="h-4 w-4 text-white" />
                  </div>
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-800 text-base py-5">
                <div className="flex items-center gap-2">
                  Tên tiện nghi
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell font-bold text-gray-800 text-base py-5">
                <div className="flex items-center gap-2">
                  Mô tả
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell font-bold text-gray-800 text-base py-5">
                <div className="flex items-center gap-2">
                  Ngày tạo
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-400"></div>
                </div>
              </TableHead>
              <TableHead className="text-right w-[140px] font-bold text-gray-800 text-base py-5">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-inner">
                      <Tag className="h-10 w-10 opacity-40" />
                    </div>
                    <p className="text-lg font-semibold text-gray-500">Không tìm thấy tiện nghi nào</p>
                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc thêm tiện nghi mới</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag, index) => (
                <TableRow
                  key={tag.id}
                  className="group hover:bg-gradient-to-r hover:from-blue-50/60 hover:via-cyan-50/40 hover:to-teal-50/60 transition-all duration-200 border-b border-gray-100 last:border-0"
                >
                  <TableCell className="py-5">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200">
                          <Tag className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                        {tag.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="font-mono">#{index + 1}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[400px] py-5">
                    {tag.description ? (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {tag.description}
                      </p>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 italic px-3 py-1 bg-gray-50 rounded-lg">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                        Chưa có mô tả
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                      <span className="text-sm font-semibold text-gray-700">
                        {new Date(tag.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(tag)}
                        className="h-10 w-10 rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200"
                        disabled={isDeleting === tag.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(tag)}
                        className="h-10 w-10 rounded-lg hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:shadow-md transition-all duration-200 border border-transparent hover:border-red-200"
                        disabled={isDeleting === tag.id}
                      >
                        {isDeleting === tag.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tiện nghi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tiện nghi{" "}
              <strong>{tagToDelete?.name}</strong>?
              <br />
              <span className="text-red-500 font-medium mt-2 block">
                ⚠️ Hành động này không thể hoàn tác!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa tiện nghi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
