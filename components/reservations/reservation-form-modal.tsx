"use client";

import { useState, useEffect } from "react";
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
import {
  ReservationFormData,
  Reservation,
  RoomTypeSelection,
} from "@/lib/types/reservation";
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
    customerName: "",
    phoneNumber: "",
    email: "",
    identityCard: "",
    address: "",
    checkInDate: "", // Keep for backward compatibility
    checkOutDate: "", // Keep for backward compatibility
    roomSelections: [],
    depositAmount: 0,
    notes: "",
  });

  // State for room selections
  const [roomSelections, setRoomSelections] = useState<RoomTypeSelection[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [guestsPerRoom, setGuestsPerRoom] = useState<number>(1);
  // New: State for date selection when adding room
  const [selectedCheckInDate, setSelectedCheckInDate] = useState<string>("");
  const [selectedCheckOutDate, setSelectedCheckOutDate] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string>("");

  // Load data when modal opens or reservation changes
  useEffect(() => {
    let cancelled = false;

    if (!isOpen) return;

    // schedule state updates asynchronously (microtask) to avoid cascading renders
    const schedule = () =>
      Promise.resolve().then(() => {
        if (cancelled) return;

        if (reservation && mode === "edit") {
          // prepare form data from reservation
          const newFormData: ReservationFormData = {
            customerName: reservation.customer.customerName || "",
            phoneNumber: reservation.customer.phoneNumber || "",
            email: reservation.customer.email || "",
            identityCard: reservation.customer.identityCard || "",
            address: reservation.customer.address || "",
            checkInDate: reservation.details[0]?.checkInDate || "",
            checkOutDate: reservation.details[0]?.checkOutDate || "",
            roomSelections: [],
            depositAmount: reservation.depositAmount || 0,
            notes: reservation.notes || "",
          };

          // Group details by room type with their dates
          const groupedRooms = reservation.details.reduce((acc, detail) => {
            const key = `${detail.roomTypeID}_${detail.checkInDate}_${detail.checkOutDate}`;
            if (!acc[key]) {
              acc[key] = {
                roomTypeID: detail.roomTypeID,
                roomTypeName: detail.roomTypeName,
                quantity: 0,
                numberOfGuests: detail.numberOfGuests,
                pricePerNight: detail.pricePerNight,
                checkInDate: detail.checkInDate,
                checkOutDate: detail.checkOutDate,
              };
            }
            acc[key].quantity += 1;
            return acc;
          }, {} as Record<string, RoomTypeSelection>);

          if (!cancelled) {
            setFormData(newFormData);
            setRoomSelections(Object.values(groupedRooms));
          }
        } else {
          // Reset form for create mode
          if (!cancelled) {
            setFormData({
              customerName: "",
              phoneNumber: "",
              email: "",
              identityCard: "",
              address: "",
              checkInDate: "",
              checkOutDate: "",
              roomSelections: [],
              depositAmount: 0,
              notes: "",
            });
            setRoomSelections([]);
          }
        }

        if (!cancelled) {
          setErrors({});
          setConflictWarning("");
        }
      });

    schedule();

    return () => {
      cancelled = true;
    };
  }, [isOpen, reservation, mode]);

  // Add room type to selections
  const handleAddRoomType = () => {    if (!selectedRoomType) {
      alert("Vui lòng chọn loại phòng!");
      return;
    }

    if (!selectedCheckInDate || !selectedCheckOutDate) {
      alert("Vui lòng chọn ngày đến và ngày đi cho phòng này!");
      return;
    }

    // Validate dates
    const checkIn = new Date(selectedCheckInDate);
    const checkOut = new Date(selectedCheckOutDate);
    if (checkOut <= checkIn) {
      alert("Ngày đi phải sau ngày đến!");
      return;
    }

    const roomType = roomTypes.find((rt) => rt.roomTypeID === selectedRoomType);
    if (!roomType) return;

    // Add new room selection with dates
    setRoomSelections([
      ...roomSelections,
      {
        roomTypeID: selectedRoomType,
        roomTypeName: roomType.roomTypeName,
        quantity,
        numberOfGuests: guestsPerRoom,
        pricePerNight: roomType.price,
        checkInDate: selectedCheckInDate,
        checkOutDate: selectedCheckOutDate,
      },
    ]);

    // Reset
    setSelectedRoomType("");
    setQuantity(1);
    setGuestsPerRoom(1);
    setSelectedCheckInDate("");
    setSelectedCheckOutDate("");
  };

  // Remove room type from selections - now using index instead of roomTypeID
  // (removed handleRemoveRoomType - now using inline arrow function in UI)

  // Update room selection - removed as we no longer allow inline editing
  // (removed handleUpdateRoomSelection)

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

    // Remove global date validation - dates are now per room selection

    if (roomSelections.length === 0) {
      newErrors.roomSelections = "Vui lòng thêm ít nhất một loại phòng";
    }

    // Validate each room selection has valid dates
    roomSelections.forEach((selection, index) => {
      if (!selection.checkInDate || !selection.checkOutDate) {
        newErrors[`room_${index}_dates`] = "Thiếu ngày đến/đi cho phòng này";
      } else {
        const checkIn = new Date(selection.checkInDate);
        const checkOut = new Date(selection.checkOutDate);
        if (checkOut <= checkIn) {
          newErrors[`room_${index}_dates`] = "Ngày đi phải sau ngày đến";
        }
      }
    });

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
        const submitData: ReservationFormData = {
          ...formData,
          roomSelections,
        };
        onSave(submitData);
        onClose();
      }
    }
  };

  // Calculate total amount - now per room selection with individual dates
  const calculateTotalAmount = () => {
    return roomSelections.reduce((total, selection) => {
      if (!selection.checkInDate || !selection.checkOutDate) return total;

      const checkIn = new Date(selection.checkInDate);
      const checkOut = new Date(selection.checkOutDate);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      return total + selection.pricePerNight * selection.quantity * nights;
    }, 0);
  };

  const totalAmount = calculateTotalAmount();
  const totalRooms = roomSelections.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[950px] w-[98vw] md:w-[90vw] lg:w-[90vw] max-h-[98vh] overflow-hidden flex flex-col bg-linear-to-br from-white via-gray-50 to-white mx-auto">
        <DialogHeader className="border-b-2 border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="w-6 h-6 text-white">{ICONS.CALENDAR}</span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-gray-900">
                {mode === "create" ? "Tạo đặt phòng mới" : "Chỉnh sửa đặt phòng"}
              </DialogTitle>
              <p className="text-sm text-gray-600 font-medium">
                {mode === "create" ? "Điền thông tin khách hàng và chi tiết đặt phòng" : "Cập nhật thông tin đặt phòng"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 px-1">
          {/* Conflict Warning */}
          {conflictWarning && (
            <Alert className="border-2 border-warning-600 bg-warning-50 shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-warning-600 w-5 h-5">{ICONS.ALERT}</span>
                <AlertDescription className="text-warning-800 font-semibold">
                  {conflictWarning}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Customer Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-5 h-5 text-primary-600">{ICONS.USER}</span>
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
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.customerName}
                  </p>
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
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.phoneNumber}
                  </p>
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
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.identityCard}
                  </p>
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

          {/* Reservation Details */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-5 h-5 text-primary-600">{ICONS.CALENDAR_DAYS}</span>
              <h3 className="text-lg font-extrabold text-gray-900">
                Chi tiết đặt phòng
              </h3>
              <p className="text-sm text-gray-600 ml-auto">
                Chọn loại phòng và thời gian lưu trú cho từng phòng
              </p>
            </div>

            {/* Multi-Room Selection */}
            <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-primary-600">{ICONS.BED_DOUBLE}</span>
                <h4 className="text-base font-extrabold text-gray-900">
                  Thêm phòng vào đặt phòng
                </h4>
              </div>

              {/* Add Room Type Form - NOW WITH DATE INPUTS */}
              <div className="grid grid-cols-1 gap-4 bg-white p-4 rounded-lg border-2 border-gray-200">
                {/* Row 1: Room Type Select */}
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <Label htmlFor="selectRoomType" className="text-sm font-medium">
                      Loại phòng <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={selectedRoomType}
                      onValueChange={setSelectedRoomType}
                    >
                      <SelectTrigger className="h-10 bg-white mt-1">
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={8} align="start" className="z-50 max-w-xs">
                        {roomTypes.map((type) => (
                          <SelectItem
                            key={type.roomTypeID}
                            value={type.roomTypeID}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {type.roomTypeName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {type.price.toLocaleString("vi-VN")} VNĐ/đêm
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="quantity" className="text-sm font-medium">
                      Số lượng <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="h-10 mt-1 bg-white text-center text-base font-semibold border-2 border-gray-200 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="guestsPerRoom" className="text-sm font-medium">
                      Khách/phòng <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="guestsPerRoom"
                      type="number"
                      min="1"
                      value={guestsPerRoom}
                      onChange={(e) =>
                        setGuestsPerRoom(parseInt(e.target.value) || 1)
                      }
                      className="h-10 mt-1 bg-white text-center text-base font-semibold border-2 border-gray-200 rounded-md"
                    />
                  </div>
                </div>

                {/* Row 2: Date Inputs */}
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <Label htmlFor="selectedCheckInDate" className="text-sm font-medium">
                      Ngày đến <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="selectedCheckInDate"
                      type="date"
                      value={selectedCheckInDate}
                      onChange={(e) => setSelectedCheckInDate(e.target.value)}
                      className="h-10 mt-1 border-2 border-gray-300 rounded-md font-medium"
                    />
                  </div>

                  <div className="col-span-5">
                    <Label htmlFor="selectedCheckOutDate" className="text-sm font-medium">
                      Ngày đi <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="selectedCheckOutDate"
                      type="date"
                      value={selectedCheckOutDate}
                      onChange={(e) => setSelectedCheckOutDate(e.target.value)}
                      className="h-10 mt-1 border-2 border-gray-300 rounded-md font-medium"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      onClick={handleAddRoomType}
                      className="h-10 w-full bg-primary-600 hover:bg-primary-500 font-bold"
                    >
                      {ICONS.PLUS}
                      Thêm
                    </Button>
                  </div>
                </div>
              </div>

              {errors.roomSelections && (
                <p className="text-sm text-red-600">{errors.roomSelections}</p>
              )}

              {/* Selected Room Types List */}
              {roomSelections.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Danh sách phòng đã chọn ({roomSelections.length}):
                  </h5>
                  {roomSelections.map((selection, index) => {
                    const checkIn = selection.checkInDate ? new Date(selection.checkInDate) : null;
                    const checkOut = selection.checkOutDate ? new Date(selection.checkOutDate) : null;
                    const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    const totalPrice = selection.pricePerNight * selection.quantity * nights;

                    return (
                      <div
                        key={`${selection.roomTypeID}_${selection.checkInDate}_${index}`}
                        className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                      >
                        {/* Room Type Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h6 className="font-bold text-gray-900 text-base">
                              {selection.roomTypeName}
                            </h6>
                            <p className="text-sm text-gray-600 mt-1">
                              {selection.pricePerNight.toLocaleString("vi-VN")} VNĐ/đêm × {selection.quantity} phòng × {nights} đêm
                            </p>
                            <p className="text-sm font-bold text-primary-600 mt-1">
                              = {totalPrice.toLocaleString("vi-VN")} VNĐ
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setRoomSelections(roomSelections.filter((_, i) => i !== index));
                            }}
                            className="h-8 w-8 text-error-600 hover:bg-error-50"
                            title="Xóa"
                          >
                            {ICONS.TRASH}
                          </Button>
                        </div>

                        {/* Dates and Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-gray-500">{ICONS.CALENDAR}</span>
                            <div>
                              <p className="text-xs text-gray-500">Ngày đến</p>
                              <p className="font-semibold text-gray-900">
                                {checkIn ? checkIn.toLocaleDateString("vi-VN") : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-gray-500">{ICONS.CALENDAR_CHECK}</span>
                            <div>
                              <p className="text-xs text-gray-500">Ngày đi</p>
                              <p className="font-semibold text-gray-900">
                                {checkOut ? checkOut.toLocaleDateString("vi-VN") : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-gray-500">{ICONS.BED_DOUBLE}</span>
                            <div>
                              <p className="text-xs text-gray-500">Số phòng</p>
                              <p className="font-semibold text-gray-900">{selection.quantity}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-gray-500">{ICONS.USERS}</span>
                            <div>
                              <p className="text-xs text-gray-500">Khách/phòng</p>
                              <p className="font-semibold text-gray-900">{selection.numberOfGuests}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary */}
              {roomSelections.length > 0 && (
                <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Tổng số phòng:</span>
                    <span className="font-bold text-gray-900 text-base">
                      {totalRooms} phòng
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600 font-medium">Tổng tiền phòng:</span>
                    <span className="font-extrabold text-primary-600 text-xl">
                      {totalAmount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Deposit */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="depositAmount" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Tiền cọc (VNĐ)
                </Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  value={formData.depositAmount}
                  onChange={(e) =>
                    handleChange("depositAmount", parseInt(e.target.value) || 0)
                  }
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${errors.depositAmount ? "border-red-600" : "border-gray-300"}`}
                />
                {errors.depositAmount && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.depositAmount}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Yêu cầu đặc biệt của khách hàng..."
                  rows={3}
                  className="mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t-2 border-gray-200 pt-5 bg-gray-50">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {totalRooms > 0 && (
                <span className="font-bold">
                  {totalRooms} phòng • {totalAmount.toLocaleString("vi-VN")} VNĐ
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="h-11 px-6 border-2 border-gray-300 font-bold hover:bg-gray-100 hover:scale-105 transition-all"
              >
                <span className="w-4 h-4 mr-2">{ICONS.CLOSE}</span>
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                className="h-11 px-6 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <span className="w-4 h-4 mr-2">{ICONS.SAVE}</span>
                {mode === "create" ? "Tạo đặt phòng" : "Cập nhật"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
