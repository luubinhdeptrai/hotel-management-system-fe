"use client";

import { Card } from "@/components/ui/card";
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
    <Card className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Check-in Date */}
        <div>
          <Label htmlFor="filterCheckIn" className="text-sm font-medium">
            Ngày đến
          </Label>
          <Input
            id="filterCheckIn"
            type="date"
            value={checkInDate}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <Label htmlFor="filterCheckOut" className="text-sm font-medium">
            Ngày đi
          </Label>
          <Input
            id="filterCheckOut"
            type="date"
            value={checkOutDate}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Room Type Filter */}
        <div>
          <Label htmlFor="filterRoomType" className="text-sm font-medium">
            Loại phòng
          </Label>
          <Select value={roomTypeFilter} onValueChange={onRoomTypeChange}>
            <SelectTrigger id="filterRoomType" className="mt-1">
              <SelectValue placeholder="Tất cả loại phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tất cả">Tất cả loại phòng</SelectItem>
              {roomTypes.map((type) => (
                <SelectItem key={type.roomTypeID} value={type.roomTypeID}>
                  {type.roomTypeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <Label htmlFor="filterStatus" className="text-sm font-medium">
            Trạng thái
          </Label>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              onStatusChange(value as ReservationStatus | "Tất cả")
            }
          >
            <SelectTrigger id="filterStatus" className="mt-1">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <Button
          onClick={onSearch}
          className="bg-primary-600 hover:bg-primary-500"
        >
          <span className="mr-2">{ICONS.SEARCH}</span>
          Tìm phòng trống
        </Button>
        <Button variant="outline" onClick={onReset}>
          <span className="mr-2">{ICONS.X_CIRCLE}</span>
          Đặt lại
        </Button>
      </div>
    </Card>
  );
}
