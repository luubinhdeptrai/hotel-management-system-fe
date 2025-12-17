"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import type { RoomType } from "@/lib/types/room";
import type { PricingPolicy, PricingPolicyFormData } from "@/lib/types/pricing";
import { mockPricingPolicies } from "@/lib/mock-pricing-policies";
import { PricingPoliciesTable } from "./pricing-policies-table";
import { PricingPolicyFormModal } from "./pricing-policy-form-modal";
import { formatCurrency } from "@/lib/utils";

interface PricingEngineTabProps {
  roomTypes: RoomType[];
}

export function PricingEngineTab({ roomTypes }: PricingEngineTabProps) {
  const [policies, setPolicies] = useState<PricingPolicy[]>(mockPricingPolicies);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PricingPolicy | null>(null);

  const handleAddNew = () => {
    setEditingPolicy(null);
    setModalOpen(true);
  };

  const handleEdit = (policy: PricingPolicy) => {
    setEditingPolicy(policy);
    setModalOpen(true);
  };

  const handleDelete = (policyId: string) => {
    setPolicies(policies.filter((p) => p.MaChinhSach !== policyId));
  };

  const handleSave = (data: PricingPolicyFormData) => {
    if (editingPolicy) {
      // Update existing
      setPolicies(
        policies.map((p) =>
          p.MaChinhSach === editingPolicy.MaChinhSach
            ? {
                ...editingPolicy,
                ...data,
                TenLoaiPhong: roomTypes.find((rt) => rt.roomTypeID === data.MaLoaiPhong)?.roomTypeName,
              }
            : p
        )
      );
    } else {
      // Create new
      const newPolicy: PricingPolicy = {
        MaChinhSach: `CS${String(policies.length + 1).padStart(3, "0")}`,
        ...data,
        TenLoaiPhong: roomTypes.find((rt) => rt.roomTypeID === data.MaLoaiPhong)?.roomTypeName,
      };
      setPolicies([...policies, newPolicy]);
    }
  };

  // Statistics
  const stats = {
    total: policies.length,
    byDateType: {
      weekday: policies.filter((p) => p.KieuNgay === "Ngày thường").length,
      weekend: policies.filter((p) => p.KieuNgay === "Cuối tuần").length,
      holiday: policies.filter((p) => p.KieuNgay === "Ngày lễ").length,
      all: policies.filter((p) => p.KieuNgay === "Tất cả").length,
    },
    avgMultiplier:
      policies.reduce((sum, p) => sum + p.HeSo, 0) / (policies.length || 1),
    highPriority: policies.filter((p) => p.MucUuTien >= 5).length,
  };

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <Card className="relative overflow-hidden bg-linear-to-br from-blue-50 via-primary-50 to-blue-100 border-2 border-blue-300 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
        <CardContent className="pt-8 pb-8 relative">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl">{ICONS.DOLLAR_SIGN}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-blue-900 mb-3 text-2xl">
                Pricing Engine - Động cơ định giá thông minh
              </h3>
              <p className="text-base text-blue-800 leading-relaxed mb-4">
                Hệ thống tự động điều chỉnh giá phòng dựa trên <strong>Kiểu ngày</strong> (Ngày thường/Cuối tuần/Ngày lễ),
                <strong> Hệ số nhân</strong>, và <strong>Mức ưu tiên</strong>. Chính sách có mức ưu tiên cao hơn sẽ được áp dụng trước.
              </p>
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-bold">
                  Tự động tính giá
                </Badge>
                <Badge className="bg-white/80 backdrop-blur-sm text-blue-900 px-4 py-2 text-sm font-bold border-2 border-blue-300">
                  Ưu tiên linh hoạt
                </Badge>
                <Badge className="bg-white/80 backdrop-blur-sm text-blue-900 px-4 py-2 text-sm font-bold border-2 border-blue-300">
                  Dễ quản lý
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200/30 rounded-full blur-2xl"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Tổng chính sách
              </span>
              <div className="w-10 h-10 bg-linear-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <span className="w-5 h-5 text-primary-600">{ICONS.CALENDAR}</span>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1 font-semibold">chính sách đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-warning-200/30 rounded-full blur-2xl"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Hệ số TB
              </span>
              <div className="w-10 h-10 bg-linear-to-br from-warning-100 to-warning-200 rounded-lg flex items-center justify-center">
                <span className="w-5 h-5 text-warning-600">{ICONS.TRENDING_UP}</span>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900">
              ×{stats.avgMultiplier.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1 font-semibold">hệ số trung bình</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-error-200/30 rounded-full blur-2xl"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Ưu tiên cao
              </span>
              <div className="w-10 h-10 bg-linear-to-br from-error-100 to-error-200 rounded-lg flex items-center justify-center">
                <span className="w-5 h-5 text-error-600">{ICONS.ALERT}</span>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900">{stats.highPriority}</p>
            <p className="text-sm text-gray-600 mt-1 font-semibold">chính sách mức ≥5</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                Phân loại
              </span>
              <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <span className="w-5 h-5 text-blue-600">{ICONS.FILTER}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1">
                T: {stats.byDateType.weekday}
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1">
                CT: {stats.byDateType.weekend}
              </Badge>
              <Badge className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1">
                L: {stats.byDateType.holiday}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Policies Section */}
      <Card className="border-2 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between bg-linear-to-r from-gray-50 to-gray-100 border-b-2 pb-6">
          <div>
            <CardTitle className="text-3xl font-extrabold text-gray-900 mb-2">
              Chính sách định giá
            </CardTitle>
            <p className="text-base text-gray-600 font-medium">
              Quản lý các chính sách giá động theo kiểu ngày và hệ số
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleAddNew}
            className="h-14 px-8 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-lg hover:shadow-2xl font-extrabold text-base hover:scale-105 transition-all"
          >
            <span className="w-5 h-5 mr-3">{ICONS.PLUS}</span>
            Thêm chính sách mới
          </Button>
        </CardHeader>
        <CardContent className="pt-8">
          <PricingPoliciesTable
            policies={policies}
            basePrice={500000}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Price Calculation Example */}
      <Card className="border-2 shadow-xl bg-linear-to-br from-white to-gray-50">
        <CardHeader className="border-b-2">
          <CardTitle className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center shadow-md">
              <span className="w-6 h-6 text-success-600">{ICONS.INFO}</span>
            </span>
            Ví dụ tính giá tự động
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-6">
            <p className="text-base text-gray-700 leading-relaxed">
              Giả sử phòng <strong className="text-primary-600">Standard</strong> có giá gốc{" "}
              <strong className="text-primary-600">{formatCurrency(500000)}</strong>/đêm:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-2 rounded-xl p-6 bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                  <p className="text-gray-600 font-bold uppercase text-sm tracking-wide">
                    Ngày thường (Hệ số ×1.0)
                  </p>
                </div>
                <p className="text-4xl font-extrabold text-blue-600 mb-2">
                  {formatCurrency(500000)}
                </p>
                <p className="text-sm text-gray-600">Giá không thay đổi</p>
              </div>

              <div className="border-2 rounded-xl p-6 bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                  <p className="text-gray-600 font-bold uppercase text-sm tracking-wide">
                    Cuối tuần (Hệ số ×1.4)
                  </p>
                </div>
                <p className="text-4xl font-extrabold text-purple-600 mb-2">
                  {formatCurrency(700000)}
                </p>
                <p className="text-sm text-gray-600">Tăng 40% so với giá gốc</p>
              </div>

              <div className="border-2 rounded-xl p-6 bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 bg-amber-500 rounded-full"></span>
                  <p className="text-gray-600 font-bold uppercase text-sm tracking-wide">
                    Ngày lễ (Hệ số ×1.8)
                  </p>
                </div>
                <p className="text-4xl font-extrabold text-amber-600 mb-2">
                  {formatCurrency(900000)}
                </p>
                <p className="text-sm text-gray-600">Tăng 80% so với giá gốc</p>
              </div>
            </div>

            <div className="bg-linear-to-r from-blue-50 to-primary-50 border-2 border-blue-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                  <span className="w-6 h-6 text-white">{ICONS.INFO}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-base text-blue-900 font-bold">
                    Cách hoạt động của Pricing Engine:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Bước 1:</strong> Hệ thống xác định loại ngày (Ngày thường/Cuối tuần/Ngày lễ)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Bước 2:</strong> Tìm tất cả chính sách áp dụng cho loại phòng và ngày đó</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Bước 3:</strong> Chọn chính sách có <strong className="text-error-600">Mức ưu tiên cao nhất</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Bước 4:</strong> Áp dụng hệ số: <code className="bg-blue-100 px-2 py-1 rounded font-mono">Giá cuối = Giá gốc × Hệ số</code></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <PricingPolicyFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        policy={editingPolicy}
        roomTypes={roomTypes}
        onSave={handleSave}
      />
    </div>
  );
}
