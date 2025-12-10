"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";

interface Shift {
  shiftID: string;
  employeeID: string;
  employeeName: string;
  startTime: string;
  endTime?: string;
  floatAmount: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number;
  variance: number;
  varianceReason?: string;
}

export default function ShiftManagementPage() {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [floatAmount, setFloatAmount] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [varianceReason, setVarianceReason] = useState("");

  // Mock shift data
  const [shifts] = useState<Shift[]>([
    {
      shiftID: "SH001",
      employeeID: "NV001",
      employeeName: "Nguyễn Thị Lan",
      startTime: "2025-12-10T08:00:00",
      endTime: "2025-12-10T16:00:00",
      floatAmount: 2000000,
      cashIn: 5000000,
      cashOut: 500000,
      expectedCash: 6500000,
      actualCash: 6500000,
      variance: 0,
    },
    {
      shiftID: "SH002",
      employeeID: "NV002",
      employeeName: "Trần Văn Nam",
      startTime: "2025-12-10T16:00:00",
      endTime: "2025-12-10T23:30:00",
      floatAmount: 2000000,
      cashIn: 7200000,
      cashOut: 300000,
      expectedCash: 8900000,
      actualCash: 8850000,
      variance: -50000,
      varianceReason: "Thiếu 50k do khách trả thiếu tiền lẻ, đã bù từ quỹ",
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const handleStartShift = () => {
    const float = parseFloat(floatAmount);
    if (isNaN(float) || float <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const newShift: Shift = {
      shiftID: `SH${Date.now()}`,
      employeeID: "NV003",
      employeeName: "Người dùng hiện tại",
      startTime: new Date().toISOString(),
      floatAmount: float,
      cashIn: 0,
      cashOut: 0,
      expectedCash: float,
      variance: 0,
    };

    setCurrentShift(newShift);
    setFloatAmount("");
  };

  const handleEndShift = () => {
    if (!currentShift) return;

    const actual = parseFloat(actualCash);
    if (isNaN(actual)) {
      alert("Vui lòng nhập số tiền thực tế");
      return;
    }

    const variance = actual - currentShift.expectedCash;

    if (variance !== 0 && !varianceReason.trim()) {
      alert("Vui lòng nhập lý do chênh lệch");
      return;
    }

    const endedShift = {
      ...currentShift,
      endTime: new Date().toISOString(),
      actualCash: actual,
      variance,
      varianceReason: varianceReason.trim() || undefined,
    };

    console.log("Kết thúc ca làm:", endedShift);
    setCurrentShift(null);
    setActualCash("");
    setVarianceReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý Ca làm việc
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bắt đầu/Kết thúc ca và đối soát tiền mặt
        </p>
      </div>

      {/* Current Shift Status */}
      {currentShift ? (
        <Card className="bg-green-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              Ca làm việc đang mở
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bắt đầu lúc</p>
                <p className="font-semibold">
                  {formatDateTime(currentShift.startTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiền đầu ca (Float)</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(currentShift.floatAmount)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold">Kết thúc ca</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="actualCash">
                    Tiền thực tế trong ngăn kéo
                  </Label>
                  <Input
                    id="actualCash"
                    type="number"
                    placeholder="Nhập số tiền đếm được"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                  />
                </div>

                {actualCash &&
                  parseFloat(actualCash) !== currentShift.expectedCash && (
                    <div>
                      <Label htmlFor="varianceReason">Lý do chênh lệch *</Label>
                      <Textarea
                        id="varianceReason"
                        placeholder="Giải thích lý do có chênh lệch..."
                        value={varianceReason}
                        onChange={(e) => setVarianceReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                <Button onClick={handleEndShift} className="w-full">
                  {ICONS.CHECK}
                  <span className="ml-2">Kết thúc ca</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Bắt đầu ca mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="floatAmount">Tiền đầu ca (Float Amount)</Label>
              <Input
                id="floatAmount"
                type="number"
                placeholder="Ví dụ: 2000000"
                value={floatAmount}
                onChange={(e) => setFloatAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Số tiền trong ngăn kéo khi bắt đầu ca
              </p>
            </div>
            <Button
              onClick={handleStartShift}
              className="w-full"
              disabled={!floatAmount}
            >
              {ICONS.PLUS}
              <span className="ml-2">Bắt đầu ca</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shift History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử ca làm việc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div
                key={shift.shiftID}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{shift.employeeName}</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(shift.startTime)} -{" "}
                      {shift.endTime && formatDateTime(shift.endTime)}
                    </p>
                  </div>
                  {shift.variance !== 0 ? (
                    <Badge variant="destructive">
                      Chênh lệch: {formatCurrency(Math.abs(shift.variance))}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">
                      Khớp đúng
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Float</p>
                    <p className="font-medium">
                      {formatCurrency(shift.floatAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cash In</p>
                    <p className="font-medium text-green-600">
                      +{formatCurrency(shift.cashIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cash Out</p>
                    <p className="font-medium text-red-600">
                      -{formatCurrency(shift.cashOut)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expected</p>
                    <p className="font-semibold">
                      {formatCurrency(shift.expectedCash)}
                    </p>
                  </div>
                </div>

                {shift.actualCash !== undefined && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Thực tế:</span>
                      <span className="font-semibold">
                        {formatCurrency(shift.actualCash)}
                      </span>
                    </div>
                    {shift.varianceReason && (
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Lý do:</strong> {shift.varianceReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
