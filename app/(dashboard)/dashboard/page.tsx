"use client";

import { BedDouble, DollarSign, Home, UserCheck } from "lucide-react";
import { ICONS } from "@/src/constants/icons.enum";

import { Separator } from "@/components/ui/separator";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RoomStatusChart } from "@/components/dashboard/room-status-chart";
import { ArrivalsTable } from "@/components/dashboard/arrivals-table";
import { DeparturesTable } from "@/components/dashboard/departures-table";
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Gradient */}
      <div className="bg-linear-to-r from-primary-600 to-primary-500 text-white px-4 sm:px-6 lg:px-8 py-8 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-md backdrop-blur-sm">
              <span className="w-8 h-8 text-white">{ICONS.DASHBOARD}</span>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold">
                Chào mừng, {user?.name}!
              </h2>
              <p className="text-primary-100 mt-1">
                Tổng quan về tình hình hoạt động của khách sạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* KPI Cards - Modern Gradient Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Phòng Sẵn Sàng"
            value={stats.availableRooms}
            icon={BedDouble}
            iconBgColor="from-success-600 to-success-500"
            iconColor="text-white"
            bgGradient="from-success-50 to-success-100/30"
            subtitle="Chỉ tính phòng READY"
          />
          <KPICard
            title="Phòng Bẩn"
            value={stats.dirtyRooms}
            icon={Home}
            iconBgColor="from-warning-600 to-warning-500"
            iconColor="text-white"
            bgGradient="from-warning-50 to-warning-100/30"
            subtitle="Cần dọn gấp"
            alert={stats.dirtyRooms > 0}
          />
          <KPICard
            title="Khách Sắp Đến"
            value={arrivalsCount}
            icon={UserCheck}
            iconBgColor="from-info-600 to-info-500"
            iconColor="text-white"
            bgGradient="from-info-50 to-info-100/30"
            subtitle="Check-in hôm nay"
          />
          <KPICard
            title="Khách Sắp Đi"
            value={departuresCount}
            icon={DollarSign}
            iconBgColor="from-error-600 to-error-500"
            iconColor="text-white"
            bgGradient="from-error-50 to-error-100/30"
            subtitle="Cần chuẩn bị bill"
          />
        </div>

        {/* Chart and Quick Stats - Modern Card Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RoomStatusChart data={roomStatusData} />
          </div>
          <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="w-5 h-5 text-white">{ICONS.BAR_CHART}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Thống Kê Nhanh
                </h3>
                <p className="text-xs text-gray-500">Cập nhật hôm nay</p>
              </div>
            </div>
            <div className="space-y-4">
              {quickStats.map((stat, index) => (
                <div key={stat.label}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                    <span
                      className={cn(
                        "text-lg font-extrabold text-gray-900",
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
            </div>
          </div>
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
