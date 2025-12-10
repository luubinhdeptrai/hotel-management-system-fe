"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerStatistics } from "@/lib/types/customer";
import { ICONS } from "@/src/constants/icons.enum";

interface CustomerStatisticsProps {
  statistics: CustomerStatistics;
}

export function CustomerStatistics({ statistics }: CustomerStatisticsProps) {
  const items = [
    {
      label: "Tổng khách hàng",
      value: statistics.totalCustomers,
      description: "Bao gồm cá nhân & doanh nghiệp",
      icon: ICONS.USERS,
      accent: "bg-primary-100 text-primary-700",
    },
    {
      label: "Khách VIP",
      value: statistics.vipCustomers,
      description: "Kích hoạt ưu đãi cá nhân hóa",
      icon: ICONS.USER_CHECK,
      accent: "bg-success-100 text-success-700",
    },
    {
      label: "Khách doanh nghiệp",
      value: statistics.corporateCustomers,
      description: "Hợp đồng corporate hiện hữu",
      icon: ICONS.CLIPBOARD_LIST,
      accent: "bg-info-100 text-info-700",
    },
    {
      label: "Khách bị vô hiệu",
      value: statistics.inactiveCustomers,
      description: "Cần rà soát trạng thái",
      icon: ICONS.ALERT,
      accent: "bg-warning-100 text-warning-700",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {item.label}
            </CardTitle>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${item.accent}`}
            >
              {item.icon}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {item.value}
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </CardContent>
        </Card>
      ))}
      <Card className="border border-gray-200 shadow-sm lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Tổng giá trị vòng đời
          </CardTitle>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            {ICONS.DOLLAR_SIGN}
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-gray-900">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(statistics.totalLifetimeValue || 0)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Tổng doanh thu ghi nhận từ tất cả khách hàng
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
