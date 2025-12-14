"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PostPaymentFormData } from "@/lib/types/folio";
import { PAYMENT_METHOD_LABELS } from "@/lib/types/folio";

interface PostPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostPaymentFormData) => void;
  balance: number;
}

type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

export function PostPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  balance,
}: PostPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !paymentMethod) {
      return;
    }

    onSubmit({
      amount: parseFloat(amount),
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setAmount("");
    setPaymentMethod("CASH");
    setReference("");
    setNotes("");
    onClose();
  };

  const handleClose = () => {
    setAmount("");
    setPaymentMethod("CASH");
    setReference("");
    setNotes("");
    onClose();
  };

  const handlePayFullBalance = () => {
    setAmount(balance.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán (Post Payment)</DialogTitle>
          <DialogDescription>
            Ghi nhận thanh toán từ khách hàng. Số tiền sẽ được tính vào cột
            Credit.
          </DialogDescription>
        </DialogHeader>

        {balance > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              Số dư cần thanh toán:{" "}
              <strong className="text-amber-900">
                {formatCurrency(balance)}
              </strong>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handlePayFullBalance}
            >
              Thanh toán toàn bộ
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền (VND)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Phương thức thanh toán</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
            >
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(
                  (method) => (
                    <SelectItem key={method} value={method}>
                      {PAYMENT_METHOD_LABELS[method]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {paymentMethod !== "CASH" && (
            <div className="space-y-2">
              <Label htmlFor="reference">
                Số tham chiếu{" "}
                {paymentMethod === "CARD" ? "(thẻ)" : "(chuyển khoản)"}
              </Label>
              <Input
                id="reference"
                placeholder={
                  paymentMethod === "CARD"
                    ? "4 số cuối thẻ hoặc mã giao dịch"
                    : "Mã giao dịch chuyển khoản"
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú nếu có"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!amount || !paymentMethod}
              className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-500"
            >
              Ghi nhận thanh toán
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
