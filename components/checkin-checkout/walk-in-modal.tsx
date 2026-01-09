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
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import { mockRooms } from "@/lib/mock-rooms";
import { mockRoomTypes } from "@/lib/mock-room-types";
import { NguoioFormModal } from "@/components/nguoio/nguoio-form-modal";
import { logger } from "@/lib/utils/logger";
import type { WalkInFormData } from "@/lib/types/checkin-checkout";

interface WalkInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: WalkInFormData) => void;
}

// Room assignment for multiple rooms
interface RoomAssignment {
  roomID: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
}

export function WalkInModal({ open, onOpenChange, onConfirm }: WalkInModalProps) {
  // Customer info state
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    phoneNumber: "",
    identityCard: "",
    email: "",
    address: "",
  });

  // Single room form for quick add
  const [singleRoom, setSingleRoom] = useState({
    roomID: "",
    numberOfGuests: 1,
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: "",
  });

  // Multiple rooms storage
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([]);

  const [depositAmount, setDepositAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nguoioModalOpen, setNguoioModalOpen] = useState(false);

  // Get available rooms (status = "Sẵn sàng") and not already selected
  const [availableRoomsData, setAvailableRoomsData] = useState<typeof mockRooms>([]);

  useEffect(() => {
    const loadAvailableRooms = async () => {
      try {
        // Try to fetch from backend if dates are set
        if (singleRoom.checkInDate && singleRoom.checkOutDate) {
          // TODO: Replace with actual API call when roomService is available
          // const response = await roomService.getAvailableRooms({
          //   checkInDate: singleRoom.checkInDate,
          //   checkOutDate: singleRoom.checkOutDate
          // });
          // setAvailableRoomsData(response);
          
          // For now, use mock data
          const selectedRoomIDs = roomAssignments.map((a) => a.roomID);
          const filtered = mockRooms.filter(
            (room) => room.roomStatus === "Sẵn sàng" && !selectedRoomIDs.includes(room.roomID)
          );
          setAvailableRoomsData(filtered);
        }
      } catch (error) {
        logger.error("Failed to fetch available rooms:", error);
        const selectedRoomIDs = roomAssignments.map((a) => a.roomID);
        const filtered = mockRooms.filter(
          (room) => room.roomStatus === "Sẵn sàng" && !selectedRoomIDs.includes(room.roomID)
        );
        setAvailableRoomsData(filtered);
      }
    };

    loadAvailableRooms();
  }, [singleRoom.checkInDate, singleRoom.checkOutDate, roomAssignments]);

  const getAvailableRooms = () => {
    // Return fetched data if available, otherwise fallback to mock
    return availableRoomsData.length > 0 ? availableRoomsData : mockRooms.filter(
      (room) => room.roomStatus === "Sẵn sàng" && !roomAssignments.map((a) => a.roomID).includes(room.roomID)
    );
  };

  const handleCustomerChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRoomChange = (field: string, value: string | number) => {
    setSingleRoom((prev) => ({ ...prev, [field]: value }));
  };

  const addRoom = () => {
    const roomErrors: Record<string, string> = {};

    if (!singleRoom.roomID) {
      roomErrors.roomID = "Vui lòng chọn phòng";
    }

    if (!singleRoom.checkOutDate) {
      roomErrors.checkOutDate = "Vui lòng chọn ngày trả phòng";
    }

    if (singleRoom.checkInDate && singleRoom.checkOutDate) {
      const checkIn = new Date(singleRoom.checkInDate);
      const checkOut = new Date(singleRoom.checkOutDate);
      if (checkOut <= checkIn) {
        roomErrors.checkOutDate = "Ngày trả phải sau ngày nhận";
      }
    }

    if (Object.keys(roomErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...roomErrors }));
      return;
    }

    // Add room to list
    setRoomAssignments((prev) => [
      ...prev,
      {
        roomID: singleRoom.roomID,
        numberOfGuests: singleRoom.numberOfGuests,
        checkInDate: singleRoom.checkInDate,
        checkOutDate: singleRoom.checkOutDate,
      },
    ]);

    // Reset form
    setSingleRoom({
      roomID: "",
      numberOfGuests: 1,
      checkInDate: new Date().toISOString().split("T")[0],
      checkOutDate: "",
    });

    // Clear errors
    setErrors({});
  };

  const removeRoom = (roomID: string) => {
    setRoomAssignments((prev) => prev.filter((a) => a.roomID !== roomID));
  };

  const handleConfirmNguoio = () => {
    // Handle registered guests - placeholder for guest registration logic
    // Can be expanded in future to integrate guest details with room assignment
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập tên khách hàng";
    }

    if (!customerInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(customerInfo.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (10 chữ số)";
    }

    if (!customerInfo.identityCard.trim()) {
      newErrors.identityCard = "Vui lòng nhập số CMND/CCCD";
    }

    if (roomAssignments.length === 0) {
      newErrors.rooms = "Vui lòng thêm ít nhất một phòng";
    }

    if (depositAmount < 0) {
      newErrors.depositAmount = "Tiền cọc không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Map room assignments to backend format
      const roomsPayload = roomAssignments.map((assignment) => {
        const room = mockRooms.find((r) => r.roomID === assignment.roomID);
        return {
          roomTypeId: room?.roomTypeID || "",
          count: 1, // Each room assignment = 1 room
        };
      });

      // Calculate total guests from all room assignments
      const totalGuests = roomAssignments.reduce(
        (sum, assignment) => sum + assignment.numberOfGuests,
        0
      );

      // Use earliest check-in and latest check-out from all rooms
      const checkInDate =
        roomAssignments.length > 0
          ? roomAssignments[0].checkInDate
          : new Date().toISOString().split("T")[0];
      const checkOutDate =
        roomAssignments.length > 0
          ? roomAssignments[0].checkOutDate
          : new Date(Date.now() + 86400000).toISOString().split("T")[0];

      const formData: WalkInFormData = {
        customerName: customerInfo.customerName,
        phoneNumber: customerInfo.phoneNumber,
        identityCard: customerInfo.identityCard,
        email: customerInfo.email || undefined,
        address: customerInfo.address || undefined,
        rooms: roomsPayload, // Backend format: [{ roomTypeId, count }]
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: totalGuests,
        notes: notes.trim() || undefined,
      };

      onConfirm(formData);
      onOpenChange(false);

      // Reset form
      setCustomerInfo({
        customerName: "",
        phoneNumber: "",
        identityCard: "",
        email: "",
        address: "",
      });
      setSingleRoom({
        roomID: "",
        numberOfGuests: 1,
        checkInDate: new Date().toISOString().split("T")[0],
        checkOutDate: "",
      });
      setRoomAssignments([]);
      setDepositAmount(0);
      setNotes("");
      setErrors({});
    }
  };

  const calculateTotal = (): number => {
    return roomAssignments.reduce((total, assignment) => {
      const room = mockRooms.find((r) => r.roomID === assignment.roomID);
      const roomType = room ? mockRoomTypes.find((rt) => rt.roomTypeID === room.roomTypeID) : null;

      if (!roomType) return total;

      const checkIn = new Date(assignment.checkInDate);
      const checkOut = new Date(assignment.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      return total + roomType.price * nights;
    }, 0);
  };

  const getRoomInfo = (roomID: string) => {
    const room = mockRooms.find((r) => r.roomID === roomID);
    const roomType = room ? mockRoomTypes.find((rt) => rt.roomTypeID === room.roomTypeID) : null;
    return { room, roomType };
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
                Tạo phiếu thuê phòng cho khách đến trực tiếp (hỗ trợ nhiều phòng)
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 px-1">
          {/* Customer Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 flex items-center justify-center text-primary-600">{ICONS.USER}</div>
              <h3 className="text-lg font-extrabold text-gray-900">Thông tin khách hàng</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="customerName" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Tên khách hàng <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={customerInfo.customerName}
                  onChange={(e) => handleCustomerChange("customerName", e.target.value)}
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
                  value={customerInfo.phoneNumber}
                  onChange={(e) => handleCustomerChange("phoneNumber", e.target.value)}
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
                  value={customerInfo.identityCard}
                  onChange={(e) => handleCustomerChange("identityCard", e.target.value)}
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
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerChange("email", e.target.value)}
                  placeholder="example@email.com"
                  className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Địa chỉ</Label>
                <Input
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => handleCustomerChange("address", e.target.value)}
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
              <h3 className="text-lg font-extrabold text-gray-900">Thông tin phòng</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <Label htmlFor="roomID" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Chọn phòng <span className="text-red-600">*</span>
                </Label>
                <Select value={singleRoom.roomID} onValueChange={(value) => handleRoomChange("roomID", value)}>
                  <SelectTrigger className={`h-12 mt-2 border-2 rounded-lg font-medium ${errors.roomID ? "border-red-600" : "border-gray-300"}`}>
                    <SelectValue placeholder="Chọn phòng trống" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRooms().length === 0 ? (
                      <SelectItem value="no-rooms" disabled>
                        Không có phòng trống
                      </SelectItem>
                    ) : (
                      getAvailableRooms().map((room) => (
                        <SelectItem key={room.roomID} value={room.roomID}>
                          <span className="font-semibold">{room.roomName}</span>
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
                    value={singleRoom.numberOfGuests}
                    onChange={(e) => handleRoomChange("numberOfGuests", parseInt(e.target.value) || 1)}
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
                  value={singleRoom.checkInDate}
                  onChange={(e) => handleRoomChange("checkInDate", e.target.value)}
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
                  value={singleRoom.checkOutDate}
                  onChange={(e) => handleRoomChange("checkOutDate", e.target.value)}
                  className={`h-11 mt-2 border-2 rounded-lg font-medium ${errors.checkOutDate ? "border-red-600" : "border-gray-300"}`}
                />
                {errors.checkOutDate && (
                  <p className="text-sm text-red-600 mt-1.5 font-semibold">{errors.checkOutDate}</p>
                )}
              </div>
            </div>

            {/* Add Room Button */}
            <Button
              type="button"
              onClick={addRoom}
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg mb-5"
            >
              <span className="w-5 h-5 mr-2">{ICONS.PLUS}</span>
              Thêm phòng
            </Button>

            {/* Selected Rooms List */}
            {roomAssignments.length > 0 && (
              <div className="space-y-3 border-t-2 border-gray-200 pt-5">
                <h4 className="text-sm font-bold text-gray-900">Phòng đã chọn ({roomAssignments.length})</h4>
                {roomAssignments.map((assignment) => {
                  const { room, roomType } = getRoomInfo(assignment.roomID);
                  const nights = Math.ceil(
                    (new Date(assignment.checkOutDate).getTime() - new Date(assignment.checkInDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const price = roomType ? roomType.price * nights : 0;

                  return (
                    <div key={assignment.roomID} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border-2 border-gray-200">
                      <div>
                        <div className="font-bold text-gray-900">{room?.roomName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {roomType?.roomTypeName} • {nights} đêm • {assignment.numberOfGuests} khách
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(assignment.checkInDate).toLocaleDateString("vi-VN")} → {new Date(assignment.checkOutDate).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">{price.toLocaleString("vi-VN")} ₫</div>
                          <Badge className="mt-1 bg-primary-600 text-white text-xs">{roomType?.roomTypeName}</Badge>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeRoom(assignment.roomID)}
                          variant="destructive"
                          size="sm"
                          className="h-9 w-9 p-0"
                        >
                          <span className="w-4 h-4">{ICONS.TRASH}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {roomAssignments.length === 0 && (
              <div className="bg-warning-50 border-2 border-warning-300 rounded-lg p-4">
                <p className="text-sm text-warning-700 font-semibold">
                  {errors.rooms || "Chưa có phòng nào được chọn"}
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="mt-5 space-y-3 border-t-2 border-gray-200 pt-5">
              <div>
                <Label htmlFor="depositAmount" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Tiền cọc (₫)
                </Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                  className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Yêu cầu đặc biệt..."
                  rows={3}
                  className="mt-2 border-2 border-gray-300 rounded-lg font-medium"
                />
              </div>

              {totalAmount > 0 && (
                <div className="p-4 bg-linear-to-r from-primary-50 to-primary-100 rounded-lg border-2 border-primary-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">Tổng tiền phòng dự kiến:</span>
                    <span className="text-2xl font-extrabold text-primary-600">
                      {totalAmount.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Tiền cọc:</span>
                    <span className="text-lg font-bold text-primary-600">
                      {depositAmount.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t-2 border-gray-200 pt-5 bg-gray-50">
          <div className="flex items-center justify-between w-full gap-3">
            <Button
              onClick={() => setNguoioModalOpen(true)}
              className="h-11 bg-linear-to-r from-info-500 to-info-600 hover:from-info-600 hover:to-info-700 text-white font-bold shadow-md"
            >
              {ICONS.USERS}
              Đăng ký lưu trú 
            </Button>

            <div className="flex items-center justify-end gap-3">
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
                {ICONS.CHECK}
                Xác nhận Check-in
              </Button>
            </div>
          </div>
        </DialogFooter>

        {/* Người ở Modal */}
        <NguoioFormModal 
          open={nguoioModalOpen} 
          onOpenChange={setNguoioModalOpen}
          onSubmit={handleConfirmNguoio}
        />
      </DialogContent>
    </Dialog>
  );
}

