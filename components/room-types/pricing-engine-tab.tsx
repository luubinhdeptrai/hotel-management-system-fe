"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight } from "lucide-react";
import { ICONS } from "@/src/constants/icons.enum";
import type { RoomType } from "@/lib/types/room";
import type { PricingRule } from "@/lib/types/pricing";
import { usePricingRules } from "@/hooks/use-pricing-rules";
import { PricingRulesTable } from "./pricing-rules-table";
import { PricingRuleFormModal } from "./pricing-rule-form-modal";
import { formatCurrency } from "@/lib/utils";
import { formatAdjustment } from "@/lib/services/pricing-rule.service";

interface PricingEngineTabProps {
  roomTypes: RoomType[];
}

export function PricingEngineTab({ roomTypes }: PricingEngineTabProps) {
  const { rules, calendarEvents, stats, loading, createRule, updateRule, deleteRule, reorderRule, toggleActive } = usePricingRules();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  const handleAddNew = () => {
    setEditingRule(null);
    setModalOpen(true);
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setModalOpen(true);
  };

  const handleDelete = async (ruleId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa quy tắc này?")) {
      await deleteRule(ruleId);
    }
  };

  const handleToggleActive = async (ruleId: string, isActive: boolean) => {
    await toggleActive(ruleId, isActive);
  };

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100 border-2 border-violet-300 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-fuchsia-300/30 rounded-full blur-3xl"></div>
        <CardContent className="pt-8 pb-8 relative z-10">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
              <span className="text-white text-4xl">💎</span>
            </div>
            <div className="flex-1">
              <h3 className="font-black text-violet-900 mb-3 text-3xl tracking-tight">
                Dynamic Pricing Engine 🚀
              </h3>
              <p className="text-lg text-violet-800 leading-relaxed mb-5 font-medium">
                Hệ thống định giá động thông minh với <strong className="text-violet-900">LexoRank</strong> ordering,
                tích hợp <strong className="text-violet-900">Calendar Events</strong>, và hỗ trợ{" "}
                <strong className="text-violet-900">RRule patterns</strong> (RFC 5545). 
                Quy tắc có thứ tự cao hơn được áp dụng trước theo chiến lược{" "}
                <strong className="text-fuchsia-700">&quot;Top of List Wins&quot;</strong>.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2 text-sm font-bold shadow-lg">
                  ⚡ Real-time Calculation
                </Badge>
                <Badge className="bg-white/90 backdrop-blur-sm text-violet-900 px-5 py-2 text-sm font-bold border-2 border-violet-400 shadow-lg">
                  🎯 Drag & Drop Priority
                </Badge>
                <Badge className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-5 py-2 text-sm font-bold shadow-lg">
                  📅 Calendar Integration
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Rules */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-300/40 to-cyan-300/40 rounded-full blur-2xl"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                  Tổng quy tắc
                </span>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
              <p className="text-5xl font-black text-gray-900 mb-1">{stats.total}</p>
              <p className="text-sm text-gray-600 font-semibold">
                {stats.active} hoạt động · {stats.inactive} tạm dừng
              </p>
            </CardContent>
          </Card>

          {/* Adjustment Types */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-300/40 to-orange-300/40 rounded-full blur-2xl"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                  Loại điều chỉnh
                </span>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <div className="flex gap-3 items-end">
                <div>
                  <p className="text-4xl font-black text-amber-600">{stats.byType.percentage}</p>
                  <p className="text-xs text-gray-600 font-bold">Phần trăm</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div>
                  <p className="text-4xl font-black text-orange-600">{stats.byType.fixedAmount}</p>
                  <p className="text-xs text-gray-600 font-bold">Cố định</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-semibold mt-2">
                TB: {formatAdjustment(stats.avgAdjustment.percentage, "PERCENTAGE")}
              </p>
            </CardContent>
          </Card>

          {/* Time Matching Methods */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-2xl"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                  Phương thức thời gian
                </span>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">⏰</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1.5 shadow-sm">
                  📅 Events: {stats.byTimeMethod.calendar}
                </Badge>
                <Badge className="bg-pink-100 text-pink-800 text-xs font-bold px-3 py-1.5 shadow-sm">
                  📆 Range: {stats.byTimeMethod.dateRange}
                </Badge>
                <Badge className="bg-violet-100 text-violet-800 text-xs font-bold px-3 py-1.5 shadow-sm">
                  🔄 RRule: {stats.byTimeMethod.recurrence}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Events Available */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-300/40 to-teal-300/40 rounded-full blur-2xl"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                  Sự kiện khả dụng
                </span>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
              <p className="text-5xl font-black text-emerald-600 mb-1">{calendarEvents.length}</p>
              <p className="text-sm text-gray-600 font-semibold">
                {stats.byTimeMethod.calendar} được sử dụng
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Events Link */}
        <Link href="/calendar-events" className="block">
          <Card className="h-full relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl hover:border-blue-400 transition-all transform hover:-translate-y-1 cursor-pointer shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black text-blue-900 mb-2">📅 Calendar Events</h3>
                  <p className="text-blue-700 text-sm font-semibold mb-6">
                    Quản lý các sự kiện đặc biệt (Tết, Hè, Concert...) để áp dụng giá động
                  </p>
                </div>
                <div className="text-4xl">🎉</div>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                <span>Chuyển đến Calendar Events</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Info Card */}
        <Card className="relative overflow-hidden border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-100 shadow-lg">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-300/20 rounded-full blur-3xl"></div>
          <CardContent className="p-8 relative z-10">
            <h3 className="text-2xl font-black text-teal-900 mb-4">🔗 Mối quan hệ</h3>
            <ul className="space-y-3 text-teal-700 font-semibold text-sm">
              <li className="flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span>Calendar Events định nghĩa các khoảng thời gian đặc biệt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span>Pricing Rules tham chiếu Calendar Events để áp dụng giá</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span>Một sự kiện có thể liên kết với nhiều Pricing Rules</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Rules Section */}
      <Card className="border-2 shadow-2xl bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-b-2 border-violet-200 pb-6">
          <div>
            <CardTitle className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
              <span className="text-violet-600">🎯</span>
              Quy tắc định giá động
            </CardTitle>
            <p className="text-base text-gray-600 font-semibold">
              Quản lý các quy tắc định giá với drag-drop priority và time matching linh hoạt
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleAddNew}
            disabled={loading}
            className="h-14 px-8 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 shadow-xl hover:shadow-2xl font-black text-base hover:scale-105 transition-all"
          >
            <span className="text-xl mr-2">✨</span>
            Thêm quy tắc mới
          </Button>
        </CardHeader>
        <CardContent className="pt-8">
          {loading && rules.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có quy tắc định giá</h3>
              <p className="text-gray-600 mb-6">Tạo quy tắc đầu tiên để bắt đầu định giá động</p>
              <Button onClick={handleAddNew} className="bg-gradient-to-r from-violet-600 to-purple-600">
                <span className="mr-2">✨</span>
                Thêm quy tắc đầu tiên
              </Button>
            </div>
          ) : (
            <PricingRulesTable
              rules={rules}
              roomTypes={roomTypes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={reorderRule}
              onToggleActive={handleToggleActive}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="border-2 shadow-2xl bg-gradient-to-br from-white via-violet-50/30 to-purple-50/30">
        <CardHeader className="border-b-2 border-violet-200">
          <CardTitle className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <span className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💡</span>
            </span>
            Cách hoạt động của Dynamic Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Algorithm */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-black text-violet-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-violet-600 text-white rounded-lg flex items-center justify-center text-sm font-black">1</span>
                  Chiến lược &quotTop of List Wins&quot
                </h4>
                <p className="text-gray-700 leading-relaxed pl-10">
                  Quy tắc ở <strong className="text-violet-600">vị trí cao nhất</strong> (rank thấp) trong danh sách sẽ được ưu tiên áp dụng trước. 
                  Sử dụng <strong>LexoRank</strong> để drag-drop sắp xếp thứ tự dễ dàng.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-black text-purple-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-black">2</span>
                  Time Matching Methods
                </h4>
                <div className="pl-10 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-violet-600 font-bold">📅</span>
                    <div>
                      <p className="font-bold text-gray-900">Calendar Events</p>
                      <p className="text-sm text-gray-600">Link quy tắc với sự kiện có sẵn (Tết, lễ hội, sự kiện đặc biệt)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">📆</span>
                    <div>
                      <p className="font-bold text-gray-900">Date Range</p>
                      <p className="text-sm text-gray-600">Chỉ định khoảng thời gian cụ thể (startDate → endDate)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-fuchsia-600 font-bold">🔄</span>
                    <div>
                      <p className="font-bold text-gray-900">RRule Patterns (RFC 5545)</p>
                      <p className="text-sm text-gray-600">Quy tắc lặp lại (cuối tuần, ngày lễ hàng tuần/tháng/năm)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-black text-fuchsia-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-fuchsia-600 text-white rounded-lg flex items-center justify-center text-sm font-black">3</span>
                  Adjustment Types
                </h4>
                <div className="pl-10 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold text-lg">%</span>
                    <div>
                      <p className="font-bold text-gray-900">PERCENTAGE</p>
                      <p className="text-sm text-gray-600">Tăng/giảm theo phần trăm (+20%, -15%)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-lg">₫</span>
                    <div>
                      <p className="font-bold text-gray-900">FIXED_AMOUNT</p>
                      <p className="text-sm text-gray-600">Cộng/trừ số tiền cố định (+50,000 VND, -100,000 VND)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Example */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 border-2 border-violet-300 rounded-2xl p-6 shadow-xl">
                <h4 className="text-lg font-black text-violet-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧮</span>
                  Ví dụ tính giá
                </h4>
                
                <div className="space-y-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-violet-200">
                    <p className="text-sm text-gray-600 font-semibold mb-2">Giá gốc phòng Deluxe</p>
                    <p className="text-3xl font-black text-gray-900">{formatCurrency(1000000)}/đêm</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                      <span className="font-bold text-gray-900">Quy tắc &quot;Cuối tuần&quot; (PERCENTAGE +40%)</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-emerald-200">
                      <p className="text-2xl font-black text-emerald-600">{formatCurrency(1400000)}</p>
                      <p className="text-xs text-gray-600 mt-1">1,000,000 + (1,000,000 × 40%) = 1,400,000</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                      <span className="font-bold text-gray-900">Quy tắc &quot;Tết 2025&quot; (FIXED_AMOUNT +500,000)</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
                      <p className="text-2xl font-black text-amber-600">{formatCurrency(1500000)}</p>
                      <p className="text-xs text-gray-600 mt-1">1,000,000 + 500,000 = 1,500,000</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💎</span>
                  <div className="space-y-2">
                    <p className="font-black text-blue-900 text-base">Lợi ích Dynamic Pricing:</p>
                    <ul className="text-sm text-blue-800 space-y-1.5 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Tối ưu doanh thu:</strong> Giá cao trong peak season, thấp off-season</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Linh hoạt:</strong> Dễ dàng tạo promotion, discount cho sự kiện</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Tự động:</strong> Áp dụng rules tự động, không cần can thiệp thủ công</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Audit trail:</strong> Lưu snapshot rule đã apply vào BookingRoom</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <PricingRuleFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        rule={editingRule}
        roomTypes={roomTypes}
        calendarEvents={calendarEvents}
        onSave={async (data) => {
          if (editingRule) {
            await updateRule(editingRule.id, data as any);
          } else {
            await createRule(data as any);
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
}
