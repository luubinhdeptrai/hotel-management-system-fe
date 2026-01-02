"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import { Room } from "@/lib/types/room";
import { RoomType } from "@/lib/types/room";

interface AvailableRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRooms: Room[];
  roomTypes: RoomType[];
  checkInDate: string;
  checkOutDate: string;
  onSelectRoom?: (room: Room) => void;
}

const STATUS_COLORS: Record<string, string> = {
  "Trống": "bg-success-100 text-success-700 border-success-200",
  "Sẵn sàng": "bg-success-100 text-success-700 border-success-200",
  "Đang thuê": "bg-info-100 text-info-700 border-info-200",
  "Đang dọn dẹp": "bg-warning-100 text-warning-700 border-warning-200",
  "Bảo trì": "bg-error-100 text-error-700 border-error-200",
};

export function AvailableRoomsModal({
  isOpen,
  onClose,
  availableRooms,
  roomTypes,
  checkInDate,
  checkOutDate,
  onSelectRoom,
}: AvailableRoomsModalProps) {
  // Group rooms by room type
  const roomsByType = availableRooms.reduce((acc, room) => {
    if (!acc[room.roomTypeID]) {
      const roomType = roomTypes.find((rt) => rt.roomTypeID === room.roomTypeID);
      acc[room.roomTypeID] = {
        roomType: roomType || null,
        rooms: [],
      };
    }
    acc[room.roomTypeID].rooms.push(room);
    return acc;
  }, {} as Record<string, { roomType: RoomType | null; rooms: Room[] }>);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="w-6 h-6 text-white">{ICONS.BED_DOUBLE}</span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-gray-900">
                Phòng trống
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Kết quả tìm kiếm từ {formatDate(checkInDate)} đến{" "}
                {formatDate(checkOutDate)} ({nights} đêm)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {availableRooms.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="w-10 h-10 text-gray-400">{ICONS.INFO}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không có phòng trống
            </h3>
            <p className="text-gray-600">
              Không tìm thấy phòng nào trống trong khoảng thời gian này.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-success-50 border-2 border-success-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-success-900 uppercase tracking-wide">
                    Tổng số phòng trống
                  </p>
                  <p className="text-3xl font-extrabold text-success-700 mt-1">
                    {availableRooms.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success-900 uppercase tracking-wide">
                    Số loại phòng
                  </p>
                  <p className="text-3xl font-extrabold text-success-700 mt-1">
                    {Object.keys(roomsByType).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Rooms grouped by type */}
            {Object.entries(roomsByType).map(([roomTypeID, { roomType, rooms }]) => {
              if (!roomType) return null;

              const totalPrice = roomType.price * nights;

              return (
                <div
                  key={roomTypeID}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Room Type Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                    <div className="flex-1">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                        {roomType.roomTypeName}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {roomType.amenities?.join(" • ") || ""}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span className="w-4 h-4">{ICONS.USERS}</span>
                          <span className="font-medium">
                            Tối đa {roomType.capacity} khách
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                        Giá {nights} đêm
                      </p>
                      <p className="text-2xl font-extrabold text-primary-600 mt-1">
                        {totalPrice.toLocaleString("vi-VN")} ₫
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {roomType.price.toLocaleString("vi-VN")} ₫/đêm
                      </p>
                    </div>
                  </div>

                  {/* Available Rooms */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">
                      Phòng trống ({rooms.length}):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {rooms.map((room) => (
                        <button
                          key={room.roomID}
                          onClick={() => onSelectRoom?.(room)}
                          className="flex flex-col items-center justify-center p-3 border-2 border-gray-200 rounded-lg hover:border-success-500 hover:bg-success-50 transition-all group"
                        >
                          <span className="w-5 h-5 text-gray-600 group-hover:text-success-600 mb-2">
                            {ICONS.DOOR_OPEN}
                          </span>
                          <span className="font-bold text-gray-900 group-hover:text-success-600 text-sm">
                            {room.roomName}
                          </span>
                          <Badge
                            className={`text-xs font-semibold px-2 py-0.5 mt-2 ${
                              STATUS_COLORS[room.roomStatus] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {room.roomStatus}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 px-6 border-2 border-gray-300 font-bold hover:bg-gray-100"
          >
            <span className="w-4 h-4 mr-2">{ICONS.CLOSE}</span>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
