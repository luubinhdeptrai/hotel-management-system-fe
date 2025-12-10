"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ICONS } from "@/src/constants/icons.enum";

interface StatsCardsProps {
  totalRoomTypes: number;
  minPrice: number | null;
  maxPrice: number | null;
}

export function StatsCards({
  totalRoomTypes,
  minPrice,
  maxPrice,
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="py-5">
        <CardContent className="px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng loại phòng</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {totalRoomTypes}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-blue-100 rounded-lg flex items-center justify-center">
              <span className="w-6 h-6 text-primary-blue-600">
                {ICONS.BED_DOUBLE}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-5">
        <CardContent className="px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Giá thấp nhất</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {minPrice !== null ? formatCurrency(minPrice) : "0 ₫"}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <span className="w-6 h-6 text-success-600">
                {ICONS.DOLLAR_SIGN}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-5">
        <CardContent className="px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Giá cao nhất</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {maxPrice !== null ? formatCurrency(maxPrice) : "0 ₫"}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <span className="w-6 h-6 text-warning-600">
                {ICONS.TRENDING_UP}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
