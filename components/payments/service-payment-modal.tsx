"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ICONS } from "@/src/constants/icons.enum";
import type { ServiceUsageResponse } from "@/lib/types/checkin-checkout";
import type { PaymentMethod } from "@/lib/types/api";
import { PAYMENT_METHOD_LABELS } from "@/lib/types/api";

interface ServicePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceUsage: ServiceUsageResponse | null;
  bookingId?: string; // Present for Scenario 3, absent for Scenario 4
  onConfirm: (data: ServicePaymentData) => void;
}

export interface ServicePaymentData {
  serviceUsageId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  description?: string;
  promotions?: Array<{
    customerPromotionId: string;
    serviceUsageId: string;
  }>;
}

export function ServicePaymentModal({
  open,
  onOpenChange,
  serviceUsage,
  bookingId,
  onConfirm,
}: ServicePaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod | undefined>(undefined);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const isGuestService = !bookingId;
  const balance = useMemo(
    () => serviceUsage?.balance ?? 0,
    [serviceUsage]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleConfirm = async () => {
    if (!method || !serviceUsage || !amount) return;

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0 || paymentAmount > balance) {
      alert(`Số tiền phải từ 0 đến ${formatCurrency(balance)}`);
      return;
    }

    setIsConfirming(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsConfirming(false);
    setIsConfirmed(true);

    onConfirm({
      serviceUsageId: serviceUsage.id,
      paymentMethod: method,
      amount: paymentAmount,
      description: description || undefined,
    });
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handlePayFull = () => {
    setAmount(balance.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={open ? serviceUsage?.id ?? "service-payment" : "closed"}
        className="sm:max-w-[600px] bg-white"
        aria-description="Thanh toán dịch vụ"
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">
            {isGuestService ? "Thanh toán dịch vụ khách lẻ" : "Thanh toán dịch vụ"}
          </DialogTitle>
        </DialogHeader>

        {!serviceUsage ? (
          <div className="text-sm text-gray-500">
            Không có dữ liệu dịch vụ.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Service Info */}
            <div className="rounded-md bg-blue-50 p-4 border-2 border-blue-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Tên dịch vụ</span>
                  <span className="font-medium text-blue-900">
                    {serviceUsage.service?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Số lượng</span>
                  <span className="font-medium text-blue-900">
                    {serviceUsage.quantity} {serviceUsage.service?.unit || ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Đơn giá</span>
                  <span className="font-medium text-blue-900">
                    {formatCurrency(serviceUsage.unitPrice)}
                  </span>
                </div>
                <Separator className="bg-blue-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Tổng tiền</span>
                  <span className="font-bold text-blue-900">
                    {formatCurrency(serviceUsage.totalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Đã thanh toán</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(serviceUsage.totalPaid)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700">Còn lại</span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Số tiền thanh toán
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="h-10"
                />
                <Button
                  type="button"
                  onClick={handlePayFull}
                  variant="outline"
                  className="h-10 whitespace-nowrap"
                >
                  Toàn bộ
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Có thể thanh toán một phần hoặc toàn bộ số tiền còn lại
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Phương thức thanh toán
              </Label>
              <Select
                value={method}
                onValueChange={(v: PaymentMethod) => setMethod(v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">{PAYMENT_METHOD_LABELS.CASH}</SelectItem>
                  <SelectItem value="CREDIT_CARD">{PAYMENT_METHOD_LABELS.CREDIT_CARD}</SelectItem>
                  <SelectItem value="BANK_TRANSFER">{PAYMENT_METHOD_LABELS.BANK_TRANSFER}</SelectItem>
                  <SelectItem value="E_WALLET">{PAYMENT_METHOD_LABELS.E_WALLET}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Ghi chú (tùy chọn)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập ghi chú về giao dịch..."
                className="min-h-[60px]"
              />
            </div>

            <Separator />

            <div className="text-xs text-gray-500">
              {isGuestService ? (
                <p>
                  Thanh toán dịch vụ khách lẻ sẽ tạo TransactionDetail độc lập (không có Transaction entity).
                </p>
              ) : (
                <p>
                  Thanh toán dịch vụ trong booking sẽ cập nhật số tiền đã trả và có thể áp dụng khuyến mãi.
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="h-9"
            onClick={() => onOpenChange(false)}
          >
            {ICONS.CLOSE}
            <span className="ml-1">Đóng</span>
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!method || !amount || isConfirming || !serviceUsage}
            className="h-9 bg-primary-600 hover:bg-primary-500 text-white"
          >
            {ICONS.CREDIT_CARD}
            <span className="ml-2">
              {isConfirming
                ? "Đang xử lý..."
                : isConfirmed
                ? "Đã thanh toán"
                : "Xác nhận Thanh toán"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
