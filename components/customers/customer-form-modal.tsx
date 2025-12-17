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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CustomerFormData, CustomerRecord } from "@/lib/types/customer";
import { ICONS } from "@/src/constants/icons.enum";

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerRecord | null;
  onSave: (data: CustomerFormData) => Promise<void>;
}

const defaultFormState: CustomerFormData = {
  customerName: "",
  phoneNumber: "",
  email: "",
  identityCard: "",
  address: "",
  nationality: "Việt Nam",
  customerType: "Cá nhân",
  isVip: false,
  notes: "",
};

export function CustomerFormModal({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState<CustomerFormData>(defaultFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      if (customer) {
        setFormData({
          customerName: customer.customerName,
          phoneNumber: customer.phoneNumber,
          email: customer.email,
          identityCard: customer.identityCard,
          address: customer.address,
          nationality: customer.nationality,
          customerType: customer.customerType,
          isVip: customer.isVip,
          notes: customer.notes || "",
        });
      } else {
        setFormData(defaultFormState);
      }
      setErrors({});
    }, 0);
  }, [customer, open]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      nextErrors.customerName = "Họ tên khách hàng không được để trống";
    }

    if (!/^\d{9,12}$/.test(formData.identityCard.trim())) {
      nextErrors.identityCard = "CCCD/Tax phải gồm 9-12 chữ số";
    }

    if (!/^0\d{9}$/.test(formData.phoneNumber.trim())) {
      nextErrors.phoneNumber = "Số điện thoại phải gồm 10 chữ số";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Email không đúng định dạng";
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Địa chỉ không được để trống";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({ ...formData, notes: formData.notes?.trim() || undefined });
    } catch {
      setErrors({ submit: "Không thể lưu khách hàng. Vui lòng thử lại." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof CustomerFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value } as CustomerFormData));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="bg-linear-to-br from-primary-600 to-primary-500 -m-6 mb-0 p-6 rounded-t-xl">
          <DialogTitle className="text-2xl font-bold text-white">
            {customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
          </DialogTitle>
          <DialogDescription className="text-primary-50 text-base">
            Điền đầy đủ thông tin để lưu hồ sơ khách hàng. Các trường có dấu *
            là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {errors.submit && (
            <Alert variant="destructive">
              <div className="flex items-center gap-2">
                {ICONS.ALERT}
                <AlertDescription>{errors.submit}</AlertDescription>
              </div>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-semibold text-gray-700">Họ tên / Tên công ty <span className="text-error-600">*</span></Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className={`h-11 mt-1 ${errors.customerName ? "border-error-600 focus:ring-error-500" : "focus:ring-primary-500"}`}
              />
              {errors.customerName && (
                <p className="text-xs text-error-600 mt-1">
                  {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">Số điện thoại <span className="text-error-600">*</span></Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="090xxxxxxx"
                className={`h-11 mt-1 ${errors.phoneNumber ? "border-error-600 focus:ring-error-500" : "focus:ring-primary-500"}`}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-error-600 mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email <span className="text-error-600">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="customer@domain.com"
                className={`h-11 mt-1 ${errors.email ? "border-error-600 focus:ring-error-500" : "focus:ring-primary-500"}`}
              />
              {errors.email && (
                <p className="text-xs text-error-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="identityCard" className="text-sm font-semibold text-gray-700">CCCD / Mã số thuế <span className="text-error-600">*</span></Label>
              <Input
                id="identityCard"
                value={formData.identityCard}
                onChange={(e) => handleChange("identityCard", e.target.value)}
                placeholder="0790xxxxxxx"
                className={`h-11 mt-1 ${errors.identityCard ? "border-error-600 focus:ring-error-500" : "focus:ring-primary-500"}`}
              />
              {errors.identityCard && (
                <p className="text-xs text-error-600 mt-1 font-medium">
                  {errors.identityCard}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Địa chỉ <span className="text-error-600">*</span></Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Nguyễn Huệ, Q1"
                className={`h-11 mt-1 ${errors.address ? "border-error-600 focus:ring-error-500" : "focus:ring-primary-500"}`}
              />
              {errors.address && (
                <p className="text-xs text-error-600 mt-1 font-medium">{errors.address}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nationality" className="text-sm font-semibold text-gray-700">Quốc tịch <span className="text-error-600">*</span></Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
                className="h-11 mt-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Loại khách <span className="text-error-600">*</span></Label>
              <Select
                value={formData.customerType}
                onValueChange={(value) => handleChange("customerType", value)}
              >
                <SelectTrigger className="h-11 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cá nhân">Cá nhân</SelectItem>
                  <SelectItem value="Doanh nghiệp">Doanh nghiệp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-linear-to-br from-warning-50 to-warning-100/30 rounded-xl p-4 border border-warning-200">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="isVip"
                  checked={formData.isVip}
                  onCheckedChange={(checked) =>
                    handleChange("isVip", Boolean(checked))
                  }
                  className="data-[state=checked]:bg-warning-600 data-[state=checked]:border-warning-600"
                />
                <div>
                  <Label htmlFor="isVip" className="cursor-pointer font-semibold text-gray-900">
                    Đánh dấu khách VIP
                  </Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Khách VIP sẽ nhận ưu đãi và dịch vụ ưu tiên
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Ghi chú ưu tiên, yêu cầu đặc biệt..."
              rows={4}
              className="mt-1 resize-none focus:ring-primary-500"
            />
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 font-medium"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 font-semibold bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg"
            >
              {submitting ? "Đang lưu..." : "Lưu khách hàng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
