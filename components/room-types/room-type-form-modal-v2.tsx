"use client";

import { logger } from "@/lib/utils/logger";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RoomType } from "@/hooks/use-room-types";
import type { RoomTag } from "@/lib/types/api";
import { Bed, Users, DollarSign, Tag, AlertCircle } from "lucide-react";

interface RoomTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomType?: RoomType | null;
  roomTags: RoomTag[];
  onSave: (roomType: Partial<RoomType>) => Promise<void>;
}

export function RoomTypeFormModal({
  open,
  onOpenChange,
  roomType,
  roomTags,
  onSave,
}: RoomTypeFormModalProps) {
  const [formData, setFormData] = useState<{
    roomTypeName: string;
    price: string;
    capacity: string;
    totalBed: string;
    selectedTags: string[];
  }>({
    roomTypeName: "",
    price: "",
    capacity: "",
    totalBed: "",
    selectedTags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      if (roomType) {
        setFormData({
          roomTypeName: roomType.roomTypeName,
          price: roomType.price.toString(),
          capacity: roomType.capacity.toString(),
          totalBed: roomType.totalBed.toString(),
          selectedTags: roomType.tags || [],
        });
      } else {
        setFormData({
          roomTypeName: "",
          price: "",
          capacity: "",
          totalBed: "",
          selectedTags: [],
        });
      }
      setErrors({});
    }, 0);
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

    const totalBed = parseInt(formData.totalBed);
    if (!formData.totalBed.trim() || isNaN(totalBed) || totalBed < 0) {
      newErrors.totalBed = "Số giường phải là số nguyên không âm";
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
        totalBed: parseInt(formData.totalBed),
        tags: formData.selectedTags,
      };

      if (roomType) {
        roomTypeData.roomTypeID = roomType.roomTypeID;
      }

      await onSave(roomTypeData);
      onOpenChange(false);
    } catch (error) {
      logger.error("Error saving room type:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary-600" />
            {roomType ? "Chỉnh sửa Loại phòng" : "Thêm Loại phòng mới"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {roomType
              ? "Cập nhật thông tin loại phòng. Nhấn Lưu để hoàn tất."
              : "Nhập thông tin loại phòng mới. Các trường có dấu * là bắt buộc."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Tên loại phòng */}
          <div className="grid gap-2">
            <Label htmlFor="roomTypeName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tên loại phòng <span className="text-error-600">*</span>
            </Label>
            <Input
              id="roomTypeName"
              value={formData.roomTypeName}
              onChange={(e) =>
                setFormData({ ...formData, roomTypeName: e.target.value })
              }
              placeholder="VD: Standard, Deluxe, Suite..."
              className={`h-11 ${
                errors.roomTypeName
                  ? "border-error-600 focus-visible:ring-error-500"
                  : "border-gray-300 focus-visible:ring-primary-500"
              }`}
            />
            {errors.roomTypeName && (
              <p className="text-xs text-error-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.roomTypeName}
              </p>
            )}
          </div>

          {/* Grid 2 cột: Giá và Sức chứa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Giá */}
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Giá (VNĐ/đêm) <span className="text-error-600">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="500000"
                className={`h-11 ${
                  errors.price
                    ? "border-error-600 focus-visible:ring-error-500"
                    : "border-gray-300 focus-visible:ring-primary-500"
                }`}
              />
              {errors.price && (
                <p className="text-xs text-error-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Sức chứa */}
            <div className="grid gap-2">
              <Label htmlFor="capacity" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sức chứa (người) <span className="text-error-600">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                placeholder="2"
                className={`h-11 ${
                  errors.capacity
                    ? "border-error-600 focus-visible:ring-error-500"
                    : "border-gray-300 focus-visible:ring-primary-500"
                }`}
              />
              {errors.capacity && (
                <p className="text-xs text-error-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.capacity}
                </p>
              )}
            </div>
          </div>

          {/* Số giường */}
          <div className="grid gap-2">
            <Label htmlFor="totalBed" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Bed className="w-4 h-4" />
              Số giường <span className="text-error-600">*</span>
            </Label>
            <Input
              id="totalBed"
              type="number"
              value={formData.totalBed}
              onChange={(e) =>
                setFormData({ ...formData, totalBed: e.target.value })
              }
              placeholder="1"
              className={`h-11 ${
                errors.totalBed
                  ? "border-error-600 focus-visible:ring-error-500"
                  : "border-gray-300 focus-visible:ring-primary-500"
              }`}
            />
            {errors.totalBed && (
              <p className="text-xs text-error-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.totalBed}
              </p>
            )}
          </div>

          {/* Tiện nghi / Tags */}
          <div className="grid gap-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tiện nghi
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              {roomTags.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-full text-center py-2">
                  Không có tiện nghi nào. Vui lòng thêm tiện nghi trước.
                </p>
              ) : (
                roomTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={formData.selectedTags.includes(tag.id)}
                      onCheckedChange={() => handleToggleTag(tag.id)}
                      className="border-gray-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="text-sm font-medium text-gray-700 cursor-pointer hover:text-primary-600 transition-colors"
                    >
                      {tag.name}
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500">
              Chọn các tiện nghi có sẵn trong loại phòng này
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white"
          >
            {isSubmitting ? "Đang lưu..." : roomType ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
