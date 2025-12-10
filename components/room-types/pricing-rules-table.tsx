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
import type { PricingRule } from "@/lib/types/pricing";

interface PricingRulesTableProps {
  rules: PricingRule[];
}

export function PricingRulesTable({ rules }: PricingRulesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loại Phòng</TableHead>
            <TableHead className="text-right">Ngày thường</TableHead>
            <TableHead className="text-right">Cuối tuần</TableHead>
            <TableHead className="text-right">Ngày lễ</TableHead>
            <TableHead className="text-right">Hệ số mùa cao điểm</TableHead>
            <TableHead>Hiệu lực</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Chưa có quy tắc định giá nào
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule) => (
              <TableRow key={rule.ruleID}>
                <TableCell className="font-medium">
                  {rule.roomTypeName}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-gray-600">
                    {formatCurrency(rule.weekdayRate)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-blue-600 font-medium">
                    {formatCurrency(rule.weekendRate)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-amber-600 font-medium">
                    {formatCurrency(rule.holidayRate)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">
                    ×{rule.highSeasonMultiplier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    From{" "}
                    {new Date(rule.effectiveFrom).toLocaleDateString("vi-VN")}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
