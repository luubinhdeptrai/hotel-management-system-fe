"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import type { ServiceUsage } from "@/lib/types/service-usage.types";
import {
  SERVICE_USAGE_STATUS_LABELS,
  SERVICE_USAGE_STATUS_COLORS,
  calculateBalance,
  canEditQuantity,
  canDelete,
  canCancel,
} from "@/lib/types/service-usage.types";

interface ServiceUsageTableProps {
  serviceUsages: ServiceUsage[];
  onEdit?: (usage: ServiceUsage) => void;
  onCancel?: (usageId: string) => void;
  onDelete?: (usage: ServiceUsage) => void;
  showActions?: boolean;
}

export function ServiceUsageTable({
  serviceUsages,
  onEdit,
  onCancel,
  onDelete,
  showActions = true,
}: ServiceUsageTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Dịch vụ</TableHead>
            <TableHead className="text-center font-semibold">SL</TableHead>
            <TableHead className="text-right font-semibold">Đơn giá</TableHead>
            <TableHead className="text-right font-semibold">Tổng tiền</TableHead>
            <TableHead className="text-right font-semibold">Đã trả</TableHead>
            <TableHead className="text-right font-semibold">Còn lại</TableHead>
            <TableHead className="text-center font-semibold">Trạng thái</TableHead>
            {showActions && <TableHead className="text-center font-semibold">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceUsages.map((usage) => {
            const balance = calculateBalance(usage);
            const canEdit = canEditQuantity(usage);
            const canDel = canDelete(usage);
            const canCancelUsage = canCancel(usage);

            return (
              <TableRow key={usage.id} className="hover:bg-gray-50">
                {/* Service Name */}
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {usage.service?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(usage.createdAt)}
                    </div>
                    {usage.note && (
                      <div className="text-xs text-gray-400 mt-1 italic">
                        {usage.note}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Quantity */}
                <TableCell className="text-center">
                  <span className="font-medium">
                    {usage.quantity} {usage.service?.unit || ""}
                  </span>
                </TableCell>

                {/* Unit Price */}
                <TableCell className="text-right">
                  {formatCurrency(usage.unitPrice)}
                </TableCell>

                {/* Total Price */}
                <TableCell className="text-right font-semibold">
                  {formatCurrency(usage.totalPrice)}
                </TableCell>

                {/* Total Paid */}
                <TableCell className="text-right text-green-600 font-medium">
                  {formatCurrency(usage.totalPaid)}
                </TableCell>

                {/* Balance */}
                <TableCell className="text-right font-semibold">
                  <span
                    className={balance > 0 ? "text-orange-600" : "text-gray-400"}
                  >
                    {formatCurrency(balance)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                  <Badge
                    className={SERVICE_USAGE_STATUS_COLORS[usage.status]}
                  >
                    {SERVICE_USAGE_STATUS_LABELS[usage.status]}
                  </Badge>
                </TableCell>

                {/* Actions */}
                {showActions && (
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {/* Edit Button */}
                      {onEdit && canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(usage)}
                          className="h-8 w-8 p-0"
                          title="Sửa số lượng"
                        >
                          <span className="w-4 h-4">{ICONS.EDIT}</span>
                        </Button>
                      )}

                      {/* Cancel Button */}
                      {onCancel && canCancelUsage && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc muốn hủy dịch vụ "${usage.service?.name}"?`
                              )
                            ) {
                              onCancel(usage.id);
                            }
                          }}
                          className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          title="Hủy dịch vụ"
                        >
                          <span className="w-4 h-4">{ICONS.X}</span>
                        </Button>
                      )}

                      {/* Delete Button */}
                      {onDelete && canDel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(usage)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Xóa dịch vụ"
                        >
                          <span className="w-4 h-4">{ICONS.TRASH}</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
