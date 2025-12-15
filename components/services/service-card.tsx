"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceItem } from "@/lib/types/service";
import { ICONS } from "@/src/constants/icons.enum";
import { formatCurrency } from "@/lib/utils";

// Specific images for each service item - mapped to actual service IDs and names
const SERVICE_ITEM_IMAGES: Record<string, string> = {
  // Minibar items
  "SRV001": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80", // Nước suối - water bottle
  "SRV002": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80", // Coca Cola
  "SRV003": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80", // Trà xanh 0 độ
  "SRV004": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80", // Snack khoai tây - Lays chips
  
  // Giặt ủi items
  "SRV005": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80", // Áo sơ mi - dress shirt
  "SRV006": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80", // Quần tây - trousers
  "SRV007": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", // Váy/đầm - dress
  
  // Spa & Massage items
  "SRV008": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80", // Massage toàn thân
  "SRV009": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80", // Massage chân
  "SRV010": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80", // Chăm sóc da mặt
  
  // Ăn uống items
  "SRV011": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80", // Bữa sáng Á - phở
  "SRV012": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80", // Bữa sáng Âu - breakfast
  "SRV013": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", // Cơm trưa/tối
  
  // Thuê xe items
  "SRV014": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80", // Đưa đón sân bay
  "SRV015": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80", // Thuê xe 4 chỗ
  "SRV016": "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&q=80", // Thuê xe 7 chỗ - SUV
};

// Category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Minibar: ICONS.WINE,
  "Giặt ủi": ICONS.SHIRT,
  "Spa & Massage": ICONS.SPA,
  "Ăn uống": ICONS.UTENSILS,
  "Thuê xe": ICONS.CAR,
  "Phụ thu": ICONS.SURCHARGE,
  "Phí phạt": ICONS.PENALTY,
};

interface ServiceCardProps {
  service: ServiceItem;
  onEdit: (service: ServiceItem) => void;
  onDelete: (serviceID: string) => void;
  onToggleActive?: (serviceID: string, isActive: boolean) => void;
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleActive,
}: ServiceCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const categoryName = service.category?.categoryName || "Khác";
  const imageUrl = SERVICE_ITEM_IMAGES[service.serviceID] || SERVICE_ITEM_IMAGES.DEFAULT || "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80";
  const categoryIcon = CATEGORY_ICONS[categoryName] || ICONS.PACKAGE;

  const handleDeleteConfirm = () => {
    onDelete(service.serviceID);
    setDeleteConfirm(false);
  };

  return (
    <>
      <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300">
        {/* Image Header */}
        <div className="relative h-32 overflow-hidden">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={service.serviceName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary-50 to-primary-100 flex items-center justify-center">
              <span className="w-12 h-12 text-primary-300">{categoryIcon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <Badge className={service.isActive 
              ? "bg-success-500 text-white text-xs" 
              : "bg-gray-400 text-white text-xs"
            }>
              {service.isActive ? "Hoạt động" : "Tạm ngưng"}
            </Badge>
          </div>

          {/* Category badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs backdrop-blur-sm">
              {categoryName}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {service.serviceName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Mã: {service.serviceID}
              </p>
            </div>
          </div>

          {service.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {service.description}
            </p>
          )}

          {/* Price and Unit */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary-600">
                {formatCurrency(service.price)}
              </span>
              {service.unit && (
                <span className="text-sm text-gray-500">/{service.unit}</span>
              )}
            </div>
            {onToggleActive && (
              <Switch
                checked={service.isActive}
                onCheckedChange={(checked) => onToggleActive(service.serviceID, checked)}
                className="data-[state=checked]:bg-success-500"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(service)}
              className="flex-1 h-8 text-xs text-primary-600 border-primary-200 hover:bg-primary-50"
            >
              <span className="w-3.5 h-3.5 mr-1">{ICONS.EDIT}</span>
              Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="h-8 px-2.5 text-error-600 border-error-200 hover:bg-error-50"
            >
              <span className="w-3.5 h-3.5">{ICONS.TRASH}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa dịch vụ</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <span className="w-6 h-6 text-primary-500">{categoryIcon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{service.serviceName}</p>
                <p className="text-sm text-primary-600">{formatCurrency(service.price)}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
