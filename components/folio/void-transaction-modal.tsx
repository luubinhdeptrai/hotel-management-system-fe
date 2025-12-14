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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FolioTransaction } from "@/lib/types/folio";
import { TRANSACTION_TYPE_LABELS } from "@/lib/types/folio";

interface VoidTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoid: (transactionId: string, reason: string) => void;
  transactions: FolioTransaction[];
}

export function VoidTransactionModal({
  isOpen,
  onClose,
  onVoid,
  transactions,
}: VoidTransactionModalProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState("");
  const [reason, setReason] = useState("");

  // Filter out already voided transactions
  const activeTransactions = transactions.filter((t) => !t.isVoided);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const selectedTransaction = activeTransactions.find(
    (t) => t.transactionID === selectedTransactionId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTransactionId || !reason) {
      return;
    }

    onVoid(selectedTransactionId, reason);

    // Reset form
    setSelectedTransactionId("");
    setReason("");
    onClose();
  };

  const handleClose = () => {
    setSelectedTransactionId("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Hủy giao dịch (Void Transaction)
          </DialogTitle>
          <DialogDescription>
            Chọn giao dịch muốn hủy. Giao dịch bị hủy sẽ không còn được tính vào
            tổng số dư.
          </DialogDescription>
        </DialogHeader>

        {activeTransactions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Không có giao dịch nào có thể hủy.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction">Chọn giao dịch</Label>
              <Select
                value={selectedTransactionId}
                onValueChange={setSelectedTransactionId}
              >
                <SelectTrigger id="transaction">
                  <SelectValue placeholder="Chọn giao dịch cần hủy" />
                </SelectTrigger>
                <SelectContent>
                  {activeTransactions.map((txn) => (
                    <SelectItem
                      key={txn.transactionID}
                      value={txn.transactionID}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{txn.date}</span>
                        <span>-</span>
                        <span>{TRANSACTION_TYPE_LABELS[txn.type]}</span>
                        <span>-</span>
                        <span
                          className={
                            txn.debit > 0 ? "text-red-600" : "text-green-600"
                          }
                        >
                          {formatCurrency(
                            txn.debit > 0 ? txn.debit : txn.credit
                          )}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTransaction && (
              <div className="bg-gray-50 border rounded-md p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Loại:</span>
                  <span className="font-medium">
                    {TRANSACTION_TYPE_LABELS[selectedTransaction.type]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Mô tả:</span>
                  <span className="font-medium">
                    {selectedTransaction.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Số tiền:</span>
                  <span
                    className={`font-bold ${
                      selectedTransaction.debit > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(
                      selectedTransaction.debit > 0
                        ? selectedTransaction.debit
                        : selectedTransaction.credit
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ngày:</span>
                  <span>{selectedTransaction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Người tạo:</span>
                  <span>{selectedTransaction.createdBy}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Lý do hủy</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do hủy giao dịch này"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Đóng
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!selectedTransactionId || !reason}
                className="disabled:bg-gray-200 disabled:text-gray-500"
              >
                Xác nhận hủy
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
