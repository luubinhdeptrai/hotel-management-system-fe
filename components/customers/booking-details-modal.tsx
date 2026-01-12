"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Calendar, Users, DollarSign, DoorOpen, Clock } from "lucide-react";
import type { Customer, Booking } from "@/lib/types/api";
import { bookingService } from "@/lib/services/booking.service";

interface BookingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  CHECKED_IN: "bg-green-100 text-green-800 border-green-300",
  CHECKED_OUT: "bg-purple-100 text-purple-800 border-purple-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-300",
};

const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã nhận phòng",
  CHECKED_OUT: "Đã trả phòng",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN");
}

export function BookingDetailsModal({
  open,
  onOpenChange,
  customer,
}: BookingDetailsModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !customer) {
      setBookings([]);
      setError(null);
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch bookings from the API
        // Note: Backend endpoint is `/customer/bookings/:id` for customer or
        // we can use `/employee/bookings` and filter by customerId
        // Fetch all bookings and filter by primaryCustomerId
        const response = await bookingService.getAllBookings();
        const customerBookings = (response.data || []).filter(
          (booking) => booking.primaryCustomerId === customer.id
        );
        setBookings(customerBookings);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Không thể tải thông tin booking. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [open, customer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[45vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <DialogTitle className="text-2xl">
            Booking của {customer?.fullName}
          </DialogTitle>
          <DialogDescription>
            Danh sách tất cả booking của khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
              <p className="text-gray-600">Đang tải booking...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-8 w-8 text-gray-400 mb-3" />
              <p className="text-gray-600">Chưa có booking nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors"
                >
                  {/* Booking Header - Always Visible */}
                  <button
                    onClick={() =>
                      setExpandedBooking(
                        expandedBooking === booking.id ? null : booking.id
                      )
                    }
                    className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {booking.bookingCode}
                          </h3>
                          <Badge
                            className={`${
                              BOOKING_STATUS_COLORS[booking.status] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {BOOKING_STATUS_LABELS[booking.status] ||
                              booking.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDateShort(booking.checkInDate)} →{" "}
                              {formatDateShort(booking.checkOutDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{booking.totalGuests} khách</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-blue-700">
                              {formatCurrency(booking.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-gray-400">
                        {expandedBooking === booking.id ? "▼" : "▶"}
                      </div>
                    </div>
                  </button>

                  {/* Booking Details - Expanded */}
                  {expandedBooking === booking.id && (
                    <div className="bg-white p-4 space-y-4 border-t">
                      {/* Dates & Times */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                            Ngày nhận phòng
                          </p>
                          <p className="text-sm font-bold text-blue-900">
                            {formatDate(booking.checkInDate)}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                            Ngày trả phòng
                          </p>
                          <p className="text-sm font-bold text-blue-900">
                            {formatDate(booking.checkOutDate)}
                          </p>
                        </div>
                      </div>

                      {/* Booking Rooms */}
                      {booking.bookingRooms && booking.bookingRooms.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <DoorOpen className="h-4 w-4" />
                            Chi tiết phòng ({booking.bookingRooms.length})
                          </h4>
                          {booking.bookingRooms.map((room) => (
                            <div
                              key={room.id}
                              className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                {/* Room Info */}
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Phòng
                                  </p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {room.room?.roomNumber || "Phòng"} -{" "}
                                    {room.roomType?.name || "Loại phòng"}
                                  </p>
                                </div>

                                {/* Price Per Night */}
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Giá/đêm
                                  </p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {formatCurrency(room.pricePerNight)}
                                  </p>
                                </div>

                                {/* Status */}
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Trạng thái
                                  </p>
                                  <Badge
                                    className={`${
                                      BOOKING_STATUS_COLORS[room.status] ||
                                      "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {BOOKING_STATUS_LABELS[room.status] ||
                                      room.status}
                                  </Badge>
                                </div>
                              </div>

                              {/* Actual Check-in/out Times */}
                              {(room.actualCheckIn || room.actualCheckOut) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-200">
                                  {room.actualCheckIn && (
                                    <div className="flex items-center gap-2 text-xs text-green-700">
                                      <Clock className="h-4 w-4" />
                                      <span>
                                        <strong>Nhận phòng lúc:</strong>{" "}
                                        {formatDate(room.actualCheckIn)}
                                      </span>
                                    </div>
                                  )}
                                  {room.actualCheckOut && (
                                    <div className="flex items-center gap-2 text-xs text-orange-700">
                                      <Clock className="h-4 w-4" />
                                      <span>
                                        <strong>Trả phòng lúc:</strong>{" "}
                                        {formatDate(room.actualCheckOut)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Payment Info */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Tiền phòng
                                  </p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {formatCurrency(
                                      typeof room.subtotalRoom === "string"
                                        ? parseFloat(room.subtotalRoom)
                                        : Number(room.subtotalRoom) || 0
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Tổng cộng
                                  </p>
                                  <p className="text-sm font-bold text-blue-700">
                                    {formatCurrency(
                                      typeof room.totalAmount === "string"
                                        ? parseFloat(room.totalAmount)
                                        : Number(room.totalAmount) || 0
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Đã thanh toán
                                  </p>
                                  <p className="text-sm font-bold text-green-700">
                                    {formatCurrency(
                                      typeof booking.totalDeposit === "string"
                                        ? parseFloat(booking.totalDeposit)
                                        : Number(booking.totalDeposit) || 0
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Còn lại
                                  </p>
                                  <p className="text-sm font-bold text-red-700">
                                    {formatCurrency(
                                      Math.max(
                                        0,
                                        (typeof room.totalAmount === "string"
                                          ? parseFloat(room.totalAmount)
                                          : Number(room.totalAmount) || 0) -
                                          (typeof booking.totalDeposit === "string"
                                            ? parseFloat(booking.totalDeposit)
                                            : Number(booking.totalDeposit) || 0)
                                      )
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Guests */}
                              {room.bookingCustomers &&
                                room.bookingCustomers.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                                      Khách ({room.bookingCustomers.length})
                                    </p>
                                    <div className="space-y-1">
                                      {room.bookingCustomers.map(
                                        (guest, idx) => (
                                          <div
                                            key={idx}
                                            className="text-sm text-gray-700"
                                          >
                                            • {guest.customer?.fullName || "Guest"}{" "}
                                            {guest.isPrimary && (
                                              <Badge className="ml-2 bg-emerald-100 text-emerald-800">
                                                Chính
                                              </Badge>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Total Payment Summary */}
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-green-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-green-600 uppercase mb-1">
                              Tổng tiền
                            </p>
                            <p className="text-lg font-bold text-green-900">
                              {formatCurrency(
                                typeof booking.totalAmount === "string"
                                  ? parseFloat(booking.totalAmount)
                                  : Number(booking.totalAmount) || 0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-green-600 uppercase mb-1">
                              Đặt cọc
                            </p>
                            <p className="text-lg font-bold text-green-900">
                              {formatCurrency(
                                typeof booking.depositRequired === "string"
                                  ? parseFloat(booking.depositRequired)
                                  : Number(booking.depositRequired) || 0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-green-600 uppercase mb-1">
                              Đã thanh toán
                            </p>
                            <p className="text-lg font-bold text-green-700">
                              {formatCurrency(
                                typeof booking.totalDeposit === "string"
                                  ? parseFloat(booking.totalDeposit)
                                  : Number(booking.totalDeposit) || 0
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-green-600 uppercase mb-1">
                              Còn lại
                            </p>
                            <p className="text-lg font-bold text-red-700">
                              {formatCurrency(
                                Math.max(
                                  0,
                                  (typeof booking.totalAmount === "string"
                                    ? parseFloat(booking.totalAmount)
                                    : Number(booking.totalAmount) || 0) -
                                    (typeof booking.totalDeposit === "string"
                                      ? parseFloat(booking.totalDeposit)
                                      : Number(booking.totalDeposit) || 0)
                                )
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Created & Updated Info */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          Tạo lúc:{" "}
                          {new Date(booking.createdAt).toLocaleString("vi-VN")}
                        </p>
                        <p>
                          Cập nhật lúc:{" "}
                          {new Date(booking.updatedAt).toLocaleString("vi-VN")}
                        </p>
                        {booking.cancelledAt && (
                          <p className="text-red-600">
                            Hủy lúc: {new Date(booking.cancelledAt).toLocaleString("vi-VN")}
                            {booking.cancelReason && ` - Lý do: ${booking.cancelReason}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
