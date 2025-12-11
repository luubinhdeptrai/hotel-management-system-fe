"use client";

import { useState, useMemo } from "react";
import { useRoomFilters } from "@/hooks/use-room-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomCard } from "@/components/rooms/room-card";
import { RoomFormModal } from "@/components/rooms/room-form-modal";
import { RoomFilters } from "@/components/rooms/room-filters";
import { ICONS } from "@/src/constants/icons.enum";
import {
  mockRooms,
  mockRoomTypes,
  getRoomStatistics,
  getUniqueFloors,
  getUniqueRoomTypes,
} from "@/lib/mock-rooms";
import { Room, RoomStatus } from "@/lib/types/room";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Use room filters hook
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredRooms,
    resetFilters,
  } = useRoomFilters({ rooms });

  // Get statistics
  const stats = useMemo(() => getRoomStatistics(rooms), [rooms]);

  // Get unique values for filters
  const uniqueFloors = useMemo(() => getUniqueFloors(rooms), [rooms]);
  const uniqueRoomTypes = useMemo(() => getUniqueRoomTypes(rooms), [rooms]);

  // Handlers
  const handleAddRoom = () => {
    setEditingRoom(null);
    setIsFormModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsFormModalOpen(true);
  };

  const handleDeleteRoom = (room: Room) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa ${room.roomName}?\n\nLưu ý: Nên thực hiện xóa mềm thay vì xóa hoàn toàn.`
      )
    ) {
      setRooms((prev) => prev.filter((r) => r.roomID !== room.roomID));
    }
  };

  const handleStatusChange = (room: Room, newStatus: RoomStatus) => {
    // Confirm for maintenance status
    if (newStatus === "Bảo trì") {
      if (
        !window.confirm(
          `Đánh dấu ${room.roomName} là "Bảo trì"?\n\nCảnh báo: Nếu có đặt phòng trong tương lai, cần kiểm tra và xử lý.`
        )
      ) {
        return;
      }
    }

    setRooms((prev) =>
      prev.map((r) =>
        r.roomID === room.roomID ? { ...r, trangThaiPhong: newStatus } : r
      )
    );
  };

  const handleSaveRoom = (roomData: Partial<Room>) => {
    if (editingRoom) {
      // Update existing room
      setRooms((prev) =>
        prev.map((r) =>
          r.roomID === editingRoom.roomID ? { ...r, ...(roomData as Room) } : r
        )
      );
    } else {
      // Add new room
      if (rooms.find((r) => r.roomID === roomData.roomID)) {
        alert("Mã phòng đã tồn tại. Vui lòng chọn mã khác.");
        return;
      }
      setRooms((prev) => [...prev, roomData as Room]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Quản lý Phòng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Hiển thị trực quan trạng thái tất cả các phòng và cho phép cập nhật
            thông tin
          </p>
        </div>
        <Button
          onClick={handleAddRoom}
          className="bg-primary-600 hover:bg-primary-500"
        >
          <span className="mr-2">{ICONS.PLUS}</span>
          Thêm phòng mới
        </Button>
      </div>

      {/* Statistics Cards - Updated for 5 statuses */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng phòng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              🟢 Sẵn sàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-600">
              {stats.available}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              🔴 Đang thuê
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error-600">
              {stats.occupied}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              🟡 Bẩn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-600">
              {stats.dirty}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              🔵 Đã đặt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info-600">
              {stats.reserved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tỷ lệ lấp đầy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-600">
              {stats.occupancyRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <RoomFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        uniqueRoomTypes={uniqueRoomTypes}
        uniqueFloors={uniqueFloors}
        filteredCount={filteredRooms.length}
        totalCount={rooms.length}
        onReset={resetFilters}
      />

      {/* Rooms Grouped by Floor */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 mb-2">{ICONS.SEARCH}</div>
            <p className="text-gray-500">
              Không tìm thấy phòng nào phù hợp với bộ lọc
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {uniqueFloors
            .sort((a, b) => a - b)
            .map((floor) => {
              const floorRooms = filteredRooms.filter(
                (room) => room.floor === floor
              );
              if (floorRooms.length === 0) return null;

              return (
                <div key={floor} className="space-y-4">
                  {/* Floor Header */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 pl-3 py-1 border-l-4 border-primary-600">
                      <span className="text-primary-600">{ICONS.HOME}</span>
                      <h2 className="text-xl font-bold text-gray-800">
                        Tầng {floor}
                      </h2>
                      <span className="text-sm text-gray-500 font-normal ml-1">
                        ({floorRooms.length} phòng)
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-linear-to-r from-gray-200 to-transparent" />
                  </div>

                  {/* Floor Rooms Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {floorRooms.map((room) => (
                      <RoomCard
                        key={room.roomID}
                        room={room}
                        onEdit={handleEditRoom}
                        onDelete={handleDeleteRoom}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Form Modal */}
      <RoomFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        room={editingRoom}
        roomTypes={mockRoomTypes}
        onSave={handleSaveRoom}
      />
    </div>
  );
}
