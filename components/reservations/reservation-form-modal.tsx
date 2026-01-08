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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ICONS } from "@/src/constants/icons.enum";
import {
  ReservationFormData,
  Reservation,
  RoomTypeSelection,
} from "@/lib/types/reservation";
import { RoomType } from "@/lib/types/room";
import { checkRoomAvailability } from "@/lib/mock-reservations";

interface ReservationDetail {
  roomTypeID?: string;
  roomTypeId?: string;
  roomTypeName?: string;
  roomType?: {
    roomTypeID?: string;
    id?: string;
    roomTypeName?: string;
    name?: string;
  };
  pricePerNight?: number;
  price?: number;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
}

interface ReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReservationFormData) => Promise<void>;
  onCancelReservation?: (reservation: Reservation) => void;
  roomTypes: RoomType[];
  reservation?: Reservation;
  mode: "create" | "edit";
}

export function ReservationFormModal({
  isOpen,
  onClose,
  onSave,
  onCancelReservation,
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
    depositConfirmed: false,
    depositPaymentMethod: "CASH",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  // Track if deposit was already confirmed when modal opened (to disable checkbox)
  const [wasDepositAlreadyConfirmed, setWasDepositAlreadyConfirmed] =
    useState(false);

  // Load data when modal opens or reservation changes
  useEffect(() => {
    let cancelled = false;

    if (!isOpen) return;

    // schedule state updates asynchronously (microtask) to avoid cascading renders
    const schedule = () =>
      Promise.resolve().then(() => {
        if (cancelled) return;

        if (reservation && mode === "edit") {
          // Determine if deposit was already confirmed based on status
          // Status "Đã xác nhận" or higher means deposit was confirmed
          // Note: "Đã đặt" = booked but deposit NOT confirmed yet (pending)
          // Note: "Chờ xác nhận" = waiting for confirmation (deposit not confirmed)
          const isDepositConfirmed =
            reservation.status === "Đã xác nhận" ||
            reservation.status === "Đã nhận phòng" ||
            reservation.status === "Đã trả phòng" ||
            reservation.status === "Đã nhận" ||
            (reservation.paidDeposit !== undefined &&
              reservation.paidDeposit > 0);

          // Track if deposit was already confirmed (for disabling checkbox)
          setWasDepositAlreadyConfirmed(isDepositConfirmed);

          // prepare form data from reservation
          // Extract customer data with fallbacks for optional fields
          const customer = reservation.customer;

          const newFormData: ReservationFormData = {
            customerName: customer?.customerName || "",
            phoneNumber: customer?.phoneNumber || "",
            email: customer?.email || "",
            identityCard: customer?.identityCard || "",
            address: customer?.address || "",
            checkInDate: reservation.details[0]?.checkInDate || "",
            checkOutDate: reservation.details[0]?.checkOutDate || "",
            roomSelections: [],
            depositAmount: reservation.depositAmount || 0,
            notes: reservation.notes || "",
            depositConfirmed: isDepositConfirmed,
            depositPaymentMethod: "CASH", // Default to CASH for edit mode
          };

          // Group details by room type with their dates
          // Normalize possible field names coming from different sources (roomTypeID vs roomTypeId vs nested roomType)
          const groupedRooms = reservation.details.reduce(
            (acc, detail: ReservationDetail) => {
              const roomTypeID =
                detail.roomTypeID ||
                detail.roomTypeId ||
                detail.roomType?.roomTypeID ||
                detail.roomType?.id ||
                "";

              const roomTypeName =
                detail.roomTypeName ||
                detail.roomType?.roomTypeName ||
                detail.roomType?.name ||
                "";

              const pricePerNight = detail.pricePerNight ?? detail.price ?? 0;

              const checkIn = detail.checkInDate || "";
              const checkOut = detail.checkOutDate || "";

              const key = `${roomTypeID}_${checkIn}_${checkOut}`;
              if (!acc[key]) {
                acc[key] = {
                  roomTypeID,
                  roomTypeName,
                  quantity: 0,
                  numberOfGuests: detail.numberOfGuests || 1,
                  pricePerNight,
                  checkInDate: checkIn,
                  checkOutDate: checkOut,
                };
              }
              acc[key].quantity += 1;
              return acc;
            },
            {} as Record<string, RoomTypeSelection>
          );

          if (!cancelled) {
            setFormData(newFormData);
            const roomSelectionsList = Object.values(groupedRooms);
            setRoomSelections(roomSelectionsList);
            // Pre-select first room type when editing
            if (roomSelectionsList.length > 0) {
              setSelectedRoomType(roomSelectionsList[0].roomTypeID);
              setSelectedCheckInDate(roomSelectionsList[0].checkInDate);
              setSelectedCheckOutDate(roomSelectionsList[0].checkOutDate);
              setQuantity(roomSelectionsList[0].quantity);
              setGuestsPerRoom(roomSelectionsList[0].numberOfGuests);
            }
          }
        } else {
          // Reset form for create mode
          if (!cancelled) {
            setWasDepositAlreadyConfirmed(false);
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
              depositConfirmed: false,
              depositPaymentMethod: "CASH",
            });
            setRoomSelections([]);
            setSelectedRoomType("");
            setSelectedCheckInDate("");
            setSelectedCheckOutDate("");
            setQuantity(1);
            setGuestsPerRoom(1);
          }
        }

        if (!cancelled) {
          setErrors({});
          setConflictWarning("");
          setApiError("");
        }
      });

    schedule();

    return () => {
      cancelled = true;
    };
  }, [isOpen, reservation, mode]);

  // Add room type to selections
  const handleAddRoomType = () => {
    if (!selectedRoomType) {
      toast.error("Vui lòng chọn loại phòng!");
      return;
    }

    if (!selectedCheckInDate || !selectedCheckOutDate) {
      toast.error("Vui lòng chọn ngày đến và ngày đi cho phòng này!");
      return;
    }

    // Validate dates
    const checkIn = new Date(selectedCheckInDate);
    const checkOut = new Date(selectedCheckOutDate);
    if (checkOut <= checkIn) {
      toast.error("Ngày đi phải sau ngày đến!");
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

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.address || !formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
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
  const handleSubmit = async () => {
    // Clear previous API error
    setApiError("");

    if (validateForm()) {
      checkAvailability();
      if (!conflictWarning) {
        const submitData: ReservationFormData = {
          ...formData,
          roomSelections,
        };

        setIsSubmitting(true);
        try {
          await onSave(submitData);
          // Only close modal if save was successful (no error thrown)
          toast.success(
            mode === "create"
              ? "Tạo đặt phòng thành công"
              : "Cập nhật đặt phòng thành công"
          );
          onClose();
        } catch (error) {
          // Extract error message from ApiError or generic Error
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi khi tạo đặt phòng. Vui lòng thử lại.";
          setApiError(errorMessage);
          toast.error("Lỗi tạo đặt phòng", {
            description: errorMessage,
          });
        } finally {
          setIsSubmitting(false);
        }
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
      <DialogContent className="!max-w-[700px] !w-[98vw] md:!w-[95vw] lg:!w-[95vw] max-h-[98vh] overflow-hidden flex flex-col bg-gradient-to-br from-white via-gray-50 to-white mx-auto">
        <DialogHeader className="border-b-2 border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="w-6 h-6 text-white">{ICONS.CALENDAR}</span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-gray-900">
                {mode === "create"
                  ? "Tạo đặt phòng mới"
                  : "Chỉnh sửa đặt phòng"}
              </DialogTitle>
              <p className="text-sm text-gray-600 font-medium">
                {mode === "create"
                  ? "Điền thông tin khách hàng và chi tiết đặt phòng"
                  : "Cập nhật thông tin đặt phòng"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 px-1">
          {/* API Error Alert */}
          {apiError && (
            <Alert className="border-2 border-error-600 bg-error-50 shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-error-600 w-5 h-5">
                  {ICONS.ALERT_CIRCLE}
                </span>
                <AlertDescription className="text-error-800 font-semibold">
                  {apiError}
                </AlertDescription>
              </div>
            </Alert>
          )}

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
                <Label
                  htmlFor="customerName"
                  className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  Tên khách hàng <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${
                    errors.customerName ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  Số điện thoại <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="0901234567"
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${
                    errors.phoneNumber ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="identityCard"
                  className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  CMND/CCCD <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="identityCard"
                  value={formData.identityCard}
                  onChange={(e) => handleChange("identityCard", e.target.value)}
                  placeholder="079012345678"
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${
                    errors.identityCard ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.identityCard && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.identityCard}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  Email <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@email.com"
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${
                    errors.email ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  Địa chỉ <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Lê Lợi, Q.1, TP.HCM"
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${
                    errors.address ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">
                    {errors.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-5 h-5 text-primary-600">
                {ICONS.CALENDAR_DAYS}
              </span>
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
                <span className="w-4 h-4 text-primary-600">
                  {ICONS.BED_DOUBLE}
                </span>
                <h4 className="text-base font-extrabold text-gray-900">
                  Thêm phòng vào đặt phòng
                </h4>
              </div>

              {/* Add Room Type Form - NOW WITH DATE INPUTS */}
              <div className="grid grid-cols-1 gap-4 bg-white p-4 rounded-lg border-2 border-gray-200">
                {/* Row 1: Room Type Select */}
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <Label
                      htmlFor="selectRoomType"
                      className="text-sm font-medium"
                    >
                      Loại phòng <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={selectedRoomType}
                      onValueChange={setSelectedRoomType}
                    >
                      <SelectTrigger className="h-10 bg-white mt-1">
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={8}
                        align="start"
                        className="z-50 max-w-xs"
                      >
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
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      className="h-10 mt-1 bg-white text-center text-base font-semibold border-2 border-gray-200 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label
                      htmlFor="guestsPerRoom"
                      className="text-sm font-medium"
                    >
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
                    <Label
                      htmlFor="selectedCheckInDate"
                      className="text-sm font-medium"
                    >
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
                    <Label
                      htmlFor="selectedCheckOutDate"
                      className="text-sm font-medium"
                    >
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
                    const checkIn = selection.checkInDate
                      ? new Date(selection.checkInDate)
                      : null;
                    const checkOut = selection.checkOutDate
                      ? new Date(selection.checkOutDate)
                      : null;
                    const nights =
                      checkIn && checkOut
                        ? Math.ceil(
                            (checkOut.getTime() - checkIn.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 0;
                    const totalPrice =
                      selection.pricePerNight * selection.quantity * nights;

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
                              {selection.pricePerNight.toLocaleString("vi-VN")}{" "}
                              VNĐ/đêm × {selection.quantity} phòng × {nights}{" "}
                              đêm
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
                              setRoomSelections(
                                roomSelections.filter((_, i) => i !== index)
                              );
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
                            <span className="w-4 h-4 text-gray-500">
                              {ICONS.CALENDAR}
                            </span>
                            <div>
                              <p className="text-xs text-gray-500">Ngày đến</p>
                              <p className="font-semibold text-gray-900">
                                {checkIn
                                  ? checkIn.toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-gray-500">
                              {ICONS.CALENDAR_CHECK}
                            </span>
                            <div>
                              <p className="text-xs text-gray-500">Ngày đi</p>
                              <p className="font-semibold text-gray-900">
                                {checkOut
                                  ? checkOut.toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-gray-500">
                              {ICONS.BED_DOUBLE}
                            </span>
                            <div>
                              <p className="text-xs text-gray-500">Số phòng</p>
                              <p className="font-semibold text-gray-900">
                                {selection.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-gray-500">
                              {ICONS.USERS}
                            </span>
                            <div>
                              <p className="text-xs text-gray-500">
                                Khách/phòng
                              </p>
                              <p className="font-semibold text-gray-900">
                                {selection.numberOfGuests}
                              </p>
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
                    <span className="text-gray-600 font-medium">
                      Tổng số phòng:
                    </span>
                    <span className="font-bold text-gray-900 text-base">
                      {totalRooms} phòng
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600 font-medium">
                      Tổng tiền phòng:
                    </span>
                    <span className="font-extrabold text-primary-600 text-xl">
                      {totalAmount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mt-6">
              <Label
                htmlFor="notes"
                className="text-sm font-bold text-gray-700 uppercase tracking-wide"
              >
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

            {/* Deposit Confirmation Section - Show in both create and edit modes */}
            {roomSelections.length > 0 && (
              <div className="mt-6 bg-primary-50 rounded-xl border-2 border-primary-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-5 h-5 text-primary-600">
                    {ICONS.CREDIT_CARD}
                  </span>
                  <h3 className="text-lg font-extrabold text-gray-900">
                    {mode === "create"
                      ? "Xác nhận đặt cọc"
                      : "Trạng thái đặt cọc"}
                  </h3>
                </div>

                {/* Deposit Amount Info */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-primary-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-semibold text-gray-900">
                      {totalAmount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Tiền cọc (30%):</span>
                    <span className="font-bold text-primary-600 text-lg">
                      {Math.round(totalAmount * 0.3).toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-4">
                  <Label
                    htmlFor="depositPaymentMethod"
                    className="text-sm font-medium"
                  >
                    Phương thức thanh toán
                  </Label>
                  <Select
                    value={formData.depositPaymentMethod || "CASH"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        depositPaymentMethod:
                          value as ReservationFormData["depositPaymentMethod"],
                      }))
                    }
                  >
                    <SelectTrigger
                      id="depositPaymentMethod"
                      className="h-10 mt-1 bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tiền mặt</SelectItem>
                      <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
                      <SelectItem value="DEBIT_CARD">Thẻ ghi nợ</SelectItem>
                      <SelectItem value="BANK_TRANSFER">
                        Chuyển khoản
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Confirmation Checkbox */}
                <div
                  className={`flex items-start space-x-3 rounded-md border p-4 ${
                    wasDepositAlreadyConfirmed
                      ? "border-success-300 bg-success-50"
                      : "border-primary-300 bg-white"
                  }`}
                >
                  <Checkbox
                    id="depositConfirmed"
                    checked={formData.depositConfirmed || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        depositConfirmed: checked === true,
                      }))
                    }
                    disabled={wasDepositAlreadyConfirmed}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="depositConfirmed"
                      className={`text-sm font-medium leading-none ${
                        wasDepositAlreadyConfirmed
                          ? "text-success-700"
                          : "cursor-pointer"
                      }`}
                    >
                      {wasDepositAlreadyConfirmed
                        ? "✅ Đã xác nhận nhận tiền cọc"
                        : "Xác nhận đã nhận tiền cọc"}
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      {wasDepositAlreadyConfirmed ? (
                        "Tiền cọc đã được xác nhận. Không thể thay đổi trạng thái này."
                      ) : (
                        <>
                          Tôi xác nhận khách hàng đã thanh toán số tiền{" "}
                          <span className="font-semibold">
                            {Math.round(totalAmount * 0.3).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </span>{" "}
                          bằng phương thức đã chọn
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  <strong>Lưu ý:</strong>{" "}
                  {mode === "create"
                    ? 'Nếu không xác nhận đặt cọc, đặt phòng sẽ ở trạng thái "Chờ xác nhận". Bạn có thể xác nhận đặt cọc sau.'
                    : wasDepositAlreadyConfirmed
                    ? "Đặt phòng đã được xác nhận và không thể hoàn tác trạng thái đặt cọc."
                    : 'Xác nhận đặt cọc sẽ chuyển trạng thái đặt phòng từ "Chờ xác nhận" sang "Đã xác nhận".'}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t-2 border-gray-200 pt-5 bg-gray-50">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600 flex items-center gap-4">
              {totalRooms > 0 && (
                <span className="font-bold">
                  {totalRooms} phòng • {totalAmount.toLocaleString("vi-VN")} VNĐ
                </span>
              )}
              {/* Cancel Reservation Button - only show in edit mode for cancellable reservations */}
              {mode === "edit" &&
                reservation &&
                onCancelReservation &&
                (reservation.status === "Đã đặt" ||
                  reservation.status === "Chờ xác nhận" ||
                  reservation.status === "Đã xác nhận") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onCancelReservation(reservation);
                    }}
                    disabled={isSubmitting}
                    className="h-9 px-4 bg-error-50 border-2 border-error-300 text-error-700 font-bold hover:bg-error-600 hover:text-white hover:border-error-700 transition-all"
                  >
                    <span className="w-4 h-4 mr-1.5">{ICONS.X_CIRCLE}</span>
                    Hủy đặt phòng
                  </Button>
                )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 px-6 border-2 border-gray-300 font-bold hover:bg-gray-100 hover:scale-105 transition-all"
              >
                <span className="w-4 h-4 mr-2">{ICONS.CLOSE}</span>
                Đóng
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 px-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 mr-2 animate-spin">
                      {ICONS.LOADER}
                    </span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 mr-2">{ICONS.SAVE}</span>
                    {mode === "create" ? "Tạo đặt phòng" : "Cập nhật"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
