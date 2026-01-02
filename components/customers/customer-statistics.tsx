"use client";

import type { CustomerStatistics } from "@/lib/types/customer";
import { ICONS } from "@/src/constants/icons.enum";

interface CustomerStatisticsProps {
  statistics: CustomerStatistics;
}

export function CustomerStatistics({ statistics }: CustomerStatisticsProps) {
  return (
    <div className="bg-linear-to-br from-primary-600 via-primary-500 to-primary-600 rounded-2xl shadow-xl p-6 text-white">
      <div className="mb-6 flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
          <span className="w-6 h-6 text-white flex items-center justify-center">{ICONS.USERS}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Quản lý Khách hàng</h2>
          <p className="text-primary-50 text-sm">Theo dõi hồ sơ khách hàng, lịch sử đặt phòng và phân loại VIP</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-primary-100 text-sm mb-1">Tổng số</div>
          <div className="text-3xl font-bold">{statistics.totalCustomers}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-primary-100 text-sm mb-1">Khách VIP</div>
          <div className="text-3xl font-bold">{statistics.vipCustomers}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-primary-100 text-sm mb-1">Doanh nghiệp</div>
          <div className="text-3xl font-bold">{statistics.corporateCustomers}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-primary-100 text-sm mb-1">Vô hiệu</div>
          <div className="text-3xl font-bold">{statistics.inactiveCustomers}</div>
        </div>
      </div>
    </div>
  );
}
