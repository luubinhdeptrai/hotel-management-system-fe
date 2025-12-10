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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import { ReservationFormData, Reservation } from "@/lib/types/reservation";
import { RoomType } from "@/lib/types/room";
import { checkRoomAvailability } from "@/lib/mock-reservations";

interface ReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReservationFormData) => void;
  roomTypes: RoomType[];
  reservation?: Reservation;
  mode: "create" | "edit";
}

export function ReservationFormModal({
  isOpen,
  onClose,
  onSave,
  roomTypes,
  reservation,
  mode,
}: ReservationFormModalProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: reservation?.customer.customerName || "",
    phoneNumber: reservation?.customer.phoneNumber || "",
    email: reservation?.customer.email || "",
    identityCard: reservation?.customer.identityCard || "",
    address: reservation?.customer.address || "",
    checkInDate: reservation?.details[0]?.checkInDate || "",
    checkOutDate: reservation?.details[0]?.checkOutDate || "",
    roomTypeID: reservation?.details[0]?.roomTypeName || "",
    numberOfGuests: reservation?.details[0]?.numberOfGuests || 1,
    depositAmount: reservation?.depositAmount || 0,
    notes: reservation?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string>("");

  // Validate form
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

    if (!formData.checkInDate) {
      newErrors.checkInDate = "Vui lòng chọn ngày đến";
    }

    if (!formData.checkOutDate) {
      newErrors.checkOutDate = "Vui lòng chọn ngày đi";
    }

    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);

      if (checkOut <= checkIn) {
        newErrors.checkOutDate = "Ngày đi phải sau ngày đến";
      }
    }

    if (!formData.roomTypeID) {
      newErrors.roomTypeID = "Vui lòng chọn loại phòng";
    }

    if (formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = "Số lượng khách phải lớn hơn 0";
    }

    if (formData.depositAmount < 0) {
      newErrors.depositAmount = "Tiền cọc không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check availability (FR-009)
  const checkAvailability = () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setConflictWarning("");
      return;
    }

    // Mock check - in real app, this would query the backend
    const mockRoomID = "P101"; // Would be selected by user
    const isAvailable = checkRoomAvailability(
      mockRoomID,
      formData.checkInDate,
      formData.checkOutDate,
      reservation?.reservationID
    );

    if (!isAvailable) {
      setConflictWarning(
        "Cảnh báo: Có thể xảy ra xung đột thời gian với đặt phòng khác. Vui lòng kiểm tra lại."
      );
    } else {
      setConflictWarning("");
    }
  };

  // Handle input change
  const handleChange = (
    field: keyof ReservationFormData,
    value: string | number
  ) => {
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

  // Handle submit
  const handleSubmit = () => {
    if (validateForm()) {
      checkAvailability();
      if (!conflictWarning) {
        onSave(formData);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Tạo đặt phòng mới" : "Chỉnh sửa đặt phòng"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Conflict Warning */}
          {conflictWarning && (
            <Alert className="border-warning-600 bg-warning-50">
              <div className="flex items-start gap-2">
                <span className="text-warning-600">{ICONS.ALERT}</span>
                <AlertDescription className="text-warning-700">
                  {conflictWarning}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Customer Information */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">
                  Tên khách hàng <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className={errors.customerName ? "border-red-600" : ""}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber">
                  Số điện thoại <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="0901234567"
                  className={errors.phoneNumber ? "border-red-600" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="identityCard">
                  CMND/CCCD <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="identityCard"
                  value={formData.identityCard}
                  onChange={(e) => handleChange("identityCard", e.target.value)}
                  placeholder="079012345678"
                  className={errors.identityCard ? "border-red-600" : ""}
                />
                {errors.identityCard && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.identityCard}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Lê Lợi, Q.1, TP.HCM"
                />
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Chi tiết đặt phòng
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInDate">
                  Ngày đến <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => {
                    handleChange("checkInDate", e.target.value);
                    checkAvailability();
                  }}
                  className={errors.checkInDate ? "border-red-600" : ""}
                />
                {errors.checkInDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.checkInDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="checkOutDate">
                  Ngày đi <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => {
                    handleChange("checkOutDate", e.target.value);
                    checkAvailability();
                  }}
                  className={errors.checkOutDate ? "border-red-600" : ""}
                />
                {errors.checkOutDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.checkOutDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="roomTypeID">
                  Loại phòng <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.roomTypeID}
                  onValueChange={(value) => handleChange("roomTypeID", value)}
                >
                  <SelectTrigger
                    className={errors.roomTypeID ? "border-red-600" : ""}
                  >
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.roomTypeID} value={type.roomTypeID}>
                        {type.roomTypeName} -{" "}
                        {type.price.toLocaleString("vi-VN")} VNĐ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomTypeID && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.roomTypeID}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="numberOfGuests">
                  Số lượng khách <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  min="1"
                  value={formData.numberOfGuests}
                  onChange={(e) =>
                    handleChange(
                      "numberOfGuests",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className={errors.numberOfGuests ? "border-red-600" : ""}
                />
                {errors.numberOfGuests && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.numberOfGuests}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="depositAmount">Tiền cọc (VNĐ)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  value={formData.depositAmount}
                  onChange={(e) =>
                    handleChange("depositAmount", parseInt(e.target.value) || 0)
                  }
                  className={errors.depositAmount ? "border-red-600" : ""}
                />
                {errors.depositAmount && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.depositAmount}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Yêu cầu đặc biệt của khách hàng..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary-600 hover:bg-primary-500"
          >
            <span className="mr-2">{ICONS.SAVE}</span>
            {mode === "create" ? "Tạo đặt phòng" : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
