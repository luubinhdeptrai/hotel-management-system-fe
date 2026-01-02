/**
 * Activity Detail Modal Component
 * Displays full activity details including metadata and relations
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import { ActivityType, type Activity } from "@/lib/types/activity";

interface ActivityDetailModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVITY_CONFIG: Record<ActivityType, { label: string; color: string }> = {
  [ActivityType.CREATE_BOOKING]: { label: "Tạo Booking", color: "primary" },
  [ActivityType.UPDATE_BOOKING]: { label: "Cập Nhật Booking", color: "blue" },
  [ActivityType.CHECKED_IN]: { label: "Check-In", color: "success" },
  [ActivityType.CHECKED_OUT]: { label: "Check-Out", color: "warning" },
  [ActivityType.CREATE_SERVICE_USAGE]: { label: "Tạo Dịch Vụ", color: "purple" },
  [ActivityType.UPDATE_SERVICE_USAGE]: { label: "Cập Nhật Dịch Vụ", color: "purple" },
  [ActivityType.CREATE_TRANSACTION]: { label: "Tạo Thanh Toán", color: "emerald" },
  [ActivityType.UPDATE_TRANSACTION]: { label: "Cập Nhật Thanh Toán", color: "emerald" },
  [ActivityType.CREATE_CUSTOMER]: { label: "Tạo Khách Hàng", color: "pink" },
  [ActivityType.CREATE_PROMOTION]: { label: "Tạo Khuyến Mại", color: "amber" },
  [ActivityType.UPDATE_PROMOTION]: { label: "Cập Nhật Khuyến Mại", color: "amber" },
  [ActivityType.CLAIM_PROMOTION]: { label: "Nhận Khuyến Mại", color: "rose" },
  [ActivityType.CREATE_BOOKING_ROOM]: { label: "Tạo Phòng Booking", color: "indigo" },
  [ActivityType.UPDATE_BOOKING_ROOM]: { label: "Cập Nhật Phòng Booking", color: "indigo" },
  [ActivityType.UPDATE_CUSTOMER]: { label: "Cập Nhật Khách Hàng", color: "pink" },
};

export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
}: ActivityDetailModalProps) {
  if (!activity) return null;

  const config = ACTIVITY_CONFIG[activity.type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-linear-to-br from-${config.color}-100 to-${config.color}-50`}>
              <span className="w-6 h-6 text-${config.color}-600">{ICONS.ACTIVITY}</span>
            </div>
            <span>Chi Tiết Hoạt Động</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Activity Type & Time */}
          <div className="p-6 bg-linear-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Badge
                variant="secondary"
                className={`bg-${config.color}-100 text-${config.color}-700 font-semibold text-base px-4 py-2`}
              >
                {config.label}
              </Badge>
              <span className="text-sm text-gray-600">
                {new Date(activity.createdAt).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
            <p className="text-gray-900 font-medium text-lg">{activity.description}</p>
          </div>

          {/* Employee Info */}
          {activity.employee && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 text-primary-600">{ICONS.USER}</span>
                Nhân Viên Thực Hiện
              </h3>
              <div className="p-4 bg-primary-50 rounded-lg border-l-4 border-primary-600">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Họ Tên</p>
                    <p className="text-gray-900 font-semibold">{activity.employee.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="text-gray-900 font-semibold">{activity.employee.email}</p>
                  </div>
                  {activity.employee.phoneNumber && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Số Điện Thoại</p>
                      <p className="text-gray-900 font-semibold">{activity.employee.phoneNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Chức Vụ</p>
                    <p className="text-gray-900 font-semibold">{activity.employee.role}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          {activity.customer && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 text-pink-600">{ICONS.USER}</span>
                Khách Hàng Liên Quan
              </h3>
              <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-600">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Họ Tên</p>
                    <p className="text-gray-900 font-semibold">{activity.customer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="text-gray-900 font-semibold">{activity.customer.email}</p>
                  </div>
                  {activity.customer.phoneNumber && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Số Điện Thoại</p>
                      <p className="text-gray-900 font-semibold">{activity.customer.phoneNumber}</p>
                    </div>
                  )}
                  {activity.customer.CCCD && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">CCCD</p>
                      <p className="text-gray-900 font-semibold">{activity.customer.CCCD}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Booking Room Info */}
          {activity.bookingRoom && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 text-blue-600">{ICONS.ROOM}</span>
                Phòng Booking
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">ID Booking Room</p>
                    <p className="text-gray-900 font-semibold">#{activity.bookingRoom.id}</p>
                  </div>
                  {activity.bookingRoom.bookingId && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ID Booking</p>
                      <p className="text-gray-900 font-semibold">#{activity.bookingRoom.bookingId}</p>
                    </div>
                  )}
                  {activity.bookingRoom.roomId && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ID Phòng</p>
                      <p className="text-gray-900 font-semibold">#{activity.bookingRoom.roomId}</p>
                    </div>
                  )}
                  {activity.bookingRoom.status && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Trạng Thái</p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold">
                        {activity.bookingRoom.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Service Usage Info */}
          {activity.serviceUsage && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 text-purple-600">{ICONS.SERVICE}</span>
                Dịch Vụ
              </h3>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">ID Dịch Vụ</p>
                    <p className="text-gray-900 font-semibold">#{activity.serviceUsage.id}</p>
                  </div>
                  {activity.serviceUsage.serviceId && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ID Service</p>
                      <p className="text-gray-900 font-semibold">#{activity.serviceUsage.serviceId}</p>
                    </div>
                  )}
                  {activity.serviceUsage.quantity && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Số Lượng</p>
                      <p className="text-gray-900 font-semibold">{activity.serviceUsage.quantity}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 text-gray-600">{ICONS.INFO}</span>
                Metadata
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <pre className="text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap font-mono">
                  {JSON.stringify(activity.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 text-gray-600">{ICONS.CALENDAR}</span>
              Thông Tin Hệ Thống
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">ID Hoạt Động</p>
                  <p className="text-gray-900 font-mono text-sm">{activity.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ngày Tạo</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(activity.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Cập Nhật Lần Cuối</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(activity.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={onClose}
            className="bg-linear-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold shadow-lg"
          >
            Đóng
            <span className="w-4 h-4 ml-2">{ICONS.X}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
