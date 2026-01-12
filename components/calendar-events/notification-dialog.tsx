/**
 * Notification Dialog Component
 * 
 * Beautiful colored notification dialogs for success, error, warning, info
 */

"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationDialogProps {
  type: NotificationType;
  title: string;
  message: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoClose?: boolean; // Auto close after 3 seconds
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    titleColor: "text-green-900",
    messageColor: "text-green-700",
    accentColor: "bg-green-500 hover:bg-green-600",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    titleColor: "text-red-900",
    messageColor: "text-red-700",
    accentColor: "bg-red-500 hover:bg-red-600",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    titleColor: "text-amber-900",
    messageColor: "text-amber-700",
    accentColor: "bg-amber-500 hover:bg-amber-600",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    titleColor: "text-blue-900",
    messageColor: "text-blue-700",
    accentColor: "bg-blue-500 hover:bg-blue-600",
  },
};

export function NotificationDialog({
  type,
  title,
  message,
  open,
  onOpenChange,
  autoClose = true,
}: NotificationDialogProps) {
  const config = notificationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, autoClose, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`border-2 ${config.borderColor} ${config.bgColor}`}
      >
        <AlertDialogHeader className="flex flex-row items-start gap-4">
          <div className="flex items-center gap-4">
            <Icon className={`w-6 h-6 flex-shrink-0 ${config.titleColor}`} />
            <div>
              <AlertDialogTitle className={config.titleColor}>
                {title}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className={config.messageColor}>
          {message}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction className={`${config.accentColor} text-white`}>
            Đóng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook for using notification dialog
 */
export function useNotification() {
  const [notification, setNotification] = useState<{
    type: NotificationType;
    title: string;
    message: string;
  } | null>(null);

  const show = (type: NotificationType, title: string, message: string) => {
    setNotification({ type, title, message });
  };

  const close = () => {
    setNotification(null);
  };

  return {
    notification,
    show,
    close,
    success: (title: string, message: string) =>
      show("success", title, message),
    error: (title: string, message: string) => show("error", title, message),
    warning: (title: string, message: string) =>
      show("warning", title, message),
    info: (title: string, message: string) => show("info", title, message),
  };
}
