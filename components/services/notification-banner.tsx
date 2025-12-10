import { ICONS } from "@/src/constants/icons.enum";

interface NotificationBannerProps {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}

export function NotificationBanner({
  type,
  message,
  onDismiss,
}: NotificationBannerProps) {
  return (
    <div
      className={`rounded-lg p-4 ${
        type === "success"
          ? "bg-success-100 text-success-700"
          : "bg-error-100 text-error-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === "success" ? ICONS.CHECK : ICONS.ALERT}
          <span>{message}</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-current hover:opacity-70"
          aria-label="Đóng thông báo"
        >
          {ICONS.CLOSE}
        </button>
      </div>
    </div>
  );
}
