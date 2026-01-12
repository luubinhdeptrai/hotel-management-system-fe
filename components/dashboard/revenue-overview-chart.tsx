import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

interface RevenueOverviewChartProps {
  stats: {
    totalRevenue: number;
    roomRevenue: number;
    serviceRevenue: number;
    totalBookings: number;
  };
}

export function RevenueOverviewChart({ stats }: RevenueOverviewChartProps) {
  // Use real revenue data from API
  const revenueData = stats.totalRevenue > 0 ? [
    { date: "Hôm nay", total: stats.totalRevenue, room: stats.roomRevenue, service: stats.serviceRevenue },
  ] : [];

  const revenueComposition = [
    { name: "Doanh Thu Phòng", value: stats.roomRevenue, color: "#3B82F6" },
    { name: "Doanh Thu Dịch Vụ", value: stats.serviceRevenue, color: "#8B5CF6" },
  ];

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Doanh Thu</h3>
          <p className="text-sm text-gray-500">Xu hướng 6 ngày gần nhất</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {(stats.totalRevenue / 1000000).toFixed(1)}M đ
          </p>
          <p className="text-xs text-green-500">+12% so với tuần trước</p>
        </div>
      </div>

      {/* Line Chart - Revenue Trend */}
      <div className="mb-6">
        {revenueData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
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
            <Line
              type="monotone"
              dataKey="total"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", r: 5 }}
              activeDot={{ r: 7 }}
              name="Tổng Doanh Thu"
            />
            <Line
              type="monotone"
              dataKey="room"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", r: 4 }}
              name="Doanh Thu Phòng"
              opacity={0.7}
            />
          </LineChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>Chưa có dữ liệu doanh thu</p>
          </div>
        )}
      </div>

      {/* Pie Chart - Revenue Breakdown */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-4">Cơ Cấu Doanh Thu</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={revenueComposition}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {revenueComposition.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center space-y-3">
          {revenueComposition.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {((item.value / stats.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {(item.value / 1000000).toFixed(1)}M
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
