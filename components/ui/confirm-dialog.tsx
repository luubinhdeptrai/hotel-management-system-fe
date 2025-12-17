"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ICONS } from "@/src/constants/icons.enum";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white border-primary-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            {variant === "destructive" ? (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error-100 text-error-600">
                <span className="w-5 h-5">{ICONS.ALERT}</span>
              </span>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="w-5 h-5">{ICONS.INFO}</span>
              </span>
            )}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-gray-600 text-base pt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-11 px-6 border-2 font-semibold hover:bg-gray-100"
          >
            <span className="w-4 h-4 mr-2">{ICONS.CLOSE}</span>
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className={cn(
              variant === "destructive"
                ? "h-11 px-6 bg-linear-to-r from-error-600 to-error-500 hover:from-error-700 hover:to-error-600 text-white font-semibold shadow-md"
                : "h-11 px-6 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold shadow-md"
            )}
          >
            <span className="w-4 h-4 mr-2">{ICONS.CHECK}</span>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
