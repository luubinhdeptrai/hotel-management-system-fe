"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Home, Layers, Tag as TagIcon } from "lucide-react";
import type { Room as ApiRoom, RoomType as ApiRoomType, RoomStatus } from "@/lib/types/api";

interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: ApiRoom | null;
  roomTypes: ApiRoomType[];
  onSave: (room: Partial<ApiRoom>) => void;
}

const ROOM_STATUS_OPTIONS: { value: RoomStatus; label: string; color: string }[] = [
  { value: "AVAILABLE", label: "Sẵn sàng", color: "text-green-600" },
  { value: "RESERVED", label: "Đã đặt", color: "text-blue-600" },
  { value: "OCCUPIED", label: "Đang sử dụng", color: "text-orange-600" },
  { value: "CLEANING", label: "Đang dọn dẹp", color: "text-yellow-600" },
  { value: "MAINTENANCE", label: "Bảo trì", color: "text-red-600" },
  { value: "OUT_OF_SERVICE", label: "Ngừng hoạt động", color: "text-gray-600" },
];

export function RoomFormModalV2({
  open,
  onOpenChange,
  room,
  roomTypes,
  onSave,
}: RoomFormModalProps) {
  const [formData, setFormData] = useState<{
    roomNumber: string;
    floor: number;
    code: string;
    roomTypeId: string;
    status: RoomStatus;
  }>({
    roomNumber: "",
    floor: 1,
    code: "",
    roomTypeId: "",
    status: "AVAILABLE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      if (room) {
        setFormData({
          roomNumber: room.roomNumber,
          floor: room.floor,
          code: room.code || "",
          roomTypeId: room.roomTypeId,
          status: room.status,
        });
      } else {
        setFormData({
          roomNumber: "",
          floor: 1,
          code: "",
          roomTypeId: roomTypes[0]?.id || "",
          status: "AVAILABLE",
        });
      }
      setErrors({});
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = "Số phòng không được để trống";
    }
    if (!formData.roomTypeId) {
      newErrors.roomTypeId = "Vui lòng chọn loại phòng";
    }
    if (formData.floor < 1) {
      newErrors.floor = "Tầng phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const roomData: Partial<ApiRoom> = {
      roomNumber: formData.roomNumber.trim(),
      floor: formData.floor,
      code: formData.code.trim(),
      roomTypeId: formData.roomTypeId,
      status: formData.status,
    };

    if (room) {
      roomData.id = room.id;
    }

    onSave(roomData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary-600" />
            {room ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {room ? "Cập nhật thông tin phòng" : "Nhập thông tin cho phòng mới"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Số phòng và Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Số phòng */}
            <div className="space-y-2">
              <Label htmlFor="roomNumber" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Số phòng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="roomNumber"
                placeholder="Ví dụ: 101, 201A"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
                disabled={!!room}
                className={`h-11 ${errors.roomNumber ? "border-red-500" : ""}`}
              />
              {errors.roomNumber && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.roomNumber}
                </p>
              )}
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Mã phòng
              </Label>
              <Input
                id="code"
                placeholder="Ví dụ: R101"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="h-11"
              />
            </div>
          </div>

          {/* Tầng và Loại phòng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tầng */}
            <div className="space-y-2">
              <Label htmlFor="floor" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Tầng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="floor"
                type="number"
                min="1"
                placeholder="1"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })
                }
                className={`h-11 ${errors.floor ? "border-red-500" : ""}`}
              />
              {errors.floor && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.floor}
                </p>
              )}
            </div>

            {/* Loại phòng */}
            <div className="space-y-2">
              <Label htmlFor="roomTypeId" className="text-sm font-medium text-gray-700">
                Loại phòng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.roomTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, roomTypeId: value })
                }
              >
                <SelectTrigger className={`h-11 ${errors.roomTypeId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name} - {parseInt(rt.pricePerNight).toLocaleString("vi-VN")}đ
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomTypeId && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.roomTypeId}
                </p>
              )}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Trạng thái
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: RoomStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={`font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white"
          >
            {room ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
