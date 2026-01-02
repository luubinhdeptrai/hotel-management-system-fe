/**
 * Activity List Component
 * Timeline-style display of activity logs with color-coded types
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import { ActivityType, type Activity } from "@/lib/types/activity";
import { ActivityDetailModal } from "@/components/activities/activity-detail-modal";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
}

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { label: string; color: string; icon: React.ReactNode; bgColor: string }
> = {
  [ActivityType.CREATE_BOOKING]: {
    label: "Tạo Booking",
    color: "primary",
    icon: ICONS.CALENDAR,
    bgColor: "bg-primary-100",
  },
  [ActivityType.UPDATE_BOOKING]: {
    label: "Cập Nhật Booking",
    color: "blue",
    icon: ICONS.EDIT,
    bgColor: "bg-blue-100",
  },
  [ActivityType.CHECKED_IN]: {
    label: "Check-In",
    color: "success",
    icon: ICONS.CHECK,
    bgColor: "bg-success-100",
  },
  [ActivityType.CHECKED_OUT]: {
    label: "Check-Out",
    color: "warning",
    icon: ICONS.CHECK,
    bgColor: "bg-warning-100",
  },
  [ActivityType.CREATE_SERVICE_USAGE]: {
    label: "Tạo Dịch Vụ",
    color: "purple",
    icon: ICONS.SERVICE,
    bgColor: "bg-purple-100",
  },
  [ActivityType.UPDATE_SERVICE_USAGE]: {
    label: "Cập Nhật Dịch Vụ",
    color: "purple",
    icon: ICONS.EDIT,
    bgColor: "bg-purple-100",
  },
  [ActivityType.CREATE_TRANSACTION]: {
    label: "Tạo Thanh Toán",
    color: "emerald",
    icon: ICONS.WALLET,
    bgColor: "bg-emerald-100",
  },
  [ActivityType.UPDATE_TRANSACTION]: {
    label: "Cập Nhật Thanh Toán",
    color: "emerald",
    icon: ICONS.EDIT,
    bgColor: "bg-emerald-100",
  },
  [ActivityType.CREATE_CUSTOMER]: {
    label: "Tạo Khách Hàng",
    color: "pink",
    icon: ICONS.USER,
    bgColor: "bg-pink-100",
  },
  [ActivityType.CREATE_PROMOTION]: {
    label: "Tạo Khuyến Mại",
    color: "amber",
    icon: ICONS.TAG,
    bgColor: "bg-amber-100",
  },
  [ActivityType.UPDATE_PROMOTION]: {
    label: "Cập Nhật Khuyến Mại",
    color: "amber",
    icon: ICONS.EDIT,
    bgColor: "bg-amber-100",
  },
  [ActivityType.CLAIM_PROMOTION]: {
    label: "Nhận Khuyến Mại",
    color: "rose",
    icon: ICONS.TAG,
    bgColor: "bg-rose-100",
  },
  [ActivityType.CREATE_BOOKING_ROOM]: {
    label: "Tạo Phòng Booking",
    color: "indigo",
    icon: ICONS.ROOM,
    bgColor: "bg-indigo-100",
  },
  [ActivityType.UPDATE_BOOKING_ROOM]: {
    label: "Cập Nhật Phòng Booking",
    color: "indigo",
    icon: ICONS.EDIT,
    bgColor: "bg-indigo-100",
  },
  [ActivityType.UPDATE_CUSTOMER]: {
    label: "Cập Nhật Khách Hàng",
    color: "pink",
    icon: ICONS.EDIT,
    bgColor: "bg-pink-100",
  },
};

export function ActivityList({ activities, isLoading }: ActivityListProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 animate-pulse"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border-2 border-gray-200">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="w-10 h-10 text-gray-400">{ICONS.ACTIVITY}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Không Tìm Thấy Hoạt Động
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          Không có hoạt động nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc xóa bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {Array.isArray(activities) && activities.map((activity, index) => {
          const config = ACTIVITY_CONFIG[activity.type];
          const isFirst = index === 0;
          const isLast = index === activities.length - 1;

          return (
            <div key={activity.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-linear-to-b from-primary-300 to-gray-200" />
              )}

              {/* Activity Card */}
              <div
                className={`
                  relative flex gap-4 p-6 bg-white rounded-xl border-2 border-gray-200
                  hover:border-primary-300 hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${isFirst ? "border-primary-400 shadow-md" : ""}
                `}
                onClick={() => setSelectedActivity(activity)}
              >
                {/* Icon */}
                <div
                  className={`
                    shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${config.bgColor} border-2 border-white shadow-sm
                  `}
                >
                  <span className={`w-6 h-6 text-${config.color}-600`}>
                    {config.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`bg-${config.color}-100 text-${config.color}-700 font-semibold border-${config.color}-300`}
                      >
                        {config.label}
                      </Badge>
                      {isFirst && (
                        <Badge
                          variant="secondary"
                          className="bg-linear-to-r from-primary-600 to-blue-600 text-white font-semibold animate-pulse"
                        >
                          Mới nhất
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(activity.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-900 font-medium mb-3 line-clamp-2">
                    {activity.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    {activity.employee && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <span className="w-4 h-4 text-gray-600">{ICONS.USER}</span>
                        <span className="text-gray-700 font-medium">
                          {activity.employee.fullName}
                        </span>
                      </div>
                    )}
                    {activity.customer && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 rounded-lg">
                        <span className="w-4 h-4 text-pink-600">{ICONS.USER}</span>
                        <span className="text-pink-700 font-medium">
                          {activity.customer.fullName}
                        </span>
                      </div>
                    )}
                    {activity.bookingRoom && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 rounded-lg">
                        <span className="w-4 h-4 text-blue-600">{ICONS.ROOM}</span>
                        <span className="text-blue-700 font-medium">
                          Booking #{activity.bookingRoom.id}
                        </span>
                      </div>
                    )}
                    {activity.serviceUsage && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 rounded-lg">
                        <span className="w-4 h-4 text-purple-600">{ICONS.SERVICE}</span>
                        <span className="text-purple-700 font-medium">
                          Dịch vụ #{activity.serviceUsage.id}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                      Xem Chi Tiết
                      <span className="w-4 h-4 ml-2">{ICONS.CHEVRON_RIGHT}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
}
