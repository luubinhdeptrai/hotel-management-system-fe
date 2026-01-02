"use client";

import { RoomType } from "@/hooks/use-room-types";
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
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
        <div className="w-24 h-24 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-lg">
          <span className="w-12 h-12 text-gray-400">{ICONS.BED_DOUBLE}</span>
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
          Chưa có loại phòng nào
        </h3>
        <p className="text-base text-gray-600 text-center max-w-md leading-relaxed">
          Bắt đầu bằng cách thêm loại phòng mới hoặc sử dụng template có sẵn
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
