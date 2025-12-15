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
      <div className="group relative bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-primary-300 transition-all duration-300 hover:-translate-y-2">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={roomType.roomTypeName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary-100 via-blue-100 to-primary-200 flex items-center justify-center">
              <span className="w-20 h-20 text-primary-400">{ICONS.BED_DOUBLE}</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Price badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/95 backdrop-blur-sm text-primary-700 font-extrabold text-base px-4 py-2 shadow-xl border-2 border-white/50">
              {formatCurrency(roomType.price)}/đêm
            </Badge>
          </div>

          {/* Room type name on image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-extrabold text-white drop-shadow-2xl">
              {roomType.roomTypeName}
            </h3>
            <p className="text-white/95 text-sm font-bold mt-1 drop-shadow-lg">
              Mã: {roomType.roomTypeID}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Capacity */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="w-5 h-5 text-primary-600">{ICONS.USERS}</span>
              <span className="font-bold text-sm">{roomType.capacity} khách</span>
            </div>
            <span className="text-gray-300 font-bold">•</span>
            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="w-5 h-5 text-primary-600">{ICONS.BED_DOUBLE}</span>
              <span className="font-bold text-sm">
                {roomType.capacity <= 2 ? "1 giường" : `${Math.ceil(roomType.capacity / 2)} giường`}
              </span>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
              Tiện nghi
            </p>
            <div className="flex flex-wrap gap-2">
              {roomType.amenities.slice(0, 4).map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full border-2 border-primary-200"
                >
                  {amenity}
                </Badge>
              ))}
              {roomType.amenities.length > 4 && (
                <Badge
                  variant="secondary"
                  className="bg-linear-to-r from-primary-100 to-blue-100 text-primary-700 text-xs font-extrabold px-3 py-1.5 rounded-full border-2 border-primary-300"
                >
                  +{roomType.amenities.length - 4} khác
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(roomType)}
              className="flex-1 h-11 text-primary-600 border-2 border-primary-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-400 transition-all font-bold text-sm hover:scale-105"
            >
              <span className="w-5 h-5 mr-2">{ICONS.EDIT}</span>
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="h-11 px-4 text-error-600 border-2 border-error-200 hover:bg-error-50 hover:text-error-700 hover:border-error-400 transition-all font-bold hover:scale-105"
            >
              <span className="w-5 h-5">{ICONS.TRASH}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Xác nhận xóa loại phòng
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
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
