"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoomType } from "@/lib/types/room";
import { ICONS } from "@/src/constants/icons.enum";
import { formatCurrency } from "@/lib/utils";

// Professional hotel room images from Unsplash
const ROOM_IMAGES: Record<string, string> = {
  STD: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  DLX: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
  SUT: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
  FAM: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
  PRE: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  DEFAULT: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
};

interface RoomTypeCardProps {
  roomType: RoomType;
  onEdit: (roomType: RoomType) => void;
  onDelete: (roomTypeID: string) => void;
  isDeleting?: boolean;
}

export function RoomTypeCard({
  roomType,
  onEdit,
  onDelete,
  isDeleting,
}: RoomTypeCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = ROOM_IMAGES[roomType.roomTypeID] || ROOM_IMAGES.DEFAULT;

  const handleDeleteConfirm = () => {
    onDelete(roomType.roomTypeID);
    setDeleteConfirm(false);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={roomType.roomTypeName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="w-16 h-16 text-primary-400">{ICONS.BED_DOUBLE}</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/95 text-primary-700 font-bold text-sm px-3 py-1 shadow-lg backdrop-blur-sm">
              {formatCurrency(roomType.price)}/đêm
            </Badge>
          </div>

          {/* Room type name on image */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">
              {roomType.roomTypeName}
            </h3>
            <p className="text-white/90 text-sm font-medium">
              Mã: {roomType.roomTypeID}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Capacity */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-5 h-5 text-primary-500">{ICONS.USERS}</span>
              <span className="font-medium">{roomType.capacity} khách</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-5 h-5 text-primary-500">{ICONS.BED_DOUBLE}</span>
              <span className="font-medium">
                {roomType.capacity <= 2 ? "1 giường" : `${Math.ceil(roomType.capacity / 2)} giường`}
              </span>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Tiện nghi
            </p>
            <div className="flex flex-wrap gap-1.5">
              {roomType.amenities.slice(0, 4).map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gray-50 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200"
                >
                  {amenity}
                </Badge>
              ))}
              {roomType.amenities.length > 4 && (
                <Badge
                  variant="secondary"
                  className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full border border-primary-200"
                >
                  +{roomType.amenities.length - 4} khác
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(roomType)}
              className="flex-1 h-9 text-primary-600 border-primary-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-colors"
            >
              <span className="w-4 h-4 mr-1.5">{ICONS.EDIT}</span>
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="h-9 px-3 text-error-600 border-error-200 hover:bg-error-50 hover:text-error-700 hover:border-error-300 transition-colors"
            >
              <span className="w-4 h-4">{ICONS.TRASH}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Xác nhận xóa loại phòng
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                {!imageError ? (
                  <Image
                    src={imageUrl}
                    alt={roomType.roomTypeName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                    <span className="w-8 h-8 text-primary-400">{ICONS.BED_DOUBLE}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{roomType.roomTypeName}</p>
                <p className="text-sm text-gray-500">Mã: {roomType.roomTypeID}</p>
                <p className="text-sm font-medium text-primary-600">{formatCurrency(roomType.price)}/đêm</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-700 flex items-start gap-2">
                <span className="w-5 h-5 shrink-0 mt-0.5">{ICONS.ALERT}</span>
                <span>
                  Bạn có chắc chắn muốn xóa loại phòng này? Tất cả dữ liệu liên quan sẽ bị ảnh hưởng.
                </span>
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(false)}
              className="px-4"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 bg-error-600 hover:bg-error-700"
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
