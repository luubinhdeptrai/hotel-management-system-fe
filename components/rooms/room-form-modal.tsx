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
import { Room, RoomType, RoomStatus } from "@/lib/types/room";

interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  roomTypes: RoomType[];
  onSave: (room: Partial<Room>) => void;
}

export function RoomFormModal({
  open,
  onOpenChange,
  room,
  roomTypes,
  onSave,
}: RoomFormModalProps) {
  const [formData, setFormData] = useState<{
    roomID: string;
    roomName: string;
    roomTypeID: string;
    roomStatus: RoomStatus;
    floor: number;
  }>({
    roomID: "",
    roomName: "",
    roomTypeID: "",
    roomStatus: "Sẵn sàng",
    floor: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      if (room) {
        setFormData({
          roomID: room.roomID,
          roomName: room.roomName,
          roomTypeID: room.roomTypeID,
          roomStatus: room.roomStatus,
          floor: room.floor,
        });
      } else {
        setFormData({
          roomID: "",
          roomName: "",
          roomTypeID: roomTypes[0]?.roomTypeID || "",
          roomStatus: "Sẵn sàng",
          floor: 1,
        });
      }
      setErrors({});
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomID.trim()) {
      newErrors.roomID = "Mã phòng không được để trống";
    }
    if (!formData.roomName.trim()) {
      newErrors.roomName = "Tên phòng không được để trống";
    }
    if (!formData.roomTypeID) {
      newErrors.roomTypeID = "Vui lòng chọn loại phòng";
    }
    if (formData.floor < 1) {
      newErrors.floor = "Tầng phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const selectedRoomType = roomTypes.find(
      (rt) => rt.roomTypeID === formData.roomTypeID
    );

    if (!selectedRoomType) return;

    const roomData: Partial<Room> = {
      roomID: formData.roomID,
      roomName: formData.roomName,
      roomTypeID: formData.roomTypeID,
      roomType: selectedRoomType,
      roomStatus: formData.roomStatus,
      floor: formData.floor,
    };

    onSave(roomData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {room ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {room ? "Cập nhật thông tin phòng" : "Nhập thông tin cho phòng mới"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Room Code */}
          <div className="space-y-2">
            <Label
              htmlFor="roomID"
              className="text-sm font-medium text-gray-700"
            >
              Mã phòng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roomID"
              placeholder="Ví dụ: 101, 201A"
              value={formData.roomID}
              onChange={(e) =>
                setFormData({ ...formData, roomID: e.target.value })
              }
              disabled={!!room}
              className={errors.roomID ? "border-red-500" : ""}
            />
            {errors.roomID && (
              <p className="text-xs text-red-500">{errors.roomID}</p>
            )}
          </div>

          {/* Room Name */}
          <div className="space-y-2">
            <Label
              htmlFor="roomName"
              className="text-sm font-medium text-gray-700"
            >
              Tên phòng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roomName"
              placeholder="Ví dụ: Phòng 101"
              value={formData.roomName}
              onChange={(e) =>
                setFormData({ ...formData, roomName: e.target.value })
              }
              className={errors.roomName ? "border-red-500" : ""}
            />
            {errors.roomName && (
              <p className="text-xs text-red-500">{errors.roomName}</p>
            )}
          </div>

          {/* Room Type */}
          <div className="space-y-2">
            <Label
              htmlFor="roomTypeID"
              className="text-sm font-medium text-gray-700"
            >
              Loại phòng <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.roomTypeID}
              onValueChange={(value) =>
                setFormData({ ...formData, roomTypeID: value })
              }
            >
              <SelectTrigger
                className={errors.roomTypeID ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type.roomTypeID} value={type.roomTypeID}>
                    {type.roomTypeName} -{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(type.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomTypeID && (
              <p className="text-xs text-red-500">{errors.roomTypeID}</p>
            )}
          </div>

          {/* Floor */}
          <div className="space-y-2">
            <Label
              htmlFor="floor"
              className="text-sm font-medium text-gray-700"
            >
              Tầng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="floor"
              type="number"
              min="1"
              value={formData.floor}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  floor: parseInt(e.target.value) || 1,
                })
              }
              className={errors.floor ? "border-red-500" : ""}
            />
            {errors.floor && (
              <p className="text-xs text-red-500">{errors.floor}</p>
            )}
          </div>

          {/* Status (only for edit mode) */}
          {room && (
            <div className="space-y-2">
              <Label
                htmlFor="roomStatus"
                className="text-sm font-medium text-gray-700"
              >
                Trạng thái
              </Label>
              <Select
                value={formData.roomStatus}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    roomStatus: value as RoomStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sẵn sàng">Sẵn sàng</SelectItem>
                  <SelectItem value="Đang thuê">Đang thuê</SelectItem>
                  <SelectItem value="Bẩn">Bẩn</SelectItem>
                  <SelectItem value="Đang dọn">Đang dọn</SelectItem>
                  <SelectItem value="Đang kiểm tra">Đang kiểm tra</SelectItem>
                  <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                  <SelectItem value="Đã đặt">Đã đặt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary-600 hover:bg-primary-500"
          >
            {room ? "Cập nhật" : "Thêm phòng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
