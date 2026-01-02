"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tag, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
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
import { useState } from "react";
import type { RoomTag } from "@/lib/types/api";

interface RoomTagCardProps {
  tag: RoomTag;
  onEdit: (tag: RoomTag) => void;
  onDelete: (tagId: string) => void;
  isDeleting: boolean;
}

export function RoomTagCard({ tag, onEdit, onDelete, isDeleting }: RoomTagCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(tag.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-cyan-50/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
        {/* Gradient Top Border */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Decorative Blur Circles */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-tr from-cyan-200/30 to-teal-200/30 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        
        <div className="relative p-6 space-y-5">
          {/* Header with Icon & Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-cyan-600/40 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 shadow-xl shadow-blue-500/40 group-hover:scale-110 transition-transform duration-300">
                  <Tag className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                  {tag.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <p className="text-xs text-gray-500">
                    {new Date(tag.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 hover:shadow-md hover:text-blue-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    <MoreVertical className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl">
                <DropdownMenuItem onClick={() => onEdit(tag)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <div>
            {tag.description ? (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {tag.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                Chưa có mô tả
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tiện nghi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tiện nghi <strong>{tag.name}</strong>?
              <br />
              <span className="text-red-500 font-medium mt-2 block">
                ⚠️ Hành động này không thể hoàn tác!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
