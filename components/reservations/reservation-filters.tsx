"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONS } from "@/src/constants/icons.enum";
import { RoomType } from "@/lib/types/room";
import { ReservationStatus } from "@/lib/types/reservation";

interface ReservationFiltersProps {
  checkInDate: string;
  checkOutDate: string;
  roomTypeFilter: string;
  statusFilter: ReservationStatus | "Tất cả";
  roomTypes: RoomType[];
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onRoomTypeChange: (roomType: string) => void;
  onStatusChange: (status: ReservationStatus | "Tất cả") => void;
  onSearch: () => void;
  onReset: () => void;
}

const STATUS_OPTIONS: Array<ReservationStatus | "Tất cả"> = [
  "Tất cả",
  "Đã đặt",
  "Đã nhận",
  "Đã hủy",
  "Không đến",
];

export function ReservationFilters({
  checkInDate,
  checkOutDate,
  roomTypeFilter,
  statusFilter,
  roomTypes,
  onCheckInChange,
  onCheckOutChange,
  onRoomTypeChange,
  onStatusChange,
  onSearch,
  onReset,
}: ReservationFiltersProps) {
  return (
    <Card className="bg-linear-to-br from-gray-50 via-white to-gray-50 border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="w-6 h-6 text-white">{ICONS.FILTER}</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-extrabold text-gray-900">
                Tìm kiếm Phòng Trống
              </CardTitle>
              <CardDescription className="text-base text-gray-600 font-medium">
                Chọn ngày và loại phòng để tìm phòng trống có thể đặt
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* 2 Date Inputs */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Check-in Date */}
            <div className="space-y-3">
              <Label htmlFor="filterCheckIn" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Ngày đến <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10">
                  {ICONS.CALENDAR}
                </span>
                <Input
                  id="filterCheckIn"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => onCheckInChange(e.target.value)}
                  className="h-12 pl-12 pr-4 border-2 border-gray-300 rounded-lg font-medium text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div className="space-y-3">
              <Label htmlFor="filterCheckOut" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Ngày đi <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10">
                  {ICONS.CALENDAR_CHECK}
                </span>
                <Input
                  id="filterCheckOut"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => onCheckOutChange(e.target.value)}
                  className="h-12 pl-12 pr-4 border-2 border-gray-300 rounded-lg font-medium text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2 Select Filters nằm gần nhau */}
          <div className="flex gap-4">
            {/* Room Type Filter */}
            <div className="w-full md:w-56 space-y-3">
              <Label htmlFor="filterRoomType" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Loại phòng
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10">
                  {ICONS.BED_DOUBLE}
                </span>
                <Select value={roomTypeFilter} onValueChange={onRoomTypeChange}>
                  <SelectTrigger id="filterRoomType" className="h-12 pl-12 pr-4 border-2 border-gray-300 rounded-lg font-medium text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                    <SelectValue placeholder="Tất cả loại phòng" />
                  </SelectTrigger>
                  <SelectContent className="z-100 max-w-xs" position="popper" align="start" sideOffset={4}>
                    <SelectItem value="Tất cả" className="font-medium">Tất cả loại phòng</SelectItem>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.roomTypeID} value={type.roomTypeID} className="font-medium">
                        {type.roomTypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-56 space-y-3">
              <Label htmlFor="filterStatus" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Trạng thái
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10">
                  {ICONS.INFO}
                </span>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    onStatusChange(value as ReservationStatus | "Tất cả")
                  }
                >
                  <SelectTrigger id="filterStatus" className="h-12 pl-12 pr-4 border-2 border-gray-300 rounded-lg font-medium text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="z-100 max-w-xs" position="popper" align="start" sideOffset={4}>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="font-medium">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 pt-6 border-t-2 border-gray-200">
          <Button
            onClick={onSearch}
            className="h-12 px-6 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold text-base"
          >
            <span className="w-5 h-5 mr-2">{ICONS.SEARCH}</span>
            Tìm phòng trống
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="h-12 px-6 border-2 border-gray-300 font-bold hover:bg-gray-100 hover:border-gray-400 hover:scale-105 transition-all text-base"
          >
            <span className="w-5 h-5 mr-2">{ICONS.X_CIRCLE}</span>
            Đặt lại
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
