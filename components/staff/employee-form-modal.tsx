"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, User, Lock, Shield, UserCircle } from "lucide-react";
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest, EmployeeRole } from "@/lib/types/api";
import { getEmployeeRole } from "@/lib/utils";

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>;
}

const roleOptions: { value: EmployeeRole; label: string; color: string }[] = [
  { value: "ADMIN", label: "Quản trị viên", color: "text-purple-600" },
  { value: "RECEPTIONIST", label: "Lễ tân", color: "text-blue-600" },
  { value: "HOUSEKEEPING", label: "Phục vụ phòng", color: "text-green-600" },
  { value: "STAFF", label: "Nhân viên", color: "text-gray-600" },
];

export function EmployeeFormModal({
  open,
  onOpenChange,
  employee,
  onSave,
}: EmployeeFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "STAFF" as EmployeeRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (employee) {
      const employeeRole = getEmployeeRole(employee) || "STAFF";
      setFormData({
        name: employee.name,
        username: employee.username,
        password: "", // Never prefill password
        role: employeeRole,
      });
    } else {
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "STAFF",
      });
    }
    setErrors({});
  }, [open, employee]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Tên nhân viên không được để trống";
    } else if (formData.name.length > 100) {
      newErrors.name = "Tên không được vượt quá 100 ký tự";
    }

    // Username validation (only for new employee)
    if (!employee) {
      if (!formData.username.trim()) {
        newErrors.username = "Tên đăng nhập không được để trống";
      } else if (formData.username.length > 50) {
        newErrors.username = "Tên đăng nhập không được vượt quá 50 ký tự";
      } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
        newErrors.username = "Tên đăng nhập chỉ chứa chữ thường, số và dấu gạch dưới";
      }
    }

    // Password validation (only for new employee)
    if (!employee) {
      if (!formData.password) {
        newErrors.password = "Mật khẩu không được để trống";
      } else if (formData.password.length < 8) {
        newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = "Mật khẩu phải chứa cả chữ và số";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (employee) {
        // Update employee (only name and role)
        const updateData: UpdateEmployeeRequest = {
          name: formData.name.trim(),
          role: formData.role,
        };
        await onSave(updateData);
      } else {
        // Create new employee
        const createData: CreateEmployeeRequest = {
          name: formData.name.trim(),
          username: formData.username.trim(),
          password: formData.password,
          role: formData.role,
        };
        await onSave(createData);
      }
      onOpenChange(false);
    } catch (error: any) {
      setErrors({
        submit: error.message || "Có lỗi xảy ra khi lưu nhân viên",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modern Header with Gradient */}
        <DialogHeader className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 -m-6 mb-0 p-8 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <UserCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </DialogTitle>
              <DialogDescription className="text-blue-50 text-base mt-1">
                {employee
                  ? "Cập nhật thông tin nhân viên. Các trường có dấu * là bắt buộc."
                  : "Điền đầy đủ thông tin để tạo tài khoản nhân viên mới. Các trường có dấu * là bắt buộc."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Error Alert */}
          {errors.submit && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Tên nhân viên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên đầy đủ của nhân viên"
              className={`h-12 ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Username Field (Only for new employee) */}
          {!employee && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-blue-600" />
                Tên đăng nhập <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                placeholder="Nhập tên đăng nhập (chữ thường, số, _)"
                className={`h-12 ${errors.username ? "border-red-500 focus:ring-red-500" : ""}`}
                disabled={isSubmitting}
                autoComplete="off"
              />
              {errors.username && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.username}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Tên đăng nhập sẽ được dùng để đăng nhập vào hệ thống. Chỉ chứa chữ thường, số và dấu gạch dưới.
              </p>
            </div>
          )}

          {/* Password Field (Only for new employee) */}
          {!employee && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                className={`h-12 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số.
              </p>
            </div>
          )}

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Vai trò <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as EmployeeRole })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Shield className={`h-4 w-4 ${option.color}`} />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">({option.value})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Vai trò xác định quyền hạn của nhân viên trong hệ thống.
            </p>
          </div>

          {/* Current Info (for editing) */}
          {employee && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-900">Thông tin hiện tại:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">Tên đăng nhập:</p>
                <p className="font-medium text-gray-900">{employee.username}</p>
                <p className="text-gray-600">Vai trò hiện tại:</p>
                <p className="font-medium text-gray-900">
                  {roleOptions.find(r => r.value === employee.role)?.label}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Tên đăng nhập không thể thay đổi. Để đổi mật khẩu, vui lòng dùng chức năng "Đổi mật khẩu".
              </p>
            </div>
          )}

          {/* Form Actions */}
          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-11"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : employee ? (
                "Cập nhật"
              ) : (
                "Tạo nhân viên"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
