"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSurchargePage } from "@/hooks/use-surcharge-page";
import { PageHeader } from "@/components/services/page-header";
import { NotificationBanner } from "@/components/services/notification-banner";
import { SurchargeTable } from "@/components/surcharges/surcharge-table";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

export default function SurchargesPage() {
  const {
    surcharges,
    statistics,
    notification,
    handleAddSurcharge,
    handleEditSurcharge,
    handleDeleteSurcharge,
    handleDismissNotification,
  } = useSurchargePage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Quản lý Phụ Thu"
        description="Quản lý các khoản phụ thu như check-in sớm, check-out muộn, người thêm, thú cưng..."
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
              Phụ thu đang hoạt động
            </CardTitle>
            {ICONS.SURCHARGE}
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
          Danh sách Phụ Thu
        </h2>
        <Button onClick={handleAddSurcharge}>
          {ICONS.PLUS}
          <span className="ml-2">Thêm Phụ Thu</span>
        </Button>
      </div>

      {/* Surcharge Table */}
      <SurchargeTable
        surcharges={surcharges}
        onEdit={handleEditSurcharge}
        onDelete={handleDeleteSurcharge}
      />
    </div>
  );
}
