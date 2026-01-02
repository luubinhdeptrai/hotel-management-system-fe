"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2, 
  Hotel,
  Layers,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Room, RoomStatus } from "@/lib/types/api";

interface RoomTableProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
  isDeleting: string | null;
}

// Status colors and labels mapping
const statusConfig: Record<RoomStatus, { 
  bg: string; 
  text: string; 
  label: string;
  dot: string;
}> = {
  AVAILABLE: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Sẵn sàng",
    dot: "bg-emerald-500",
  },
  OCCUPIED: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Đang sử dụng",
    dot: "bg-red-500",
  },
  RESERVED: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Đã đặt",
    dot: "bg-blue-500",
  },
  CLEANING: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Đang dọn",
    dot: "bg-yellow-500",
  },
  MAINTENANCE: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "Bảo trì",
    dot: "bg-gray-500",
  },
  OUT_OF_SERVICE: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "Ngừng hoạt động",
    dot: "bg-purple-500",
  },
};

export function RoomTable({ rooms, onEdit, onDelete, isDeleting }: RoomTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; room: Room | null }>({
    open: false,
    room: null,
  });

  const handleDeleteClick = (room: Room) => {
    setDeleteDialog({ open: true, room });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.room) {
      onDelete(deleteDialog.room.id);
    }
    setDeleteDialog({ open: false, room: null });
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('vi-VN');
  };

  return (
    <>
      <div className="rounded-xl border-0 overflow-hidden shadow-lg">
        {/* Table Header with Gradient */}
        <div className="bg-linear-to-r from-blue-600 via-cyan-600 to-teal-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <Hotel className="h-5 w-5 text-white" />
            <h3 className="text-lg font-bold text-white">Danh sách phòng</h3>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold text-white">
              {rooms.length} phòng
            </span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="font-bold text-gray-700 w-[140px]">Số phòng</TableHead>
              <TableHead className="font-bold text-gray-700">Loại phòng</TableHead>
              <TableHead className="font-bold text-gray-700 w-[100px] text-center">Tầng</TableHead>
              <TableHead className="font-bold text-gray-700 w-[100px] text-center">Sức chứa</TableHead>
              <TableHead className="font-bold text-gray-700 w-[150px] text-right">Giá/đêm</TableHead>
              <TableHead className="font-bold text-gray-700 w-[160px] text-center">Trạng thái</TableHead>
              <TableHead className="font-bold text-gray-700 w-[100px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Hotel className="h-10 w-10 mb-2 text-gray-300" />
                    <p className="font-medium">Không có phòng nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room, index) => {
                const status = statusConfig[room.status];
                const isDeletingThis = isDeleting === room.id;
                
                return (
                  <TableRow 
                    key={room.id} 
                    className={`
                      transition-colors hover:bg-blue-50/50
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                    `}
                  >
                    {/* Room Number */}
                    <TableCell className="font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                          <Hotel className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-lg">{room.roomNumber}</span>
                      </div>
                    </TableCell>

                    {/* Room Type */}
                    <TableCell>
                      <div className="font-medium text-gray-800">
                        {room.roomType?.name || "Không xác định"}
                      </div>
                      {room.code && (
                        <div className="text-xs text-gray-500 mt-0.5 font-mono">
                          Code: {room.code}
                        </div>
                      )}
                    </TableCell>

                    {/* Floor */}
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <Layers className="h-3.5 w-3.5 text-gray-500" />
                        <span className="font-semibold text-gray-700">{room.floor}</span>
                      </div>
                    </TableCell>

                    {/* Capacity */}
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-50 rounded-lg">
                        <Users className="h-3.5 w-3.5 text-cyan-600" />
                        <span className="font-semibold text-cyan-700">
                          {room.roomType?.capacity || 0}
                        </span>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-right">
                      <span className="font-bold text-blue-600 text-lg">
                        {formatPrice(room.roomType?.pricePerNight || 0)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">VNĐ</span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
                        <div className={`h-2 w-2 rounded-full ${status.dot} animate-pulse`} />
                        <span className={`text-sm font-semibold ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg hover:bg-gray-100"
                            disabled={isDeletingThis}
                          >
                            {isDeletingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : (
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl">
                          <DropdownMenuItem 
                            onClick={() => onEdit(room)} 
                            className="cursor-pointer gap-2"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                            <span>Chỉnh sửa</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(room)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Xóa phòng</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ open, room: deleteDialog.room })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phòng{" "}
              <strong className="text-gray-900">{deleteDialog.room?.roomNumber}</strong>?
              <br />
              <span className="text-red-500 font-medium mt-2 block">
                ⚠️ Hành động này không thể hoàn tác!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa phòng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
