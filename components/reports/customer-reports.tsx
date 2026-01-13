"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, TrendingUp, DollarSign } from "lucide-react";
import { useCustomerReports } from "@/hooks/use-customer-reports";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#14b8a6"];

export function CustomerReports() {
  const { lifetimeValue, rankDistribution, loading, error } = useCustomerReports();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {lifetimeValue?.totalCustomers ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-violet-500 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Khách Hàng</CardTitle>
                <Users className="h-5 w-5 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-600">
                  {lifetimeValue?.totalCustomers || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CLV Trung Bình</CardTitle>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {(lifetimeValue?.averageCLV || 0).toFixed(0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Khách Hàng</CardTitle>
                <Star className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {lifetimeValue?.topCustomersByValue?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Top Khách Hàng Có Giá Trị
              </CardTitle>
              <CardDescription>
                Danh sách khách hàng có giá trị lifetime cao nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-semibold">Tên</th>
                        <th className="px-4 py-3 text-left font-semibold">Hạng</th>
                        <th className="px-4 py-3 text-right font-semibold">Tổng Chi</th>
                        <th className="px-4 py-3 text-right font-semibold">Lượt Ở</th>
                        <th className="px-4 py-3 text-right font-semibold">TB/Lượt</th>
                        <th className="px-4 py-3 text-right font-semibold">CLV Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lifetimeValue?.topCustomersByValue?.slice(0, 10)?.map((customer) => (
                        <tr key={customer.customerId} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{customer.fullName}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                              {customer.rank?.name || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                            {formatCurrency(customer.totalSpent || 0)}
                          </td>
                          <td className="px-4 py-3 text-right">{customer.totalStays || 0}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(customer.averageSpendPerStay || 0)}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-600">
                            {(customer.clvScore || 0).toFixed(0)}
                          </td>
                        </tr>
                      )) || []}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu khách hàng...</p>
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
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-3 text-yellow-600">
              <p className="font-semibold">ℹ️ Không có dữ liệu</p>
              <p className="text-sm">Vui lòng chọn khoảng thời gian để xem dữ liệu</p>
            </div>
          </CardContent>
        </Card>
      )}
      {rankDistribution?.distribution && rankDistribution.distribution.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-violet-500" />
                Phân Bổ Hạng Khách Hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={(rankDistribution?.distribution as any) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={(e: any) => `${e.rankName}: ${(e.percentage || 0).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="customerCount"
                  >
                    {rankDistribution?.distribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                Doanh Thu Theo Hạng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <BarChart data={(rankDistribution?.distribution as any) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="rankName" stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number | undefined) => [value ? formatCurrency(value) : "0 ₫", "Doanh Thu"]} />
                  <Bar dataKey="totalRevenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu khách hàng...</p>
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
      ) : null}

      {/* Duplicate loading/error states - remove these */}
    </div>
  );
}
