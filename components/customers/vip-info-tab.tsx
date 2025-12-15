"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CustomerRecord } from "@/lib/types/customer";
import { VIP_TIER_LABELS, VIP_TIER_COLORS } from "@/lib/types/customer";
import { getNextTierProgress } from "@/lib/utils/vip-tier";
import { ICONS } from "@/src/constants/icons.enum";

interface VIPInfoTabProps {
  customer: CustomerRecord;
}

export function VIPInfoTab({ customer }: VIPInfoTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const tierProgress = getNextTierProgress(customer.totalSpent);

  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <Card className="bg-linear-to-br from-amber-50 to-purple-50 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            Hạng thành viên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Hạng hiện tại</p>
              <Badge
                className={`${
                  VIP_TIER_COLORS[customer.vipTier]
                } text-lg px-4 py-2`}
              >
                {VIP_TIER_LABELS[customer.vipTier]}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(customer.totalSpent)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {customer.totalBookings} lần đặt phòng
              </p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {tierProgress.nextTier && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Tiến độ lên hạng {VIP_TIER_LABELS[tierProgress.nextTier]}
                </p>
                <p className="text-sm text-gray-600">
                  {tierProgress.progressPercentage.toFixed(0)}%
                </p>
              </div>
              <Progress
                value={tierProgress.progressPercentage}
                className="h-3"
              />
              <p className="text-xs text-gray-500 mt-2">
                Chi tiêu thêm {formatCurrency(tierProgress.amountToNextTier)} để
                lên hạng
              </p>
            </div>
          )}

          {customer.vipTier === "PLATINUM" && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-purple-700">
                <span className="text-xl">🏆</span>
                <p className="text-sm font-medium">
                  Bạn đã đạt hạng thành viên cao nhất!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {ICONS.INFO}
            Quyền lợi thành viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customer.vipTier === "STANDARD" && (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Khách hàng thường</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Tích lũy điểm thưởng cho mỗi lần đặt phòng</li>
                  <li>• Nhận thông tin khuyến mãi qua email</li>
                </ul>
              </div>
            )}

            {customer.vipTier === "VIP" && (
              <div className="space-y-2">
                <p className="font-medium text-amber-700">VIP</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>✓ Giảm 10% cho tất cả các dịch vụ</li>
                  <li>✓ Late checkout miễn phí đến 14:00</li>
                  <li>✓ Minibar miễn phí</li>
                  <li>✓ Ưu tiên đặt phòng trong mùa cao điểm</li>
                </ul>
              </div>
            )}

            {customer.vipTier === "PLATINUM" && (
              <div className="space-y-2">
                <p className="font-medium text-purple-700">Platinum VIP</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>✓ Giảm 20% cho tất cả các dịch vụ</li>
                  <li>✓ Late checkout miễn phí đến 18:00</li>
                  <li>✓ Nâng hạng phòng miễn phí (tùy tình trạng)</li>
                  <li>✓ Minibar + Bữa sáng miễn phí</li>
                  <li>✓ Ưu tiên cao nhất và hỗ trợ 24/7</li>
                  <li>✓ Phòng chờ VIP tại sảnh</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Lần đặt gần nhất</p>
            <p className="font-semibold text-gray-900">
              {new Date(customer.lastVisit).toLocaleDateString("vi-VN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Thành viên từ</p>
            <p className="font-semibold text-gray-900">
              {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Chi tiêu TB/lần</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(
                customer.totalBookings > 0
                  ? customer.totalSpent / customer.totalBookings
                  : 0
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
