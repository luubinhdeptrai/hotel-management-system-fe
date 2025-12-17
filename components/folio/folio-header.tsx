"use client";

import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
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
    <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-linear-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-md">
            <span className="inline-flex items-center justify-center w-7 h-7 text-white">{ICONS.RECEIPT}</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900">
                Folio #{folio.folioID}
              </h1>
              <Badge
                className={
                  folio.status === "OPEN"
                    ? "inline-flex items-center gap-2 bg-success-100 text-success-800 border-success-300 px-3 py-1.5 font-semibold"
                    : "inline-flex items-center gap-2 bg-gray-100 text-gray-800 border-gray-300 px-3 py-1.5 font-semibold"
                }
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                  {folio.status === "OPEN" ? ICONS.CHECK_CIRCLE : ICONS.X_CIRCLE}
                </span>
                {folio.status === "OPEN" ? "Đang mở" : "Đã đóng"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.CALENDAR}</span>
              Tạo lúc: {formatDate(folio.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-3 h-3">{ICONS.USER}</span>
            Khách hàng
          </p>
          <p className="font-bold text-gray-900">{folio.customerName}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-3 h-3">{ICONS.DOOR_OPEN}</span>
            Phòng
          </p>
          <p className="font-bold text-gray-900">
            {folio.roomName} <span className="text-xs text-gray-500">({folio.roomTypeName})</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-3 h-3">{ICONS.CALENDAR_CHECK}</span>
            Ngày nhận
          </p>
          <p className="font-bold text-gray-900">
            {formatDate(folio.checkInDate)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-3 h-3">{ICONS.CALENDAR_DAYS}</span>
            Ngày trả
          </p>
          <p className="font-bold text-gray-900">
            {folio.checkOutDate
              ? formatDate(folio.checkOutDate)
              : "Chưa xác định"}
          </p>
        </div>
      </div>

      {folio.reservationID && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.CLIPBOARD_LIST}</span>
            Mã đặt phòng:{" "}
            <span className="font-mono font-semibold text-primary-700 bg-primary-100 px-2 py-0.5 rounded">
              {folio.reservationID}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
