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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Employee, AccountFormData, EmployeeRole } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";

interface AccountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onSave: (employeeId: string, accountData: AccountFormData) => Promise<void>;
}

const roles: { value: EmployeeRole; label: string }[] = [
  { value: "Admin", label: "Admin" },
  { value: "Quản lý", label: "Quản lý" },
  { value: "Lễ tân", label: "Lễ tân" },
  { value: "Phục vụ", label: "Phục vụ" },
];

export function AccountFormModal({
  open,
  onOpenChange,
  employee,
  onSave,
}: AccountFormModalProps) {
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    confirmPassword: string;
    role: EmployeeRole;
  }>({
    username: "",
    password: "",
    confirmPassword: "",
    role: "Lễ tân",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        role: "Lễ tân",
      });
      setErrors({});
    }, 0);
  }, [open, employee]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    } else if (formData.username.length < 4) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 4 ký tự";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      newErrors.password =
        "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Vui lòng chọn vai trò";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const accountData: AccountFormData = {
        username: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      };

      await onSave(employee.employeeId, accountData);
      onOpenChange(false);
    } catch (error) {
      logger.error("Error creating account:", error);
      setErrors({
        submit: "Có lỗi xảy ra khi tạo tài khoản",
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
      <DialogContent className="max-w-md">
        {/* Gradient Header */}
        <div className="bg-linear-to-br from-info-600 to-info-500 -m-6 mb-0 p-6 rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Tạo tài khoản đăng nhập</DialogTitle>
            <DialogDescription className="text-white/90">
              Tạo tài khoản đăng nhập cho nhân viên{" "}
              <span className="font-semibold">{employee.fullName}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
          {errors.submit && (
            <Alert variant="destructive">
              <div className="flex items-center gap-2">
                {ICONS.ALERT}
                <AlertDescription>{errors.submit}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Employee Info */}
          <div className="p-4 bg-linear-to-r from-info-50 to-info-100/30 rounded-xl border border-info-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">Mã nhân viên:</span>
              <span className="font-semibold text-gray-900">{employee.employeeId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">Chức vụ:</span>
              <span className="font-semibold text-gray-900">{employee.position}</span>
            </div>
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="username" className="text-gray-700 font-semibold">
              Tên đăng nhập *
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="username"
              className={`h-11 mt-1.5 ${
                errors.username ? "border-error-500 focus:ring-error-500" : "focus:ring-info-500"
              }`}
            />
            {errors.username && (
              <p className="text-xs text-error-600 mt-1.5 font-medium">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-gray-700 font-semibold">
              Mật khẩu *
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="********"
                className={`h-11 pr-11 ${
                  errors.password ? "border-error-500 focus:ring-error-500" : "focus:ring-info-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors w-5 h-5"
              >
                {showPassword ? ICONS.EYE_OFF : ICONS.EYE}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error-600 mt-1.5 font-medium">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1.5">
              Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số
              và ký tự đặc biệt
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">
              Xác nhận mật khẩu *
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                placeholder="********"
                className={`h-11 pr-11 ${
                  errors.confirmPassword ? "border-error-500 focus:ring-error-500" : "focus:ring-info-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors w-5 h-5"
              >
                {showConfirmPassword ? ICONS.EYE_OFF : ICONS.EYE}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error-600 mt-1.5 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" className="text-gray-700 font-semibold">
              Vai trò *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value)}
            >
              <SelectTrigger
                id="role"
                className={`h-11 mt-1.5 ${
                  errors.role ? "border-error-500 focus:ring-error-500" : "focus:ring-info-500"
                }`}
              >
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-error-600 mt-1.5 font-medium">{errors.role}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4">
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
              className="bg-linear-to-r from-info-500 to-info-600 hover:from-info-600 hover:to-info-700 text-white h-11 px-6 font-semibold shadow-md"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
