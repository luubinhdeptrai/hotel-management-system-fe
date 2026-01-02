"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import { Room, RoomType } from "@/lib/types/room";

interface RoomSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedRoom: Room | null;
  roomTypes: RoomType[];
  checkInDate: string;
  checkOutDate: string;
}

const STATUS_COLORS: Record<string, string> = {
  "Trống": "bg-success-100 text-success-700 border-success-200",
  "Sẵn sàng": "bg-success-100 text-success-700 border-success-200",
  "Đang thuê": "bg-info-100 text-info-700 border-info-200",
  "Đang dọn dẹp": "bg-warning-100 text-warning-700 border-warning-200",
  "Bảo trì": "bg-error-100 text-error-700 border-error-200",
};

export function RoomSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  selectedRoom,
  roomTypes,
  checkInDate,
  checkOutDate,
}: RoomSelectionModalProps) {
  if (!selectedRoom) return null;

  const roomType = roomTypes.find((rt) => rt.roomTypeID === selectedRoom.roomTypeID);

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
  const totalPrice = (roomType?.price || 0) * nights;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="w-5 h-5 text-white">{ICONS.CHECK}</span>
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-gray-900">
                Xác nhận chọn phòng
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Bạn chắc chắn muốn chọn phòng này?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Room Details */}
        <div className="space-y-4 py-4">
          {/* Room Info Card */}
          <div className="border-2 border-primary-200 rounded-lg p-4 bg-primary-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-primary-900 uppercase tracking-wide">
                  Số phòng
                </p>
                <p className="text-2xl font-extrabold text-primary-700 mt-1">
                  {selectedRoom.roomName}
                </p>
              </div>
              <Badge
                className={`text-xs font-semibold px-3 py-1 ${
                  STATUS_COLORS[selectedRoom.roomStatus] || "bg-gray-100 text-gray-700"
                }`}
              >
                {selectedRoom.roomStatus}
              </Badge>
            </div>
          </div>

          {/* Room Type Info */}
          {roomType && (
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Loại phòng
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {roomType.roomTypeName}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-4 h-4">{ICONS.USERS}</span>
                  <span>Tối đa {roomType.capacity} khách</span>
                </div>
                {roomType.amenities && roomType.amenities.length > 0 && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {roomType.amenities.join(" • ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Booking Dates */}
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
              Khoảng thời gian đặt
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 text-primary-600">{ICONS.CALENDAR}</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(checkInDate)}
                  </span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">
                    {formatDate(checkOutDate)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600">({nights} đêm)</p>
            </div>
          </div>

          {/* Price Info */}
          <div className="border-2 border-success-200 rounded-lg p-4 bg-success-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-success-900 uppercase tracking-wide">
                  Giá {nights} đêm
                </p>
                <p className="text-2xl font-extrabold text-success-700 mt-1">
                  {totalPrice.toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-success-900 uppercase tracking-wide">
                  Giá/đêm
                </p>
                <p className="text-lg font-bold text-success-700 mt-1">
                  {roomType?.price.toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 px-4 border-2 border-gray-300 font-bold hover:bg-gray-100"
          >
            <span className="w-4 h-4 mr-2">{ICONS.CLOSE}</span>
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            className="h-10 px-4 bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors"
          >
            <span className="w-4 h-4 mr-2">{ICONS.CHECK}</span>
            Xác nhận chọn phòng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
