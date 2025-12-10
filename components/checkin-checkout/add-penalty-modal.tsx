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
import type { AddPenaltyFormData } from "@/lib/types/checkin-checkout";

interface AddPenaltyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: AddPenaltyFormData) => void;
}

export function AddPenaltyModal({
  open,
  onOpenChange,
  onConfirm,
}: AddPenaltyModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    if (!description.trim() || !amount) return;

    const formData: AddPenaltyFormData = {
      description: description.trim(),
      amount: parseFloat(amount),
      notes: notes.trim() || undefined,
    };

    onConfirm(formData);
    onOpenChange(false);
    // Reset form
    setDescription("");
    setAmount("");
    setNotes("");
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Thêm phí phạt
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Nhập thông tin về phí phạt hoặc bồi thường cho khách
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Mô tả vi phạm <span className="text-error-600">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Ví dụ: Làm vỡ bình hoa trang trí, làm bẩn thảm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-gray-300 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Số tiền phạt (VNĐ) <span className="text-error-600">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10 border-gray-300 focus:ring-primary-500"
            />
            {amount && (
              <p className="text-xs text-gray-500">
                Số tiền: {formatCurrency(amount)}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="penalty-notes" className="text-sm font-medium">
              Ghi chú bổ sung
            </Label>
            <Textarea
              id="penalty-notes"
              placeholder="Nhập ghi chú bổ sung (nếu có)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="border-gray-300 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-error-100 p-4 flex gap-3">
            <div className="text-error-600 shrink-0">{ICONS.ALERT}</div>
            <div className="text-sm text-error-600">
              <p className="font-medium">Lưu ý:</p>
              <p className="mt-1">
                Phí phạt sẽ được thêm vào tổng hóa đơn. Vui lòng kiểm tra kỹ
                thông tin trước khi xác nhận.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="h-10"
          >
            {ICONS.CLOSE}
            <span className="ml-2">Hủy</span>
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!description.trim() || !amount}
            className="h-10 bg-error-600 hover:bg-error-500 text-white disabled:opacity-50"
          >
            {ICONS.ALERT}
            <span className="ml-2">Thêm phí phạt</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
