"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useRevenueReports } from "@/hooks/use-revenue-reports";
import { 
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  CreditCard,
  Tag,
} from "lucide-react";
import { 
  Line, 
  LineChart, 
  Bar, 
  BarChart, 
  Pie, 
  PieChart, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  teal: "#14b8a6",
  cyan: "#06b6d4",
};

const PIE_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", 
  "#10b981", "#14b8a6", "#06b6d4", "#ef4444"
];

export function RevenueReports() {
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const {
    revenueSummary,
    revenueByRoomType,
    paymentMethodDistribution,
    promotionEffectiveness,
    loading,
    error,
  } = useRevenueReports({
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

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" />
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

      {/* Summary Cards */}
      {revenueSummary?.summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(revenueSummary.summary.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Phòng: {formatCurrency(revenueSummary.summary.roomRevenue || 0)} |
                  Dịch vụ: {formatCurrency(revenueSummary.summary.serviceRevenue || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ Lệ Lấp Đầy</CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercent(revenueSummary.summary.occupancyRate)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {revenueSummary.summary.totalRoomNights} đêm phòng
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ADR (Giá TB/Đêm)</CardTitle>
                <BarChart3 className="h-5 w-5 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-600">
                  {formatCurrency(revenueSummary.summary.averageDailyRate)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average Daily Rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(revenueSummary.summary.revenuePerAvailableRoom)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Revenue Per Available Room
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Biểu Đồ Doanh Thu
              </CardTitle>
              <CardDescription>
                Xu hướng doanh thu theo {groupBy === "day" ? "ngày" : groupBy === "week" ? "tuần" : "tháng"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueSummary.breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [formatCurrency(value), "Doanh Thu"]}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.success} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.success, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Doanh Thu"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              {loading ? "Đang tải dữ liệu..." : error ? `Lỗi: ${error}` : "Không có dữ liệu"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Room Type & Payment Methods */}
      {revenueByRoomType?.roomTypes && paymentMethodDistribution?.distribution && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue by Room Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Doanh Thu Theo Loại Phòng
              </CardTitle>
              <CardDescription>
                Top {revenueByRoomType?.roomTypes?.length || 0} loại phòng có doanh thu cao nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByRoomType?.roomTypes?.slice(0, 8) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="roomTypeName" 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [formatCurrency(value), "Doanh Thu"]}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="totalRevenue" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Method Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-500" />
                Phân Bố Phương Thức Thanh Toán
              </CardTitle>
              <CardDescription>
                Tỷ lệ sử dụng các phương thức thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={(paymentMethodDistribution?.distribution as any) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={(_e: any) => `${_e.method}: ${_e.percentageByAmount.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="totalAmount"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {paymentMethodDistribution?.distribution?.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | undefined) => [value ? formatCurrency(value) : "0 ₫", "Tổng Tiền"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promotion Effectiveness */}
      {promotionEffectiveness?.promotions && promotionEffectiveness.promotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-pink-500" />
              Hiệu Quả Khuyến Mãi
            </CardTitle>
            <CardDescription>
              Phân tích ROI và hiệu quả của các chương trình khuyến mãi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-semibold">Mã KM</th>
                      <th className="px-4 py-3 text-left font-semibold">Mô Tả</th>
                      <th className="px-4 py-3 text-right font-semibold">Lượt Dùng</th>
                      <th className="px-4 py-3 text-right font-semibold">Giảm Giá</th>
                      <th className="px-4 py-3 text-right font-semibold">Doanh Thu</th>
                      <th className="px-4 py-3 text-right font-semibold">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotionEffectiveness?.promotions?.map((promo) => (
                      <tr key={promo.promotionId} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">
                          {promo.promotionCode}
                        </td>
                        <td className="px-4 py-3">{promo.description || "N/A"}</td>
                        <td className="px-4 py-3 text-right">{promo.timesUsed}</td>
                        <td className="px-4 py-3 text-right text-orange-600 font-medium">
                          {formatCurrency(promo.totalDiscountGiven)}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                          {formatCurrency(promo.totalRevenueInfluenced)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={
                            "font-bold " + (promo.roi >= 2 ? "text-emerald-600" :
                            promo.roi >= 1 ? "text-blue-600" : "text-orange-600")
                          }>
                            {promo.roi.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng Giảm Giá</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(promotionEffectiveness?.summary?.totalDiscountGiven || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doanh Thu Tạo Ra</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(promotionEffectiveness?.summary?.totalRevenueInfluenced || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROI Trung Bình</p>
                  <p className="text-lg font-bold text-blue-600">
                    {(promotionEffectiveness?.summary?.overallROI || 0).toFixed(2)}x
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading & Error States */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu báo cáo...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-3 text-red-600">
              <p className="font-semibold">⚠️ Lỗi tải dữ liệu</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
