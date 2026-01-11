"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RankBadge } from "@/components/customer-ranks/rank-badge";
import type { CustomerRecord } from "@/lib/types/customer";
import type { CustomerRank } from "@/lib/types/customer-rank";
import { formatSpending, parseBenefits } from "@/lib/types/customer-rank";
import { ICONS } from "@/src/constants/icons.enum";

interface VIPInfoTabProps {
  customer: CustomerRecord;
  allRanks: CustomerRank[];
}

export function VIPInfoTab({ customer, allRanks }: VIPInfoTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate next rank from Backend data
  const getNextRankInfo = () => {
    if (!customer.rank) {
      // No current rank - find first rank
      const sortedRanks = [...allRanks].sort(
        (a, b) => Number(a.minSpending) - Number(b.minSpending)
      );
      const firstRank = sortedRanks[0];
      
      if (!firstRank) {
        return { nextRank: null, amountToNext: 0, progress: 0 };
      }
      
      const minSpending = Number(firstRank.minSpending);
      const progress = minSpending > 0 ? Math.min((customer.totalSpent / minSpending) * 100, 100) : 0;
      
      return {
        nextRank: firstRank,
        amountToNext: Math.max(minSpending - customer.totalSpent, 0),
        progress
      };
    }

    // Find next higher rank
    const currentMin = Number(customer.rank.minSpending);
    const nextRank = allRanks
      .filter(r => Number(r.minSpending) > currentMin)
      .sort((a, b) => Number(a.minSpending) - Number(b.minSpending))[0];

    if (!nextRank) {
      // Already at highest tier
      return { nextRank: null, amountToNext: 0, progress: 100 };
    }

    // Calculate progress
    const currentSpent = customer.totalSpent;
    const nextMin = Number(nextRank.minSpending);
    const currentMax = customer.rank.maxSpending 
      ? Number(customer.rank.maxSpending) 
      : nextMin;
    
    const range = nextMin - currentMin;
    const progressAmount = currentSpent - currentMin;
    const progress = range > 0 ? Math.min((progressAmount / range) * 100, 100) : 0;
    const amountToNext = Math.max(nextMin - currentSpent, 0);

    return { nextRank, amountToNext, progress };
  };

  const { nextRank, amountToNext, progress } = getNextRankInfo();
  const benefits = customer.rank ? parseBenefits(customer.rank.benefits) : {};

  return (
    <div className="space-y-6">
      {/* Current Rank Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-purple-50 border-2">
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
              <RankBadge rank={customer.rank} size="lg" />
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

          {/* Progress to Next Rank */}
          {nextRank && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Tiến độ lên hạng {nextRank.displayName}
                </p>
                <p className="text-sm text-gray-600">
                  {progress.toFixed(0)}%
                </p>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-gray-500 mt-2">
                Chi tiêu thêm {formatCurrency(amountToNext)} để lên hạng
              </p>
            </div>
          )}

          {!nextRank && customer.rank && (
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
      {customer.rank && Object.keys(benefits).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              Quyền lợi thành viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(benefits).map(([key, value]) => {
                if (key === 'description') return null;
                return (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">
                      {typeof value === 'boolean' && value ? key : `${key}: ${value}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Rank Details */}
      {customer.rank && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {ICONS.INFO}
              Chi tiết hạng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngưỡng tối thiểu:</span>
                <span className="font-medium">
                  {formatSpending(customer.rank.minSpending)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngưỡng tối đa:</span>
                <span className="font-medium">
                  {customer.rank.maxSpending 
                    ? formatSpending(customer.rank.maxSpending)
                    : "Không giới hạn"}
                </span>
              </div>
              {customer.rank.description && (
                <div className="pt-2 border-t">
                  <p className="text-gray-600">{customer.rank.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
