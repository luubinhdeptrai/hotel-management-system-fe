import { TrendingUp, DollarSign, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KeyMetricsSectionProps {
  stats: {
    totalRevenue: number;
    roomRevenue: number;
    serviceRevenue: number;
    totalBookings: number;
    occupancyRate: number;
    averageRoomRate: number;
    revenuePerAvailableRoom: number;
  };
}

interface MetricCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description: string;
  bgColor: string;
  iconBgColor: string;
}

export function KeyMetricsSection({ stats }: KeyMetricsSectionProps) {
  const metrics: MetricCard[] = [
    {
      label: "Tổng Doanh Thu",
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign className="w-6 h-6" />,
      description: "Hôm nay",
      bgColor: "from-green-50 to-green-100",
      iconBgColor: "from-green-500 to-green-600",
      trend: 12,
    },
    {
      label: "Doanh Thu Phòng",
      value: formatCurrency(stats.roomRevenue),
      icon: <DollarSign className="w-6 h-6" />,
      description: "Từ phòng",
      bgColor: "from-blue-50 to-blue-100",
      iconBgColor: "from-blue-500 to-blue-600",
      trend: 8,
    },
    {
      label: "Doanh Thu Dịch Vụ",
      value: formatCurrency(stats.serviceRevenue),
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Từ dịch vụ",
      bgColor: "from-purple-50 to-purple-100",
      iconBgColor: "from-purple-500 to-purple-600",
      trend: 15,
    },
    {
      label: "Tỷ Lệ Lấp Đầy",
      value: `${stats.occupancyRate.toFixed(1)}%`,
      icon: <Percent className="w-6 h-6" />,
      description: "Hiện tại",
      bgColor: "from-orange-50 to-orange-100",
      iconBgColor: "from-orange-500 to-orange-600",
      trend: 5,
    },
    {
      label: "ADR (Giá Trung Bình)",
      value: formatCurrency(stats.averageRoomRate),
      icon: <DollarSign className="w-6 h-6" />,
      description: "Giá 1 phòng",
      bgColor: "from-pink-50 to-pink-100",
      iconBgColor: "from-pink-500 to-pink-600",
    },
    {
      label: "RevPAR",
      value: formatCurrency(stats.revenuePerAvailableRoom),
      icon: <TrendingUp className="w-6 h-6" />,
      description: "Doanh thu/phòng có sẵn",
      bgColor: "from-cyan-50 to-cyan-100",
      iconBgColor: "from-cyan-500 to-cyan-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <MetricCardComponent key={index} metric={metric} />
      ))}
    </div>
  );
}

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  return (
    <div
      className={`bg-linear-to-br ${metric.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm`}
    >
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-linear-to-br ${metric.iconBgColor} p-3 rounded-xl shadow-lg`}>
          <div className="text-white">{metric.icon}</div>
        </div>
        {metric.trend && (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            <TrendingUp size={14} />
            +{metric.trend}%
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{metric.label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</h3>
        <p className="text-gray-500 text-xs">{metric.description}</p>
      </div>
    </div>
  );
}
