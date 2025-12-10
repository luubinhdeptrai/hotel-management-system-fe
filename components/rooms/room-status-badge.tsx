import { Badge } from "@/components/ui/badge";
import { RoomStatus } from "@/lib/types/room";
import { cn } from "@/lib/utils";

interface RoomStatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  // Color mapping based on spec:
  // 🟢 Sẵn sàng (READY) - Green
  // 🔴 Đang thuê (OCCUPIED) - Red
  // 🟡 Bẩn (DIRTY) - Yellow/Warning
  // 🧹 Đang dọn (CLEANING) - Blue
  // 🔍 Đang kiểm tra (INSPECTING) - Purple
  // ⚫ Bảo trì (MAINTENANCE) - Gray/Dark
  // 🔵 Đã đặt (RESERVED) - Blue
  const statusConfig: Record<
    RoomStatus,
    { color: string; bgColor: string; label: string; icon: string }
  > = {
    "Sẵn sàng": {
      color: "text-success-700",
      bgColor: "bg-success-100",
      label: "Sẵn sàng",
      icon: "🟢",
    },
    "Đang thuê": {
      color: "text-error-700",
      bgColor: "bg-error-100",
      label: "Đang thuê",
      icon: "🔴",
    },
    Bẩn: {
      color: "text-warning-700",
      bgColor: "bg-warning-100",
      label: "Bẩn",
      icon: "🟡",
    },
    "Đang dọn": {
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      label: "Đang dọn",
      icon: "🧹",
    },
    "Đang kiểm tra": {
      color: "text-purple-700",
      bgColor: "bg-purple-100",
      label: "Đang kiểm tra",
      icon: "🔍",
    },
    "Bảo trì": {
      color: "text-gray-700",
      bgColor: "bg-gray-200",
      label: "Bảo trì",
      icon: "⚫",
    },
    "Đã đặt": {
      color: "text-info-700",
      bgColor: "bg-info-100",
      label: "Đã đặt",
      icon: "🔵",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium border-0",
        config.bgColor,
        config.color,
        className
      )}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
