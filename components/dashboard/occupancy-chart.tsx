import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface OccupancyChartProps {
  occupancyData?: {
    forecast?: Array<{
      date: string;
      occupiedRooms: number;
      availableRooms: number;
      occupancyRate: number;
    }>;
    averageOccupancyRate?: number;
  } | null;
}

export function OccupancyChart({ occupancyData }: OccupancyChartProps) {
  // Use real forecast data from API
  const forecastData = occupancyData?.forecast || [];
  const avgOccupancy = occupancyData?.averageOccupancyRate || 0;

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Dự Báo Lấp Đầy</h3>
          <p className="text-sm text-gray-500">7 ngày tới</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-2xl font-bold text-blue-600">{avgOccupancy.toFixed(1)}%</p>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className="text-xs text-gray-500">Trung bình</p>
        </div>
      </div>

      {/* Area Chart - Occupancy Forecast */}
      <div className="mb-6">
        {forecastData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="occupiedRooms"
              stackId="1"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorOccupied)"
              name="Phòng Đã Đặt"
            />
            <Area
              type="monotone"
              dataKey="availableRooms"
              stackId="1"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorAvailable)"
              name="Phòng Trống"
            />
          </AreaChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>Chưa có dữ liệu dự báo lấp đầy</p>
          </div>
        )}
      </div>

      {/* Occupancy Rate Progress */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Tỷ Lệ Lấp Đầy Ngày Hôm Nay</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{avgOccupancy.toFixed(1)}% - {avgOccupancy > 70 ? 'Tốt' : avgOccupancy > 40 ? 'Trung bình' : 'Thấp'}</span>
            <span className="text-xs text-gray-500">Chi tiết từ API</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(avgOccupancy, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
