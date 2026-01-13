"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useEmployeeReports } from "@/hooks/use-employee-reports";
import { 
  UserCheck, 
  Calendar,
  Activity,
  CheckCircle2,
  XCircle,
  Package,
  TrendingUp,
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
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
  primary: "#f97316",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  blue: "#3b82f6",
};

const PIE_COLORS = ["#f97316", "#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

export function EmployeeReports() {
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });

  const {
    bookingPerformance,
    servicePerformance,
    activitySummary,
    loading,
    error,
  } = useEmployeeReports({
    fromDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "",
    toDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "",
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
            <Calendar className="h-5 w-5 text-orange-500" />
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu nhân viên...</p>
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
          {/* Booking Performance */}
          {bookingPerformance?.employees && bookingPerformance.employees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-orange-500" />
                  Hiệu Suất Booking
                </CardTitle>
                <CardDescription>
                  Thống kê check-in, check-out và doanh thu theo nhân viên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-semibold">Nhân Viên</th>
                          <th className="px-4 py-3 text-right font-semibold">Check-in</th>
                          <th className="px-4 py-3 text-right font-semibold">Check-out</th>
                          <th className="px-4 py-3 text-right font-semibold">Hủy</th>
                          <th className="px-4 py-3 text-right font-semibold">Doanh Thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingPerformance.employees.map((emp) => (
                          <tr key={emp.employeeId} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{emp.name}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {emp.totalCheckIns}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {emp.totalCheckOuts}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {emp.totalTransactions}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-semibold">
                              {formatCurrency(emp.totalRevenueProcessed || 0)}
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

          {/* Service Performance */}
          {servicePerformance?.employees && servicePerformance.employees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  Hiệu Suất Dịch Vụ
                </CardTitle>
                <CardDescription>
                  Thống kê dịch vụ đã xử lý và doanh thu dịch vụ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-semibold">Nhân Viên</th>
                          <th className="px-4 py-3 text-right font-semibold">Hoàn Thành</th>
                          <th className="px-4 py-3 text-right font-semibold">Đang Xử Lý</th>
                          <th className="px-4 py-3 text-right font-semibold">Đã Hủy</th>
                          <th className="px-4 py-3 text-right font-semibold">Doanh Thu DV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {servicePerformance.employees.map((emp) => (
                          <tr key={emp.employeeId} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium">{emp.name}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {emp.totalServicesProvided}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {emp.totalServicesPaid}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {(emp.totalServicesProvided - emp.totalServicesPaid) || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-semibold">
                              {formatCurrency(emp.totalServiceRevenue || 0)}
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

          {/* Activity Summary */}
          {activitySummary?.activityTypeSummary && activitySummary.activityTypeSummary.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-500" />
                    Tổng Hợp Hoạt Động
                  </CardTitle>
                  <CardDescription>
                    Phân loại hoạt động theo loại
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activitySummary.activityTypeSummary.map((activity) => (
                      <div key={activity.type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{activity.type}</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-800">
                          {activity.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Biểu Đồ Hoạt Động
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={activitySummary.activityTypeSummary}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {activitySummary.activityTypeSummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
