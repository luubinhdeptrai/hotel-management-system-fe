"use client";

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
      gradient: "from-primary-600 to-primary-500",
      lightGradient: "from-primary-50 to-primary-100/30",
    },
    {
      title: "Tổng Số Booking",
      value: totalBookings.toString(),
      icon: ICONS.CALENDAR_CHECK,
      gradient: "from-success-600 to-success-500",
      lightGradient: "from-success-50 to-success-100/30",
    },
    {
      title: "Công Suất Trung Bình",
      value: `${averageOccupancy.toFixed(1)}%`,
      icon: ICONS.TRENDING_UP,
      gradient: "from-info-600 to-info-500",
      lightGradient: "from-info-50 to-info-100/30",
    },
    {
      title: "Tổng Khách Hàng",
      value: totalCustomers.toString(),
      icon: ICONS.USERS,
      gradient: "from-warning-600 to-warning-500",
      lightGradient: "from-warning-50 to-warning-100/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-linear-to-br ${card.lightGradient} rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group`}
        >
          {/* Icon Circle */}
          <div
            className={`w-14 h-14 bg-linear-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}
          >
            <div className="w-7 h-7 text-white flex items-center justify-center">
              {card.icon}
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              {card.title}
            </p>
            <p className="text-2xl font-extrabold text-gray-900">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
