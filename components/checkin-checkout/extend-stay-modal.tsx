"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ICONS } from "@/src/constants/icons.enum";
import { cn } from "@/lib/utils";

interface ExtendStayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (additionalNights: number, newCheckOutDate: string) => void;
  roomNumber: string;
  currentCheckOutDate: string;
  nightlyRate: number;
}

interface AvailabilityDay {
  date: string;
  available: boolean;
  hasConflict: boolean;
  conflictReason?: string;
}

export function ExtendStayModal({
  open,
  onOpenChange,
  onConfirm,
  roomNumber,
  currentCheckOutDate,
  nightlyRate,
}: ExtendStayModalProps) {
  const [additionalNights, setAdditionalNights] = useState(1);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Mock availability check (in production, this would be an API call)
  const mockAvailability: AvailabilityDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentCheckOutDate);
    date.setDate(date.getDate() + i + 1);
    
    // Mock: Room is available for first 5 days, then has a booking
    const available = i < 5;
    
    return {
      date: date.toISOString().split('T')[0],
      available,
      hasConflict: !available,
      conflictReason: !available ? "Có đặt phòng mới" : undefined,
    };
  });

  const maxAvailableNights = mockAvailability.findIndex(day => !day.available);
  const actualMaxNights = maxAvailableNights === -1 ? 7 : maxAvailableNights;

  const handleCheckAvailability = () => {
    setIsChecking(true);
    // Simulate API call
    setTimeout(() => {
      setIsChecking(false);
      setAvailabilityChecked(true);
    }, 500);
  };

  const calculateNewCheckOutDate = () => {
    const date = new Date(currentCheckOutDate);
    date.setDate(date.getDate() + additionalNights);
    return date.toISOString().split('T')[0];
  };

  const calculateExtensionCost = () => {
    return nightlyRate * additionalNights;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleConfirm = () => {
    onConfirm(additionalNights, calculateNewCheckOutDate());
    onOpenChange(false);
    // Reset state
    setAdditionalNights(1);
    setAvailabilityChecked(false);
  };

  const canExtend = additionalNights <= actualMaxNights;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="w-6 h-6 text-white">{ICONS.CALENDAR_PLUS}</span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-extrabold text-gray-900">
                Gia hạn lưu trú
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Kiểm tra và gia hạn thêm thời gian lưu trú cho phòng {roomNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Info */}
          <Card className="border-2 border-warning-200 bg-linear-to-br from-warning-50 via-white to-warning-50/30 p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Ngày trả hiện tại:
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatDate(currentCheckOutDate)}
                </p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Giá phòng/đêm:
                </span>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  {formatCurrency(nightlyRate)}
                </p>
              </div>
            </div>
          </Card>

          {/* Extension Input */}
          <div className="space-y-3">
            <Label htmlFor="nights" className="text-base font-bold text-gray-900">
              Số đêm muốn gia hạn thêm <span className="text-error-600">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="nights"
                type="number"
                min={1}
                max={actualMaxNights}
                value={additionalNights}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setAdditionalNights(Math.min(Math.max(value, 1), actualMaxNights));
                  setAvailabilityChecked(false);
                }}
                className="h-12 text-base border-2 border-gray-300 focus:border-warning-500 focus:ring-warning-500"
              />
              <Button
                onClick={handleCheckAvailability}
                disabled={isChecking}
                className="h-12 px-6 bg-warning-600 hover:bg-warning-700 text-white font-semibold whitespace-nowrap"
              >
                {isChecking ? (
                  <>
                    <span className="animate-spin mr-2">{ICONS.LOADER}</span>
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    {ICONS.SEARCH}
                    <span className="ml-2">Kiểm tra phòng trống</span>
                  </>
                )}
              </Button>
            </div>
            {!canExtend && (
              <p className="text-sm text-error-600 font-medium">
                ⚠ Phòng chỉ còn trống tối đa {actualMaxNights} đêm. Sau đó có đặt phòng mới.
              </p>
            )}
          </div>

          {/* Availability Calendar */}
          {availabilityChecked && (
            <Card className="border-2 border-info-200 bg-linear-to-br from-info-50 via-white to-info-50/30 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                {ICONS.CALENDAR}
                <span>Tình trạng phòng trống (7 ngày tới)</span>
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {mockAvailability.map((day, index) => (
                  <div
                    key={day.date}
                    className={cn(
                      "relative p-3 rounded-lg text-center border-2 transition-all",
                      day.available
                        ? "bg-success-50 border-success-300"
                        : "bg-error-50 border-error-300",
                      index < additionalNights && day.available
                        ? "ring-2 ring-warning-500 ring-offset-2 scale-105 shadow-lg"
                        : ""
                    )}
                  >
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      {new Date(day.date).toLocaleDateString("vi-VN", { weekday: "short" })}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(day.date).getDate()}
                    </div>
                    <div className="mt-2">
                      {day.available ? (
                        <Badge className="bg-success-600 text-white text-xs px-1 py-0.5">
                          Trống
                        </Badge>
                      ) : (
                        <Badge className="bg-error-600 text-white text-xs px-1 py-0.5">
                          Đặt
                        </Badge>
                      )}
                    </div>
                    {index < additionalNights && day.available && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* New Checkout Date & Cost */}
          {availabilityChecked && canExtend && (
            <Card className="border-2 border-success-200 bg-linear-to-br from-success-50 via-white to-success-50/30 p-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Ngày trả mới:
                  </span>
                  <p className="text-xl font-extrabold text-success-700 mt-1">
                    {formatDate(calculateNewCheckOutDate())}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Chi phí gia hạn:
                  </span>
                  <p className="text-xl font-extrabold text-primary-600 mt-1">
                    {formatCurrency(calculateExtensionCost())}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ({additionalNights} đêm × {formatCurrency(nightlyRate)})
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Room Move Alternative */}
          {availabilityChecked && !canExtend && (
            <Card className="border-2 border-warning-200 bg-linear-to-br from-warning-50 via-white to-warning-50/30 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-warning-600 rounded-lg flex items-center justify-center shrink-0">
                  <span className="w-5 h-5 text-white">{ICONS.ALERT_TRIANGLE}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">
                    Phòng không còn trống
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Phòng {roomNumber} chỉ còn trống tối đa {actualMaxNights} đêm. Sau đó có đặt phòng mới.
                  </p>
                  <Button
                    variant="outline"
                    className="h-10 bg-white border-warning-600 text-warning-700 hover:bg-warning-50 font-semibold"
                  >
                    {ICONS.ARROW_RIGHT_LEFT}
                    <span className="ml-2">Chuyển phòng (Room Move)</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="h-11 px-6 font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!availabilityChecked || !canExtend}
            className="h-11 px-6 bg-linear-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600 text-white font-semibold shadow-md disabled:opacity-50"
          >
            {ICONS.CHECK}
            <span className="ml-2">Xác nhận gia hạn</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
