"use client";

import { RoomType } from "@/lib/types/room";
import { RoomTypeCard } from "./room-type-card";
import { ICONS } from "@/src/constants/icons.enum";

interface RoomTypeGridProps {
  roomTypes: RoomType[];
  onEdit: (roomType: RoomType) => void;
  onDelete: (roomTypeID: string) => void;
  isDeleting?: string | null;
}

export function RoomTypeGrid({
  roomTypes,
  onEdit,
  onDelete,
  isDeleting,
}: RoomTypeGridProps) {
  if (roomTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
          <span className="w-10 h-10 text-gray-300">{ICONS.BED_DOUBLE}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chưa có loại phòng nào
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Bắt đầu bằng cách thêm loại phòng mới hoặc sử dụng template có sẵn
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {roomTypes.map((roomType) => (
        <RoomTypeCard
          key={roomType.roomTypeID}
          roomType={roomType}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting === roomType.roomTypeID}
        />
      ))}
    </div>
  );
}
