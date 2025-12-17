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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONS } from "@/src/constants/icons.enum";
import {
  ServiceItem,
  ServiceItemFormData,
  ServiceCategory,
  ServiceGroup,
  SERVICE_GROUP_LABELS,
} from "@/lib/types/service";

interface ServiceItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceItemFormData) => void;
  service?: ServiceItem;
  categories: ServiceCategory[];
  mode: "create" | "edit";
}

export function ServiceItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  service,
  categories,
  mode,
}: ServiceItemFormModalProps) {
  const initialData: ServiceItemFormData =
    service && mode === "edit"
      ? {
          serviceName: service.serviceName,
          categoryID: service.categoryID,
          serviceGroup: service.serviceGroup,
          price: service.price,
          unit: service.unit,
          description: service.description || "",
        }
      : {
          serviceName: "",
          categoryID: "",
          serviceGroup: "F&B" as ServiceGroup,
          price: 0,
          unit: "",
          description: "",
        };

  const [formData, setFormData] = useState<ServiceItemFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = "Tên dịch vụ không được để trống";
    }

    if (!formData.categoryID) {
      newErrors.categoryID = "Vui lòng chọn loại dịch vụ";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Giá dịch vụ phải lớn hơn 0";
    }

    if (!formData.serviceGroup) {
      newErrors.serviceGroup = "Vui lòng chọn nhóm dịch vụ";
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

    onSubmit(formData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      serviceName: "",
      categoryID: "",
      serviceGroup: "F&B" as ServiceGroup,
      price: 0,
      unit: "",
      description: "",
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
      <DialogContent className="max-w-md">
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
            <Label htmlFor="serviceName">
              Tên dịch vụ <span className="text-error-600">*</span>
            </Label>
            <Input
              id="serviceName"
              value={formData.serviceName}
              onChange={(e) =>
                setFormData({ ...formData, serviceName: e.target.value })
              }
              placeholder="Ví dụ: Nước suối, Giặt ủi áo sơ mi..."
              className={errors.serviceName ? "border-error-600" : ""}
            />
            {errors.serviceName && (
              <p className="text-sm text-error-600">{errors.serviceName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryID">
              Loại dịch vụ <span className="text-error-600">*</span>
            </Label>
            <Select
              value={formData.categoryID}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryID: value })
              }
            >
              <SelectTrigger
                className={errors.categoryID ? "border-error-600" : ""}
              >
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((cat) => cat.isActive)
                  .map((category) => (
                    <SelectItem
                      key={category.categoryID}
                      value={category.categoryID}
                    >
                      {category.categoryName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.categoryID && (
              <p className="text-sm text-error-600">{errors.categoryID}</p>
            )}
          </div>

          {/* NEW: Service Group Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="serviceGroup">
              Nhóm dịch vụ <span className="text-error-600">*</span>
            </Label>
            <Select
              value={formData.serviceGroup}
              onValueChange={(value: ServiceGroup) => {
                setFormData({
                  ...formData,
                  serviceGroup: value,
                });
              }}
            >
              <SelectTrigger
                className={errors.serviceGroup ? "border-error-600" : ""}
              >
                <SelectValue placeholder="Chọn nhóm dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SERVICE_GROUP_LABELS) as ServiceGroup[]).map(
                  (group) => (
                    <SelectItem key={group} value={group}>
                      {SERVICE_GROUP_LABELS[group]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.serviceGroup && (
              <p className="text-sm text-error-600">{errors.serviceGroup}</p>
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
                placeholder="chai, gói, cái..."
                className={errors.unit ? "border-error-600" : ""}
              />
              {errors.unit && (
                <p className="text-sm text-error-600">{errors.unit}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả chi tiết về dịch vụ..."
              rows={3}
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
              <div className="w-4 h-4 mr-2 flex items-center justify-center">{ICONS.SAVE}</div>
              <span>
                {mode === "create" ? "Thêm mới" : "Cập nhật"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

