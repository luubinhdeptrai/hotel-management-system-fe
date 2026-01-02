"use client";

import { RoomAvailabilityTable } from "./room-availability-table";
import { ICONS } from "@/src/constants/icons.enum";
import type { RoomAvailabilityData } from "@/lib/types/reports";

interface RoomAvailabilityReportProps {
  roomAvailabilityData: RoomAvailabilityData[];
}

export function RoomAvailabilityReport({
  roomAvailabilityData,
}: RoomAvailabilityReportProps) {
  const totalRooms = roomAvailabilityData.reduce((sum, d) => sum + d.total, 0);
  const totalAvailable = roomAvailabilityData.reduce((sum, d) => sum + d.available, 0);
  const totalOccupied = roomAvailabilityData.reduce((sum, d) => sum + d.occupied, 0);
  const totalMaintenance = roomAvailabilityData.reduce((sum, d) => sum + d.maintenance, 0);
  const totalCleaning = roomAvailabilityData.reduce((sum, d) => sum + d.cleaning, 0);
  
  const availabilityRate = totalRooms > 0 ? (totalAvailable / totalRooms) * 100 : 0;
  const occupancyRate = totalRooms > 0 ? (totalOccupied / totalRooms) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-linear-to-br from-primary-50 to-primary-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Tổng số phòng
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {totalRooms}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tất cả loại phòng
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.HOTEL}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-success-50 to-success-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Phòng trống
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {totalAvailable}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {availabilityRate.toFixed(1)}% tổng phòng
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.CHECK_CIRCLE}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-info-50 to-info-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Đang sử dụng
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {totalOccupied}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {occupancyRate.toFixed(1)}% tổng phòng
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.USER_CHECK}</span>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-warning-50 to-warning-100/30 rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Bảo trì & Dọn dẹp
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {totalMaintenance + totalCleaning}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                BT: {totalMaintenance} | DD: {totalCleaning}
              </p>
            </div>
            <div className="w-12 h-12 bg-linear-to-br from-warning-600 to-warning-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="w-6 h-6 text-white">{ICONS.SETTINGS}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="w-5 h-5 text-white">{ICONS.PIE_CHART}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Biểu đồ trạng thái phòng
            </h3>
            <p className="text-xs text-gray-500">Phân bố theo loại phòng</p>
          </div>
        </div>

        <div className="space-y-4">
          {roomAvailabilityData.map((item, index) => {
            const total = item.total || 1;
            const availableWidth = (item.available / total) * 100;
            const occupiedWidth = (item.occupied / total) * 100;
            const maintenanceWidth = (item.maintenance / total) * 100;
            const cleaningWidth = (item.cleaning / total) * 100;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-900">{item.roomType}</span>
                  <span className="text-gray-500 font-medium">
                    Tổng: {item.total} phòng
                  </span>
                </div>
                
                <div className="flex h-12 w-full overflow-hidden rounded-lg border-2 border-gray-200">
                  {item.available > 0 && (
                    <div
                      className="bg-linear-to-r from-success-600 to-success-500 flex items-center justify-center text-white text-sm font-bold transition-all hover:opacity-90"
                      style={{ width: `${availableWidth}%` }}
                      title={`Trống: ${item.available} phòng`}
                    >
                      {availableWidth > 10 && `${item.available}`}
                    </div>
                  )}
                  {item.occupied > 0 && (
                    <div
                      className="bg-linear-to-r from-info-600 to-info-500 flex items-center justify-center text-white text-sm font-bold transition-all hover:opacity-90"
                      style={{ width: `${occupiedWidth}%` }}
                      title={`Đang thuê: ${item.occupied} phòng`}
                    >
                      {occupiedWidth > 10 && `${item.occupied}`}
                    </div>
                  )}
                  {item.cleaning > 0 && (
                    <div
                      className="bg-linear-to-r from-warning-600 to-warning-500 flex items-center justify-center text-white text-sm font-bold transition-all hover:opacity-90"
                      style={{ width: `${cleaningWidth}%` }}
                      title={`Dọn dẹp: ${item.cleaning} phòng`}
                    >
                      {cleaningWidth > 10 && `${item.cleaning}`}
                    </div>
                  )}
                  {item.maintenance > 0 && (
                    <div
                      className="bg-linear-to-r from-error-600 to-error-500 flex items-center justify-center text-white text-sm font-bold transition-all hover:opacity-90"
                      style={{ width: `${maintenanceWidth}%` }}
                      title={`Bảo trì: ${item.maintenance} phòng`}
                    >
                      {maintenanceWidth > 10 && `${item.maintenance}`}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-linear-to-r from-success-600 to-success-500 rounded-full"></div>
                    <span className="text-gray-600">Trống: {item.available}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-linear-to-r from-info-600 to-info-500 rounded-full"></div>
                    <span className="text-gray-600">Thuê: {item.occupied}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-linear-to-r from-warning-600 to-warning-500 rounded-full"></div>
                    <span className="text-gray-600">Dọn: {item.cleaning}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-linear-to-r from-error-600 to-error-500 rounded-full"></div>
                    <span className="text-gray-600">BT: {item.maintenance}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RoomAvailabilityTable data={roomAvailabilityData} />
    </div>
  );
}
