"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trash2 } from "lucide-react";
import type { SelectedRoom } from "./room-selector";

interface SelectedRoomsListProps {
  rooms: SelectedRoom[];
  onRemoveRoom: (roomId: string) => void;
  onChangeRoom?: (roomId: string) => void;
  isEditable?: boolean;
}

export function SelectedRoomsList({
  rooms,
  onRemoveRoom,
  onChangeRoom,
  isEditable = true,
}: SelectedRoomsListProps) {
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const from = new Date(checkIn);
    const to = new Date(checkOut);
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (rooms.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">
                Bạn chưa chọn phòng nào
              </p>
              <p className="text-sm text-yellow-700">
                Vui lòng chọn ít nhất một phòng để tiếp tục.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPrice = rooms.reduce((sum, room) => {
    const nights = calculateNights(room.checkInDate, room.checkOutDate);
    return sum + room.pricePerNight * nights;
  }, 0);

  return (
    <div className="space-y-4">
      {rooms.map((room, index) => {
        const nights = calculateNights(room.checkInDate, room.checkOutDate);
        const roomTotal = room.pricePerNight * nights;

        return (
          <div
            key={room.roomID}
            className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Room Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-xl text-gray-900">{room.roomName}</p>
                    <p className="text-sm text-blue-600 font-semibold">
                      {room.roomType?.roomTypeName}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1">
                    #{index + 1}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <span>📍</span> Tầng {room.floor}
                  </p>
                  <p className="flex items-center gap-2">
                    <span>👥</span> Sức chứa: {room.roomType?.capacity} khách
                  </p>
                </div>
              </div>

              {/* Date Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg space-y-2 border border-blue-100">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  📅 Thời gian lưu trú
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-semibold text-gray-700">Nhận:</span>{" "}
                    <span className="text-gray-600">{room.checkInDate}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Trả:</span>{" "}
                    <span className="text-gray-600">{room.checkOutDate}</span>
                  </p>
                  <p className="pt-2 border-t border-blue-200">
                    <span className="font-semibold text-blue-600">{nights} đêm</span>
                  </p>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 flex-1 mb-3">
                  <p className="text-sm text-gray-600 mb-2">
                    {room.pricePerNight.toLocaleString()}₫ × {nights} đêm
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {roomTotal.toLocaleString()}₫
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {onChangeRoom && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onChangeRoom(room.roomID)}
                      className="flex-1 border-2 hover:bg-blue-50"
                    >
                      ✏️ Thay đổi
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveRoom(room.roomID)}
                    className="border-2 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Total Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold flex items-center gap-2">
            💰 Tổng Cộng
          </span>
          <span className="text-4xl font-bold">
            {totalPrice.toLocaleString()}₫
          </span>
        </div>
        <p className="text-blue-100 text-sm mt-2">
          {rooms.length} phòng • {rooms.reduce((sum, r) => sum + calculateNights(r.checkInDate, r.checkOutDate), 0)} đêm
        </p>
      </div>
    </div>
  );
}
