"use client";

import { useState, useEffect } from "react";
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
import type { Service } from "@/lib/types/api";
import { ICONS } from "@/src/constants/icons.enum";
import { formatCurrency } from "@/lib/utils";
import { imageApi, type ImageResponse } from "@/lib/api/image.api";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
}: ServiceCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [firstImage, setFirstImage] = useState<ImageResponse | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  // Fetch service images from image API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoadingImage(true);
        const images = await imageApi.getServiceImages(service.id);
        if (images && images.length > 0) {
          setFirstImage(images[0]);
        }
      } catch (err) {
        console.error("Failed to fetch service images:", err);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImages();
  }, [service.id]);

  // Get image URL from fetched image or service object
  const imageUrl = firstImage?.secureUrl || firstImage?.url || null;

  const handleDeleteConfirm = () => {
    onDelete(service.id);
    setDeleteConfirm(false);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300">
        {/* Image Header */}
        <div className="relative h-40 overflow-hidden">
          {!loadingImage && imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={service.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="w-12 h-12 text-blue-300 flex items-center justify-center">
                {ICONS.PACKAGE}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Badge
              className={
                service.isActive
                  ? "bg-linear-to-r from-success-600 to-success-500 text-white text-xs font-bold shadow-lg"
                  : "bg-linear-to-r from-gray-500 to-gray-400 text-white text-xs font-bold shadow-lg"
              }
            >
              {service.isActive ? "Hoạt động" : "Tạm ngưng"}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate text-base group-hover:text-blue-600 transition-colors">
                {service.name}
              </h3>
            </div>
          </div>

          {/* Price and Unit */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {formatCurrency(service.price)}
              </span>
              {service.unit && (
                <span className="text-sm text-gray-500 font-medium">
                  /{service.unit}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(service)}
              className="flex-1 h-10 text-sm font-bold text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all"
            >
              <div className="w-4 h-4 mr-1.5 flex items-center justify-center">
                {ICONS.EDIT}
              </div>
              Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="h-10 px-3 font-bold text-error-600 border-2 border-error-200 hover:bg-error-50 hover:border-error-400 transition-all"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {ICONS.TRASH}
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Xác nhận xóa dịch vụ
            </DialogTitle>
            <DialogDescription className="text-base">
              Hành động này không thể hoàn tác. Bạn có chắc muốn xóa dịch vụ này
              không?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-linear-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center shrink-0 shadow-sm">
                <div className="w-7 h-7 text-blue-500 flex items-center justify-center">
                  {ICONS.PACKAGE}
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">
                  {service.name}
                </p>
                <p className="text-sm font-bold bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  {formatCurrency(service.price)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(false)}
              className="h-11 px-6 border-2 font-bold"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="h-11 px-6 font-bold shadow-lg"
            >
              Xóa dịch vụ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
