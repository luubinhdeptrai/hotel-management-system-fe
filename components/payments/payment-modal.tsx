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
import { Separator } from "@/components/ui/separator";
import { ICONS } from "@/src/constants/icons.enum";
import type { CheckoutSummary } from "@/lib/types/checkin-checkout";
import type { PaymentMethod } from "@/lib/types/payment";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: CheckoutSummary | null;
  onConfirm: (method: PaymentMethod) => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  summary,
  onConfirm,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod | undefined>(undefined);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Local state resets automatically because DialogContent is keyed below

  const total = useMemo(() => summary?.grandTotal ?? 0, [summary]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleConfirm = async () => {
    if (!method || !summary) return;
    setIsConfirming(true);
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 600));
    setIsConfirming(false);
    setIsConfirmed(true);
    onConfirm(method);
  };

  const handlePrint = () => {
    if (!summary) return;
    const url = `/payments/print?receiptID=${encodeURIComponent(
      summary.receiptID
    )}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={open ? summary?.receiptID ?? "payment" : "closed"}
        className="sm:max-w-[600px] bg-white"
        aria-description="Xác nhận thanh toán và in hóa đơn"
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">
            Thanh toán
          </DialogTitle>
        </DialogHeader>

        {!summary ? (
          <div className="text-sm text-gray-500">
            Không có dữ liệu thanh toán.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-md bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-700">
                  <p className="text-sm">Khách hàng</p>
                  <p className="font-medium text-gray-900">
                    {summary.receipt.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Tổng số tiền</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Chọn phương thức thanh toán
              </label>
              <Select
                value={method}
                onValueChange={(v: PaymentMethod) => setMethod(v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                  <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                  <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="text-xs text-gray-500">
              Bằng việc xác nhận, hệ thống sẽ cập nhật trạng thái phiếu thuê
              thành &quot;Đã thanh toán&quot; và chuyển phòng sang trạng thái
              &quot;Đang vệ sinh&quot;.
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

          <div className="flex items-center gap-3">
            <Button
              type="button"
              disabled={!isConfirmed}
              onClick={handlePrint}
              className="h-9 bg-gray-900 text-white hover:bg-gray-700"
            >
              {ICONS.RECEIPT}
              <span className="ml-1">In Hóa đơn</span>
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!method || isConfirming || !summary}
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
