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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, User, Phone, Mail, CreditCard, MapPin, Lock } from "lucide-react";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/lib/types/api";

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSave: (data: CreateCustomerRequest | UpdateCustomerRequest) => Promise<void>;
}

export function CustomerFormModal({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    password: "",
    email: "",
    idNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (customer) {
      setFormData({
        fullName: customer.fullName,
        phone: customer.phone,
        password: "", // Never prefill password
        email: customer.email || "",
        idNumber: customer.idNumber || "",
        address: customer.address || "",
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        password: "",
        email: "",
        idNumber: "",
        address: "",
      });
    }
    setErrors({});
  }, [open, customer]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = "Họ tên không được vượt quá 100 ký tự";
    }

    // Phone validation (only for new customer)
    if (!customer) {
      if (!formData.phone.trim()) {
        newErrors.phone = "Số điện thoại không được để trống";
      } else if (!/^0\d{9}$/.test(formData.phone.trim())) {
        newErrors.phone = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0";
      }
    }

    // Password validation (only for new customer)
    if (!customer) {
      if (!formData.password) {
        newErrors.password = "Mật khẩu không được để trống";
      } else if (formData.password.length < 8) {
        newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = "Mật khẩu phải chứa cả chữ và số";
      }
    }

    // Email validation (optional)
    if (formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email không đúng định dạng";
      }
    }

    // ID Number validation (optional)
    if (formData.idNumber.trim()) {
      if (!/^\d{9,12}$/.test(formData.idNumber.trim())) {
        newErrors.idNumber = "Số CMND/CCCD phải gồm 9-12 chữ số";
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
      if (customer) {
        // Update customer (cannot change phone)
        const updateData: UpdateCustomerRequest = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim() || undefined,
          idNumber: formData.idNumber.trim() || undefined,
          address: formData.address.trim() || undefined,
        };
        await onSave(updateData);
      } else {
        // Create new customer
        const createData: CreateCustomerRequest = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          email: formData.email.trim() || undefined,
          idNumber: formData.idNumber.trim() || undefined,
          address: formData.address.trim() || undefined,
        };
        await onSave(createData);
      }
      onOpenChange(false);
    } catch (error: any) {
      setErrors({
        submit: error.message || "Có lỗi xảy ra khi lưu khách hàng",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modern Header with Gradient */}
        <DialogHeader className="bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 -m-6 mb-0 p-8 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
              </DialogTitle>
              <DialogDescription className="text-emerald-50 text-base mt-1">
                {customer
                  ? "Cập nhật thông tin khách hàng. Các trường có dấu * là bắt buộc."
                  : "Điền thông tin để tạo tài khoản khách hàng mới. Các trường có dấu * là bắt buộc."}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name Field */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nhập họ tên đầy đủ của khách hàng"
                className={`h-12 ${errors.fullName ? "border-red-500 focus:ring-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone Field (Only for new customer) */}
            {!customer && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại (10 chữ số)"
                  className={`h-12 ${errors.phone ? "border-red-500 focus:ring-red-500" : ""}`}
                  disabled={isSubmitting}
                  maxLength={10}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Số điện thoại sẽ được dùng để đăng nhập vào hệ thống.
                </p>
              </div>
            )}

            {/* Password Field (Only for new customer) */}
            {!customer && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600" />
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

            {/* Email Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Nhập email (tùy chọn)"
                className={`h-12 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* ID Number Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Số CMND/CCCD
              </Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="Nhập số CMND/CCCD (tùy chọn)"
                className={`h-12 ${errors.idNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                disabled={isSubmitting}
                maxLength={12}
              />
              {errors.idNumber && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.idNumber}
                </p>
              )}
            </div>

            {/* Address Field (Optional) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Địa chỉ
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nhập địa chỉ (tùy chọn)"
                className={`min-h-[80px] ${errors.address ? "border-red-500 focus:ring-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address}
                </p>
              )}
            </div>
          </div>

          {/* Current Info (for editing) */}
          {customer && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-emerald-900">Thông tin hiện tại:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">Số điện thoại:</p>
                <p className="font-medium text-gray-900">{customer.phone}</p>
                <p className="text-gray-600">Ngày tạo:</p>
                <p className="font-medium text-gray-900">
                  {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
                </p>
                {customer._count && (
                  <>
                    <p className="text-gray-600">Số lần đặt phòng:</p>
                    <p className="font-medium text-gray-900">{customer._count.bookings} lần</p>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Số điện thoại không thể thay đổi vì dùng để đăng nhập.
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
              className="h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : customer ? (
                "Cập nhật"
              ) : (
                "Tạo khách hàng"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
