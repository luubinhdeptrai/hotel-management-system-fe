"use client";

import { BedDouble, DollarSign, Home, UserCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RoomStatusChart } from "@/components/dashboard/room-status-chart";
import { ArrivalsTable } from "@/components/dashboard/arrivals-table";
import { DeparturesTable } from "@/components/dashboard/departures-table";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { cn, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const {
    user,
    stats,
    roomStatusData,
    arrivals,
    departures,
    occupancyRate,
    arrivalsCount,
    departuresCount,
    roomsNeedingCleaning,
  } = useDashboardPage();

  const quickStats = [
    {
      label: "Tỷ lệ lấp đầy",
      value: `${occupancyRate.toFixed(1)}%`,
    },
    {
      label: "Khách đến hôm nay",
      value: arrivalsCount.toString(),
    },
    {
      label: "Khách trả hôm nay",
      value: departuresCount.toString(),
    },
    {
      label: "Phòng cần dọn dẹp",
      value: roomsNeedingCleaning.toString(),
      valueClassName: "text-warning-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Chào mừng, {user?.fullName}!
          </h2>
          <p className="text-gray-600 mt-1">
            Tổng quan về tình hình hoạt động của khách sạn
          </p>
        </div>

        {/* KPI Cards - Updated per spec 2.2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Phòng Sẵn Sàng"
            value={stats.availableRooms}
            icon={BedDouble}
            iconBgColor="bg-success-100"
            iconColor="text-success-600"
            subtitle="Chỉ tính phòng READY"
          />
          <KPICard
            title="Phòng Bẩn"
            value={stats.dirtyRooms}
            icon={Home}
            iconBgColor="bg-warning-100"
            iconColor="text-warning-600"
            subtitle="Cần dọn gấp"
            alert={stats.dirtyRooms > 0}
          />
          <KPICard
            title="Khách Sắp Đến"
            value={arrivalsCount}
            icon={UserCheck}
            iconBgColor="bg-info-100"
            iconColor="text-info-600"
            subtitle="Check-in hôm nay"
          />
          <KPICard
            title="Khách Sắp Đi"
            value={departuresCount}
            icon={DollarSign}
            iconBgColor="bg-error-100"
            iconColor="text-error-600"
            subtitle="Cần chuẩn bị bill"
          />
        </div>

        {/* Chart and Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RoomStatusChart data={roomStatusData} />
          </div>
          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Thống Kê Nhanh
              </CardTitle>
              <CardDescription>Cập nhật trong ngày hôm nay</CardDescription>
            </CardHeader>
            <CardContent className="mt-6 space-y-4">
              {quickStats.map((stat, index) => (
                <div key={stat.label}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span
                      className={cn(
                        "text-sm font-semibold text-gray-900",
                        stat.valueClassName
                      )}
                    >
                      {stat.value}
                    </span>
                  </div>
                  {index < quickStats.length - 1 && (
                    <Separator className="mt-3 bg-gray-200" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Arrivals and Departures Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ArrivalsTable arrivals={arrivals} />
          <DeparturesTable departures={departures} />
        </div>
      </main>
    </div>
  );
}
