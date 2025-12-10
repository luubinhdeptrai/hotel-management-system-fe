"use client";

import { Card } from "@/components/ui/card";
import { ICONS } from "@/src/constants/icons.enum";

interface ReportSummaryCardsProps {
  totalRevenue: number;
  totalBookings: number;
  averageOccupancy: number;
  totalCustomers: number;
}

export function ReportSummaryCards({
  totalRevenue,
  totalBookings,
  averageOccupancy,
  totalCustomers,
}: ReportSummaryCardsProps) {
  const cards = [
    {
      title: "Tổng Doanh Thu",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(totalRevenue),
      icon: ICONS.DOLLAR_SIGN,
      bgColor: "bg-primary-blue-100",
      iconColor: "text-primary-blue-600",
    },
    {
      title: "Tổng Số Booking",
      value: totalBookings.toString(),
      icon: ICONS.CALENDAR_CHECK,
      bgColor: "bg-success-100",
      iconColor: "text-success-600",
    },
    {
      title: "Công Suất Trung Bình",
      value: `${averageOccupancy.toFixed(1)}%`,
      icon: ICONS.TRENDING_UP,
      bgColor: "bg-info-100",
      iconColor: "text-info-600",
    },
    {
      title: "Tổng Khách Hàng",
      value: totalCustomers.toString(),
      icon: ICONS.USERS,
      bgColor: "bg-warning-100",
      iconColor: "text-warning-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {card.value}
              </p>
            </div>
            <div className={`rounded-md p-3 ${card.bgColor}`}>
              <div className={`h-6 w-6 ${card.iconColor}`}>{card.icon}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
