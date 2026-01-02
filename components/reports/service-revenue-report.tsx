"use client";

import { ServiceRevenueTable } from "./service-revenue-table";
import { ICONS } from "@/src/constants/icons.enum";
import type { ServiceRevenueData } from "@/lib/types/reports";

interface ServiceRevenueReportProps {
  serviceRevenueData: ServiceRevenueData[];
}

export function ServiceRevenueReport({
  serviceRevenueData,
}: ServiceRevenueReportProps) {
  const totalRevenue = serviceRevenueData.reduce((sum, s) => sum + s.revenue, 0);
  const totalQuantity = serviceRevenueData.reduce((sum, s) => sum + s.quantity, 0);
  const avgRevenuePerService = serviceRevenueData.length > 0 ? totalRevenue / serviceRevenueData.length : 0;
  
  const topService = serviceRevenueData.reduce((max, s) =>
    s.revenue > max.revenue ? s : max,
    serviceRevenueData[0] || { revenue: 0, serviceName: "", category: "", quantity: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Tổng doanh thu DV
              </p>
              <p className="text-2xl font-extrabold text-gray-900">
                {new Intl.NumberFormat("vi-VN").format(totalRevenue)} ₫
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Từ tất cả dịch vụ
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.DOLLAR_SIGN}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Dịch vụ phổ biến nhất
              </p>
              <p className="text-lg font-extrabold text-gray-900 truncate">
                {topService.serviceName || "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Intl.NumberFormat("vi-VN").format(topService.revenue)} ₫
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.STAR}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-info-50 to-info-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Doanh thu TB/DV
              </p>
              <p className="text-2xl font-extrabold text-gray-900">
                {new Intl.NumberFormat("vi-VN").format(avgRevenuePerService)} ₫
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Trung bình mỗi loại
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.BAR_CHART}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-warning-50 to-warning-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Tổng lượt sử dụng
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {totalQuantity}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tất cả dịch vụ
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.PACKAGE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="w-5 h-5 text-white">{ICONS.BAR_CHART}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Biểu đồ doanh thu theo dịch vụ
            </h3>
            <p className="text-xs text-gray-500">Top 10 dịch vụ có doanh thu cao nhất</p>
          </div>
        </div>

        <div className="space-y-3">
          {serviceRevenueData
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)
            .map((item, index) => {
              const barWidth = topService.revenue > 0 ? (item.revenue / topService.revenue) * 100 : 0;
              const isTop = index === 0;

              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-semibold text-gray-700 truncate">
                        {item.serviceName}
                      </span>
                      <span className="text-gray-500 text-xs">({item.category})</span>
                      {isTop && (
                        <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs font-bold rounded-full shrink-0">
                          TOP 1
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 shrink-0 ml-2">
                      {new Intl.NumberFormat("vi-VN").format(item.revenue)} ₫
                    </span>
                  </div>
                  <div className="h-10 w-full overflow-hidden rounded-lg bg-gray-100 relative">
                    <div
                      className={`h-full rounded-lg transition-all duration-300 ${
                        isTop 
                          ? "bg-linear-to-r from-success-600 to-success-500" 
                          : "bg-linear-to-r from-primary-600 to-primary-500"
                      }`}
                      style={{ width: `${Math.max(barWidth, 2)}%` }}
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <span className="text-xs font-bold text-white">
                        SL: {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <ServiceRevenueTable data={serviceRevenueData} />
    </div>
  );
}
