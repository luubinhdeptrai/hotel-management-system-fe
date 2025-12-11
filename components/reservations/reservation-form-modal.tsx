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
    customerName: reservation?.customer.customerName || "",
    phoneNumber: reservation?.customer.phoneNumber || "",
    email: reservation?.customer.email || "",
    identityCard: reservation?.customer.identityCard || "",
    address: reservation?.customer.address || "",
    checkInDate: reservation?.details[0]?.checkInDate || "",
    checkOutDate: reservation?.details[0]?.checkOutDate || "",
    roomSelections: [],
    depositAmount: reservation?.depositAmount || 0,
    notes: reservation?.notes || "",
  });

  // State for room selections
  const [roomSelections, setRoomSelections] = useState<RoomTypeSelection[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [guestsPerRoom, setGuestsPerRoom] = useState<number>(1);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string>("");

  // Initialize room selections from reservation if editing
  useEffect(() => {
    if (reservation && mode === "edit") {
      // Group details by room type
      const groupedRooms = reservation.details.reduce((acc, detail) => {
        const key = detail.roomTypeID;
        if (!acc[key]) {
          acc[key] = {
            roomTypeID: detail.roomTypeID,
            roomTypeName: detail.roomTypeName,
            quantity: 0,
            numberOfGuests: detail.numberOfGuests,
            pricePerNight: detail.pricePerNight,
          };
        }
        acc[key].quantity += 1;
        return acc;
      }, {} as Record<string, RoomTypeSelection>);

      setRoomSelections(Object.values(groupedRooms));
    }
  }, [reservation, mode]);

  // Add room type to selections
  const handleAddRoomType = () => {
    if (!selectedRoomType) {
      alert("Vui lòng chọn loại phòng!");
      return;
    }

    // Check if already added
    const existingIndex = roomSelections.findIndex(
      (r) => r.roomTypeID === selectedRoomType
    );

    const roomType = roomTypes.find((rt) => rt.roomTypeID === selectedRoomType);
    if (!roomType) return;

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...roomSelections];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
      setRoomSelections(updated);
    } else {
      // Add new
      setRoomSelections([
        ...roomSelections,
        {
          roomTypeID: selectedRoomType,
          roomTypeName: roomType.roomTypeName,
          quantity,
          numberOfGuests: guestsPerRoom,
          pricePerNight: roomType.price,
        },
      ]);
    }

    // Reset
    setSelectedRoomType("");
    setQuantity(1);
    setGuestsPerRoom(1);
  };

  // Remove room type from selections
  const handleRemoveRoomType = (roomTypeID: string) => {
    setRoomSelections(
      roomSelections.filter((r) => r.roomTypeID !== roomTypeID)
    );
  };

  // Update room selection
  const handleUpdateRoomSelection = (
    roomTypeID: string,
    field: keyof RoomTypeSelection,
    value: number
  ) => {
    setRoomSelections(
      roomSelections.map((r) =>
        r.roomTypeID === roomTypeID ? { ...r, [field]: value } : r
      )
    );
  };

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

    if (roomSelections.length === 0) {
      newErrors.roomSelections = "Vui lòng thêm ít nhất một loại phòng";
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
        const submitData: ReservationFormData = {
          ...formData,
          roomSelections,
        };
        onSave(submitData);
        onClose();
      }
    }
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    return roomSelections.reduce((total, selection) => {
      return total + selection.pricePerNight * selection.quantity * nights;
    }, 0);
  };

  const totalAmount = calculateTotalAmount();
  const totalRooms = roomSelections.reduce((sum, s) => sum + s.quantity, 0);

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
            <div className="grid grid-cols-2 gap-4 mb-6">
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
            </div>

            {/* Multi-Room Selection */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Chọn loại phòng và số lượng
              </h4>

              {/* Add Room Type Form */}
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  <Label htmlFor="selectRoomType" className="text-sm">
                    Loại phòng
                  </Label>
                  <Select
                    value={selectedRoomType}
                    onValueChange={setSelectedRoomType}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Chọn loại phòng" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="col-span-3">
                  <Label htmlFor="quantity" className="text-sm">
                    Số lượng
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-10 bg-white"
                  />
                </div>

                <div className="col-span-3">
                  <Label htmlFor="guestsPerRoom" className="text-sm">
                    Khách/phòng
                  </Label>
                  <Input
                    id="guestsPerRoom"
                    type="number"
                    min="1"
                    value={guestsPerRoom}
                    onChange={(e) =>
                      setGuestsPerRoom(parseInt(e.target.value) || 1)
                    }
                    className="h-10 bg-white"
                  />
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    onClick={handleAddRoomType}
                    size="icon"
                    className="h-10 w-10 bg-primary-600 hover:bg-primary-500"
                  >
                    {ICONS.PLUS}
                  </Button>
                </div>
              </div>

              {errors.roomSelections && (
                <p className="text-sm text-red-600">{errors.roomSelections}</p>
              )}

              {/* Selected Room Types List */}
              {roomSelections.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">
                    Danh sách phòng đã chọn:
                  </h5>
                  {roomSelections.map((selection) => (
                    <div
                      key={selection.roomTypeID}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {selection.roomTypeName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selection.pricePerNight.toLocaleString("vi-VN")}{" "}
                          VNĐ/đêm
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-600">
                            Số phòng:
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={selection.quantity}
                            onChange={(e) =>
                              handleUpdateRoomSelection(
                                selection.roomTypeID,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="h-8 w-16 text-center"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-600">
                            Khách:
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={selection.numberOfGuests}
                            onChange={(e) =>
                              handleUpdateRoomSelection(
                                selection.roomTypeID,
                                "numberOfGuests",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="h-8 w-16 text-center"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveRoomType(selection.roomTypeID)
                          }
                          className="h-8 w-8 text-error-600 hover:bg-error-50"
                        >
                          {ICONS.TRASH}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {roomSelections.length > 0 && (
                <div className="border-t border-gray-300 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng số phòng:</span>
                    <span className="font-semibold text-gray-900">
                      {totalRooms} phòng
                    </span>
                  </div>
                  {formData.checkInDate && formData.checkOutDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng tiền phòng:</span>
                      <span className="font-semibold text-primary-600">
                        {totalAmount.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Deposit */}
            <div className="mt-4">
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

            {/* Notes */}
            <div className="mt-4">
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
