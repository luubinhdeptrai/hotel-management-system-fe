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
import type { TransactionType, PostChargeFormData } from "@/lib/types/folio";
import { TRANSACTION_TYPE_LABELS } from "@/lib/types/folio";

interface PostChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostChargeFormData) => void;
}

// Only charge types (not payments)
const CHARGE_TYPES: TransactionType[] = [
  "ROOM_CHARGE",
  "SERVICE",
  "SURCHARGE",
  "PENALTY",
];

export function PostChargeModal({
  isOpen,
  onClose,
  onSubmit,
}: PostChargeModalProps) {
  const [type, setType] = useState<TransactionType>("SERVICE");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !description || !amount) {
      return;
    }

    onSubmit({
      type,
      description,
      amount: parseFloat(amount),
    });

    // Reset form
    setType("SERVICE");
    setDescription("");
    setAmount("");
    onClose();
  };

  const handleClose = () => {
    setType("SERVICE");
    setDescription("");
    setAmount("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm phí (Post Charge)</DialogTitle>
          <DialogDescription>
            Thêm phí mới vào folio của khách. Phí sẽ được tính vào cột Debit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="charge-type">Loại phí</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as TransactionType)}
            >
              <SelectTrigger id="charge-type">
                <SelectValue placeholder="Chọn loại phí" />
              </SelectTrigger>
              <SelectContent>
                {CHARGE_TYPES.map((chargeType) => (
                  <SelectItem key={chargeType} value={chargeType}>
                    {TRANSACTION_TYPE_LABELS[chargeType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả cho khoản phí"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!type || !description || !amount}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500"
            >
              Thêm phí
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
