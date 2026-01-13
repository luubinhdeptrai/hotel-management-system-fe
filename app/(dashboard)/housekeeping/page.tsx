"use client";

import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import type { RoomStatusFE } from "@/lib/api/rooms.api";
import {
  useHousekeepingRooms,
  useUpdateRoomStatus,
  useHousekeepingStats,
} from "@/hooks/useRooms";
import { Skeleton } from "@/components/ui/skeleton";

export default function HousekeepingPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch rooms with CLEANING status from BE API
  const { data: roomsData, isLoading } = useHousekeepingRooms();
  const { data: stats } = useHousekeepingStats();
  const updateStatusMutation = useUpdateRoomStatus();

  const rooms = roomsData?.data || [];

  const housekeepingRooms = rooms.filter((room) => {
    if (statusFilter === "all") return true;
    return room.roomStatus === statusFilter;
  });

  const handleStatusChange = (roomID: string, newStatus: RoomStatusFE) => {
    updateStatusMutation.mutate(
      { roomId: roomID, newStatus },
      {
        onSuccess: () => {
          logger.log(`Changed room ${roomID} to ${newStatus}`);
        },
      }
    );
  };

  const getStatusColor = (status: RoomStatusFE) => {
    const colors: Record<string, string> = {
      "Đang dọn": "bg-info-100 text-info-800 border-info-300",
      "Sẵn sàng": "bg-success-100 text-success-800 border-success-300",
      "Bảo trì": "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status: RoomStatusFE) => {
    if (status === "Đang dọn") return ICONS.SPARKLES;
    if (status === "Sẵn sàng") return ICONS.CHECK_CIRCLE;
    if (status === "Bảo trì") return ICONS.ALERT_CIRCLE;
    return ICONS.CLIPBOARD_LIST;
  };

  const getActionButton = (room: any) => {
    // CLEANING status → can mark as AVAILABLE
    if (room.roomStatus === "Đang dọn") {
      return (
        <Button
          onClick={() => handleStatusChange(room.roomID, "Sẵn sàng")}
          disabled={updateStatusMutation.isPending}
          className="inline-flex items-center gap-2 bg-linear-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600 text-white h-11 px-6 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          <span className="inline-flex items-center justify-center w-4 h-4">
            {ICONS.CHECK_CIRCLE}
          </span>
          Hoàn thành dọn dẹp
        </Button>
      );
    }

    return null;
  };

  const cleaningCount = rooms.filter((r) => r.roomStatus === "Đang dọn").length;
  const totalPending = stats?.cleaning || cleaningCount;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="bg-linear-to-r from-warning-600 to-warning-500 text-white px-4 sm:px-6 lg:px-8 py-8 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-md backdrop-blur-sm">
              <span className="inline-flex items-center justify-center w-8 h-8 text-white">{ICONS.SPARKLES}</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">
                Quản lý Buồng phòng
              </h1>
              <p className="text-warning-100 mt-1">
                Quy trình làm sạch và kiểm tra phòng
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-linear-to-br from-info-50 to-info-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Đang dọn</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {cleaningCount}
                </p>
                <p className="text-xs text-gray-500 mt-2">Đang xử lý</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="w-6 h-6 text-white">{ICONS.SPARKLES}</span>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Sẵn sàng</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {stats?.available || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">Phòng trống</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="w-6 h-6 text-white">{ICONS.CHECK_CIRCLE}</span>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-gray-50 to-gray-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Tổng phòng</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {stats?.total || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">Tổng số</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-gray-600 to-gray-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="w-6 h-6 text-white">{ICONS.CLIPBOARD_LIST}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-5 h-5 text-gray-500">{ICONS.FILTER}</span>
            <label className="text-sm font-semibold text-gray-700">
              Lọc theo trạng thái:
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-60 h-11 border-2 border-gray-200 rounded-lg inline-flex items-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Đang dọn">✨ Đang dọn</SelectItem>
                <SelectItem value="Sẵn sàng">✅ Sẵn sàng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-5 h-5 text-white">{ICONS.DOOR_OPEN}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Danh sách phòng ({housekeepingRooms.length})
              </h2>
              <p className="text-xs text-gray-500">Phòng cần xử lý</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {housekeepingRooms.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-gray-50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="w-8 h-8 text-gray-400">{ICONS.CHECK_CIRCLE}</span>
                </div>
                <p className="text-gray-500 font-medium">Không có phòng nào cần xử lý</p>
                <p className="text-xs text-gray-400 mt-1">Tất cả phòng đã được dọn sạch</p>
              </div>
            ) : (
              housekeepingRooms.map((room) => (
                <div
                  key={room.roomID}
                  className="flex items-center justify-between p-5 border-2 rounded-xl bg-linear-to-r from-white to-gray-50 hover:shadow-md transition-all"
                  style={{
                    borderColor: room.roomStatus === "Đang dọn" ? "#0ea5e9" : "#10b981"
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-700">
                      {room.floor}F
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{room.roomName}</p>
                      <p className="text-sm text-gray-600">
                        {room.roomType.roomTypeName}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(room.roomStatus)} px-3 py-1.5 font-semibold text-sm flex items-center gap-2`}>
                      <span className="inline-flex items-center justify-center w-4 h-4">{getStatusIcon(room.roomStatus)}</span>
                      {room.roomStatus}
                    </Badge>
                  </div>
                  {getActionButton(room)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
