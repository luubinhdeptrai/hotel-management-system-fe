"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// Removed unused Checkbox import
import { ICONS } from "@/src/constants/icons.enum";
import type { BackendCheckInRequest } from "@/lib/types/checkin-checkout";
import type { Booking } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface ModernCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onConfirm: (data: BackendCheckInRequest) => Promise<void>;
  isLoading?: boolean;
}

interface RoomCheckInState {
  bookingRoomId: string;
  customerIds: string[];
  numberOfGuests: number;
}

export function ModernCheckInModal({
  open,
  onOpenChange,
  booking,
  onConfirm,
  isLoading = false,
}: ModernCheckInModalProps) {
  const [checkInStates, setCheckInStates] = useState<RoomCheckInState[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [lastInitializedBookingId, setLastInitializedBookingId] = useState<
    string | null
  >(null);
  const [showGuestRegistration, setShowGuestRegistration] = useState(false);

  // Initialize state when modal opens with new booking data
  // Using React's recommended pattern: set state during render based on props
  // This avoids the cascading renders warning from useEffect
  if (open && booking?.id && booking.id !== lastInitializedBookingId) {
    setLastInitializedBookingId(booking.id);

    const initialStates =
      booking.bookingRooms
        ?.filter((br) => br.status === "CONFIRMED")
        .map((br) => {
          // Get customers already assigned to this room (if any)
          const roomCustomers = br.bookingCustomers?.map(bc => bc.customerId) || [];
          
          // If no customers assigned yet, default to primary customer
          const defaultCustomers = roomCustomers.length > 0 
            ? roomCustomers 
            : [booking.primaryCustomerId];

          return {
            bookingRoomId: br.id,
            customerIds: defaultCustomers,
            numberOfGuests: defaultCustomers.length,
          };
        }) || [];

    setCheckInStates(initialStates);
    setSelectedRooms(new Set(initialStates.map((s) => s.bookingRoomId)));
  }

  // Reset state when modal closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setCheckInStates([]);
        setNotes("");
        setSelectedRooms(new Set());
        setLastInitializedBookingId(null);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const toggleRoomSelection = (bookingRoomId: string) => {
    setSelectedRooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingRoomId)) {
        newSet.delete(bookingRoomId);
      } else {
        newSet.add(bookingRoomId);
      }
      return newSet;
    });
  };
  // Customer assignment helpers removed — backend list endpoint doesn't provide bookingCustomers yet.

  const handleConfirm = async () => {
    if (!booking || selectedRooms.size === 0) return;

    const checkInInfo = checkInStates
      .filter((state) => selectedRooms.has(state.bookingRoomId))
      .map((state) => ({
        bookingRoomId: state.bookingRoomId,
        customerIds: state.customerIds,
      }));

    const requestData: BackendCheckInRequest = {
      checkInInfo,
    };

    try {
      await onConfirm(requestData);
      handleOpenChange(false);
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  if (!booking) return null;

  const formatCurrency = (value: string | number) => {
    const amount = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const confirmedRooms =
    booking.bookingRooms?.filter((br) => br.status === "CONFIRMED" || br.status === "PARTIALLY_CHECKED_OUT" || br.status === "CHECKED_IN") || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modern Header with Gradient */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="w-7 h-7 text-white">{ICONS.CALENDAR_CHECK}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                Check-in Confirmation
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Booking Code:{" "}
                <span className="font-mono font-semibold text-blue-600">
                  {booking.bookingCode}
                </span>
              </DialogDescription>
            </div>
            <Badge
              variant="default"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {confirmedRooms.length}{" "}
              {confirmedRooms.length === 1 ? "Room" : "Rooms"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Guest Information Card */}
          {booking.primaryCustomer && (
            <Card className="border-2 border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="w-5 h-5 text-white">{ICONS.USER}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Guest Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {booking.primaryCustomer.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">
                      {booking.primaryCustomer.phone}
                    </p>
                  </div>
                  {booking.primaryCustomer.email && (
                    <div className="col-span-2">
                      <p className="text-gray-500 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">
                        {booking.primaryCustomer.email}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Details Card */}
          <Card className="border-2 border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="w-5 h-5 text-white">
                    {ICONS.CALENDAR_DAYS}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Stay Details
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Check-in</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(booking.checkInDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Check-out</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(booking.checkOutDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Total Guests</p>
                  <p className="font-semibold text-gray-900">
                    {booking.totalGuests} guests
                  </p>
                </div>
                <div className="col-span-3">
                  <Separator className="my-2" />
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total Amount</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                    {booking.depositRequired && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Deposit Required</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(booking.depositRequired)}</span>
                      </div>
                    )}
                    {booking.balance !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Remaining Balance</span>
                        <span className={`font-bold ${parseFloat(booking.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(booking.balance)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Selection */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <span className="w-5 h-5 text-white">{ICONS.BUILDING}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Select Rooms to Check-in
              </h3>
            </div>
            <div className="space-y-3">
              {confirmedRooms.map((bookingRoom) => {
                const isSelected = selectedRooms.has(bookingRoom.id);
                const state = checkInStates.find(
                  (s) => s.bookingRoomId === bookingRoom.id
                );

                return (
                  <Card
                    key={bookingRoom.id}
                    className={cn(
                      "border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => toggleRoomSelection(bookingRoom.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          )}
                        >
                          {isSelected && (
                            <span className="w-4 h-4 text-white">
                              {ICONS.CHECK}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900">
                              Room{" "}
                              {bookingRoom.room?.roomNumber ||
                                bookingRoom.roomId}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {bookingRoom.roomType?.name || "Room"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">
                                Price/Night
                              </p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(bookingRoom.pricePerNight)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Total</p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(bookingRoom.totalAmount)}
                              </p>
                            </div>
                            {isSelected && state && (
                              <div className="col-span-3 pt-2">
                                <p className="text-xs font-medium text-blue-600">
                                  ✓ {state.customerIds.length} Guest(s) assigned
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Customer Assignment Info */}
                      {isSelected && state && (
                        <div
                          className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-blue-600 font-bold text-lg">ℹ</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                Primary Guest: {booking.primaryCustomer?.fullName || "Guest"}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Total guests assigned: <span className="font-bold text-blue-600">{state.customerIds.length}</span>
                              </p>
                            </div>
                          </div>
                          {bookingRoom.bookingCustomers && bookingRoom.bookingCustomers.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                              <p className="text-xs font-semibold text-gray-700 mb-1">👥 Guests in this room:</p>
                              <div className="space-y-1">
                                {bookingRoom.bookingCustomers.map((bc) => (
                                  <p key={bc.id} className="text-xs text-gray-700 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
                                    {bc.customer?.fullName || `Guest ${bc.customerId.slice(0, 6)}`}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                          {bookingRoom.actualCheckIn && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                              <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                                ✓ Checked in at {new Date(bookingRoom.actualCheckIn).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                            💡 <strong>Tip:</strong> Use the &quot;Guest Names & Special Notes&quot; section below to specify all guest names for this room and any special requests.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Guest Registration Button */}
          <Button
            variant="outline"
            onClick={() => setShowGuestRegistration(true)}
            className="w-full bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-700 font-medium"
          >
            <span className="mr-2">👤</span>
            Đăng ký khách lưu trú (Register Guest Information)
          </Button>

          {/* Notes & Guest Details */}
          <div>
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Guest Names & Special Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Example:&#10;Room 201: John (Primary), Mary, Kid&#10;Room 202: Alice, Bob&#10;&#10;Special requests: Late check-in, high floor, etc."
              className="min-h-24 resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              ℹ️ List all guest names for each room and any special requests
            </p>
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedRooms.size === 0}
            className="min-w-[120px] bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 mr-2 animate-spin">
                  {ICONS.LOADING}
                </span>
                Processing...
              </>
            ) : (
              <>
                <span className="w-4 h-4 mr-2">{ICONS.CHECK}</span>
                Confirm Check-in ({selectedRooms.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Guest Registration Modal */}
      <GuestRegistrationModal
        open={showGuestRegistration}
        onOpenChange={setShowGuestRegistration}
        booking={booking}
      />
    </Dialog>
  );
}

// Guest Registration Modal Component
interface GuestRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

interface GuestInfo {
  fullName: string;
  documentType: string;
  documentNumber: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  checkInDate: string;
  checkOutDate: string;
}

function GuestRegistrationModal({
  open,
  onOpenChange,
  booking,
}: GuestRegistrationModalProps) {
  const [guests, setGuests] = useState<GuestInfo[]>([
    {
      fullName: "",
      documentType: "",
      documentNumber: "",
      dateOfBirth: "",
      nationality: "Việt Nam",
      address: "",
      checkInDate: booking?.checkInDate ? booking.checkInDate.split("T")[0] : "",
      checkOutDate: booking?.checkOutDate ? booking.checkOutDate.split("T")[0] : "",
    },
  ]);

  const documentTypes = [
    { value: "CCCD", label: "Căn cước công dân" },
    { value: "CMND", label: "Chứng minh nhân dân" },
    { value: "PASSPORT", label: "Hộ chiếu" },
    { value: "DRIVER_LICENSE", label: "Bằng lái xe" },
  ];

  const nationalities = [
    "Việt Nam",
    "Thái Lan",
    "Lào",
    "Campuchia",
    "Trung Quốc",
    "Nhật Bản",
    "Hàn Quốc",
    "Mỹ",
    "Anh",
    "Pháp",
    "Đức",
    "Khác",
  ];

  const updateGuest = (
    index: number,
    field: keyof GuestInfo,
    value: string
  ) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setGuests(newGuests);
  };

  const addGuest = () => {
    setGuests([
      ...guests,
      {
        fullName: "",
        documentType: "",
        documentNumber: "",
        dateOfBirth: "",
        nationality: "Việt Nam",
        address: "",
        checkInDate: booking?.checkInDate ? booking.checkInDate.split("T")[0] : "",
        checkOutDate: booking?.checkOutDate ? booking.checkOutDate.split("T")[0] : "",
      },
    ]);
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    // Validate required fields
    const allValid = guests.every(
      (g) => g.fullName && g.documentType && g.documentNumber
    );

    if (!allValid) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Here you would typically save this to backend
    console.log("Registered guests:", guests);
    alert("Đã lưu thông tin khách: " + guests.map(g => g.fullName).join(", "));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Đăng ký khách lưu trú
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Nhập thông tin khách lưu trú. Các trường có (*) là bắt buộc.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 px-6">
          {guests.map((guest, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">Khách {index + 1}</h4>
                {guests.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGuest(index)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    ❌ Xóa
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Nhập họ tên đầy đủ..."
                    value={guest.fullName}
                    onChange={(e) =>
                      updateGuest(index, "fullName", e.target.value)
                    }
                  />
                </div>

                {/* Document Type and Number */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Loại giấy tờ <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={guest.documentType}
                    onChange={(e) =>
                      updateGuest(index, "documentType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn loại...</option>
                    {documentTypes.map((doc) => (
                      <option key={doc.value} value={doc.value}>
                        {doc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Số giấy tờ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Nhập số giấy tờ..."
                    value={guest.documentNumber}
                    onChange={(e) =>
                      updateGuest(index, "documentNumber", e.target.value)
                    }
                  />
                </div>

                {/* Date of Birth and Nationality */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ngày sinh
                  </Label>
                  <Input
                    type="date"
                    value={guest.dateOfBirth}
                    onChange={(e) =>
                      updateGuest(index, "dateOfBirth", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Quốc tịch
                  </Label>
                  <select
                    value={guest.nationality}
                    onChange={(e) =>
                      updateGuest(index, "nationality", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {nationalities.map((nat) => (
                      <option key={nat} value={nat}>
                        {nat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Permanent Address */}
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Địa chỉ thường trú
                  </Label>
                  <Input
                    placeholder="Nhập địa chỉ thường trú..."
                    value={guest.address}
                    onChange={(e) =>
                      updateGuest(index, "address", e.target.value)
                    }
                  />
                </div>

                {/* Check-in and Check-out Dates */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ngày bắt đầu
                  </Label>
                  <Input
                    type="date"
                    value={guest.checkInDate}
                    onChange={(e) =>
                      updateGuest(index, "checkInDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ngày kết thúc
                  </Label>
                  <Input
                    type="date"
                    value={guest.checkOutDate}
                    onChange={(e) =>
                      updateGuest(index, "checkOutDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Guest Button */}
          <Button
            variant="outline"
            onClick={addGuest}
            className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            + Thêm khách
          </Button>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[120px]"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="min-w-[120px] bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            💾 Lưu thông tin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
