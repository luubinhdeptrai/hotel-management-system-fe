import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

interface QuickStatsCardsProps {
  totalRevenue: number;
  averageDailyRate: number;
  occupancyRate: number;
}

export function QuickStatsCards({
  totalRevenue,
  averageDailyRate,
  occupancyRate,
}: QuickStatsCardsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M đ`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K đ`;
    }
    return `${value.toFixed(0)} đ`;
  };

  return (
    <div className="space-y-4">
      {/* Total Revenue Card */}
      <Card className="p-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-green-600 mt-1">Hôm nay</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>

      {/* ADR Card */}
      <Card className="p-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium">Giá Trung Bình (ADR)</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              {formatCurrency(averageDailyRate)}
            </p>
            <p className="text-xs text-blue-600 mt-1">Mỗi phòng</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Occupancy Rate Card */}
      <Card className="p-4 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium">Tỷ Lệ Lấp Đầy</p>
            <p className="text-2xl font-bold text-purple-700 mt-2">
              {occupancyRate.toFixed(1)}%
            </p>
            <p className="text-xs text-purple-600 mt-1">Hiện tại</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <div className="text-white font-bold text-lg">%</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
