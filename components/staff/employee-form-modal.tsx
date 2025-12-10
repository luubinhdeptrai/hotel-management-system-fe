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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Employee, EmployeeFormData } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: EmployeeFormData) => Promise<void>;
}

export function EmployeeFormModal({
  open,
  onOpenChange,
  employee,
  onSave,
}: EmployeeFormModalProps) {
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
    position: string;
    dateOfBirth: string;
    address: string;
    identityCard: string;
    startDate: string;
  }>({
    fullName: "",
    email: "",
    phoneNumber: "",
    position: "",
    dateOfBirth: "",
    address: "",
    identityCard: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (employee) {
      setFormData({
        fullName: employee.fullName,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        position: employee.position,
        dateOfBirth: employee.dateOfBirth
          ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: employee.address || "",
        identityCard: employee.identityCard || "",
        startDate: new Date(employee.startDate).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        position: "",
        dateOfBirth: "",
        address: "",
        identityCard: "",
        startDate: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [open, employee]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Chức vụ không được để trống";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu không được để trống";
    }

    // Optional fields validation
    if (
      formData.identityCard &&
      !/^[0-9]{9,12}$/.test(formData.identityCard.replace(/\s/g, ""))
    ) {
      newErrors.identityCard = "Số CCCD/CMND không hợp lệ (9-12 chữ số)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const employeeData: EmployeeFormData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        position: formData.position.trim(),
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth)
          : undefined,
        address: formData.address.trim() || undefined,
        identityCard: formData.identityCard.trim() || undefined,
        startDate: new Date(formData.startDate),
      };

      await onSave(employeeData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      setErrors({
        submit: "Có lỗi xảy ra khi lưu thông tin nhân viên",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Chỉnh sửa thông tin nhân viên" : "Thêm nhân viên mới"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Cập nhật thông tin nhân viên. Nhấn Lưu khi hoàn tất."
              : "Nhập đầy đủ thông tin nhân viên mới. Các trường có dấu * là bắt buộc."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <Alert variant="destructive">
              <div className="flex items-center gap-2">
                {ICONS.ALERT}
                <AlertDescription>{errors.submit}</AlertDescription>
              </div>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="col-span-2">
              <Label htmlFor="fullName" className="required">
                Họ và tên *
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Nguyễn Văn A"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="nguyenvana@hotel.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber">Số điện thoại *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="0901234567"
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Position */}
            <div>
              <Label htmlFor="position">Chức vụ *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                placeholder="Nhân viên Lễ tân"
                className={errors.position ? "border-red-500" : ""}
              />
              {errors.position && (
                <p className="text-xs text-red-500 mt-1">{errors.position}</p>
              )}
            </div>

            {/* Identity Card */}
            <div>
              <Label htmlFor="identityCard">Số CCCD/CMND</Label>
              <Input
                id="identityCard"
                value={formData.identityCard}
                onChange={(e) => handleChange("identityCard", e.target.value)}
                placeholder="079095001234"
                className={errors.identityCard ? "border-red-500" : ""}
              />
              {errors.identityCard && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.identityCard}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <Label htmlFor="startDate">Ngày bắt đầu làm việc *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* Address */}
            <div className="col-span-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Nguyễn Huệ, Q1, TP.HCM"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
