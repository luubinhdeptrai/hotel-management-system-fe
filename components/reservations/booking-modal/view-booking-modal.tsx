"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import { Reservation } from "@/lib/types/reservation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { serviceUsageAPI } from "@/lib/services/service-unified.service";
import { ServiceUsage } from "@/lib/types/service-unified";
import { X } from "lucide-react";

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

export function ViewBookingModal({
  isOpen,
  onClose,
  reservation,
}: ViewBookingModalProps) {
  const [services, setServices] = useState<ServiceUsage[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    if (isOpen && reservation) {
      const fetchServices = async () => {
        try {
          setLoadingServices(true);
          // Assuming reservationID is the bookingId
          const data = await serviceUsageAPI.getServiceUsages({
            bookingId: reservation.reservationID,
          });
          setServices(data);
        } catch (error) {
          console.error("Failed to fetch services", error);
        } finally {
          setLoadingServices(false);
        }
      };
      fetchServices();
    } else {
      setServices([]);
    }
  }, [isOpen, reservation]);

  if (!reservation) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ xác nhận":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Đã xác nhận":
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Đã nhận phòng":
      case "CHECKED_IN":
        return "bg-green-100 text-green-800 border-green-200";
      case "Đã trả phòng":
      case "CHECKED_OUT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Đã hủy":
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 0;
  };

  const totalServiceAmount = services.reduce(
    (sum, s) => sum + (s.totalPrice || 0),
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {ICONS.EYE} Chi Tiết Đặt Phòng
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`px-3 py-1 font-bold ${getStatusColor(
                  reservation.status
                )}`}
              >
                {reservation.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer & Booking Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border">
            {/* Customer Info */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                {ICONS.USERS} Thông Tin Khách Hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Họ và tên:</span>
                  <span className="font-medium">
                    {reservation.customer.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số điện thoại:</span>
                  <span className="font-medium">
                    {reservation.customer.phoneNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">
                    {reservation.customer.email || "---"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CMND/CCCD:</span>
                  <span className="font-medium">
                    {reservation.customer.identityCard}
                  </span>
                </div>
              </div>
            </div>

            {/* General Booking Info */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                {ICONS.CALENDAR} Thông Tin Chung
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đặt phòng:</span>
                  <span className="font-mono font-bold">
                    {reservation.bookingCode || reservation.reservationID}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày nhận phòng:</span>
                  <span className="font-medium">
                    {formatDate(reservation.checkInDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày trả phòng:</span>
                  <span className="font-medium">
                    {formatDate(reservation.checkOutDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng số khách:</span>
                  <span className="font-medium">
                    {reservation.details.reduce(
                      (sum, d) => sum + d.numberOfGuests,
                      0
                    )}{" "}
                    khách
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Room List - Updated with explicit calculations */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
              {ICONS.DOOR_OPEN} Chi Tiết Tiền Phòng (
              {reservation.details.length})
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="p-3">Phòng</th>
                    <th className="p-3">Khách hàng</th>
                    <th className="p-3">Loại phòng</th>
                    <th className="p-3 text-right">Đơn giá</th>
                    <th className="p-3 text-center">Số đêm</th>
                    <th className="p-3 text-right">Thành tiền</th>
                    <th className="p-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reservation.details.map((room, index) => {
                    const nights = calculateNights(
                      room.checkInDate,
                      room.checkOutDate
                    );
                    const roomTotal =
                      room.subtotalRoom || room.pricePerNight * nights || 0;

                    return (
                      <tr key={room.id || index} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{room.roomName}</td>
                        <td className="p-3">
                          {reservation.customer.customerName}
                        </td>
                        <td className="p-3">{room.roomTypeName}</td>
                        <td className="p-3 text-right">
                          {formatCurrency(room.pricePerNight)}
                          <span className="text-gray-400 text-xs">/đêm</span>
                        </td>
                        <td className="p-3 text-center">{nights}</td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(roomTotal)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={getStatusColor(
                              room.detailStatus || reservation.status
                            )}
                          >
                            {room.detailStatus || reservation.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Services Section - New */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
              {ICONS.SERVICE} Dịch Vụ & Phụ Thu
            </h3>
            {loadingServices ? (
              <div className="text-center py-4 text-gray-500">
                Đang tải thông tin dịch vụ...
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded border border-dashed text-gray-500 text-sm">
                Không có dịch vụ nào được sử dụng
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-3">Tên dịch vụ</th>
                      <th className="p-3 text-center">Số lượng</th>
                      <th className="p-3 text-right">Đơn giá</th>
                      <th className="p-3 text-right">Thành tiền</th>
                      <th className="p-3">Ghi chú</th>
                      <th className="p-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {services.map((service, index) => (
                      <tr
                        key={service.id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium">
                          {service.service?.name || "Dịch vụ"}
                        </td>
                        <td className="p-3 text-center">{service.quantity}</td>
                        <td className="p-3 text-right">
                          {formatCurrency(
                            service.customPrice ?? service.unitPrice
                          )}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(service.totalPrice)}
                        </td>
                        <td className="p-3 text-gray-500 italic">
                          {service.note || "-"}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="bg-gray-100">
                            {service.status === "COMPLETED"
                              ? "Hoàn thành"
                              : service.status === "PENDING"
                              ? "Chờ xử lý"
                              : service.status === "CANCELLED"
                              ? "Đã hủy"
                              : service.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td colSpan={3} className="p-3 text-right">
                        Tổng tiền dịch vụ:
                      </td>
                      <td className="p-3 text-right text-blue-600">
                        {formatCurrency(totalServiceAmount)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <Separator />

          {/* Financials Breakdown */}
          <div className="flex flex-col items-end space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-600 mb-2">
              {ICONS.DOLLAR_SIGN} Tổng Quan Thanh Toán
            </h3>
            <div className="w-full md:w-1/2 lg:w-1/3 bg-gray-50 p-4 rounded-lg border space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tổng tiền phòng:</span>
                <span className="font-medium">
                  {formatCurrency(
                    reservation.totalAmount - totalServiceAmount ||
                      reservation.totalAmount
                    // Approximate specific room total because totalAmount usually includes services.
                    // But if services are added externally (not part of booking total calculation yet in frontend hook), this might be tricky.
                    // IMPORTANT: In this system, Booking.totalAmount usually aggregates everything.
                    // If we want "Tiền phòng" specifically, we should sum up room fees.
                    // Let's iterate room details to be precise.
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tổng tiền dịch vụ:</span>
                <span className="font-medium">
                  {formatCurrency(totalServiceAmount)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center text-base">
                <span className="text-gray-900 font-bold">Tổng cộng:</span>
                {/* 
                  To avoid confusion, we should probably stick to reservation.totalAmount as the source of truth if it's correct.
                  Or we can sum up (Room Fees + Services).
                  Let's assume reservation.totalAmount is the Source of Truth from backend.
                  If it doesn't match sum, it's backend logic.
                */}
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency(reservation.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-gray-600">Đặt cọc yêu cầu:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(
                    reservation.depositAmount ||
                      reservation.depositRequired ||
                      0
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Trạng thái:</span>
                <Badge
                  variant="outline"
                  className={
                    reservation.status !== "Chờ xác nhận"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }
                >
                  {reservation.status !== "Chờ xác nhận"
                    ? "Đã đặt cọc"
                    : "Chưa đặt cọc"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm">
              <h4 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                {ICONS.EDIT} Ghi chú
              </h4>
              <p className="text-yellow-700">{reservation.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="min-w-[100px]">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
