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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoomType } from "@/lib/types/room";
import { ICONS } from "@/src/constants/icons.enum";

interface RoomTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomType?: RoomType | null;
  onSave: (roomType: Partial<RoomType>) => Promise<void>;
}

export function RoomTypeFormModal({
  open,
  onOpenChange,
  roomType,
  onSave,
}: RoomTypeFormModalProps) {
  const [formData, setFormData] = useState<{
    roomTypeName: string;
    price: string;
    capacity: string;
    amenities: string;
  }>({
    roomTypeName: "",
    price: "",
    capacity: "",
    amenities: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (roomType) {
      setFormData({
        roomTypeName: roomType.roomTypeName,
        price: roomType.price.toString(),
        capacity: roomType.capacity.toString(),
        amenities: roomType.amenities.join(", "),
      });
    } else {
      setFormData({
        roomTypeName: "",
        price: "",
        capacity: "",
        amenities: "",
      });
    }
    setErrors({});
  }, [open, roomType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomTypeName.trim()) {
      newErrors.roomTypeName = "Tên loại phòng không được để trống";
    }

    const price = parseFloat(formData.price);
    if (!formData.price.trim() || isNaN(price) || price <= 0) {
      newErrors.price = "Giá phải là số dương";
    }

    const capacity = parseInt(formData.capacity);
    if (!formData.capacity.trim() || isNaN(capacity) || capacity <= 0) {
      newErrors.capacity = "Sức chứa phải là số nguyên dương";
    }

    if (!formData.amenities.trim()) {
      newErrors.amenities = "Tiện nghi không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const roomTypeData: Partial<RoomType> = {
        roomTypeName: formData.roomTypeName.trim(),
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        amenities: formData.amenities
          .split(/[,\n]+/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      };

      if (roomType) {
        roomTypeData.roomTypeID = roomType.roomTypeID;
      }

      await onSave(roomTypeData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving room type:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {roomType ? "Chỉnh sửa Loại phòng" : "Thêm Loại phòng mới"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {roomType
              ? "Cập nhật thông tin loại phòng. Nhấn Lưu để hoàn tất."
              : "Nhập thông tin loại phòng mới. Tất cả các trường đều bắt buộc."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Tên loại phòng */}
          <div className="grid gap-2">
            <Label
              htmlFor="roomTypeName"
              className="text-sm font-medium text-gray-700"
            >
              Tên loại phòng <span className="text-error-600">*</span>
            </Label>
            <Input
              id="roomTypeName"
              value={formData.roomTypeName}
              onChange={(e) =>
                setFormData({ ...formData, roomTypeName: e.target.value })
              }
              placeholder="VD: Standard, Deluxe, Suite..."
              className={`h-10 ${
                errors.roomTypeName
                  ? "border-error-600 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-blue-500"
              }`}
            />
            {errors.roomTypeName && (
              <p className="text-xs text-error-600 flex items-center gap-1">
                {errors.roomTypeName}
              </p>
            )}
          </div>

          {/* Giá */}
          <div className="grid gap-2">
            <Label
              htmlFor="price"
              className="text-sm font-medium text-gray-700"
            >
              Giá (VNĐ) <span className="text-error-600">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="VD: 500000"
              className={`h-10 ${
                errors.price
                  ? "border-error-600 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-blue-500"
              }`}
            />
            {errors.price && (
              <p className="text-xs text-error-600 flex items-center gap-1">
                {errors.price}
              </p>
            )}
          </div>

          {/* Sức chứa */}
          <div className="grid gap-2">
            <Label
              htmlFor="capacity"
              className="text-sm font-medium text-gray-700"
            >
              Sức chứa (người) <span className="text-error-600">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              placeholder="VD: 2"
              className={`h-10 ${
                errors.capacity
                  ? "border-error-600 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-blue-500"
              }`}
            />
            {errors.capacity && (
              <p className="text-xs text-error-600 flex items-center gap-1">
                {errors.capacity}
              </p>
            )}
          </div>

          {/* Tiện nghi */}
          <div className="grid gap-2">
            <Label
              htmlFor="amenities"
              className="text-sm font-medium text-gray-700"
            >
              Tiện nghi <span className="text-error-600">*</span>
            </Label>
            <Textarea
              id="amenities"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              placeholder="VD: WiFi, Tivi, Điều hòa, Tủ lạnh\nMinibar, Ban công, Bồn tắm\nPhòng khách riêng"
              rows={3}
              className={`resize-none ${
                errors.amenities
                  ? "border-error-600 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-blue-500"
              }`}
            />
            <p className="text-xs text-gray-500">
              Nhập các tiện nghi cách nhau bằng dấu phẩy hoặc xuống dòng
            </p>
            {errors.amenities && (
              <p className="text-xs text-error-600 flex items-center gap-1">
                {errors.amenities}
              </p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <Alert variant="destructive">
              <span className="w-4 h-4">{ICONS.ALERT}</span>
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-10 px-5 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 px-5 bg-primary-600 text-white hover:bg-primary-500"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
