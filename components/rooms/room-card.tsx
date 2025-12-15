"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomStatusBadge } from "@/components/rooms/room-status-badge";
import { Room, RoomStatus } from "@/lib/types/room";
import { ICONS } from "@/src/constants/icons.enum";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
  onStatusChange?: (room: Room, newStatus: RoomStatus) => void;
}

export function RoomCard({
  room,
  onEdit,
  onDelete,
  onStatusChange,
}: RoomCardProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Status border and background color mapping
  const statusStyles: Record<RoomStatus, { border: string; bg: string; glow: string }> = {
    "Sẵn sàng": { 
      border: "before:border-l-success-500", 
      bg: "from-success-50/50 to-white",
      glow: "group-hover:shadow-success-200"
    },
    "Đang thuê": { 
      border: "before:border-l-error-500", 
      bg: "from-error-50/50 to-white",
      glow: "group-hover:shadow-error-200"
    },
    "Bẩn": { 
      border: "before:border-l-warning-500", 
      bg: "from-warning-50/50 to-white",
      glow: "group-hover:shadow-warning-200"
    },
    "Đang dọn": { 
      border: "before:border-l-blue-400", 
      bg: "from-blue-50/50 to-white",
      glow: "group-hover:shadow-blue-200"
    },
    "Đang kiểm tra": { 
      border: "before:border-l-purple-500", 
      bg: "from-purple-50/50 to-white",
      glow: "group-hover:shadow-purple-200"
    },
    "Bảo trì": { 
      border: "before:border-l-gray-500", 
      bg: "from-gray-50/50 to-white",
      glow: "group-hover:shadow-gray-200"
    },
    "Đã đặt": { 
      border: "before:border-l-info-500", 
      bg: "from-info-50/50 to-white",
      glow: "group-hover:shadow-info-200"
    },
  };

  const currentStyle = statusStyles[room.roomStatus];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 border-0 shadow-md",
        "hover:shadow-2xl hover:-translate-y-2 flex flex-col",
        `bg-linear-to-br ${currentStyle.bg}`,
        currentStyle.glow,
        "before:absolute before:inset-0 before:border-l-4 before:transition-all before:pointer-events-none",
        currentStyle.border
      )}
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-blue-200/30 rounded-full blur-3xl group-hover:w-40 group-hover:h-40 transition-all duration-500" />
      
      <CardHeader className="pb-3 relative z-10">
        {/* Row 1: Room Name + Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <CardTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 truncate">
            {room.roomName}
          </CardTitle>
          <RoomStatusBadge status={room.roomStatus} />
        </div>

        {/* Row 2: Room Type + Price */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600 truncate font-medium">
            {room.roomType.roomTypeName}
          </p>
          <div className="text-right shrink-0 whitespace-nowrap">
            <div className="px-3 py-1.5 bg-primary-100/80 backdrop-blur-sm rounded-lg border border-primary-200">
              <span className="text-lg font-extrabold text-primary-600">
                {formatCurrency(room.roomType.price)}
              </span>
              <span className="text-xs text-primary-500 ml-1 font-semibold">/đêm</span>
            </div>
          </div>
        </div>

        {/* Show guest name when room is occupied */}
        {room.roomStatus === "Đang thuê" && room.guestName && (
          <div className="mt-3 px-3 py-2 bg-error-100/80 backdrop-blur-sm rounded-lg border border-error-200 shadow-sm">
            <p className="text-sm font-bold text-error-700 flex items-center gap-2">
              <span className="text-base">👤</span> {room.guestName}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pt-0 relative z-10">
        {/* Room Info Row */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <span className="text-primary-600">{ICONS.BED_DOUBLE}</span>
            <span className="font-semibold text-gray-700">{room.roomType.capacity} người</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2">
          {room.roomType.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="text-xs px-3 py-1.5 bg-primary-50/80 backdrop-blur-sm text-primary-700 rounded-full border border-primary-200 font-semibold"
            >
              {amenity}
            </span>
          ))}
          {room.roomType.amenities.length > 3 && (
            <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-bold">
              +{room.roomType.amenities.length - 3}
            </span>
          )}
        </div>

        {/* Quick Status Change */}
        {onStatusChange && (
          <div className="pt-3 border-t-2 border-gray-100">
            <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              Cập nhật trạng thái:
            </p>
            <div className="flex flex-wrap gap-2">
              {(["Sẵn sàng", "Bẩn", "Bảo trì", "Đã đặt"] as RoomStatus[]).map(
                (status) =>
                  room.roomStatus !== status && (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3 font-semibold hover:scale-105 transition-transform"
                      onClick={() => onStatusChange(room, status)}
                    >
                      {status}
                    </Button>
                  )
              )}
            </div>
          </div>
        )}

        {/* Spacer to push actions to bottom */}
        <div className="flex-1" />

        {/* Actions - Always at bottom */}
        <div className="pt-3 border-t-2 border-gray-100 space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 font-semibold hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300 transition-all"
              onClick={() => onEdit?.(room)}
            >
              <span className="mr-1.5">{ICONS.EDIT}</span>
              Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-error-600 hover:text-error-700 hover:bg-error-50 hover:border-error-300 font-semibold transition-all"
              onClick={() => onDelete?.(room)}
            >
              <span className="mr-1.5">{ICONS.TRASH}</span>
              Xóa
            </Button>
          </div>

          {/* View Folio - Only for occupied rooms - AT THE VERY BOTTOM */}
          {room.roomStatus === "Đang thuê" && room.folioId && (
            <Button
              className="w-full bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-md hover:shadow-lg h-10 font-bold transition-all hover:scale-105"
              size="sm"
              onClick={() => router.push(`/payments/folio/${room.folioId}`)}
            >
              <span className="mr-2">{ICONS.RECEIPT}</span>
              Xem chi tiết Folio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
