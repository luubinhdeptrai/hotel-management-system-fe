"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useServiceReports } from "@/hooks/use-service-reports";
import { 
  Package, 
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { 
  BarChart, 
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const COLORS = {
  completed: "#10b981",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

const PIE_COLORS = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#14b8a6"];

export function ServiceReports() {
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const {
    usageStatistics,
    topServices,
    serviceTrend,
    loading,
    error,
  } = useServiceReports({
    fromDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "",
    toDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "",
    groupBy,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-pink-500" />
            Bộ Lọc Thời Gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Từ Ngày</label>
              <Input
                type="date"
                value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setDateRange({ ...dateRange, from: new Date(e.target.value) });
                  }
                }}
                className="w-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Đến Ngày</label>
              <Input
                type="date"
                value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setDateRange({ ...dateRange, to: new Date(e.target.value) });
                  }
                }}
                className="w-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nhóm Theo</label>
              <Select value={groupBy} onValueChange={(value: "day" | "week" | "month") => setGroupBy(value)}>
                <SelectTrigger className="w-45">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="month">Tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({ from: subDays(today, 7), to: today })}
              >
                7 Ngày
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({ from: subDays(today, 30), to: today })}
              >
                30 Ngày
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({ from: startOfMonth(today), to: endOfMonth(today) })}
              >
                Tháng Này
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu dịch vụ...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-3 text-red-600">
              <p className="font-semibold">⚠️ Lỗi tải dữ liệu</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          {usageStatistics?.summary && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-l-4 border-l-pink-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng Lượt Sử Dụng</CardTitle>
                  <Package className="h-5 w-5 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-600">
                    {usageStatistics.summary.totalServiceCount}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Số Dịch Vụ</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {usageStatistics.summary.totalServices}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doanh Thu Trung Bình</CardTitle>
                  <Clock className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(usageStatistics.summary.averageRevenuePerService || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
                  <XCircle className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(usageStatistics.summary.totalServiceRevenue || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Services by Revenue */}
          {topServices?.topServices && topServices.topServices.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-pink-500" />
                    Top Dịch Vụ Theo Doanh Thu
                  </CardTitle>
                  <CardDescription>
                    {topServices.topServices.length} dịch vụ hàng đầu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topServices.topServices.map((service, index) => (
                      <div key={service.serviceId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{service.serviceName}</div>
                            <div className="text-sm text-muted-foreground">
                              Sử dụng: {service.totalUsageCount} lần
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">
                            {formatCurrency(service.totalRevenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-pink-500" />
                    Biểu Đồ Doanh Thu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topServices.topServices.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="serviceName" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number | undefined) => value ? formatCurrency(value) : ''}
                      />
                      <Bar dataKey="totalRevenue" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Service Trend */}
          {serviceTrend?.trend && serviceTrend.trend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-pink-500" />
                  Xu Hướng Sử Dụng Dịch Vụ
                </CardTitle>
                <CardDescription>
                  Biểu đồ xu hướng sử dụng theo {groupBy === "day" ? "ngày" : groupBy === "week" ? "tuần" : "tháng"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={serviceTrend.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value: number | undefined, name: string | undefined) => {
                        if (!value) return '';
                        if (name === "revenue") return formatCurrency(value);
                        return value;
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="usageCount" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      name="Lượt sử dụng"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Doanh thu"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Usage Statistics Detail */}
          {usageStatistics?.services && usageStatistics.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-pink-500" />
                  Chi Tiết Thống Kê Dịch Vụ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-semibold">Dịch Vụ</th>
                          <th className="px-4 py-3 text-right font-semibold">Tổng</th>
                          <th className="px-4 py-3 text-right font-semibold">Hoàn Thành</th>
                          <th className="px-4 py-3 text-right font-semibold">Đang XL</th>
                          <th className="px-4 py-3 text-right font-semibold">Đã Hủy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageStatistics.services.map((service) => (
                          <tr key={service.serviceId} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{service.serviceName}</td>
                            <td className="px-4 py-3 text-right font-semibold">{service.totalUsageCount}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {service.statusBreakdown.COMPLETED}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {service.statusBreakdown.PENDING}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {service.statusBreakdown.CANCELLED}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
