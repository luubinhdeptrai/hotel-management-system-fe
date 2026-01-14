"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRoomTypePrice } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import { bookingService } from "@/lib/services/booking.service";
import type { AvailableRoom } from "@/lib/types/api";
import type { Room, RoomType } from "@/lib/types/room";
import { logger } from "@/lib/utils/logger";

export interface SelectedRoom extends Room {
  selectedAt: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  pricePerNight: number;
  nights?: number; // Number of nights
  totalPrice?: number; // Total price for selected nights
}

interface RoomSelectorProps {
  checkInDate: string;
  checkOutDate: string;
  roomTypes: RoomType[];
  onRoomsSelected: (rooms: SelectedRoom[]) => void;
  selectedRooms: SelectedRoom[];
  maxRooms?: number; // Limit number of rooms that can be selected
}

interface GroupedAvailableRooms {
  roomTypeId: string;
  roomTypeName: string;
  basePrice: number;
  capacity: number;
  availableCount: number;
  rooms: AvailableRoom[];
}

export function RoomSelector({
  checkInDate,
  checkOutDate,
  roomTypes,
  onRoomsSelected,
  selectedRooms,
  maxRooms = 10,
}: RoomSelectorProps) {
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedRoomTypeFilter, setSelectedRoomTypeFilter] = useState<
    string | undefined
  >();
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [searchRoomNumber, setSearchRoomNumber] = useState<string>("");

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const check_in = new Date(checkInDate);
    const check_out = new Date(checkOutDate);
    return Math.ceil(
      (check_out.getTime() - check_in.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const nights = calculateNights();

  // Load available rooms when dates or filters change
  useEffect(() => {
    if (!checkInDate || !checkOutDate) return;

    const loadAvailableRooms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: any = {
          checkInDate,
          checkOutDate,
          limit: 100, // Max allowed by API validation
        };

        // Add optional filters
        if (selectedRoomTypeFilter && selectedRoomTypeFilter !== "all") {
          params.roomTypeId = selectedRoomTypeFilter;
          logger.log("🔍 FILTER: Room type filter ID:", selectedRoomTypeFilter);
        }
        if (searchRoomNumber) {
          params.search = searchRoomNumber;
        }

        if (minPrice) {
          params.minPrice = parseInt(minPrice);
        }
        if (maxPrice) {
          params.maxPrice = parseInt(maxPrice);
        }

        logger.log(
          "📤 Full params sent to API:",
          JSON.stringify(params, null, 2)
        );
        const rooms = await bookingService.getAvailableRooms(params);

        logger.log("📥 API returned:", rooms.length, "rooms");
        logger.log("Available rooms loaded from service:", rooms);
        logger.log(
          "Rooms array length:",
          Array.isArray(rooms) ? rooms.length : "not an array"
        );
        if (Array.isArray(rooms) && rooms.length > 0) {
          logger.log("First room sample:", rooms[0]);
          const roomTypeIds = [...new Set(rooms.map((r) => r.roomType?.id))];
          logger.log("Unique room type IDs in response:", roomTypeIds);
        }
        logger.log(
          "Available room type IDs from props:",
          roomTypes.map((rt) => rt.roomTypeID)
        );
        setAvailableRooms(Array.isArray(rooms) ? rooms : []);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách phòng. Vui lòng thử lại.";
        logger.error("Failed to load available rooms:", err);
        setError(errorMessage);
        setAvailableRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailableRooms();
  }, [
    checkInDate,
    checkOutDate,
    selectedRoomTypeFilter,
    searchRoomNumber,
    minPrice,
    maxPrice,
    roomTypes,
  ]);

  // Filter to exclude already selected rooms (client-side only)
  const filteredRooms = (
    Array.isArray(availableRooms) ? availableRooms : []
  ).filter((room) => {
    // Exclude already selected rooms
    return !selectedRooms.some((sr) => sr.roomID === room.id);
  });

  // Group filtered rooms by room type
  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const roomTypeId = room.roomType?.id || "unknown";
    const existingGroup = acc.find((g) => g.roomTypeId === roomTypeId);

    if (existingGroup) {
      existingGroup.rooms.push(room);
    } else {
      acc.push({
        roomTypeId,
        roomTypeName: room.roomType?.name || "Loại phòng không xác định",
        basePrice: getRoomTypePrice(room.roomType),
        capacity: room.roomType?.capacity || 0,
        availableCount: filteredRooms.filter(
          (r) => r.roomType?.id === roomTypeId
        ).length,
        rooms: [room],
      });
    }

    return acc;
  }, [] as GroupedAvailableRooms[]);

  const handleSelectRoom = (
    room: AvailableRoom,
    numberOfGuests: number = 1
  ) => {
    if (selectedRooms.length >= (maxRooms || 10)) {
      toast.error(`Bạn chỉ có thể chọn tối đa ${maxRooms || 10} phòng`);
      return;
    }

    if (!room.roomType) {
      toast.error("Thông tin loại phòng không có sẵn");
      return;
    }

    // Use helper function to safely extract price from roomType (handles both basePrice and pricePerNight)
    const pricePerNight = getRoomTypePrice(room.roomType);
    const totalPrice = pricePerNight * nights;

    const newSelectedRoom: SelectedRoom = {
      id: room.id,
      roomNumber: room.roomNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roomID: room.id,
      roomName: room.roomNumber,
      roomTypeID: room.roomType?.id || "",
      roomType: {
        id: room.roomType?.id || "",
        name: room.roomType?.name || "",
        capacity: room.roomType?.capacity || 0,
        totalBed: 0,
        basePrice: pricePerNight,
        roomTypeID: room.roomType.id || "",
        roomTypeName: room.roomType.name,
        price: pricePerNight,
      },
      roomStatus: room.status,
      floor: room.floor,
      selectedAt: new Date().toISOString(),
      checkInDate,
      checkOutDate,
      numberOfGuests,
      pricePerNight,
      nights,
      totalPrice,
    } as SelectedRoom;

    const updated = [...selectedRooms, newSelectedRoom];
    onRoomsSelected(updated);
    toast.success(
      `Đã chọn phòng ${room.roomNumber} - ${
        room.roomType.name
      } (${totalPrice.toLocaleString()}₫)`
    );
  };

  const handleRemoveRoom = (roomId: string) => {
    const updated = selectedRooms.filter((r) => r.roomID !== roomId);
    onRoomsSelected(updated);
    toast.success("Đã xóa phòng khỏi danh sách");
  };

  const handleClearFilters = () => {
    setSelectedRoomTypeFilter(undefined);
    setMinPrice("");
    setMaxPrice("");
    setSearchRoomNumber("");
  };

  return (
    <div className="space-y-6">
      {/* Dates Summary */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Ngày nhận phòng</p>
              <p className="font-semibold">{checkInDate}</p>
            </div>
            <div>
              <p className="text-gray-600">Ngày trả phòng</p>
              <p className="font-semibold">{checkOutDate}</p>
            </div>
            <div>
              <p className="text-gray-600">Phòng đã chọn</p>
              <p className="font-semibold text-blue-600">
                {selectedRooms.length}/{maxRooms}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <span className="text-xl">🔍</span>
              Bộ lọc phòng
            </CardTitle>
            {(selectedRoomTypeFilter ||
              minPrice ||
              maxPrice ||
              searchRoomNumber) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                ✕ Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* First row: Room Type, Floor, Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Room Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                <span className="text-blue-600">🛏️</span> Loại phòng
              </Label>
              <Select
                value={selectedRoomTypeFilter || "all"}
                onValueChange={(val) =>
                  setSelectedRoomTypeFilter(val === "all" ? undefined : val)
                }
              >
                <SelectTrigger className="bg-white border-blue-200 hover:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại phòng</SelectItem>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room Number Search */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                <span className="text-blue-600">🔑</span> Số phòng
              </Label>
              <Input
                placeholder="Nhập số phòng..."
                value={searchRoomNumber}
                onChange={(e) => setSearchRoomNumber(e.target.value)}
                className="bg-white border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Second row: Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-blue-100">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                <span className="text-blue-600">💰</span> Giá tối thiểu (VNĐ)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-white border-blue-200 focus:border-blue-400"
              />
              {minPrice && (
                <p className="text-xs text-blue-600">
                  Từ {parseInt(minPrice).toLocaleString()} VNĐ/đêm
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                <span className="text-blue-600">💰</span> Giá tối đa (VNĐ)
              </Label>
              <Input
                type="number"
                placeholder="999999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-white border-blue-200 focus:border-blue-400"
              />
              {maxPrice && (
                <p className="text-xs text-blue-600">
                  Đến {parseInt(maxPrice).toLocaleString()} VNĐ/đêm
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Đang tải danh sách phòng...</p>
        </div>
      )}

      {/* View Mode Tabs */}
      {!isLoading && filteredRooms.length > 0 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Tìm thấy {filteredRooms.length} phòng có sẵn ({nights} đêm)
            </p>
          </div>

          {/* Grouped Display by Room Type */}
          <div className="space-y-6 max-h-[600px] overflow-y-auto p-2">
            {groupedRooms.map((group) => (
              <div key={group.roomTypeId} className="space-y-3">
                {/* Room Type Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-900">
                        {group.roomTypeName}
                      </p>
                      <p className="text-sm text-blue-700">
                        Sức chứa: {group.capacity} khách | Còn lại:{" "}
                        {group.availableCount} phòng
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        {group.basePrice.toLocaleString()}₫
                      </p>
                      <p className="text-xs text-blue-600">/đêm</p>
                      {nights > 0 && (
                        <p className="text-sm font-semibold text-blue-700">
                          {(group.basePrice * nights).toLocaleString()}₫ (
                          {nights}đ)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rooms in this type */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-2">
                  {group.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all bg-white"
                    >
                      <div className="space-y-2">
                        <div>
                          <p className="text-lg font-bold text-center">
                            {room.roomNumber}
                          </p>
                          <p className="text-xs text-gray-600 text-center">
                            Tầng {room.floor}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="text-sm font-semibold text-blue-600">
                            {(group.basePrice * nights).toLocaleString()}₫
                          </p>
                          <p className="text-xs text-gray-600">
                            {group.basePrice.toLocaleString()}₫ × {nights}đ
                          </p>
                        </div>

                        <Button
                          onClick={() => handleSelectRoom(room)}
                          size="sm"
                          className="w-full"
                          variant="default"
                        >
                          Chọn
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading &&
        filteredRooms.length === 0 &&
        availableRooms.length > 0 && (
          <Alert>
            <AlertDescription>
              Không tìm thấy phòng nào khớp với bộ lọc của bạn. Vui lòng thử
              thay đổi bộ lọc.
            </AlertDescription>
          </Alert>
        )}

      {/* No Available Rooms */}
      {!isLoading && availableRooms.length === 0 && !error && (
        <Alert>
          <AlertDescription>
            Không có phòng nào có sẵn cho khoảng thời gian này. Vui lòng chọn
            ngày khác.
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Rooms Preview */}
      {selectedRooms.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">
              ✓ Phòng đã chọn ({selectedRooms.length}/{maxRooms})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedRooms.map((room) => (
              <div
                key={room.roomID}
                className="flex items-center justify-between p-3 bg-white rounded border border-green-100 hover:border-green-300"
              >
                <div className="flex-1">
                  <p className="font-bold text-lg">{room.roomName}</p>
                  <p className="text-sm text-gray-600">
                    {room.roomType?.roomTypeName ||
                      room.roomType?.name ||
                      "Phòng"}{" "}
                    • Tầng {room.floor}
                  </p>
                  {room.totalPrice && (
                    <p className="text-sm font-semibold text-green-600">
                      {room.pricePerNight.toLocaleString()}₫ × {nights}đ ={" "}
                      {room.totalPrice.toLocaleString()}₫
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRoom(room.roomID || room.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Xóa
                </Button>
              </div>
            ))}

            {/* Summary */}
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between font-semibold">
                <span>
                  Tổng cộng ({selectedRooms.length} phòng × {nights} đêm):
                </span>
                <span className="text-lg text-green-600">
                  {selectedRooms
                    .reduce((sum, r) => sum + (r.totalPrice || 0), 0)
                    .toLocaleString()}
                  ₫
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
