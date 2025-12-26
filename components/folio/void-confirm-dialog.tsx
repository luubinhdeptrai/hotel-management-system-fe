"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VoidConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  transactionDescription?: string;
}

export function VoidConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  transactionDescription,
}: VoidConfirmDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      return;
    }
    onConfirm(reason);
    setReason("");
    onClose();
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-error-600">
            Xác nhận hủy giao dịch
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn hủy giao dịch này? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {transactionDescription && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-sm text-gray-700">
              <strong>Giao dịch:</strong> {transactionDescription}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="void-reason">Lý do hủy *</Label>
          <Textarea
            id="void-reason"
            placeholder="Nhập lý do hủy giao dịch này..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="bg-error-600 hover:bg-error-700 text-white disabled:bg-gray-200 disabled:text-gray-500"
          >
            Xác nhận hủy giao dịch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
