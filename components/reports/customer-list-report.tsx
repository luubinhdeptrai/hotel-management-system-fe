"use client";

import { CustomerListTable } from "./customer-list-table";
import { ICONS } from "@/src/constants/icons.enum";
import type { CustomerReportData } from "@/lib/types/reports";

interface CustomerListReportProps {
  customerReportData: CustomerReportData[];
}

export function CustomerListReport({
  customerReportData,
}: CustomerListReportProps) {
  const totalCustomers = customerReportData.length;
  const totalBookings = customerReportData.reduce((sum, c) => sum + c.totalBookings, 0);
  const totalRevenue = customerReportData.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpending = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  
  const vipCustomers = customerReportData.filter(c => c.totalSpent > 10000000).length;
  const repeatCustomers = customerReportData.filter(c => c.totalBookings > 1).length;
  const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Tổng khách hàng
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {totalCustomers}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Trong kỳ báo cáo
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.USERS}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Tổng đặt phòng
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {totalBookings}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                TB: {totalCustomers > 0 ? (totalBookings / totalCustomers).toFixed(1) : 0} lần/khách
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.CALENDAR_CHECK}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-warning-50 to-warning-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Khách VIP
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {vipCustomers}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Chi tiêu &gt; 10 triệu
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.STAR}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-info-50 to-info-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Tỷ lệ quay lại
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {repeatRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {repeatCustomers} khách quay lại
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.TRENDING_UP}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Card */}
      <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="w-5 h-5 text-white">{ICONS.BAR_CHART}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Phân tích chi tiết
            </h3>
            <p className="text-xs text-gray-500">Thông tin khách hàng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-xl p-4 border-2 border-white/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Tổng doanh thu</span>
              <span className="text-xl font-extrabold text-gray-900">
                {new Intl.NumberFormat("vi-VN").format(totalRevenue)} ₫
              </span>
            </div>
          </div>

          <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-xl p-4 border-2 border-white/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Chi tiêu TB/khách</span>
              <span className="text-xl font-extrabold text-gray-900">
                {new Intl.NumberFormat("vi-VN").format(avgSpending)} ₫
              </span>
            </div>
          </div>
        </div>
      </div>

      <CustomerListTable data={customerReportData} />
    </div>
  );
}
