"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { RoomStatus } from "@/lib/types/room";

export default function HousekeepingPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Local state to manage room statuses
  const [rooms, setRooms] = useState(mockRooms);

  // Filter rooms for housekeeping workflow
  // Shows DIRTY (needs cleaning), CLEANING (in progress), and INSPECTING (awaiting approval)
  const housekeepingRooms = rooms.filter((room) => {
    const status = room.roomStatus;
    const isHousekeepingRelated =
      status === "Bẩn" || status === "Đang dọn" || status === "Đang kiểm tra";

    if (statusFilter === "all") return isHousekeepingRelated;
    return status === statusFilter;
  });

  const handleStatusChange = (roomID: string, newStatus: RoomStatus) => {
    // Update the room status in local state
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.roomID === roomID ? { ...room, roomStatus: newStatus } : room
      )
    );
    // In real app: API call to update room status
    console.log(`Changed room ${roomID} to ${newStatus}`);
  };

  const getStatusColor = (status: RoomStatus) => {
    const colors: Record<string, string> = {
      Bẩn: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Đang dọn": "bg-blue-100 text-blue-800 border-blue-300",
      "Đang kiểm tra": "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status: RoomStatus) => {
    const icons: Record<string, string> = {
      Bẩn: "🟡",
      "Đang dọn": "🧹",
      "Đang kiểm tra": "🔍",
    };
    return icons[status] || "📋";
  };

  // Action button logic based on workflow:
  // DIRTY (Bẩn) → "Start" → CLEANING (Đang dọn)
  // CLEANING (Đang dọn) → "Finish" → INSPECTING (Đang kiểm tra)
  // INSPECTING (Đang kiểm tra) → "Pass Inspection" → READY (Sẵn sàng)
  const getActionButton = (room: (typeof mockRooms)[0]) => {
    if (room.roomStatus === "Bẩn") {
      return (
        <Button
          onClick={() => handleStatusChange(room.roomID, "Đang dọn")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <span className="mr-2">🧹</span>
          Bắt đầu dọn
        </Button>
      );
    }

    if (room.roomStatus === "Đang dọn") {
      return (
        <Button
          onClick={() => handleStatusChange(room.roomID, "Đang kiểm tra")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <span className="mr-2">✓</span>
          Hoàn thành
        </Button>
      );
    }

    if (room.roomStatus === "Đang kiểm tra") {
      return (
        <Button
          onClick={() => handleStatusChange(room.roomID, "Sẵn sàng")}
          className="bg-green-600 hover:bg-green-700"
        >
          {ICONS.CHECK}
          <span className="ml-2">Phê duyệt</span>
        </Button>
      );
    }

    return null;
  };

  // Statistics for workflow stages
  const dirtyCount = rooms.filter((r) => r.roomStatus === "Bẩn").length;
  const cleaningCount = rooms.filter((r) => r.roomStatus === "Đang dọn").length;
  const inspectingCount = rooms.filter(
    (r) => r.roomStatus === "Đang kiểm tra"
  ).length;
  const totalPending = dirtyCount + cleaningCount + inspectingCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Quản lý Buồng phòng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quy trình làm sạch và kiểm tra phòng
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cần dọn</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {dirtyCount}
                </p>
              </div>
              <span className="text-3xl">🟡</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đang dọn</p>
                <p className="text-3xl font-bold text-blue-600">
                  {cleaningCount}
                </p>
              </div>
              <span className="text-3xl">🧹</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Chờ kiểm tra</p>
                <p className="text-3xl font-bold text-purple-600">
                  {inspectingCount}
                </p>
              </div>
              <span className="text-3xl">🔍</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng cần xử lý</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalPending}
                </p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Lọc theo trạng thái:
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Bẩn">🟡 Cần dọn</SelectItem>
                <SelectItem value="Đang dọn">🧹 Đang dọn</SelectItem>
                <SelectItem value="Đang kiểm tra">🔍 Chờ kiểm tra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng ({housekeepingRooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {housekeepingRooms.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Không có phòng nào cần xử lý</p>
              </div>
            ) : (
              housekeepingRooms.map((room) => (
                <div
                  key={room.roomID}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg ${getStatusColor(
                    room.roomStatus
                  )}`}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-lg">{room.roomName}</p>
                      <p className="text-sm text-gray-600">
                        {room.roomType.roomTypeName} • Tầng {room.floor}
                      </p>
                    </div>
                    <Badge className={getStatusColor(room.roomStatus)}>
                      {getStatusIcon(room.roomStatus)} {room.roomStatus}
                    </Badge>
                  </div>
                  {getActionButton(room)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
