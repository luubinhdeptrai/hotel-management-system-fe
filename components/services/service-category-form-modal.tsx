"use client";

import { useState } from "react";
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
import { ICONS } from "@/src/constants/icons.enum";
import { ServiceCategory, ServiceCategoryFormData } from "@/lib/types/service";

interface ServiceCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceCategoryFormData) => void;
  category?: ServiceCategory;
  mode: "create" | "edit";
}

export function ServiceCategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  mode,
}: ServiceCategoryFormModalProps) {
  const initialData: ServiceCategoryFormData =
    category && mode === "edit"
      ? {
          categoryName: category.categoryName,
          description: category.description || "",
        }
      : {
          categoryName: "",
          description: "",
        };

  const [formData, setFormData] =
    useState<ServiceCategoryFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = "Tên loại dịch vụ không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      categoryName: "",
      description: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm loại dịch vụ mới"
              : "Chỉnh sửa loại dịch vụ"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Nhập thông tin loại dịch vụ mới"
              : "Cập nhật thông tin loại dịch vụ"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">
              Tên loại dịch vụ <span className="text-error-600">*</span>
            </Label>
            <Input
              id="categoryName"
              value={formData.categoryName}
              onChange={(e) =>
                setFormData({ ...formData, categoryName: e.target.value })
              }
              placeholder="Ví dụ: Minibar, Giặt ủi, Spa..."
              className={errors.categoryName ? "border-error-600" : ""}
            />
            {errors.categoryName && (
              <p className="text-sm text-error-600">{errors.categoryName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả về loại dịch vụ này..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="mr-2"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-primary-600 hover:bg-primary-500"
            >
              {ICONS.SAVE}
              <span className="ml-2">
                {mode === "create" ? "Thêm mới" : "Cập nhật"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
