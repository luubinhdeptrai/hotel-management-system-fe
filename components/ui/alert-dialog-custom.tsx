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
import { ICONS } from "@/src/constants/icons.enum";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  variant?: "default" | "info" | "warning" | "error" | "success";
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "OK",
  variant = "info",
}: AlertDialogProps) {
  const variantStyles = {
    default: {
      iconBg: "bg-gray-100 text-gray-600",
      icon: ICONS.INFO,
      buttonBg: "bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600",
    },
    info: {
      iconBg: "bg-primary-100 text-primary-600",
      icon: ICONS.INFO,
      buttonBg: "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600",
    },
    warning: {
      iconBg: "bg-warning-100 text-warning-600",
      icon: ICONS.ALERT,
      buttonBg: "bg-gradient-to-r from-warning-600 to-warning-500 hover:from-warning-700 hover:to-warning-600",
    },
    error: {
      iconBg: "bg-error-100 text-error-600",
      icon: ICONS.ALERT_CIRCLE,
      buttonBg: "bg-gradient-to-r from-error-600 to-error-500 hover:from-error-700 hover:to-error-600",
    },
    success: {
      iconBg: "bg-success-100 text-success-600",
      icon: ICONS.CHECK_CIRCLE,
      buttonBg: "bg-gradient-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600",
    },
  };

  const style = variantStyles[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white border-primary-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${style.iconBg}`}>
              <span className="w-5 h-5">{style.icon}</span>
            </span>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-gray-600 text-base pt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className={`h-11 px-8 ${style.buttonBg} text-white font-semibold shadow-md w-full`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
