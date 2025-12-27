"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ICONS } from "@/src/constants/icons.enum";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Mock data
const mockOccupiedRooms = [
  { roomId: "R101", roomNumber: "101", roomType: "Deluxe", guestName: "Nguyễn Văn A", checkInDate: "2025-12-10", checkOutDate: "2025-12-16", nights: 6 },
  { roomId: "R201", roomNumber: "201", roomType: "Suite", guestName: "Trần Thị B", checkInDate: "2025-12-12", checkOutDate: "2025-12-18", nights: 6 },
  { roomId: "R305", roomNumber: "305", roomType: "Standard", guestName: "Lê Văn C", checkInDate: "2025-12-14", checkOutDate: "2025-12-20", nights: 6 },
];

const mockAvailableRooms = [
  { roomId: "R102", roomNumber: "102", roomType: "Deluxe", price: 1200000, floor: 1, status: "Trống" },
  { roomId: "R203", roomNumber: "203", roomType: "Suite", price: 2500000, floor: 2, status: "Trống" },
  { roomId: "R304", roomNumber: "304", roomType: "Standard", price: 800000, floor: 3, status: "Trống" },
  { roomId: "R405", roomNumber: "405", roomType: "Deluxe", price: 1200000, floor: 4, status: "Trống" },
  { roomId: "R106", roomNumber: "106", roomType: "Standard", price: 800000, floor: 1, status: "Trống" },
];

const moveReasons = [
  { value: "maintenance", label: "Phòng hỏng/bảo trì", icon: ICONS.ALERT_TRIANGLE },
  { value: "upgrade", label: "Nâng cấp phòng", icon: ICONS.ARROW_UP_DOWN },
  { value: "customer_request", label: "Khách yêu cầu", icon: ICONS.USER },
  { value: "overstay", label: "Gia hạn/Overstay", icon: ICONS.CALENDAR },
  { value: "other", label: "Lý do khác", icon: ICONS.MORE_VERTICAL },
];

export default function RoomMovePage() {
  const [selectedCurrentRoom, setSelectedCurrentRoom] = useState("");
  const [selectedNewRoom, setSelectedNewRoom] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [currentRoomSearchQuery, setCurrentRoomSearchQuery] = useState("");
  const [newRoomSearchQuery, setNewRoomSearchQuery] = useState("");
  const [succeededRoomData, setSucceededRoomData] = useState<{ current: typeof mockOccupiedRooms[0] | undefined; new: typeof mockAvailableRooms[0] | undefined }>({ current: undefined, new: undefined });

  const currentRoomData = mockOccupiedRooms.find((r) => r.roomId === selectedCurrentRoom);
  const newRoomData = mockAvailableRooms.find((r) => r.roomId === selectedNewRoom);

  const filteredOccupiedRooms = mockOccupiedRooms.filter((room) =>
    room.roomNumber.includes(currentRoomSearchQuery) || room.guestName.toLowerCase().includes(currentRoomSearchQuery.toLowerCase())
  );

  const filteredAvailableRooms = mockAvailableRooms.filter((room) =>
    room.roomNumber.includes(newRoomSearchQuery) || room.roomType.toLowerCase().includes(newRoomSearchQuery.toLowerCase())
  );

  const handleMoveRoom = () => {
    if (currentRoomData && newRoomData) {
      setSucceededRoomData({ current: currentRoomData, new: newRoomData });
    }
    setConfirmOpen(false);
    setTimeout(() => {
      setSuccessOpen(true);
      setSelectedCurrentRoom("");
      setSelectedNewRoom("");
      setMoveReason("");
      setCustomReason("");
      setNotes("");
    }, 500);
  };

  const isFormValid = selectedCurrentRoom && selectedNewRoom && (moveReason !== "other" ? moveReason : customReason);

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
              <div className="text-3xl font-bold">{mockOccupiedRooms.length}</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-sm text-warning-100">Phòng trống</div>
              <div className="text-3xl font-bold">{mockAvailableRooms.length}</div>
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredOccupiedRooms.map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => setSelectedCurrentRoom(room.roomId)}
                    className={cn(
                      "p-4 border-2 rounded-xl cursor-pointer transition-all",
                      selectedCurrentRoom === room.roomId
                        ? "bg-primary-50 border-primary-600 shadow-lg scale-105"
                        : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-md"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md",
                          selectedCurrentRoom === room.roomId
                            ? "bg-linear-to-br from-primary-600 to-primary-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        )}>
                          {room.roomNumber}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{room.guestName}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{room.roomType}</Badge>
                            <span>•</span>
                            <span>{room.nights} đêm</span>
                          </div>
                        </div>
                      </div>
                      {selectedCurrentRoom === room.roomId && (
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="w-3.5 h-3.5 text-white flex items-center justify-center leading-none">{ICONS.CHECK}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {currentRoomData && (
                <div className="mt-4 p-4 bg-info-50 border-2 border-info-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-info-600 rounded-lg flex items-center justify-center shrink-0">
                      <span className="w-5 h-5 text-white flex items-center justify-center">{ICONS.INFO}</span>
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="font-semibold text-gray-900 mb-1">Thông tin lưu trú</div>
                      <div className="space-y-1 text-gray-700">
                        <div>Check-in: <span className="font-semibold">{new Date(currentRoomData.checkInDate).toLocaleDateString('vi-VN')}</span></div>
                        <div>Check-out: <span className="font-semibold">{new Date(currentRoomData.checkOutDate).toLocaleDateString('vi-VN')}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredAvailableRooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => setSelectedNewRoom(room.roomId)}
                  className={cn(
                    "p-4 border-2 rounded-xl cursor-pointer transition-all",
                    selectedNewRoom === room.roomId
                      ? "bg-success-50 border-success-600 shadow-lg scale-105"
                      : "bg-white border-gray-200 hover:border-success-300 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md",
                        selectedNewRoom === room.roomId
                          ? "bg-linear-to-br from-success-600 to-success-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      )}>
                        {room.roomNumber}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {room.roomType}
                          <Badge className="bg-success-600 text-white text-xs">Trống</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {room.price.toLocaleString('vi-VN')}₫/đêm • Tầng {room.floor}
                        </div>
                      </div>
                    </div>
                    {selectedNewRoom === room.roomId && (
                      <div className="w-6 h-6 bg-success-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="w-3.5 h-3.5 text-white flex items-center justify-center leading-none">{ICONS.CHECK}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
          {currentRoomData && newRoomData && (
            <div className="mt-6 p-6 bg-linear-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 text-primary-600 flex items-center justify-center">{ICONS.INFO}</span>
                Tóm tắt chuyển phòng
              </h3>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Từ phòng</div>
                  <div className="w-20 h-20 bg-linear-to-br from-error-500 to-error-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {currentRoomData.roomNumber}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">{currentRoomData.roomType}</div>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="w-7 h-7 text-warning-700 flex items-center justify-center">{ICONS.ARROW_RIGHT_LEFT}</span>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Sang phòng</div>
                  <div className="w-20 h-20 bg-linear-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {newRoomData.roomNumber}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">{newRoomData.roomType}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCurrentRoom("");
                setSelectedNewRoom("");
                setMoveReason("");
                setCustomReason("");
                setNotes("");
              }}
              className="h-12 px-6 font-semibold"
            >
              <span className="w-5 h-5">{ICONS.X}</span>
              <span className="ml-2">Hủy bỏ</span>
            </Button>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!isFormValid}
              className="h-12 px-8 bg-linear-to-r from-warning-600 to-warning-500 hover:from-warning-700 hover:to-warning-600 text-white font-bold shadow-xl disabled:opacity-50"
            >
              <span className="w-5 h-5">{ICONS.ARROW_RIGHT_LEFT}</span>
              <span className="ml-2">Xác nhận chuyển phòng</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-6 h-6 text-white">{ICONS.ALERT_TRIANGLE}</span>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Xác nhận chuyển phòng</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn thực hiện?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Khách hàng:</span>
                <span className="font-semibold text-gray-900">{currentRoomData?.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Từ phòng:</span>
                <span className="font-semibold text-error-700">{currentRoomData?.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sang phòng:</span>
                <span className="font-semibold text-success-700">{newRoomData?.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lý do:</span>
                <span className="font-semibold text-gray-900">
                  {moveReasons.find(r => r.value === moveReason)?.label || customReason}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="h-11 font-semibold">
              Hủy
            </Button>
            <Button onClick={handleMoveRoom} className="h-11 bg-linear-to-r from-warning-600 to-warning-500 hover:from-warning-700 hover:to-warning-600 text-white font-semibold flex items-center">
              <span className="w-5 h-5 flex items-center justify-center">{ICONS.CHECK}</span>
              <span className="ml-2">Xác nhận</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-success-600 to-success-500 rounded-2xl flex items-center justify-center shadow-xl shrink-0">
                <span className="w-10 h-10 text-white flex items-center justify-center">{ICONS.CHECK_CIRCLE}</span>
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
                {succeededRoomData.current?.roomNumber}
              </div>
              <div className="text-xs text-gray-600">Phòng cũ</div>
              <div className="text-xs text-gray-500 mt-1">{succeededRoomData.current?.roomType}</div>
            </div>
            <span className="w-6 h-6 text-success-600">{ICONS.ARROW_RIGHT_LEFT}</span>
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-xl flex items-center justify-center text-success-700 font-bold text-xl mb-2">
                {succeededRoomData.new?.roomNumber}
              </div>
              <div className="text-xs text-gray-600">Phòng mới</div>
              <div className="text-xs text-gray-500 mt-1">{succeededRoomData.new?.roomType}</div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)} className="w-full h-12 bg-linear-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600 text-white font-bold shadow-lg">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
