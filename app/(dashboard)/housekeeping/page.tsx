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
import { mockRooms } from "@/lib/mock-rooms";
import type { RoomStatus } from "@/lib/types/room";

export default function HousekeepingPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rooms, setRooms] = useState(mockRooms);

  const housekeepingRooms = rooms.filter((room) => {
    const status = room.roomStatus;
    const isHousekeepingRelated =
      status === "Bẩn" || status === "Đang dọn" || status === "Đang kiểm tra";

    if (statusFilter === "all") return isHousekeepingRelated;
    return status === statusFilter;
  });

  const handleStatusChange = (roomID: string, newStatus: RoomStatus) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.roomID === roomID ? { ...room, roomStatus: newStatus } : room
      )
    );
    logger.log(`Changed room ${roomID} to ${newStatus}`);
  };

  const getStatusColor = (status: RoomStatus) => {
    const colors: Record<string, string> = {
      Bẩn: "bg-warning-100 text-warning-800 border-warning-300",
      "Đang dọn": "bg-info-100 text-info-800 border-info-300",
      "Đang kiểm tra": "bg-primary-100 text-primary-800 border-primary-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status: RoomStatus) => {
    if (status === "Bẩn") return ICONS.ALERT_CIRCLE;
    if (status === "Đang dọn") return ICONS.SPARKLES;
    if (status === "Đang kiểm tra") return ICONS.SEARCH;
    return ICONS.CLIPBOARD_LIST;
  };

  const getActionButton = (room: (typeof mockRooms)[0]) => {
    if (room.roomStatus === "Bẩn") {
      return (
        <Button
          onClick={() => handleStatusChange(room.roomID, "Đang dọn")}
          className="inline-flex items-center gap-2 bg-linear-to-r from-info-600 to-info-500 hover:from-info-700 hover:to-info-600 text-white h-11 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.SPARKLES}</span>
          Bắt đầu dọn
        </Button>
      );
    }

    if (room.roomStatus === "Đang dọn") {
      return (
        <Button
          onClick={() => handleStatusChange(room.roomID, "Đang kiểm tra")}
          className="inline-flex items-center gap-2 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white h-11 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.CHECK}</span>
          Hoàn thành
        </Button>
      );
    }

    if (room.roomStatus === "Đang kiểm tra") {
      return (
        <Button
          onClick={() => handleStatusChange(room.roomID, "Sẵn sàng")}
          className="inline-flex items-center gap-2 bg-linear-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600 text-white h-11 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.CHECK_CIRCLE}</span>
          Phê duyệt
        </Button>
      );
    }

    return null;
  };

  const dirtyCount = rooms.filter((r) => r.roomStatus === "Bẩn").length;
  const cleaningCount = rooms.filter((r) => r.roomStatus === "Đang dọn").length;
  const inspectingCount = rooms.filter(
    (r) => r.roomStatus === "Đang kiểm tra"
  ).length;
  const totalPending = dirtyCount + cleaningCount + inspectingCount;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-linear-to-br from-warning-50 to-warning-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Cần dọn</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {dirtyCount}
                </p>
                <p className="text-xs text-gray-500 mt-2">Phòng bẩn</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="w-6 h-6 text-white">{ICONS.ALERT_CIRCLE}</span>
              </div>
            </div>
          </div>

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

          <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Chờ kiểm tra</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {inspectingCount}
                </p>
                <p className="text-xs text-gray-500 mt-2">Cần phê duyệt</p>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="w-6 h-6 text-white">{ICONS.SEARCH}</span>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-gray-50 to-gray-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Tổng cần xử lý</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {totalPending}
                </p>
                <p className="text-xs text-gray-500 mt-2">Tất cả trạng thái</p>
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
                <SelectItem value="Bẩn">⚠️ Cần dọn</SelectItem>
                <SelectItem value="Đang dọn">✨ Đang dọn</SelectItem>
                <SelectItem value="Đang kiểm tra">🔍 Chờ kiểm tra</SelectItem>
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
                    borderColor: room.roomStatus === "Bẩn" ? "#f59e0b" : 
                                room.roomStatus === "Đang dọn" ? "#0ea5e9" : "#6366f1"
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
