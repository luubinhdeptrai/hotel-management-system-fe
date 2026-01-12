"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import type { RoomType } from "@/lib/types/room";

export interface BookingFormData {
  rooms: Array<{ roomId: string }>;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
}

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isLoading?: boolean;
}

interface RoomSelection {
  roomTypeId: string;
  roomTypeName: string;
  count: number;
  price: number;
}

export function BookingFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: BookingFormModalProps) {
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [totalGuests, setTotalGuests] = useState<string>("1");
  const [roomSelections, setRoomSelections] = useState<RoomSelection[]>([]);
  
  // Add room form
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [roomCount, setRoomCount] = useState<string>("1");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal closes - schedule to avoid cascading updates
  useEffect(() => {
    if (!isOpen) {
      const resetState = () => {
        setCheckInDate("");
        setCheckOutDate("");
        setTotalGuests("1");
        setRoomSelections([]);
        setSelectedRoomType("");
        setRoomCount("1");
        setErrors({});
      };
      Promise.resolve().then(resetState);
    }
  }, [isOpen]);

  const handleAddRoom = () => {
    if (!selectedRoomType) {
      setErrors({ ...errors, roomType: "Vui lòng chọn loại phòng" });
      return;
    }

    const count = parseInt(roomCount);
    if (isNaN(count) || count <= 0) {
      setErrors({ ...errors, roomCount: "Số lượng phòng không hợp lệ" });
      return;
    }

    // TODO: Fetch room types from API
    // For now, skip room type validation
    // const roomType = mockRoomTypes.find((rt: RoomType) => rt.roomTypeID === selectedRoomType);
    // if (!roomType) {
    //   console.error("Room type not found:", selectedRoomType, "Available:", mockRoomTypes);
    //   return;
    // }

    // Check if room type already added
    const existingIndex = roomSelections.findIndex((r) => r.roomTypeId === selectedRoomType);
    if (existingIndex >= 0) {
      // Update existing
      const updated = [...roomSelections];
      updated[existingIndex] = {
        ...updated[existingIndex],
        count: updated[existingIndex].count + count,
      };
      setRoomSelections(updated);
    } else {
      // Add new
      setRoomSelections([
        ...roomSelections,
        {
          roomTypeId: selectedRoomType,
          roomTypeName: selectedRoomType, // TODO: Get from API
          count,
          price: 0, // TODO: Get from API
        },
      ]);
    }

    // Reset add form
    setSelectedRoomType("");
    setRoomCount("1");
    setErrors({ ...errors, roomType: "", roomCount: "" });
  };

  const handleRemoveRoom = (roomTypeId: string) => {
    setRoomSelections(roomSelections.filter((r) => r.roomTypeId !== roomTypeId));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!checkInDate) {
      newErrors.checkInDate = "Vui lòng chọn ngày nhận phòng";
    }

    if (!checkOutDate) {
      newErrors.checkOutDate = "Vui lòng chọn ngày trả phòng";
    }

    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = "Ngày trả phòng phải sau ngày nhận phòng";
      }
    }

    const guests = parseInt(totalGuests);
    if (isNaN(guests) || guests <= 0) {
      newErrors.totalGuests = "Số lượng khách không hợp lệ";
    }

    if (roomSelections.length === 0) {
      newErrors.rooms = "Vui lòng thêm ít nhất một loại phòng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // NOTE: This component is deprecated. Use ReservationFormModal instead.
    // This is kept for backward compatibility but won't work properly
    // because the old booking format (roomTypeId + count) is no longer supported.
    // Backend now requires specific roomIds.
    
    throw new Error(
      'BookingFormModal is deprecated. Use ReservationFormModal instead. ' +
      'Backend requires specific room IDs, not room types.'
    );
  };

  const calculateTotal = (): number => {
    if (!checkInDate || !checkOutDate) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return roomSelections.reduce((sum, room) => {
      return sum + (room.price * room.count * nights);
    }, 0);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 text-primary-600">{ICONS.CALENDAR_DAYS}</span>
            Tạo đặt phòng mới
          </DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự động phân bổ phòng dựa trên loại phòng và số lượng bạn chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Check-in / Check-out Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInDate">Ngày nhận phòng *</Label>
              <Input
                id="checkInDate"
                type="date"
                value={checkInDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.checkInDate && (
                <p className="text-xs text-red-600">{errors.checkInDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutDate">Ngày trả phòng *</Label>
              <Input
                id="checkOutDate"
                type="date"
                value={checkOutDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckOutDate(e.target.value)}
                min={checkInDate || new Date().toISOString().split("T")[0]}
              />
              {errors.checkOutDate && (
                <p className="text-xs text-red-600">{errors.checkOutDate}</p>
              )}
            </div>
          </div>

          {/* Total Guests */}
          <div className="space-y-2">
            <Label htmlFor="totalGuests">Tổng số khách *</Label>
            <Input
              id="totalGuests"
              type="number"
              value={totalGuests}
              onChange={(e) => setTotalGuests(e.target.value)}
              min={1}
              placeholder="Nhập tổng số khách"
            />
            {errors.totalGuests && (
              <p className="text-xs text-red-600">{errors.totalGuests}</p>
            )}
          </div>

          {/* Add Room Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-5 text-primary-600">{ICONS.PLUS}</span>
              Thêm loại phòng
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomType">Loại phòng</Label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger id="roomType" className="w-full">
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {/* TODO: Fetch roomTypes from API */}
                    {[].map((rt: RoomType) => (
                      <SelectItem key={rt.roomTypeID} value={rt.roomTypeID}>
                        <span className="flex items-center gap-2">
                          {rt.roomTypeName} - {formatCurrency(rt.price)}/đêm (Tối đa {rt.capacity} khách)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomType && (
                  <p className="text-xs text-red-600">{errors.roomType}</p>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3 items-end">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="roomCount">Số lượng phòng</Label>
                  <Input
                    id="roomCount"
                    type="number"
                    value={roomCount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomCount(e.target.value)}
                    min={1}
                    max={10}
                    placeholder="Nhập số lượng"
                    className="text-base py-2 px-3"
                  />
                  {errors.roomCount && (
                    <p className="text-xs text-red-600">{errors.roomCount}</p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleAddRoom}
                  disabled={!selectedRoomType || !roomCount}
                  className="col-span-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4"
                >
                  <span className="mr-2">{ICONS.PLUS}</span>
                  Thêm phòng
                </Button>
              </div>
            </div>
          </div>

          {/* Room Selections List */}
          {roomSelections.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Danh sách phòng đã chọn</h3>
              <div className="space-y-2">
                {roomSelections.map((room) => (
                  <div
                    key={room.roomTypeId}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{room.roomTypeName}</p>
                      <p className="text-sm text-gray-600">
                        {room.count} phòng × {formatCurrency(room.price)}/đêm
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRoom(room.roomTypeId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      {ICONS.TRASH}
                    </Button>
                  </div>
                ))}
              </div>
              {errors.rooms && (
                <p className="text-xs text-red-600">{errors.rooms}</p>
              )}
            </div>
          )}

          {/* Total Amount */}
          {roomSelections.length > 0 && checkInDate && checkOutDate && (
            <Alert className="bg-primary-50 border-primary-500 p-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-primary-700">Tổng tiền dự kiến:</span>
                  <span className="font-bold text-lg text-primary-700">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
                <AlertDescription className="text-xs text-primary-600 leading-normal inline">
                  * Bạn sẽ cần thanh toán tiền đặt cọc sau khi tạo đặt phòng
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || roomSelections.length === 0}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Đang xử lý...
              </>
            ) : (
              <>
                <span className="mr-2">{ICONS.CHECK}</span>
                Tạo đặt phòng
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
