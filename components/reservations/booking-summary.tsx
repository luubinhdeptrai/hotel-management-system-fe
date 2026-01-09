"use client";

import { Badge } from "@/components/ui/badge";
import type { SelectedRoom } from "./room-selector";

interface BookingSummaryProps {
  rooms: SelectedRoom[];
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  depositPercentage: number;
  showDeposit?: boolean;
}

export function BookingSummary({
  rooms,
  customerName,
  checkInDate,
  checkOutDate,
  totalGuests,
  depositPercentage,
  showDeposit = true,
}: BookingSummaryProps) {
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const from = new Date(checkIn);
    const to = new Date(checkOut);
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkInDate, checkOutDate);

  const roomBreakdown = rooms.map((room) => ({
    roomNumber: room.roomName,
    roomType: room.roomType?.roomTypeName || "Unknown",
    nights,
    pricePerNight: room.pricePerNight,
    subtotal: room.pricePerNight * nights,
  }));

  const subtotal = roomBreakdown.reduce((sum, item) => sum + item.subtotal, 0);
  const deposit = Math.round(subtotal * (depositPercentage / 100));
  const balance = subtotal - deposit;

  return (
    <div className="space-y-4">
      {/* Customer Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          👤 Thông tin khách hàng
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Tên khách hàng</p>
            <p className="font-bold text-gray-900 text-lg">{customerName}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Số lượng khách</p>
            <p className="font-bold text-gray-900 text-lg">👥 {totalGuests} khách</p>
          </div>
        </div>
      </div>

      {/* Check-in/Check-out */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          📅 Thời gian lưu trú
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-600 mb-1">Ngày nhận phòng</p>
            <p className="font-bold text-gray-900">{checkInDate}</p>
            <p className="text-xs text-gray-500 mt-1">Lúc 14:00</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-2xl">➜</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-600 mb-1">Ngày trả phòng</p>
            <p className="font-bold text-gray-900">{checkOutDate}</p>
            <p className="text-xs text-gray-500 mt-1">Lúc 12:00</p>
          </div>
        </div>
        <div className="mt-4 bg-purple-100 p-3 rounded-lg text-center">
          <p className="text-sm font-semibold text-purple-900">🌙 {nights} đêm lưu trú</p>
        </div>
      </div>

      {/* Rooms Breakdown */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-300">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          🛏️ Chi tiết phòng ({rooms.length})
        </h3>
        <div className="space-y-3">
          {roomBreakdown.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900 text-base">{item.roomNumber}</p>
                  <Badge className="bg-green-100 text-green-700 text-xs mt-1">
                    {item.roomType}
                  </Badge>
                </div>
                <span className="font-bold text-green-600 text-lg">
                  {item.subtotal.toLocaleString()}₫
                </span>
              </div>
              <p className="text-xs text-gray-600 border-t border-gray-200 pt-2">
                {item.nights} đêm × <span className="font-semibold">{item.pricePerNight.toLocaleString()}₫</span>/đêm
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all duration-300">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          💰 Chi tiết thanh toán
        </h3>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100">
            <span className="text-gray-700 font-medium">Tổng tiền phòng</span>
            <span className="font-bold text-gray-900 text-lg">{subtotal.toLocaleString()}₫</span>
          </div>

          {showDeposit && (
            <>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100">
                <span className="text-gray-700 font-medium">Cọc ({depositPercentage}%)</span>
                <Badge className="bg-orange-100 text-orange-700 font-bold">
                  {deposit.toLocaleString()}₫
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                <span className="text-green-900 font-bold">Còn lại sau cọc</span>
                <span className="text-green-700 font-bold text-lg">
                  {balance.toLocaleString()}₫
                </span>
              </div>
            </>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Thành tiền</span>
            <span className="text-3xl font-bold">
              {subtotal.toLocaleString()}₫
            </span>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 hover:border-blue-300 transition-all duration-300">
        <p className="text-sm text-blue-900 leading-relaxed">
          <span className="font-bold text-blue-700 flex items-center gap-2 mb-2">
            ℹ️ Lưu ý quan trọng
          </span>
          Giá trên đã bao gồm thuế và phí dịch vụ.
          {showDeposit && ` Bạn sẽ thanh toán cọc ${depositPercentage}% khi xác nhận đặt phòng.`}
        </p>
      </div>
    </div>
  );
}
