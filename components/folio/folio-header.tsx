"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Folio } from "@/lib/types/folio";

interface FolioHeaderProps {
  folio: Folio;
}

export function FolioHeader({ folio }: FolioHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Folio #{folio.folioID}
              </h1>
              <Badge
                variant={folio.status === "OPEN" ? "default" : "secondary"}
                className={
                  folio.status === "OPEN"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {folio.status === "OPEN" ? "🟢 Đang mở" : "⚫ Đã đóng"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Tạo lúc: {formatDate(folio.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Khách hàng</p>
            <p className="font-semibold text-gray-900">{folio.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phòng</p>
            <p className="font-semibold text-gray-900">
              {folio.roomName} ({folio.roomTypeName})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngày nhận</p>
            <p className="font-semibold text-gray-900">
              {formatDate(folio.checkInDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngày trả</p>
            <p className="font-semibold text-gray-900">
              {folio.checkOutDate
                ? formatDate(folio.checkOutDate)
                : "Chưa xác định"}
            </p>
          </div>
        </div>

        {folio.reservationID && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Mã đặt phòng:{" "}
              <span className="font-mono text-gray-900">
                {folio.reservationID}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
