"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hotel, AlertCircle, Loader2, DoorOpen, Layers, Tag } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Room, RoomStatus, CreateRoomRequest, UpdateRoomRequest } from "@/lib/types/api";
import { useRoomTypes } from "@/hooks/use-room-types";

interface RoomFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateRoomRequest | UpdateRoomRequest) => Promise<void>;
  editingRoom: Room | null;
}

const roomStatuses: { value: RoomStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Sẵn sàng" },
  { value: "RESERVED", label: "Đã đặt" },
  { value: "OCCUPIED", label: "Đang sử dụng" },
  { value: "CLEANING", label: "Đang dọn" },
  { value: "MAINTENANCE", label: "Bảo trì" },
  { value: "OUT_OF_SERVICE", label: "Ngừng hoạt động" },
];

export function RoomFormModal({
  open,
  onClose,
  onSave,
  editingRoom,
}: RoomFormModalProps) {
  const { roomTypes, loading: loadingRoomTypes } = useRoomTypes();
  
  const [formData, setFormData] = useState({
    roomNumber: "",
    floor: 1,
    code: "",
    roomTypeId: "",
    status: "AVAILABLE" as RoomStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingRoom) {
        setFormData({
          roomNumber: editingRoom.roomNumber,
          floor: editingRoom.floor,
          code: editingRoom.code || "",
          roomTypeId: editingRoom.roomTypeId,
          status: editingRoom.status,
        });
      } else {
        setFormData({
          roomNumber: "",
          floor: 1,
          code: "",
          roomTypeId: roomTypes[0]?.roomTypeID || "",
          status: "AVAILABLE",
        });
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editingRoom, roomTypes]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = "Số phòng là bắt buộc";
    } else if (formData.roomNumber.trim().length > 50) {
      newErrors.roomNumber = "Số phòng không được vượt quá 50 ký tự";
    }

    if (!formData.roomTypeId) {
      newErrors.roomTypeId = "Vui lòng chọn loại phòng";
    }

    if (formData.floor < 1) {
      newErrors.floor = "Tầng phải lớn hơn 0";
    }

    if (formData.code && formData.code.length > 50) {
      newErrors.code = "Mã phòng không được vượt quá 50 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        roomNumber: formData.roomNumber.trim(),
        floor: formData.floor,
        code: formData.code.trim() || undefined,
        roomTypeId: formData.roomTypeId,
        status: formData.status,
      });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu phòng";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative bg-linear-to-br from-blue-600 via-cyan-600 to-teal-600 px-6 py-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Hotel className="h-7 w-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base mt-1">
                {editingRoom
                  ? "Cập nhật thông tin phòng"
                  : "Nhập thông tin để tạo phòng mới"}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {submitError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="roomNumber" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DoorOpen className="h-4 w-4 text-blue-600" />
                Số phòng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="roomNumber"
                placeholder="VD: 101, 201A, P302..."
                value={formData.roomNumber}
                onChange={(e) => handleChange("roomNumber", e.target.value)}
                className={`h-12 ${errors.roomNumber ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200 focus:border-blue-500"}`}
                maxLength={50}
              />
              {errors.roomNumber && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.roomNumber}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.roomNumber.length}/50 ký tự
              </p>
            </div>

            {/* Floor */}
            <div className="space-y-2">
              <Label htmlFor="floor" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Layers className="h-4 w-4 text-blue-600" />
                Tầng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="floor"
                type="number"
                placeholder="Nhập số tầng"
                value={formData.floor}
                onChange={(e) => handleChange("floor", parseInt(e.target.value) || 1)}
                className={`h-12 ${errors.floor ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200 focus:border-blue-500"}`}
                min={1}
              />
              {errors.floor && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.floor}
                </p>
              )}
            </div>

            {/* Code (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="code" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag className="h-4 w-4 text-blue-600" />
                Mã phòng <span className="text-gray-400 text-xs font-normal">(Không bắt buộc)</span>
              </Label>
              <Input
                id="code"
                placeholder="VD: VIP01, EXEC202..."
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className={`h-12 ${errors.code ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200 focus:border-blue-500"}`}
                maxLength={50}
              />
              {errors.code && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.code}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.code.length}/50 ký tự
              </p>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <Label htmlFor="roomType" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Hotel className="h-4 w-4 text-blue-600" />
                Loại phòng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.roomTypeId}
                onValueChange={(value) => handleChange("roomTypeId", value)}
              >
                <SelectTrigger className={`h-12 ${errors.roomTypeId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>
                <SelectContent>
                  {loadingRoomTypes ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      <p className="text-sm mt-2">Đang tải...</p>
                    </div>
                  ) : roomTypes.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">Chưa có loại phòng nào</p>
                    </div>
                  ) : (
                    roomTypes.map((type) => (
                      <SelectItem key={type.roomTypeID} value={type.roomTypeID}>
                        {type.roomTypeName} - {type.price.toLocaleString('vi-VN')} VNĐ/đêm
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.roomTypeId && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.roomTypeId}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Trạng thái
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value as RoomStatus)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="h-12 px-6"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 px-8 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  {editingRoom ? "Cập nhật" : "Thêm phòng"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
