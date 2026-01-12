"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ICONS } from "@/src/constants/icons.enum";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useRoomTransfer,
  useCheckedInRooms,
  useAvailableRoomsForTransfer,
} from "@/hooks/use-room-transfer";
import type { BookingRoom, Room } from "@/lib/types/api";
import { Loader2 } from "lucide-react";

const moveReasons = [
  { value: "Phòng hỏng/bảo trì", label: "Phòng hỏng/bảo trì", icon: ICONS.ALERT_TRIANGLE },
  { value: "Nâng cấp phòng", label: "Nâng cấp phòng", icon: ICONS.ARROW_UP_DOWN },
  { value: "Khách yêu cầu", label: "Khách yêu cầu", icon: ICONS.USER },
  { value: "Giảm cấp phòng", label: "Giảm cấp phòng", icon: ICONS.ARROW_UP_DOWN },
  { value: "other", label: "Lý do khác", icon: ICONS.MORE_VERTICAL },
];

export default function RoomMovePage() {
  // Room Transfer Hooks
  const { transferRoom, isTransferring } = useRoomTransfer();
  const {
    checkedInRooms,
    isLoading: isLoadingCheckedIn,
    refreshCheckedInRooms,
  } = useCheckedInRooms();
  const {
    availableRooms,
    isLoading: isLoadingAvailable,
    searchAvailableRooms,
  } = useAvailableRoomsForTransfer();

  // Form State
  const [selectedBookingRoomId, setSelectedBookingRoomId] = useState("");
  const [selectedNewRoomId, setSelectedNewRoomId] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [currentRoomSearchQuery, setCurrentRoomSearchQuery] = useState("");
  const [newRoomSearchQuery, setNewRoomSearchQuery] = useState("");
  const [transferResult, setTransferResult] = useState<{
    oldRoomNumber: string;
    newRoomNumber: string;
    oldRoomType: string;
    newRoomType: string;
    priceDifference?: number;
  } | null>(null);

  // Load data on mount
  useEffect(() => {
    refreshCheckedInRooms();
    searchAvailableRooms("", ""); // Load all available rooms
  }, [refreshCheckedInRooms, searchAvailableRooms]);

  // Find selected booking room and new room
  const selectedBookingRoom = useMemo(
    () => checkedInRooms.find((br) => br.id === selectedBookingRoomId),
    [checkedInRooms, selectedBookingRoomId]
  );

  const selectedNewRoom = useMemo(
    () => availableRooms.find((r) => r.id === selectedNewRoomId),
    [availableRooms, selectedNewRoomId]
  );

  // Filter checked-in rooms
  const filteredCheckedInRooms = useMemo(() => {
    if (!currentRoomSearchQuery) return checkedInRooms;

    return checkedInRooms.filter((br) => {
      const roomNumber = br.room?.roomNumber || "";
      const guestName =
        br.booking?.primaryCustomer?.fullName?.toLowerCase() || "";
      const query = currentRoomSearchQuery.toLowerCase();

      return roomNumber.includes(query) || guestName.includes(query);
    });
  }, [checkedInRooms, currentRoomSearchQuery]);

  // Filter available rooms
  const filteredAvailableRooms = useMemo(() => {
    if (!newRoomSearchQuery) return availableRooms;

    return availableRooms.filter((room) => {
      const roomNumber = room.roomNumber || "";
      const roomType = room.roomType?.name?.toLowerCase() || "";
      const query = newRoomSearchQuery.toLowerCase();

      return roomNumber.includes(query) || roomType.includes(query);
    });
  }, [availableRooms, newRoomSearchQuery]);

  // Calculate remaining nights for selected booking room
  const remainingNights = useMemo(() => {
    if (!selectedBookingRoom) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOutDate = new Date(selectedBookingRoom.checkOutDate);
    checkOutDate.setHours(0, 0, 0, 0);

    const diffTime = checkOutDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 1);
  }, [selectedBookingRoom]);

  // Handle room transfer
  const handleMoveRoom = async () => {
    if (!selectedBookingRoomId || !selectedNewRoomId) return;

    const finalReason =
      moveReason === "other" ? customReason : moveReason;

    setConfirmOpen(false);

    const result = await transferRoom(
      selectedBookingRoomId,
      selectedNewRoomId,
      finalReason || undefined
    );

    if (result) {
      // Store transfer result for success dialog
      setTransferResult({
        oldRoomNumber: selectedBookingRoom?.room?.roomNumber || "",
        newRoomNumber: result.bookingRoom.room?.roomNumber || "",
        oldRoomType: selectedBookingRoom?.roomType?.name || "",
        newRoomType: result.bookingRoom.roomType?.name || "",
        priceDifference: result.priceAdjustment.priceDifference,
      });

      // Refresh data
      await Promise.all([refreshCheckedInRooms(), searchAvailableRooms("", "")]);

      // Reset form
      setSelectedBookingRoomId("");
      setSelectedNewRoomId("");
      setMoveReason("");
      setCustomReason("");
      setNotes("");

      // Show success dialog
      setTimeout(() => {
        setSuccessOpen(true);
      }, 300);
    }
  };

  const isFormValid =
    selectedBookingRoomId &&
    selectedNewRoomId &&
    (moveReason !== "other" ? moveReason : customReason);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-linear-to-br from-warning-600 via-warning-500 to-warning-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                <div className="w-7 h-7 flex items-center justify-center">
                  <span className="w-7 h-7 text-white flex items-center justify-center">{ICONS.ARROW_RIGHT_LEFT}</span>
                </div>
              </div>
              <h1 className="text-4xl font-extrabold">Chuyển Phòng</h1>
            </div>
            <p className="text-warning-100 text-base">Di chuyển khách giữa các phòng một cách dễ dàng</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-center">
              <div className="text-sm text-warning-100">Phòng đang thuê</div>
              <div className="text-3xl font-bold">{isLoadingCheckedIn ? "..." : checkedInRooms.length}</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-sm text-warning-100">Phòng trống</div>
              <div className="text-3xl font-bold">{isLoadingAvailable ? "..." : availableRooms.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Select Current Room */}
        <Card className="shadow-xl border-2 border-gray-200 rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-br from-primary-50 via-white to-primary-50/30 border-b-2 border-primary-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900">Chọn phòng hiện tại</CardTitle>
                <p className="text-sm text-gray-600">Phòng khách đang ở</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">{ICONS.SEARCH}</span>
                <Input
                  placeholder="Tìm số phòng hoặc tên khách..."
                  value={currentRoomSearchQuery}
                  onChange={(e) => setCurrentRoomSearchQuery(e.target.value)}
                  className="h-11 pl-10 border-gray-300 focus:ring-primary-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingCheckedIn ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {filteredCheckedInRooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Không có phòng nào đang được thuê</p>
                    </div>
                  ) : (
                    filteredCheckedInRooms.map((bookingRoom) => {
                      // Calculate remaining nights for each booking room
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const checkOutDate = new Date(bookingRoom.checkOutDate);
                      checkOutDate.setHours(0, 0, 0, 0);
                      const diffTime = checkOutDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const nights = Math.max(diffDays, 1);

                      return (
                        <div
                          key={bookingRoom.id}
                          onClick={() => setSelectedBookingRoomId(bookingRoom.id)}
                          className={cn(
                            "p-4 border-2 rounded-xl cursor-pointer transition-all",
                            selectedBookingRoomId === bookingRoom.id
                              ? "bg-primary-50 border-primary-600 shadow-lg scale-105"
                              : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-md"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md",
                                selectedBookingRoomId === bookingRoom.id
                                  ? "bg-linear-to-br from-primary-600 to-primary-500 text-white"
                                  : "bg-gray-100 text-gray-700"
                              )}>
                                {bookingRoom.room?.roomNumber || "?"}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {bookingRoom.booking?.primaryCustomer?.fullName || "Chưa rõ"}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {bookingRoom.roomType?.name || "N/A"}
                                  </Badge>
                                  <span>•</span>
                                  <span>{nights} đêm còn lại</span>
                                </div>
                              </div>
                            </div>
                            {selectedBookingRoomId === bookingRoom.id && (
                              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="w-3.5 h-3.5 text-white flex items-center justify-center leading-none">{ICONS.CHECK}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedBookingRoom && (
                  <div className="mt-4 p-4 bg-info-50 border-2 border-info-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-info-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="w-5 h-5 text-white flex items-center justify-center">{ICONS.INFO}</span>
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="font-semibold text-gray-900 mb-1">Thông tin lưu trú</div>
                        <div className="space-y-1 text-gray-700">
                          <div>Check-in: <span className="font-semibold">{new Date(selectedBookingRoom.checkInDate).toLocaleDateString('vi-VN')}</span></div>
                          <div>Check-out: <span className="font-semibold">{new Date(selectedBookingRoom.checkOutDate).toLocaleDateString('vi-VN')}</span></div>
                          <div>Mã booking: <span className="font-semibold">{selectedBookingRoom.booking?.bookingCode}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select New Room */}
        <Card className="shadow-xl border-2 border-gray-200 rounded-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-br from-success-50 via-white to-success-50/30 border-b-2 border-success-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900">Chọn phòng mới</CardTitle>
                <p className="text-sm text-gray-600">Phòng trống khả dụng</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">{ICONS.SEARCH}</span>
                <Input
                  placeholder="Tìm số phòng hoặc loại phòng..."
                  value={newRoomSearchQuery}
                  onChange={(e) => setNewRoomSearchQuery(e.target.value)}
                  className="h-11 pl-10 border-gray-300 focus:ring-success-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingAvailable ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-success-600" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredAvailableRooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Không có phòng trống khả dụng</p>
                  </div>
                ) : (
                  filteredAvailableRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedNewRoomId(room.id)}
                      className={cn(
                        "p-4 border-2 rounded-xl cursor-pointer transition-all",
                        selectedNewRoomId === room.id
                          ? "bg-success-50 border-success-600 shadow-lg scale-105"
                          : "bg-white border-gray-200 hover:border-success-300 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md",
                            selectedNewRoomId === room.id
                              ? "bg-linear-to-br from-success-600 to-success-500 text-white"
                              : "bg-gray-100 text-gray-700"
                          )}>
                            {room.roomNumber}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {room.roomType?.name || "N/A"}
                              <Badge className="bg-success-600 text-white text-xs">Trống</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {Number(room.roomType?.basePrice || room.roomType?.pricePerNight || 0).toLocaleString('vi-VN')}₫/đêm • Tầng {room.floor}
                            </div>
                          </div>
                        </div>
                        {selectedNewRoomId === room.id && (
                          <div className="w-6 h-6 bg-success-600 rounded-full flex items-center justify-center shrink-0">
                            <span className="w-3.5 h-3.5 text-white flex items-center justify-center leading-none">{ICONS.CHECK}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Move Details */}
      <Card className="shadow-xl border-2 border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-br from-warning-50 via-white to-warning-50/30 border-b-2 border-warning-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Thông tin chuyển phòng</CardTitle>
              <p className="text-sm text-gray-600">Lý do và ghi chú</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reason Selection */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-gray-900">
                Lý do chuyển phòng <span className="text-error-600">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {moveReasons.map((reason) => (
                  <div
                    key={reason.value}
                    onClick={() => setMoveReason(reason.value)}
                    className={cn(
                      "p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3",
                      moveReason === reason.value
                        ? "bg-warning-50 border-warning-600 shadow-md"
                        : "bg-white border-gray-200 hover:border-warning-300"
                    )}
                  >
                    <span className={cn(
                      "w-5 h-5",
                      moveReason === reason.value ? "text-warning-700" : "text-gray-500"
                    )}>
                      {reason.icon}
                    </span>
                    <span className={cn(
                      "font-semibold",
                      moveReason === reason.value ? "text-warning-900" : "text-gray-700"
                    )}>
                      {reason.label}
                    </span>
                    {moveReason === reason.value && (
                      <span className="ml-auto w-5 h-5 text-warning-700 flex items-center justify-center">{ICONS.CHECK_CIRCLE}</span>
                    )}
                  </div>
                ))}
              </div>

              {moveReason === "other" && (
                <div className="mt-3">
                  <Input
                    placeholder="Nhập lý do khác..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="h-11 border-2 border-gray-300 focus:ring-warning-500"
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-gray-900">Ghi chú thêm</Label>
              <Textarea
                placeholder="Thêm ghi chú nếu cần..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={10}
                className="resize-none border-2 border-gray-300 focus:ring-warning-500"
              />
            </div>
          </div>

          {/* Summary */}
          {selectedBookingRoom && selectedNewRoom && (
            <div className="mt-6 p-6 bg-linear-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 text-primary-600 flex items-center justify-center">{ICONS.INFO}</span>
                Tóm tắt chuyển phòng
              </h3>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Từ phòng</div>
                  <div className="w-20 h-20 bg-linear-to-br from-error-500 to-error-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedBookingRoom.room?.roomNumber}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">{selectedBookingRoom.roomType?.name}</div>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="w-7 h-7 text-warning-700 flex items-center justify-center">{ICONS.ARROW_RIGHT_LEFT}</span>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Sang phòng</div>
                  <div className="w-20 h-20 bg-linear-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedNewRoom.roomNumber}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">{selectedNewRoom.roomType?.name}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBookingRoomId("");
                setSelectedNewRoomId("");
                setMoveReason("");
                setCustomReason("");
                setNotes("");
              }}
              className="h-12 px-6 font-semibold"
              disabled={isTransferring}
            >
              <span className="w-5 h-5">{ICONS.X}</span>
              <span className="ml-2">Hủy bỏ</span>
            </Button>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!isFormValid || isTransferring}
              className="h-12 px-8 bg-linear-to-r from-warning-600 to-warning-500 hover:from-warning-700 hover:to-warning-600 text-white font-bold shadow-xl disabled:opacity-50"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Đang chuyển...</span>
                </>
              ) : (
                <>
                  <span className="w-5 h-5">{ICONS.ARROW_RIGHT_LEFT}</span>
                  <span className="ml-2">Xác nhận chuyển phòng</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <span className="w-7 h-7 text-warning-700">{ICONS.ALERT_TRIANGLE}</span>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Xác nhận chuyển phòng</DialogTitle>
                <DialogDescription className="text-base">
                  Vui lòng kiểm tra thông tin trước khi xác nhận
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Khách:</span>
                <span className="font-semibold text-gray-900">{selectedBookingRoom?.booking?.primaryCustomer?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Từ phòng:</span>
                <span className="font-semibold text-error-700">{selectedBookingRoom?.room?.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sang phòng:</span>
                <span className="font-semibold text-success-700">{selectedNewRoom?.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lý do:</span>
                <span className="font-semibold text-gray-900">
                  {moveReason === "other" ? customReason : moveReason}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="h-11 font-semibold" disabled={isTransferring}>
              Hủy
            </Button>
            <Button onClick={handleMoveRoom} className="h-11 bg-warning-600 hover:bg-warning-700 text-white font-semibold" disabled={isTransferring}>
              {isTransferring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-success-100 rounded-full flex items-center justify-center">
                <span className="w-8 h-8 text-success-700">{ICONS.CHECK_CIRCLE}</span>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Chuyển phòng thành công!</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Khách đã được chuyển sang phòng mới
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4 py-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-error-100 rounded-xl flex items-center justify-center text-error-700 font-bold text-xl mb-2">
                {transferResult?.oldRoomNumber}
              </div>
              <div className="text-xs text-gray-600">Phòng cũ</div>
              <div className="text-xs text-gray-500 mt-1">{transferResult?.oldRoomType}</div>
            </div>
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
              <span className="w-6 h-6 text-success-700">{ICONS.ARROW_RIGHT_LEFT}</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-xl flex items-center justify-center text-success-700 font-bold text-xl mb-2">
                {transferResult?.newRoomNumber}
              </div>
              <div className="text-xs text-gray-600">Phòng mới</div>
              <div className="text-xs text-gray-500 mt-1">{transferResult?.newRoomType}</div>
            </div>
          </div>
          {transferResult?.priceDifference !== undefined && transferResult.priceDifference !== 0 && (
            <div className={cn(
              "p-4 rounded-lg border-2 text-sm",
              transferResult.priceDifference > 0
                ? "bg-warning-50 border-warning-200 text-warning-900"
                : "bg-success-50 border-success-200 text-success-900"
            )}>
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-5 h-5">{ICONS.INFO}</span>
                <span>Điều chỉnh giá:</span>
                <span className="ml-auto">
                  {transferResult.priceDifference > 0 ? "+" : ""}
                  {transferResult.priceDifference.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <p className="text-xs mt-2 opacity-90">
                {transferResult.priceDifference > 0
                  ? "Khách cần thanh toán thêm do nâng cấp phòng"
                  : "Khách được hoàn lại do giảm giá phòng"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)} className="h-11 w-full bg-success-600 hover:bg-success-700 text-white font-semibold">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
