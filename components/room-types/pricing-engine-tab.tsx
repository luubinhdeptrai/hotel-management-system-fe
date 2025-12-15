"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import type { RoomType } from "@/lib/types/room";
import { mockPricingRules, mockSpecialPriceDates } from "@/lib/mock-pricing";
import { PricingRulesTable } from "./pricing-rules-table";
import { SpecialDatesTable } from "./special-dates-table";

interface PricingEngineTabProps {
  roomTypes: RoomType[];
}

export function PricingEngineTab({ roomTypes: _roomTypes }: PricingEngineTabProps) {
  const [pricingRules] = useState(mockPricingRules);
  const [specialDates] = useState(mockSpecialPriceDates);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <span className="text-blue-600 mt-1">{ICONS.INFO}</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Pricing Engine
              </h3>
              <p className="text-sm text-blue-700">
                Cấu hình giá động dựa trên ngày trong tuần (Weekday/Weekend),
                ngày lễ và mùa cao điểm. Giá đặc biệt có ưu tiên cao nhất.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Rules Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quy tắc định giá</CardTitle>
          <Button
            size="sm"
            className="h-9 bg-primary-600 hover:bg-primary-500"
            disabled
          >
            {ICONS.PLUS}
            <span className="ml-2">Thêm quy tắc</span>
          </Button>
        </CardHeader>
        <CardContent>
          <PricingRulesTable rules={pricingRules} />
        </CardContent>
      </Card>

      {/* Special Dates Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Giá đặc biệt theo ngày</CardTitle>
          <Button
            size="sm"
            className="h-9 bg-primary-600 hover:bg-primary-500"
            disabled
          >
            {ICONS.PLUS}
            <span className="ml-2">Thêm ngày đặc biệt</span>
          </Button>
        </CardHeader>
        <CardContent>
          <SpecialDatesTable specialDates={specialDates} />
        </CardContent>
      </Card>

      {/* Pricing Calculation Example */}
      <Card>
        <CardHeader>
          <CardTitle>Ví dụ tính giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="border rounded-lg p-4">
                <p className="text-gray-500 mb-1">Ngày thường (T2-T5)</p>
                <p className="font-semibold text-gray-900">
                  Standard: {formatCurrency(500000)}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-gray-500 mb-1">Cuối tuần (T6-CN)</p>
                <p className="font-semibold text-gray-900">
                  Standard: {formatCurrency(700000)}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-gray-500 mb-1">Ngày lễ / Tết</p>
                <p className="font-semibold text-gray-900">
                  Standard: {formatCurrency(900000)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              <strong>Lưu ý:</strong> Giá đặ biệt trong danh sách trên sẽ ghi đè
              lên quy tắc tự động.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
