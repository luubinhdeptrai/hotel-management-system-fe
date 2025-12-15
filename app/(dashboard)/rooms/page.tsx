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
    <div className="space-y-8 pb-8">
      {/* Modern Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary-600 via-primary-500 to-blue-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <span className="text-white text-2xl">{ICONS.BED_DOUBLE}</span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
                  Quản lý Phòng
                </h1>
                <p className="text-sm text-white/90 mt-1 font-medium">
                  Hiển thị trực quan trạng thái tất cả các phòng và cho phép cập nhật thông tin
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleAddRoom}
            className="bg-white text-primary-600 hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 font-semibold px-6 h-12"
          >
            <span className="mr-2">{ICONS.PLUS}</span>
            Thêm phòng mới
          </Button>
        </div>
      </div>

      {/* Modern Statistics Cards with Gradients */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Rooms */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-gray-50 to-gray-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-300/20 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Tổng phòng
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500 font-semibold">100% tổng số</div>
          </CardContent>
        </Card>

        {/* Available */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-success-50 to-success-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success-400/20 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-success-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="text-lg">🟢</span> Sẵn sàng
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-extrabold text-success-600 mb-1">
              {stats.available}
            </div>
            <div className="text-xs text-success-600 font-semibold">
              {((stats.available / stats.total) * 100).toFixed(0)}% khả dụng
            </div>
          </CardContent>
        </Card>

        {/* Occupied */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-error-50 to-error-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-error-400/20 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-error-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="text-lg">🔴</span> Đang thuê
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-extrabold text-error-600 mb-1">
              {stats.occupied}
            </div>
            <div className="text-xs text-error-600 font-semibold">
              {((stats.occupied / stats.total) * 100).toFixed(0)}% đang sử dụng
            </div>
          </CardContent>
        </Card>

        {/* Dirty */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-warning-50 to-warning-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-warning-400/20 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-warning-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="text-lg">🟡</span> Bẩn
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-extrabold text-warning-600 mb-1">
              {stats.dirty}
            </div>
            <div className="text-xs text-warning-600 font-semibold">Cần dọn dẹp</div>
          </CardContent>
        </Card>

        {/* Reserved */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-info-50 to-info-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-info-400/20 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-info-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="text-lg">🔵</span> Đã đặt
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-extrabold text-info-600 mb-1">
              {stats.reserved}
            </div>
            <div className="text-xs text-info-600 font-semibold">Có đặt trước</div>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-primary-50 to-primary-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-400/20 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-primary-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="text-lg">📊</span> Lấp đầy
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-extrabold text-primary-600 mb-1">
              {stats.occupancyRate}%
            </div>
            <div className="text-xs text-primary-600 font-semibold">Tỷ lệ hiện tại</div>
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
        <Card className="border-2 border-dashed border-gray-300 bg-linear-to-br from-white to-gray-50 shadow-none">
          <CardContent className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <div className="text-gray-400 text-4xl">{ICONS.SEARCH}</div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Không tìm thấy phòng nào
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Vui lòng thử lại với bộ lọc khác hoặc thêm phòng mới vào hệ thống
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
                <div key={floor} className="space-y-5">
                  {/* Modern Floor Header */}
                  <div className="flex items-center gap-4 group">
                    <div className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-linear-to-r from-primary-600 to-primary-500 shadow-lg shadow-primary-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <span className="text-white text-2xl">{ICONS.HOME}</span>
                      <div>
                        <h2 className="text-2xl font-extrabold text-white">
                          Tầng {floor}
                        </h2>
                        <span className="text-xs text-white/90 font-semibold">
                          {floorRooms.length} phòng
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 h-1 bg-linear-to-r from-primary-300 via-primary-100 to-transparent rounded-full" />
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
