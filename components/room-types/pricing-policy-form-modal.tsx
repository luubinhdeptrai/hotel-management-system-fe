"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONS } from "@/src/constants/icons.enum";
import type { PricingPolicy, PricingPolicyFormData } from "@/lib/types/pricing";
import type { RoomType } from "@/lib/types/room";
import { formatCurrency } from "@/lib/utils";

interface PricingPolicyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: PricingPolicy | null;
  roomTypes: RoomType[];
  onSave: (data: PricingPolicyFormData) => void;
}

export function PricingPolicyFormModal({
  open,
  onOpenChange,
  policy,
  roomTypes,
  onSave,
}: PricingPolicyFormModalProps) {
  const [formData, setFormData] = useState<PricingPolicyFormData>({
    TenChinhSach: "",
    MaLoaiPhong: "",
    TuNgay: "",
    DenNgay: "",
    KieuNgay: "Ngày thường",
    HeSo: 1.0,
    MucUuTien: 1,
  });

  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  useEffect(() => {
    if (!open) return; // Only run when modal opens
    
    if (policy) {
      setFormData({
        TenChinhSach: policy.TenChinhSach,
        MaLoaiPhong: policy.MaLoaiPhong,
        TuNgay: policy.TuNgay,
        DenNgay: policy.DenNgay,
        KieuNgay: policy.KieuNgay,
        HeSo: policy.HeSo,
        MucUuTien: policy.MucUuTien,
      });
      const roomType = roomTypes.find((rt) => rt.roomTypeID === policy.MaLoaiPhong);
      setSelectedRoomType(roomType || null);
    } else {
      setFormData({
        TenChinhSach: "",
        MaLoaiPhong: "",
        TuNgay: "",
        DenNgay: "",
        KieuNgay: "Ngày thường",
        HeSo: 1.0,
        MucUuTien: 1,
      });
      setSelectedRoomType(null);
    }
  }, [policy, roomTypes, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleRoomTypeChange = (roomTypeId: string) => {
    setFormData({ ...formData, MaLoaiPhong: roomTypeId });
    const roomType = roomTypes.find((rt) => rt.roomTypeID === roomTypeId);
    setSelectedRoomType(roomType || null);
  };

  const calculatedPrice = selectedRoomType
    ? selectedRoomType.price * formData.HeSo
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-primary-600">{ICONS.DOLLAR_SIGN}</span>
            </span>
            {policy ? "Chỉnh sửa chính sách giá" : "Thêm chính sách giá mới"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {policy
              ? "Cập nhật thông tin chính sách định giá"
              : "Tạo chính sách định giá mới cho loại phòng"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            {/* Tên chính sách */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="TenChinhSach" className="text-sm font-bold text-gray-700">
                Tên chính sách <span className="text-error-600">*</span>
              </Label>
              <Input
                id="TenChinhSach"
                value={formData.TenChinhSach}
                onChange={(e) =>
                  setFormData({ ...formData, TenChinhSach: e.target.value })
                }
                placeholder="VD: Giá cuối tuần - Standard"
                required
                className="h-12 border-2 font-medium"
              />
            </div>

            {/* Loại phòng */}
            <div className="space-y-2">
              <Label htmlFor="MaLoaiPhong" className="text-sm font-bold text-gray-700">
                Loại phòng <span className="text-error-600">*</span>
              </Label>
              <Select
                value={formData.MaLoaiPhong}
                onValueChange={handleRoomTypeChange}
                required
              >
                <SelectTrigger className="h-12 border-2 font-medium">
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả loại phòng</SelectItem>
                  {roomTypes.map((roomType) => (
                    <SelectItem key={roomType.roomTypeID} value={roomType.roomTypeID}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{roomType.roomTypeName}</span>
                        <span className="text-gray-500 text-sm">
                          ({formatCurrency(roomType.price)})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kiểu ngày */}
            <div className="space-y-2">
              <Label htmlFor="KieuNgay" className="text-sm font-bold text-gray-700">
                Kiểu ngày <span className="text-error-600">*</span>
              </Label>
              <Select
                value={formData.KieuNgay}
                onValueChange={(value) =>
                  setFormData({ ...formData, KieuNgay: value as typeof formData.KieuNgay })
                }
                required
              >
                <SelectTrigger className="h-12 border-2 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ngày thường">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      Ngày thường (T2-T5)
                    </div>
                  </SelectItem>
                  <SelectItem value="Cuối tuần">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                      Cuối tuần (T6-CN)
                    </div>
                  </SelectItem>
                  <SelectItem value="Ngày lễ">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                      Ngày lễ
                    </div>
                  </SelectItem>
                  <SelectItem value="Tất cả">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                      Tất cả các ngày
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Từ ngày */}
            <div className="space-y-2">
              <Label htmlFor="TuNgay" className="text-sm font-bold text-gray-700">
                Từ ngày <span className="text-error-600">*</span>
              </Label>
              <Input
                id="TuNgay"
                type="date"
                value={formData.TuNgay}
                onChange={(e) =>
                  setFormData({ ...formData, TuNgay: e.target.value })
                }
                required
                className="h-12 border-2 font-medium"
              />
            </div>

            {/* Đến ngày */}
            <div className="space-y-2">
              <Label htmlFor="DenNgay" className="text-sm font-bold text-gray-700">
                Đến ngày <span className="text-error-600">*</span>
              </Label>
              <Input
                id="DenNgay"
                type="date"
                value={formData.DenNgay}
                onChange={(e) =>
                  setFormData({ ...formData, DenNgay: e.target.value })
                }
                required
                min={formData.TuNgay}
                className="h-12 border-2 font-medium"
              />
            </div>

            {/* Hệ số */}
            <div className="space-y-2">
              <Label htmlFor="HeSo" className="text-sm font-bold text-gray-700">
                Hệ số giá <span className="text-error-600">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="HeSo"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={formData.HeSo}
                  onChange={(e) =>
                    setFormData({ ...formData, HeSo: parseFloat(e.target.value) || 1.0 })
                  }
                  required
                  className="h-12 border-2 font-bold text-lg pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  ×
                </span>
              </div>
              <p className="text-xs text-gray-600">
                VD: 1.0 = giá gốc, 1.5 = tăng 50%, 0.8 = giảm 20%
              </p>
            </div>

            {/* Mức ưu tiên */}
            <div className="space-y-2">
              <Label htmlFor="MucUuTien" className="text-sm font-bold text-gray-700">
                Mức ưu tiên <span className="text-error-600">*</span>
              </Label>
              <Input
                id="MucUuTien"
                type="number"
                min="1"
                max="10"
                value={formData.MucUuTien}
                onChange={(e) =>
                  setFormData({ ...formData, MucUuTien: parseInt(e.target.value) || 1 })
                }
                required
                className="h-12 border-2 font-bold text-lg"
              />
              <p className="text-xs text-gray-600">
                Số càng cao = ưu tiên càng lớn (1-10)
              </p>
            </div>
          </div>

          {/* Price Preview */}
          {selectedRoomType && (
            <div className="bg-linear-to-br from-primary-50 to-blue-50 border-2 border-primary-300 rounded-xl p-6">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                Xem trước giá
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Giá gốc</p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {formatCurrency(selectedRoomType.price)}
                  </p>
                </div>
                <div className="text-3xl font-extrabold text-primary-600">
                  ×{formData.HeSo.toFixed(2)}
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-1">Giá sau áp dụng</p>
                  <p className="text-3xl font-extrabold text-primary-600">
                    {formatCurrency(calculatedPrice)}
                  </p>
                </div>
              </div>
              {formData.HeSo !== 1.0 && (
                <div className="mt-3 pt-3 border-t-2 border-primary-200">
                  <p className="text-sm font-semibold text-gray-700">
                    {formData.HeSo > 1.0
                      ? `Tăng ${((formData.HeSo - 1) * 100).toFixed(0)}%`
                      : `Giảm ${((1 - formData.HeSo) * 100).toFixed(0)}%`}
                    {" "}so với giá gốc
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 px-6 font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="h-12 px-8 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <span className="mr-2">{ICONS.CHECK}</span>
              {policy ? "Cập nhật" : "Tạo chính sách"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
