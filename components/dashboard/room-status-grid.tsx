import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoomStatusGridProps {
  roomStatusSummary?: {
    available?: number;
    occupied?: number;
    reserved?: number;
    cleaning?: number;
    maintenance?: number;
    outOfService?: number;
  };
}

export function RoomStatusGrid({ roomStatusSummary }: RoomStatusGridProps) {
  const statusData = roomStatusSummary || {
    available: 0,
    occupied: 0,
    reserved: 0,
    cleaning: 0,
    maintenance: 0,
    outOfService: 0,
  };

  const chartData = [
    {
      name: "Sẵn Sàng",
      count: statusData.available || 0,
      color: "#10B981",
    },
    {
      name: "Đã Đặt",
      count: statusData.occupied || 0,
      color: "#3B82F6",
    },
    {
      name: "Cơm Dặm",
      count: statusData.reserved || 0,
      color: "#F59E0B",
    },
    {
      name: "Đang Dọn",
      count: statusData.cleaning || 0,
      color: "#8B5CF6",
    },
    {
      name: "Bảo Trì",
      count: statusData.maintenance || 0,
      color: "#EF4444",
    },
    {
      name: "Không Dùng",
      count: statusData.outOfService || 0,
      color: "#6B7280",
    },
  ];

  const totalRooms = Object.values(statusData).reduce((a, b) => a + b, 0) || 75;

  const statusBadges = [
    {
      label: "Sẵn Sàng",
      value: statusData.available || 0,
      bgColor: "from-green-50 to-green-100",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      label: "Đã Đặt",
      value: statusData.occupied || 0,
      bgColor: "from-blue-50 to-blue-100",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      label: "Cơm Dặm",
      value: statusData.reserved || 0,
      bgColor: "from-orange-50 to-orange-100",
      textColor: "text-orange-700",
      borderColor: "border-orange-200",
      badgeColor: "bg-orange-100 text-orange-700",
    },
    {
      label: "Đang Dọn",
      value: statusData.cleaning || 0,
      bgColor: "from-purple-50 to-purple-100",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      badgeColor: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Tình Trạng Phòng</h3>
          <p className="text-sm text-gray-500">Tổng cộng {totalRooms} phòng</p>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusBadges.map((status, index) => (
          <div
            key={index}
            className={`bg-linear-to-br ${status.bgColor} border ${status.borderColor} rounded-lg p-4 text-center`}
          >
            <p className="text-xs text-gray-600 mb-2">{status.label}</p>
            <p className={`text-2xl font-bold ${status.textColor}`}>{status.value}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((status.value / totalRooms) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="count"
              fill="#3B82F6"
              shape={<CustomBar />}
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Bar key={`bar-${index}`} dataKey="count" fill={entry.color} radius={[8, 8, 0, 0]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-3">Phân Bố Tình Trạng</p>
        <div className="flex items-center gap-2 flex-wrap">
          {chartData.map((status, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status.color }}
              ></div>
              <span className="text-xs text-gray-600">
                {status.name}: {status.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function CustomBar(props: { fill?: string; x?: number; y?: number; width?: number; height?: number }) {
  const { fill, x, y, width, height } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={8}
      ry={8}
    />
  );
}
