"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ICONS } from "@/src/constants/icons.enum";

interface NguoioFormData {
  hoTen: string;
  loaiGiayTo: string;
  soGiayTo: string;
  ngaySinh?: string;
  quocTich?: string;
  diaChiThuongTru?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
}

interface NguoioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (guests: NguoioFormData[]) => void;
  roomNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

const idTypes = ["CCCD", "CMND", "Passport", "Khác"];
const countries = ["Việt Nam", "United States", "Japan", "Korea", "China", "Singapore", "Thailand", "Khác"];

export function NguoioFormModal({ open, onOpenChange, onSubmit, roomNumber, checkInDate, checkOutDate }: NguoioFormModalProps) {
  const [guests, setGuests] = useState<NguoioFormData[]>([
    {
      hoTen: "",
      loaiGiayTo: "",
      soGiayTo: "",
      ngaySinh: "",
      quocTich: "Việt Nam",
      diaChiThuongTru: "",
      ngayBatDau: checkInDate || "",
      ngayKetThuc: checkOutDate || "",
    },
  ]);
  const [editingIndex, setEditingIndex] = useState<number | null>(0);

  const updateGuest = (index: number, field: keyof NguoioFormData, value: string) => {
    const updated = [...guests];
    updated[index] = { ...updated[index], [field]: value };
    setGuests(updated);
  };

  const addGuest = () => {
    setGuests([
      ...guests,
      {
        hoTen: "",
        loaiGiayTo: "",
        soGiayTo: "",
        ngaySinh: "",
        quocTich: "Việt Nam",
        diaChiThuongTru: "",
        ngayBatDau: checkInDate || "",
        ngayKetThuc: checkOutDate || "",
      },
    ]);
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const validGuests = guests.filter((g) => g.hoTen && g.loaiGiayTo && g.soGiayTo);
    if (validGuests.length > 0) {
      onSubmit(validGuests);
      onOpenChange(false);
      // Reset form
      setGuests([
        {
          hoTen: "",
          loaiGiayTo: "",
          soGiayTo: "",
          ngaySinh: "",
          quocTich: "Việt Nam",
          diaChiThuongTru: "",
          ngayBatDau: checkInDate || "",
          ngayKetThuc: checkOutDate || "",
        },
      ]);
      setEditingIndex(0);
    }
  };

  const isGuestValid = (guest: NguoioFormData) => {
    return guest.hoTen && guest.loaiGiayTo && guest.soGiayTo;
  };

  const isFormValid = guests.some(isGuestValid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <span className="w-6 h-6 text-white flex items-center justify-center">{ICONS.USERS}</span>
            </div>
            Đăng ký khách lưu trú
          </DialogTitle>
          <DialogDescription className="text-base">
            {roomNumber && <span className="font-semibold text-info-700">Phòng {roomNumber}</span>} • Nhập thông tin khách lưu trú. Các trường có (*) là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {guests.map((guest, index) => {
            const isValid = isGuestValid(guest);
            const isEditing = editingIndex === index;
            
            // Compact view for completed guests
            if (isValid && !isEditing) {
              return (
                <Card
                  key={index}
                  className="p-4 bg-success-50 border-2 border-success-200 hover:border-success-300 transition-colors cursor-pointer"
                  onClick={() => setEditingIndex(index)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-success-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-gray-900 truncate">{guest.hoTen}</h3>
                          <Badge className="bg-success-600 text-white shrink-0">
                            {guest.loaiGiayTo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-mono font-semibold">{guest.soGiayTo}</span>
                          {guest.quocTich && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{guest.quocTich}</span>
                            </>
                          )}
                          {guest.ngaySinh && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{new Date(guest.ngaySinh).toLocaleDateString('vi-VN')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIndex(index);
                        }}
                        className="h-8 text-info-600 hover:bg-info-50 flex items-center"
                      >
                        <span className="w-4 h-4 flex items-center justify-center">{ICONS.EDIT}</span>
                        <span className="ml-1 text-xs">Sửa</span>
                      </Button>
                      {guests.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGuest(index);
                          }}
                          className="h-8 text-error-600 hover:bg-error-50 flex items-center"
                        >
                          <span className="w-4 h-4 flex items-center justify-center">{ICONS.TRASH}</span>
                          <span className="ml-1 text-xs">Xóa</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            }
            
            // Expanded form view for editing
            return (
              <div key={index} className="space-y-4 p-5 bg-linear-to-br from-info-50/50 via-white to-white border-2 border-info-200 rounded-xl relative shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-info-700 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-6 h-6 bg-info-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    KHÁCH {index + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isValid && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
                        className="h-8 text-success-600 hover:bg-success-50 flex items-center"
                      >
                        <span className="w-4 h-4 flex items-center justify-center">{ICONS.CHECK}</span>
                        <span className="ml-1 text-xs">Xong</span>
                      </Button>
                    )}
                    {guests.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGuest(index)}
                        className="h-8 text-error-600 hover:bg-error-50 flex items-center"
                      >
                        <span className="w-4 h-4 flex items-center justify-center">{ICONS.TRASH}</span>
                        <span className="ml-1 text-xs">Xóa</span>
                      </Button>
                    )}
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Họ tên */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Họ và tên <span className="text-error-600">*</span>
                  </Label>
                  <Input
                    placeholder="Nhập họ tên đầy đủ..."
                    value={guest.hoTen}
                    onChange={(e) => updateGuest(index, "hoTen", e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>

                {/* Loại giấy tờ */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Loại giấy tờ <span className="text-error-600">*</span>
                  </Label>
                  <Select value={guest.loaiGiayTo} onValueChange={(value) => updateGuest(index, "loaiGiayTo", value)}>
                    <SelectTrigger className="h-11 border-gray-300 focus:ring-info-500">
                      <SelectValue placeholder="Chọn loại..." />
                    </SelectTrigger>
                    <SelectContent>
                      {idTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Số giấy tờ */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Số giấy tờ <span className="text-error-600">*</span>
                  </Label>
                  <Input
                    placeholder="Nhập số giấy tờ..."
                    value={guest.soGiayTo}
                    onChange={(e) => updateGuest(index, "soGiayTo", e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500 font-mono"
                  />
                </div>

                {/* Ngày sinh */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Ngày sinh</Label>
                  <Input
                    type="date"
                    value={guest.ngaySinh}
                    onChange={(e) => updateGuest(index, "ngaySinh", e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>

                {/* Quốc tịch */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Quốc tịch</Label>
                  <Select value={guest.quocTich} onValueChange={(value) => updateGuest(index, "quocTich", value)}>
                    <SelectTrigger className="h-11 border-gray-300 focus:ring-info-500">
                      <SelectValue placeholder="Chọn quốc tịch..." />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Địa chỉ thường trú */}
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Địa chỉ thường trú</Label>
                  <Input
                    placeholder="Nhập địa chỉ thường trú..."
                    value={guest.diaChiThuongTru}
                    onChange={(e) => updateGuest(index, "diaChiThuongTru", e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>

                {/* Ngày bắt đầu/kết thúc */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Ngày bắt đầu</Label>
                  <Input
                    type="date"
                    value={guest.ngayBatDau}
                    onChange={(e) => updateGuest(index, "ngayBatDau", e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Ngày kết thúc</Label>
                  <Input
                    type="date"
                    value={guest.ngayKetThuc}
                    onChange={(e) => updateGuest(index, "ngayKetThuc", e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>
              </div>
            </div>
            );
          })}

          {/* Add Guest Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              addGuest();
              setEditingIndex(guests.length);
            }}
            className="w-full h-11 border-2 border-dashed border-info-300 hover:border-info-500 hover:bg-info-50 text-info-700 font-semibold flex items-center justify-center"
          >
            <span className="w-5 h-5 mr-2 flex items-center justify-center">{ICONS.PLUS}</span>
            Thêm khách
          </Button>
        </div>

        <DialogFooter className="gap-2 border-t border-gray-200 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 font-semibold"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="h-11 bg-linear-to-r from-info-600 to-info-500 hover:from-info-700 hover:to-info-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center"
          >
            <span className="w-5 h-5 mr-2 flex items-center justify-center">{ICONS.CHECK}</span>
            Lưu thông tin ({guests.filter((g) => g.hoTen && g.loaiGiayTo && g.soGiayTo).length} khách)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
