"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { useRoomReports } from "@/hooks/use-room-reports";
import {
  Calendar,
  Hotel,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { 
  Line, 
  LineChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart 
} from "recharts";

const COLORS = {
  available: "#10b981",
  occupied: "#3b82f6",
  reserved: "#f59e0b",
  occupancyRate: "#8b5cf6",
};

export function RoomReports() {
  const today = new Date();
  const [forecastRange, setForecastRange] = useState({
    from: today,
    to: addDays(today, 30),
  });
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const {
    occupancyForecast,
    loading,
    error,
  } = useRoomReports({
    startDate: forecastRange.from ? format(forecastRange.from, "yyyy-MM-dd") : "",
    endDate: forecastRange.to ? format(forecastRange.to, "yyyy-MM-dd") : "",
    groupBy,
  });

  const formatPercent = (value: number | undefined) => value !== undefined ? `${value.toFixed(1)}%` : "0%";

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card className="border-2 border-dashed border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Dự Báo Công Suất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Từ Ngày</label>
              <Input
                type="date"
                value={forecastRange.from ? format(forecastRange.from, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setForecastRange({ ...forecastRange, from: new Date(e.target.value) });
                  }
                }}
                className="w-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Đến Ngày</label>
              <Input
                type="date"
                value={forecastRange.to ? format(forecastRange.to, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setForecastRange({ ...forecastRange, to: new Date(e.target.value) });
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setForecastRange({ from: today, to: addDays(today, 30) })}
            >
              30 Ngày Tới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {occupancyForecast?.totalRooms ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Số Phòng</CardTitle>
                <Hotel className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {occupancyForecast?.totalRooms || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Phòng có sẵn trong hệ thống
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Công Suất TB</CardTitle>
                <TrendingUp className="h-5 w-5 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-600">
                  {formatPercent(occupancyForecast?.averageOccupancyRate)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tỷ lệ lấp đầy trung bình
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Phòng Đã Đặt TB</CardTitle>
                <BarChart3 className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {(occupancyForecast?.averageOccupiedRooms || 0).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Số phòng trung bình/ngày
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Occupancy Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Dự Báo Công Suất Phòng
              </CardTitle>
              <CardDescription>
                Biểu đồ dự báo tình trạng phòng trong {occupancyForecast?.forecast?.length || 0} {groupBy === "day" ? "ngày" : groupBy === "week" ? "tuần" : "tháng"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={occupancyForecast?.forecast || []}>
                  <defs>
                    <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.occupied} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.occupied} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.available} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.available} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="occupiedRooms" 
                    stroke={COLORS.occupied} 
                    fillOpacity={1} 
                    fill="url(#colorOccupied)"
                    name="Phòng Đã Đặt"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="availableRooms" 
                    stroke={COLORS.available} 
                    fillOpacity={1} 
                    fill="url(#colorAvailable)"
                    name="Phòng Trống"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occupancy Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-500" />
                Xu Hướng Tỷ Lệ Lấp Đầy
              </CardTitle>
              <CardDescription>
                Theo dõi xu hướng tỷ lệ lấp đầy phòng theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occupancyForecast?.forecast || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number | undefined) => [value ? `${value.toFixed(2)}%` : "0%", "Tỷ Lệ"]}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="occupancyRate" 
                    stroke={COLORS.occupancyRate} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.occupancyRate, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Tỷ Lệ Lấp Đầy (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu dự báo phòng...</p>
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
              <p className="text-sm">Vui lòng chọn khoảng thời gian để xem dự báo</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
