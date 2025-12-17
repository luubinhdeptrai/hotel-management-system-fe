"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONS } from "@/src/constants/icons.enum";
import { mockRooms } from "@/lib/mock-rooms";
import { mockRoomTypes } from "@/lib/mock-room-types";

interface WalkInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: WalkInFormData) => void;
}

export interface WalkInFormData {
  // Customer info
  customerName: string;
  phoneNumber: string;
  identityCard: string;
  email?: string;
  address?: string;
  // Room selection
  roomID: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  // Payment
  depositAmount: number;
  notes?: string;
}

export function WalkInModal({ open, onOpenChange, onConfirm }: WalkInModalProps) {
  const [formData, setFormData] = useState<WalkInFormData>({
    customerName: "",
    phoneNumber: "",
    identityCard: "",
    email: "",
    address: "",
    roomID: "",
    numberOfGuests: 1,
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: "",
    depositAmount: 0,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available rooms (status = "Sẵn sàng")
  const availableRooms = mockRooms.filter((room) => room.roomStatus === "Sẵn sàng");

  const handleChange = (field: keyof WalkInFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập tên khách hàng";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (10 chữ số)";
    }

    if (!formData.identityCard.trim()) {
      newErrors.identityCard = "Vui lòng nhập số CMND/CCCD";
    }

    if (!formData.roomID) {
      newErrors.roomID = "Vui lòng chọn phòng";
    }

    if (!formData.checkOutDate) {
      newErrors.checkOutDate = "Vui lòng chọn ngày trả phòng";
    }

    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);

      if (checkOut <= checkIn) {
        newErrors.checkOutDate = "Ngày trả phải sau ngày nhận";
      }
    }

    if (formData.depositAmount < 0) {
      newErrors.depositAmount = "Tiền cọc không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        customerName: "",
        phoneNumber: "",
        identityCard: "",
        email: "",
        address: "",
        roomID: "",
        numberOfGuests: 1,
        checkInDate: new Date().toISOString().split("T")[0],
        checkOutDate: "",
        depositAmount: 0,
        notes: "",
      });
      setErrors({});
    }
  };

  const selectedRoom = mockRooms.find((r) => r.roomID === formData.roomID);
  const selectedRoomType = selectedRoom
    ? mockRoomTypes.find((rt) => rt.roomTypeID === selectedRoom.roomTypeID)
    : null;

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate || !selectedRoomType) return 0;

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    return selectedRoomType.price * nights;
  };

  const totalAmount = calculateTotal();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-linear-to-br from-white via-gray-50 to-white">
        <DialogHeader className="border-b-2 border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 flex items-center justify-center text-white">{ICONS.USER_PLUS}</div>
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-gray-900">
                Khách vãng lai (Walk-in)
              </DialogTitle>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Tạo phiếu thuê phòng cho khách đến trực tiếp
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 px-1">
          {/* Customer Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 flex items-center justify-center text-primary-600">{ICONS.USER}</div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Thông tin khách hàng
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="customerName" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Tên khách hàng <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${errors.customerName ? "border-red-600" : "border-gray-300"}`}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.customerName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Số điện thoại <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="0901234567"
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${errors.phoneNumber ? "border-red-600" : "border-gray-300"}`}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="identityCard" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  CMND/CCCD <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="identityCard"
                  value={formData.identityCard}
                  onChange={(e) => handleChange("identityCard", e.target.value)}
                  placeholder="079012345678"
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${errors.identityCard ? "border-red-600" : "border-gray-300"}`}
                />
                {errors.identityCard && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.identityCard}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@email.com"
                  className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Lê Lợi, Q.1, TP.HCM"
                  className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>
            </div>
          </div>

          {/* Room & Stay Details */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 flex items-center justify-center text-primary-600">{ICONS.BED_DOUBLE}</div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Thông tin phòng
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="roomID" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Chọn phòng <span className="text-red-600">*</span>
                </Label>
                <Select value={formData.roomID} onValueChange={(value) => handleChange("roomID", value)}>
                  <SelectTrigger className={`h-12 mt-2 border-2 rounded-lg font-medium ${errors.roomID ? "border-red-600" : "border-gray-300"}`}>
                    <SelectValue placeholder="Chọn phòng trống" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.length === 0 ? (
                      <SelectItem value="no-rooms" disabled>
                        Không có phòng trống
                      </SelectItem>
                    ) : (
                      availableRooms.map((room) => (
                        <SelectItem key={room.roomID} value={room.roomID}>
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-semibold">{room.roomName}</span>
                            <span className="text-xs text-gray-500">
                              {room.roomType?.roomTypeName} - {room.roomType?.price.toLocaleString("vi-VN")} ₫/đêm
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.roomID && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.roomID}</p>
                )}
              </div>

              <div className="flex justify-end">
                <div className="w-1/2">
                  <Label htmlFor="numberOfGuests" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Số khách
                  </Label>
                  <Input
                    id="numberOfGuests"
                    type="number"
                    min="1"
                    value={formData.numberOfGuests}
                    onChange={(e) => handleChange("numberOfGuests", parseInt(e.target.value) || 1)}
                    className="h-9 mt-2 border-2 border-gray-300 rounded-lg font-medium text-center w-full"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="checkInDate" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Ngày nhận phòng
                </Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleChange("checkInDate", e.target.value)}
                  className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <Label htmlFor="checkOutDate" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Ngày trả phòng <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleChange("checkOutDate", e.target.value)}
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${errors.checkOutDate ? "border-red-600" : "border-gray-300"}`}
                />
                {errors.checkOutDate && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.checkOutDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="depositAmount" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Tiền cọc (₫)
                </Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  value={formData.depositAmount}
                  onChange={(e) => handleChange("depositAmount", parseInt(e.target.value) || 0)}
                  className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Yêu cầu đặc biệt..."
                  rows={3}
                  className="mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>
            </div>

            {/* Summary */}
            {totalAmount > 0 && (
              <div className="mt-6 p-4 bg-linear-to-r from-primary-50 to-primary-100 rounded-lg border-2 border-primary-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Tổng tiền phòng dự kiến:</span>
                  <span className="text-2xl font-extrabold text-primary-600">
                    {totalAmount.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t-2 border-gray-200 pt-5 bg-gray-50">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 border-2 border-gray-300 font-bold hover:bg-gray-100"
            >
              <div className="w-4 h-4 mr-2 flex items-center justify-center">{ICONS.CLOSE}</div>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-11 px-6 bg-linear-to-r from-success-600 to-success-500 hover:from-success-500 hover:to-success-600 font-bold shadow-lg text-white"
            >
              <div className="w-4 h-4 mr-2 flex items-center justify-center">{ICONS.CHECK}</div>
              Xác nhận Check-in
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

