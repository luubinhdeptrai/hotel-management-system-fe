/**
 * RankStatistics Component
 * Display customer rank statistics with modern professional design
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CustomerRankStatistics } from "@/lib/types/customer-rank";
import { formatSpending } from "@/lib/types/customer-rank";
import { Users, TrendingUp, Award, Star } from "lucide-react";

interface RankStatisticsProps {
  statistics: CustomerRankStatistics | null;
  loading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
}

function StatCard({ icon, title, value, subtitle, gradient }: StatCardProps) {
  const gradientMap: Record<string, string> = {
    "from-blue-500": "from-indigo-500 to-blue-600",
    "from-purple-500": "from-blue-500 to-indigo-600",
    "from-amber-500": "from-amber-500 to-orange-600",
    "from-rose-500": "from-pink-500 to-rose-600",
  };
  
  const mappedGradient = gradientMap[gradient] || gradient;

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-slate-50">
      <div className={`h-1 bg-gradient-to-r ${mappedGradient}`}></div>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${mappedGradient} bg-clip-text text-transparent`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-br ${mappedGradient} rounded-lg text-white shadow-md`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RankStatistics({ statistics, loading }: RankStatisticsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-slate-600">Không có dữ liệu thống kê</p>
        </CardContent>
      </Card>
    );
  }

  const unrankedPercentage = statistics.totalCustomers > 0
    ? ((statistics.customersWithoutRank / statistics.totalCustomers) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Tổng số hạng"
          value={statistics.totalRanks}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />

        <StatCard
          icon={<Users className="h-6 w-6" />}
          title="Tổng khách hàng"
          value={statistics.totalCustomers}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />

        <StatCard
          icon={<Award className="h-6 w-6" />}
          title="Khách chưa có hạng"
          value={statistics.customersWithoutRank}
          subtitle={`${unrankedPercentage}% tổng khách`}
          gradient="bg-gradient-to-r from-amber-500 to-amber-600"
        />

        <StatCard
          icon={<Star className="h-6 w-6" />}
          title="Hạng phổ biến nhất"
          value={statistics.mostPopularRank?.displayName || "—"}
          subtitle={
            statistics.mostPopularRank
              ? `${statistics.mostPopularRank.customerCount} khách hàng`
              : "Chưa có dữ liệu"
          }
          gradient="bg-gradient-to-r from-rose-500 to-rose-600"
        />
      </div>

      {/* Rank Breakdown */}
      {statistics?.rankBreakdown && statistics.rankBreakdown.length > 0 ? (
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50">
            <CardTitle className="text-xl flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-lg shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Phân bố khách hàng theo hạng
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {statistics.rankBreakdown.map((breakdown, index) => {
                const percentage = statistics.totalCustomers > 0
                  ? (breakdown.customerCount / statistics.totalCustomers) * 100
                  : 0;
                
                const colors = [
                  { bg: "from-cyan-500", text: "text-cyan-600", bgLight: "bg-cyan-100" },
                  { bg: "from-indigo-500", text: "text-indigo-600", bgLight: "bg-indigo-100" },
                  { bg: "from-blue-500", text: "text-blue-600", bgLight: "bg-blue-100" },
                  { bg: "from-purple-500", text: "text-purple-600", bgLight: "bg-purple-100" },
                  { bg: "from-pink-500", text: "text-pink-600", bgLight: "bg-pink-100" },
                ];
                
                const colorPair = colors[index % colors.length];

                return (
                  <div
                    key={breakdown.rankId}
                    className={`group p-4 rounded-lg border-2 ${colorPair.bgLight} hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-slate-50`}
                    style={{
                      borderColor: `var(--color-${colorPair.text.split('-')[1]}-300)`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 bg-gradient-to-br ${colorPair.bg} to-opacity-10 rounded-lg shadow-md`}>
                          <Star className={`h-5 w-5 text-white`} />
                        </div>
                        <div className="flex-1">
                          <Badge variant="secondary" className={`mb-1 font-semibold text-sm ${colorPair.text}`}>
                            {breakdown.displayName}
                          </Badge>
                          <p className="text-xs text-slate-600 mt-1">
                            {formatSpending(breakdown.minSpending)} →{" "}
                            {breakdown.maxSpending
                              ? formatSpending(breakdown.maxSpending)
                              : "Không giới hạn"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-slate-900">
                          {breakdown.customerCount}
                        </p>
                        <p className={`text-sm font-semibold ${colorPair.text}`}>
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-full bg-gradient-to-r ${colorPair.bg} to-${colorPair.bg.split('-')[1]}-600 transition-all duration-500 ease-out shadow-lg`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-slate-600">Chưa có khách hàng nào được xếp hạng</p>
            <p className="text-sm text-slate-500 mt-2">Dữ liệu sẽ hiển thị khi khách hàng đạt ngưỡng chi tiêu</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
