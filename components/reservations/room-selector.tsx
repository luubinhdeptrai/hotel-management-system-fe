"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
}

interface RoomSelectorProps {
  checkInDate: string;
  checkOutDate: string;
  roomTypes: RoomType[];
  onRoomsSelected: (rooms: SelectedRoom[]) => void;
  selectedRooms: SelectedRoom[];
  maxRooms?: number; // Limit number of rooms that can be selected
}

interface RoomFilter {
  roomTypeId?: string;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
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
  const [selectedFloor, setSelectedFloor] = useState<string>();
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [searchRoomNumber, setSearchRoomNumber] = useState<string>("");

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load available rooms when dates change
  useEffect(() => {
    if (!checkInDate || !checkOutDate) return;

    const loadAvailableRooms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rooms = await bookingService.getAvailableRooms({
          checkInDate,
          checkOutDate,
          roomTypeId: selectedRoomTypeFilter,
        });

        logger.log("Available rooms loaded:", rooms);
        setAvailableRooms(rooms);
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
  }, [checkInDate, checkOutDate, selectedRoomTypeFilter]);

  // Filter rooms
  const filteredRooms = availableRooms.filter((room) => {
    // Search by room number
    if (
      searchRoomNumber &&
      !room.roomNumber.toLowerCase().includes(searchRoomNumber.toLowerCase())
    ) {
      return false;
    }

    // Filter by floor
    if (selectedFloor && room.floor !== parseInt(selectedFloor)) {
      return false;
    }

    // Filter by price range
    const roomPrice = parseInt(room.roomType?.pricePerNight || "0");
    if (minPrice && roomPrice < parseInt(minPrice)) {
      return false;
    }
    if (maxPrice && roomPrice > parseInt(maxPrice)) {
      return false;
    }

    // Exclude already selected rooms
    if (
      selectedRooms.some((sr) => sr.roomID === room.id)
    ) {
      return false;
    }

    return true;
  });

  const handleSelectRoom = (room: AvailableRoom, numberOfGuests: number = 1) => {
    if (selectedRooms.length >= (maxRooms || 10)) {
      toast.error(`Bạn chỉ có thể chọn tối đa ${maxRooms || 10} phòng`);
      return;
    }

    if (!room.roomType) {
      toast.error("Thông tin loại phòng không có sẵn");
      return;
    }

    const newSelectedRoom: SelectedRoom = {
      roomID: room.id,
      roomName: room.roomNumber,
      roomTypeID: room.roomType?.id || "",
      roomType: {
        roomTypeID: room.roomType.id || "",
        roomTypeName: room.roomType.name,
        price: parseInt(room.roomType.pricePerNight || "0"),
        capacity: room.roomType.capacity,
      },
      roomStatus: "Sẵn sàng" as const,  // Set to available since we fetched available rooms
      floor: room.floor,
      selectedAt: new Date().toISOString(),
      checkInDate,
      checkOutDate,
      numberOfGuests,
      pricePerNight: parseInt(room.roomType.pricePerNight || "0"),
    } as SelectedRoom;

    const updated = [...selectedRooms, newSelectedRoom];
    onRoomsSelected(updated);
    toast.success(
      `Đã chọn phòng ${room.roomNumber} (${room.roomType.name})`
    );
  };

  const handleRemoveRoom = (roomId: string) => {
    const updated = selectedRooms.filter((r) => r.roomID !== roomId);
    onRoomsSelected(updated);
    toast.success("Đã xóa phòng khỏi danh sách");
  };

  const handleClearFilters = () => {
    setSelectedRoomTypeFilter(undefined);
    setSelectedFloor(undefined);
    setMinPrice("");
    setMaxPrice("");
    setSearchRoomNumber("");
  };

  const getFloors = (): number[] => {
    const floors = new Set<number>();
    availableRooms.forEach((room) => floors.add(room.floor));
    return Array.from(floors).sort((a, b) => a - b);
  };

  const getPriceRange = (): { min: number; max: number } => {
    if (availableRooms.length === 0) return { min: 0, max: 1000000 };

    const prices = availableRooms.map((r) => parseInt(r.roomType?.pricePerNight || "0"));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  };

  const priceRange = getPriceRange();
  const floors = getFloors();

  return (
    <div className="space-y-6">
      {/* Dates Summary */}
      <Card>
        <CardContent className="pt-6">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lọc phòng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Room Type Filter */}
            <div>
              <Label className="text-sm">Loại phòng</Label>
              <Select
                value={selectedRoomTypeFilter || "all"}
                onValueChange={(val) =>
                  setSelectedRoomTypeFilter(val === "all" ? undefined : val)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.roomTypeID} value={rt.roomTypeID}>
                      {rt.roomTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Floor Filter */}
            <div>
              <Label className="text-sm">Tầng</Label>
              <Select
                value={selectedFloor || "all"}
                onValueChange={(val) =>
                  setSelectedFloor(val === "all" ? undefined : val)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      Tầng {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Price */}
            <div>
              <Label className="text-sm">Giá từ</Label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            {/* Max Price */}
            <div>
              <Label className="text-sm">Giá đến</Label>
              <Input
                type="number"
                placeholder="999999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Room Number Search */}
          <div>
            <Label className="text-sm">Tìm kiếm phòng số</Label>
            <Input
              placeholder="101, 102, ..."
              value={searchRoomNumber}
              onChange={(e) => setSearchRoomNumber(e.target.value)}
            />
          </div>

          {/* Clear Filters Button */}
          {(selectedRoomTypeFilter ||
            selectedFloor ||
            minPrice ||
            maxPrice ||
            searchRoomNumber) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="w-full"
            >
              Xóa bộ lọc
            </Button>
          )}
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
        <Tabs
          value={viewMode}
          onValueChange={(val) => setViewMode(val as "grid" | "list")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Lưới</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-4">
            <p className="text-sm text-gray-600">
              Tìm thấy {filteredRooms.length} phòng có sẵn
            </p>
            <div className="h-[500px] w-full rounded-md border p-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-lg font-bold">{room.roomNumber}</p>
                          <p className="text-sm text-gray-600">
                            {room.roomType?.name}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>Tầng {room.floor}</span>
                          <Badge variant="outline">
                            Sức chứa: {room.roomType?.capacity}
                          </Badge>
                        </div>

                        <div className="border-t pt-3">
                          <p className="text-sm text-gray-600">Giá mỗi đêm</p>
                          <p className="text-xl font-bold text-blue-600">
                            {parseInt(room.roomType?.pricePerNight || "0").toLocaleString()}₫
                          </p>
                        </div>

                        <Button
                          onClick={() => handleSelectRoom(room)}
                          className="w-full"
                        >
                          Chọn phòng
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            <p className="text-sm text-gray-600">
              Tìm thấy {filteredRooms.length} phòng có sẵn
            </p>
            <div className="h-[500px] w-full rounded-md border overflow-y-auto">
              <div className="space-y-2 p-4">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{room.roomNumber}</p>
                      <p className="text-sm text-gray-600">
                        {room.roomType?.name} • Tầng {room.floor} • Sức chứa:{" "}
                        {room.roomType?.capacity}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-blue-600">
                        {parseInt(room.roomType?.pricePerNight || "0").toLocaleString()}₫
                      </p>
                      <Button
                        onClick={() => handleSelectRoom(room)}
                        size="sm"
                      >
                        Chọn
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!isLoading && filteredRooms.length === 0 && availableRooms.length > 0 && (
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
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">
              Phòng đã chọn ({selectedRooms.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedRooms.map((room) => (
              <div
                key={room.roomID}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <span className="font-semibold">{room.roomName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRoom(room.roomID)}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
