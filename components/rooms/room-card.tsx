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

  // Status border color mapping
  const statusBorderColor: Record<RoomStatus, string> = {
    "Sẵn sàng": "border-l-success-600",
    "Đang thuê": "border-l-error-600",
    Bẩn: "border-l-warning-600",
    "Đang dọn": "border-l-blue-400",
    "Đang kiểm tra": "border-l-purple-500",
    "Bảo trì": "border-l-gray-600",
    "Đã đặt": "border-l-info-600",
  };

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 border-l-4 flex flex-col",
        statusBorderColor[room.roomStatus]
      )}
    >
      <CardHeader className="pb-3">
        {/* Row 1: Room Name + Status */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <CardTitle className="text-lg font-bold text-gray-900 truncate">
            {room.roomName}
          </CardTitle>
          <RoomStatusBadge status={room.roomStatus} />
        </div>

        {/* Row 2: Room Type + Price */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 truncate">
            {room.roomType.roomTypeName}
          </p>
          <div className="text-right shrink-0 whitespace-nowrap">
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(room.roomType.price)}
            </span>
            <span className="text-xs text-gray-500 ml-1">/đêm</span>
          </div>
        </div>

        {/* Show guest name when room is occupied */}
        {room.roomStatus === "Đang thuê" && room.guestName && (
          <div className="mt-2 px-2 py-1.5 bg-error-100 rounded-md border border-error-200">
            <p className="text-sm font-medium text-error-600 flex items-center gap-1.5">
              👤 {room.guestName}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        {/* Room Info Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">{ICONS.BED_DOUBLE}</span>
            <span>{room.roomType.capacity} người</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1">
          {room.roomType.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-100"
            >
              {amenity}
            </span>
          ))}
          {room.roomType.amenities.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              +{room.roomType.amenities.length - 3}
            </span>
          )}
        </div>

        {/* Quick Status Change */}
        {onStatusChange && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1.5">
              Cập nhật trạng thái:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(["Sẵn sàng", "Bẩn", "Bảo trì", "Đã đặt"] as RoomStatus[]).map(
                (status) =>
                  room.roomStatus !== status && (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
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
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8"
              onClick={() => onEdit?.(room)}
            >
              <span className="mr-1">{ICONS.EDIT}</span>
              Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete?.(room)}
            >
              <span className="mr-1">{ICONS.TRASH}</span>
              Xóa
            </Button>
          </div>

          {/* View Folio - Only for occupied rooms - AT THE VERY BOTTOM */}
          {room.roomStatus === "Đang thuê" && room.folioId && (
            <Button
              className="w-full bg-primary-600 hover:bg-primary-500 h-9"
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
