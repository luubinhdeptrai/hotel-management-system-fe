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
      className={`rounded-lg p-5 ${
        type === "success"
          ? "bg-success-100 text-success-700 border-2 border-success-300"
          : "bg-error-100 text-error-700 border-2 border-error-300"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 shrink-0 flex items-center justify-center ${
            type === "success" ? "text-success-600" : "text-error-600"
          }`}>
            {type === "success" ? ICONS.CHECK : ICONS.ALERT}
          </div>
          <span className="font-semibold text-base">{message}</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-current hover:opacity-70 shrink-0"
          aria-label="Đóng thông báo"
        >
          {ICONS.CLOSE}
        </button>
      </div>
    </div>
  );
}
