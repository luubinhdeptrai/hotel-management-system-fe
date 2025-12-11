"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePenaltyPage } from "@/hooks/use-penalty-page";
import { PageHeader } from "@/components/services/page-header";
import { NotificationBanner } from "@/components/services/notification-banner";
import { PenaltyTable } from "@/components/penalties/penalty-table";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

export default function PenaltiesPage() {
  const {
    penalties,
    statistics,
    notification,
    handleAddPenalty,
    handleEditPenalty,
    handleDeletePenalty,
    handleDismissNotification,
  } = usePenaltyPage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Quản lý Phí Phạt"
        description="Quản lý các khoản phí phạt như hư hỏng thiết bị, mất đồ, vi phạm quy định..."
      />

      {/* Notification */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onDismiss={handleDismissNotification}
        />
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Phí phạt đang hoạt động
            </CardTitle>
            {ICONS.PENALTY}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeCount}</div>
            <p className="text-xs text-muted-foreground">
              / {statistics.totalCount} tổng số
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Danh sách Phí Phạt
        </h2>
        <Button onClick={handleAddPenalty}>
          {ICONS.PLUS}
          <span className="ml-2">Thêm Phí Phạt</span>
        </Button>
      </div>

      {/* Penalty Table */}
      <PenaltyTable
        penalties={penalties}
        onEdit={handleEditPenalty}
        onDelete={handleDeletePenalty}
      />
    </div>
  );
}
