"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Hotel, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2,
  Users,
  DoorOpen,
  Layers,
} from "lucide-react";
import type { Room, RoomStatus } from "@/lib/types/api";

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
  isDeleting: boolean;
}

// Status colors mapping
const statusColors: Record<RoomStatus, { 
  bg: string; 
  text: string; 
  badge: string;
  border: string;
  icon: string;
}> = {
  AVAILABLE: {
    bg: "from-emerald-50 to-teal-50",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    border: "border-l-emerald-500",
    icon: "text-emerald-600",
  },
  OCCUPIED: {
    bg: "from-red-50 to-orange-50",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700 border-red-200",
    border: "border-l-red-500",
    icon: "text-red-600",
  },
  RESERVED: {
    bg: "from-blue-50 to-cyan-50",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    border: "border-l-blue-500",
    icon: "text-blue-600",
  },
  CLEANING: {
    bg: "from-yellow-50 to-amber-50",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    border: "border-l-yellow-500",
    icon: "text-yellow-600",
  },
  MAINTENANCE: {
    bg: "from-gray-50 to-slate-50",
    text: "text-gray-700",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    border: "border-l-gray-500",
    icon: "text-gray-600",
  },
  OUT_OF_SERVICE: {
    bg: "from-purple-50 to-pink-50",
    text: "text-purple-700",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    border: "border-l-purple-500",
    icon: "text-purple-600",
  },
};

const statusLabels: Record<RoomStatus, string> = {
  AVAILABLE: "Sẵn sàng",
  OCCUPIED: "Đang sử dụng",
  RESERVED: "Đã đặt",
  CLEANING: "Đang dọn",
  MAINTENANCE: "Bảo trì",
  OUT_OF_SERVICE: "Ngừng hoạt động",
};

export function RoomCard({ room, onEdit, onDelete, isDeleting }: RoomCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(room.id);
    setShowDeleteDialog(false);
  };

  const colors = statusColors[room.status];

  return (
    <>
      <Card className={`group relative overflow-hidden border-0 border-l-4 ${colors.border} bg-linear-to-br ${colors.bg} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
        {/* Decorative blur circles */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/30 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
        
        <div className="relative p-6 space-y-4">
          {/* Header with Room Number & Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div className={`absolute inset-0 ${colors.icon} opacity-20 rounded-xl blur-md`}></div>
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-lg border-2 ${colors.badge.split(' ').find(c => c.startsWith('border-'))}`}>
                  <Hotel className={`h-7 w-7 ${colors.icon}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-2xl ${colors.text} truncate`}>
                  {room.roomNumber}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {room.roomType?.name || "Không xác định"}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/80 hover:shadow-md"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className={`h-4 w-4 animate-spin ${colors.icon}`} />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl">
                <DropdownMenuItem onClick={() => onEdit(room)} className="cursor-pointer">
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

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${colors.badge} font-bold text-sm shadow-sm`}>
              <div className={`h-2 w-2 rounded-full ${colors.icon.replace('text-', 'bg-')} animate-pulse`}></div>
              {statusLabels[room.status]}
            </div>
          </div>

          {/* Room Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 font-medium">Tầng:</span>
              <span className="font-bold text-gray-900">{room.floor}</span>
            </div>
            
            {room.roomType && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Sức chứa:</span>
                  <span className="font-bold text-gray-900">{room.roomType.capacity} người</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <DoorOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Giá:</span>
                  <span className="font-bold text-blue-600">
                    {parseFloat(room.roomType.pricePerNight).toLocaleString('vi-VN')} VNĐ/đêm
                  </span>
                </div>
              </>
            )}

            {room.code && (
              <div className="text-xs text-gray-500 mt-2 font-mono bg-white/60 px-2 py-1 rounded">
                Code: {room.code}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phòng{" "}
              <strong className="text-gray-900">{room.roomNumber}</strong>?
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
              Xóa phòng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
