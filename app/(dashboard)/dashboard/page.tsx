"use client";

import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KeyMetricsSection } from "@/components/dashboard/key-metrics-section";
import { RevenueOverviewChart } from "@/components/dashboard/revenue-overview-chart";
import { TodaysActivitySection } from "@/components/dashboard/todays-activity-section";
import { RoomStatusGrid } from "@/components/dashboard/room-status-grid";
import { QuickStatsCards } from "@/components/dashboard/quick-stats-cards";

const testUser = { name: "Quản lý Khách sạn" };

export default function DashboardPage() {
  const {
    stats,
    arrivalsData,
    departuresData,
  } = useDashboardPage();

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Welcome Message */}
      <DashboardHeader userName={testUser.name} />

      {/* Key Metrics - Top KPIs */}
      <KeyMetricsSection stats={stats} />

      {/* Main Charts - Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueOverviewChart stats={stats} />
      </div>

      {/* Quick Stats & Room Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RoomStatusGrid />
        </div>
        <QuickStatsCards
          totalRevenue={stats.totalRevenue}
          averageDailyRate={stats.averageRoomRate}
          occupancyRate={stats.occupancyRate}
        />
      </div>

      {/* Today's Activity - Arrivals & Departures */}
      <TodaysActivitySection arrivals={arrivalsData} departures={departuresData} />
    </div>
  );
}
