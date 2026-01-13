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
import { ICONS } from "@/src/constants/icons.enum";
import type { Service } from "@/lib/types/api";
import ImageUpload from "@/components/ImageUpload";
import LocalImageUpload from "@/components/LocalImageUpload";

interface ServiceFormData {
  name: string;
  price: number;
  unit: string;
  isActive: boolean;
}

interface ServiceItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData, files?: File[]) => void;
  service?: Service;
  mode: "create" | "edit";
}

export function ServiceItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  service,
  mode,
}: ServiceItemFormModalProps) {
  const initialData: ServiceFormData =
    service && mode === "edit"
      ? {
          name: service.name,
          price: service.price,
          unit: service.unit,
          isActive: service.isActive,
        }
      : {
          name: "",
          price: 0,
          unit: "lần",
          isActive: true,
        };

  const [formData, setFormData] = useState<ServiceFormData>(initialData);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data when modal opens or service changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setSelectedFiles([]); // Reset files on open
        if (service && mode === "edit") {
          setFormData({
            name: service.name,
            price: service.price,
            unit: service.unit,
            isActive: service.isActive,
          });
        } else {
          setFormData({
            name: "",
            price: 0,
            unit: "lần",
            isActive: true,
          });
        }
        setErrors({});
      }, 0);
    }
  }, [isOpen, service, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên dịch vụ không được để trống";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Giá dịch vụ phải lớn hơn 0";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Đơn vị tính không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData, selectedFiles);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      price: 0,
      unit: "lần",
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === "create" ? "Thêm dịch vụ mới" : "Chỉnh sửa dịch vụ"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === "create"
              ? "Nhập thông tin dịch vụ mới"
              : "Cập nhật thông tin dịch vụ"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên dịch vụ <span className="text-error-600">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ví dụ: Nước suối, Giặt ủi áo sơ mi..."
              className={errors.name ? "border-error-600" : ""}
            />
            {errors.name && (
              <p className="text-sm text-error-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Giá <span className="text-error-600">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Number(e.target.value),
                  })
                }
                placeholder="0"
                min="0"
                step="1000"
                className={errors.price ? "border-error-600" : ""}
              />
              {errors.price && (
                <p className="text-sm text-error-600">{errors.price}</p>
              )}
              {formData.price > 0 && (
                <p className="text-xs text-gray-500">
                  {formatCurrency(formData.price)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Đơn vị <span className="text-error-600">*</span>
              </Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="lần, chai, gói..."
                className={errors.unit ? "border-error-600" : ""}
              />
              {errors.unit && (
                <p className="text-sm text-error-600">{errors.unit}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>Kích hoạt dịch vụ</span>
              </div>
            </Label>
          </div>

          {/* Image Management - Show upload component when editing */}
          {service?.id && mode === "edit" && (
            <div className="space-y-2 mb-4">
              <Label>Hình ảnh hiện có</Label>
              <ImageUpload
                entityType="service"
                entityId={service.id}
                disableUpload={true}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {mode === "create" ? "Hình ảnh" : "Thêm ảnh mới"}
              <span className="text-xs text-gray-500 font-normal">
                (sẽ upload sau khi lưu)
              </span>
            </Label>
            <LocalImageUpload
              files={selectedFiles}
              onFilesChange={setSelectedFiles}
            />
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-11 px-6 border-2 font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 font-bold shadow-lg"
            >
              <div className="w-4 h-4 mr-2 flex items-center justify-center">
                {ICONS.SAVE}
              </div>
              <span>{mode === "create" ? "Thêm mới" : "Cập nhật"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
