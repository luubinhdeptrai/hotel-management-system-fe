"use client";


import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";

interface ShiftRecord {
  id: string;
  startTime: Date;
  endTime?: Date;
  floatAmount: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  varianceReason?: string;
  employeeName: string;
}

export default function ShiftManagementPage() {
  const [currentShift, setCurrentShift] = useState<ShiftRecord | null>(null);
  const [floatAmount, setFloatAmount] = useState("500000");
  const [actualCash, setActualCash] = useState("");
  const [varianceReason, setVarianceReason] = useState("");

  const [shiftHistory] = useState<ShiftRecord[]>([
    {
      id: "SH-001",
      startTime: new Date(2024, 0, 15, 8, 0),
      endTime: new Date(2024, 0, 15, 16, 0),
      floatAmount: 500000,
      cashIn: 12500000,
      cashOut: 200000,
      expectedCash: 12800000,
      actualCash: 12750000,
      variance: -50000,
      varianceReason: "Thiếu 50k do khách bỏ quên, đã ghi chú lại",
      employeeName: "Nguyễn Văn A",
    },
    {
      id: "SH-002",
      startTime: new Date(2024, 0, 14, 8, 0),
      endTime: new Date(2024, 0, 14, 16, 0),
      floatAmount: 500000,
      cashIn: 8900000,
      cashOut: 150000,
      expectedCash: 9250000,
      actualCash: 9250000,
      variance: 0,
      employeeName: "Trần Thị B",
    },
  ]);

  const handleStartShift = () => {
    const newShift: ShiftRecord = {
      id: `SH-${Date.now()}`,
      startTime: new Date(),
      floatAmount: parseFloat(floatAmount) || 500000,
      cashIn: 0,
      cashOut: 0,
      expectedCash: parseFloat(floatAmount) || 500000,
      employeeName: "Nhân viên hiện tại",
    };
    setCurrentShift(newShift);
  };

  const handleEndShift = () => {
    if (!currentShift) return;

    const actual = parseFloat(actualCash) || 0;
    const variance = actual - currentShift.expectedCash;

    const completedShift: ShiftRecord = {
      ...currentShift,
      endTime: new Date(),
      actualCash: actual,
      variance,
      varianceReason: variance !== 0 ? varianceReason : undefined,
    };

    logger.log("Shift ended:", completedShift);
    setCurrentShift(null);
    setActualCash("");
    setVarianceReason("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const getVarianceColor = (variance: number) => {
    if (variance === 0) return "bg-success-100 text-success-800 border-success-300";
    if (variance < 0) return "bg-error-100 text-error-800 border-error-300";
    return "bg-warning-100 text-warning-800 border-warning-300";
  };

  const getVarianceIcon = (variance: number) => {
    if (variance === 0) return ICONS.CHECK_CIRCLE;
    if (variance < 0) return ICONS.ALERT_TRIANGLE;
    return ICONS.ALERT_CIRCLE;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="bg-linear-to-r from-primary-600 to-primary-500 text-white px-4 sm:px-6 lg:px-8 py-8 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-md backdrop-blur-sm">
              <span className="inline-flex items-center justify-center w-8 h-8 text-white">{ICONS.CLOCK}</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Quản lý Ca làm việc</h1>
              <p className="text-primary-100 mt-1">
                Bắt đầu/Kết thúc ca và đối soát tiền mặt
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        {currentShift ? (
          <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-6 border-2 border-success-300 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success-300/20 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-success-300/20 rounded-full -ml-12 -mb-12" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-linear-to-br from-success-600 to-success-500 rounded-2xl flex items-center justify-center shadow-md animate-pulse">
                    <span className="inline-flex items-center justify-center w-7 h-7 text-white">{ICONS.CLOCK}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Ca đang làm việc</h2>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <span className="w-4 h-4">{ICONS.CALENDAR}</span>
                      Bắt đầu: {formatDateTime(currentShift.startTime)}
                    </p>
                  </div>
                </div>
                <Badge className="inline-flex items-center gap-2 bg-success-600 text-white px-4 py-2 text-sm font-semibold shadow-md">
                  Đang hoạt động
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Tiền đầu ca</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentShift.floatAmount)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Tiền thu</p>
                  <p className="text-2xl font-bold text-success-600">
                    +{formatCurrency(currentShift.cashIn)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Tiền chi</p>
                  <p className="text-2xl font-bold text-error-600">
                    -{formatCurrency(currentShift.cashOut)}
                  </p>
                </div>
              </div>

              <div className="bg-primary-50 rounded-xl p-5 border-2 border-primary-200 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                      <span className="w-5 h-5 text-white">{ICONS.DOLLAR_SIGN}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Tiền mặt dự kiến</p>
                      <p className="text-xs text-gray-500">Float + Thu - Chi</p>
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-primary-700">
                    {formatCurrency(currentShift.expectedCash)}
                  </p>
                </div>
              </div>

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5">{ICONS.CLIPBOARD_LIST}</span>
                  Kết thúc ca làm việc
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="actualCash" className="text-sm font-semibold text-gray-700">
                      Tiền mặt thực tế <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="actualCash"
                      type="number"
                      placeholder="Nhập số tiền thực tế trong két"
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      className="mt-2 h-11 border-2 border-gray-200 rounded-lg focus:border-primary-500"
                    />
                  </div>

                  {actualCash && parseFloat(actualCash) !== currentShift.expectedCash && (
                    <div>
                      <Label htmlFor="varianceReason" className="text-sm font-semibold text-gray-700">
                        Lý do chênh lệch <span className="text-error-500">*</span>
                      </Label>
                      <Textarea
                        id="varianceReason"
                        placeholder="Giải thích nguyên nhân chênh lệch tiền mặt..."
                        value={varianceReason}
                        onChange={(e) => setVarianceReason(e.target.value)}
                        className="mt-2 min-h-[100px] border-2 border-gray-200 rounded-lg focus:border-primary-500"
                      />
                      <div className={`mt-3 inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 ${
                        parseFloat(actualCash) - currentShift.expectedCash < 0
                          ? "bg-error-50 border-error-200"
                          : "bg-warning-50 border-warning-200"
                      }`}>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-current">
                          {parseFloat(actualCash) - currentShift.expectedCash < 0 ? ICONS.ALERT_TRIANGLE : ICONS.CHECK_CIRCLE}
                        </span>
                        <p className="text-sm font-semibold">
                          Chênh {formatCurrency(parseFloat(actualCash) - currentShift.expectedCash)}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleEndShift}
                    disabled={!actualCash}
                    className="w-full inline-flex items-center gap-2 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white h-12 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5">{ICONS.CHECK_CIRCLE}</span>
                    Kết thúc ca làm việc
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-md">
                <span className="inline-flex items-center justify-center w-7 h-7 text-white">{ICONS.PLAY}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bắt đầu ca mới</h2>
                <p className="text-sm text-gray-600">Nhập tiền đầu ca và bắt đầu làm việc</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="floatAmount" className="text-sm font-semibold text-gray-700">
                  Tiền đầu ca (VNĐ) <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="floatAmount"
                  type="number"
                  placeholder="Nhập số tiền đầu ca"
                  value={floatAmount}
                  onChange={(e) => setFloatAmount(e.target.value)}
                  className="mt-2 h-11 border-2 border-gray-200 rounded-lg focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Khuyến nghị: 500,000 VNĐ
                </p>
              </div>

              <Button
                onClick={handleStartShift}
                className="w-full inline-flex items-center gap-2 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white h-12 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <span className="inline-flex items-center justify-center w-5 h-5">{ICONS.PLAY}</span>
                Bắt đầu ca làm việc
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-linear-to-br from-gray-600 to-gray-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="inline-flex items-center justify-center w-5 h-5 text-white">{ICONS.HISTORY}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Lịch sử ca làm việc</h2>
              <p className="text-xs text-gray-500">Các ca đã hoàn thành</p>
            </div>
          </div>

          <div className="space-y-4">
            {shiftHistory.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-gray-50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 text-gray-400">{ICONS.HISTORY}</span>
                </div>
                <p className="text-gray-500 font-medium">Chưa có lịch sử ca làm việc</p>
              </div>
            ) : (
              shiftHistory.map((shift) => (
                <div
                  key={shift.id}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-linear-to-r from-gray-50 to-white p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg text-gray-900">{shift.id}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {shift.employeeName}
                        </p>
                      </div>
                      <Badge className={`${getVarianceColor(shift.variance || 0)} px-3 py-1.5 font-semibold text-sm inline-flex items-center gap-3`}>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-current">{getVarianceIcon(shift.variance || 0)}</span>
                        {shift.variance === 0 ? "Khớp chính xác" : `Chênh ${formatCurrency(shift.variance || 0)}`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">Bắt đầu:</span>{" "}
                        {formatDateTime(shift.startTime)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Kết thúc:</span>{" "}
                        {shift.endTime ? formatDateTime(shift.endTime) : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
                    <div className="bg-white p-4">
                      <p className="text-xs text-gray-500 mb-1">Tiền đầu ca</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(shift.floatAmount)}
                      </p>
                    </div>
                    <div className="bg-success-50 p-4">
                      <p className="text-xs text-success-700 mb-1 font-semibold">Tiền thu</p>
                      <p className="text-lg font-bold text-success-700">
                        +{formatCurrency(shift.cashIn)}
                      </p>
                    </div>
                    <div className="bg-error-50 p-4">
                      <p className="text-xs text-error-700 mb-1 font-semibold">Tiền chi</p>
                      <p className="text-lg font-bold text-error-700">
                        -{formatCurrency(shift.cashOut)}
                      </p>
                    </div>
                    <div className="bg-primary-50 p-4">
                      <p className="text-xs text-primary-700 mb-1 font-semibold">Dự kiến</p>
                      <p className="text-lg font-bold text-primary-700">
                        {formatCurrency(shift.expectedCash)}
                      </p>
                    </div>
                  </div>

                  {shift.varianceReason && (
                    <div className="bg-gray-50 p-4 border-t-2 border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Ghi chú chênh lệch:</p>
                      <p className="text-sm text-gray-700">{shift.varianceReason}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
