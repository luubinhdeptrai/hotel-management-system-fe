"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface UnifiedReservationsFilterProps {
  // Filter state (for calendar/list below)
  checkInDate: string;
  checkOutDate: string;
  roomTypeFilter: string;
  statusFilter: ReservationStatus | "Tất cả";
  roomTypes: RoomType[];
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onRoomTypeChange: (roomType: string) => void;
  onStatusChange: (status: ReservationStatus | "Tất cả") => void;
  onFilterBookings: () => void;  // Filter calendar/list (doesn't open modal)
  onReset: () => void;
  // Find rooms handler (separate)
  onFindRoomsSearch: (checkInDate: string, checkOutDate: string, roomType: string) => void;
}

export function UnifiedReservationsFilter({
  checkInDate,
  checkOutDate,
  roomTypeFilter,
  statusFilter,
  roomTypes,
  onCheckInChange,
  onCheckOutChange,
  onRoomTypeChange,
  onStatusChange,
  onFilterBookings,
  onReset,
  onFindRoomsSearch,
}: UnifiedReservationsFilterProps) {
  const [activeTab, setActiveTab] = useState<"find" | "filter">("find");
  
  // Local state for Find tab (independent from filter state)
  const [findCheckInDate, setFindCheckInDate] = useState("");
  const [findCheckOutDate, setFindCheckOutDate] = useState("");
  const [findRoomTypeFilter, setFindRoomTypeFilter] = useState("Tất cả");

  const handleFindSearch = () => {
    if (!findCheckInDate || !findCheckOutDate) {
      alert("Vui lòng chọn ngày đến và ngày đi!");
      return;
    }
    onFindRoomsSearch(findCheckInDate, findCheckOutDate, findRoomTypeFilter);
  };

  const handleFindReset = () => {
    setFindCheckInDate("");
    setFindCheckOutDate("");
    setFindRoomTypeFilter("Tất cả");
  };

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="w-5 h-5 text-white">{ICONS.FILTER}</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-extrabold text-gray-900">
                Quản lý Đặt Phòng
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                Tìm phòng trống hoặc lọc các đặt phòng hiện có
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "find" | "filter")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="find" className="font-bold">
              <span className="w-4 h-4 mr-2">{ICONS.SEARCH}</span>
              Tìm Phòng Trống
            </TabsTrigger>
            <TabsTrigger value="filter" className="font-bold">
              <span className="w-4 h-4 mr-2">{ICONS.FILTER}</span>
              Lọc Đặt Phòng Hiện Có
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Find Available Rooms */}
          <TabsContent value="find" className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Check-in Date */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-900">
                    Ngày đến <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={findCheckInDate}
                    onChange={(e) => setFindCheckInDate(e.target.value)}
                    className="h-10 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-900">
                    Ngày đi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={findCheckOutDate}
                    onChange={(e) => setFindCheckOutDate(e.target.value)}
                    className="h-10 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Room Type */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-900">
                    Loại Phòng <span className="text-red-500">*</span>
                  </Label>
                  <Select value={findRoomTypeFilter} onValueChange={setFindRoomTypeFilter}>
                    <SelectTrigger className="h-10 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500">
                      <SelectValue placeholder="Chọn loại phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tất cả">Tất cả loại phòng</SelectItem>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.roomTypeID} value={type.roomTypeName}>
                          {type.roomTypeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Find Button with Green Styling */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleFindSearch}
                  className="flex-1 h-11 bg-linear-to-r from-success-500 to-success-600 text-white font-bold hover:from-success-600 hover:to-success-700 transition-all shadow-md hover:shadow-lg rounded-md"
                >
                  <span className="w-5 h-5 mr-2">{ICONS.SEARCH}</span>
                  Tìm Phòng Trống
                </Button>
                <Button
                  onClick={handleFindReset}
                  variant="outline"
                  className="h-11 px-6 border-2 border-gray-300 font-bold hover:bg-gray-100 rounded-md"
                >
                  <span className="w-5 h-5 mr-2">{ICONS.X}</span>
                  Đặt lại
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <span className="font-bold">💡 Gợi ý:</span> Chọn ngày đến, ngày đi và loại phòng để tìm các phòng trống có sẵn
              </p>
            </div>
          </TabsContent>

          {/* TAB 2: Filter Existing Bookings */}
          <TabsContent value="filter" className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Check-in Date */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-900">Ngày đến</Label>
                  <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => onCheckInChange(e.target.value)}
                    className="h-10 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-900">Ngày đi</Label>
                  <Input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => onCheckOutChange(e.target.value)}
                    className="h-10 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Type */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-900">Loại Phòng</Label>
                  <Select value={roomTypeFilter} onValueChange={onRoomTypeChange}>
                    <SelectTrigger className="h-10 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500">
                      <SelectValue placeholder="Chọn loại phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tất cả">Tất cả loại phòng</SelectItem>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.roomTypeID} value={type.roomTypeName}>
                          {type.roomTypeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="font-bold text-gray-900">Trạng Thái</Label>
                  <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="h-10 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tất cả">Tất cả trạng thái</SelectItem>
                      <SelectItem value="Đã đặt">Đã đặt</SelectItem>
                      <SelectItem value="Đã hủy">Đã hủy</SelectItem>
                      <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={onFilterBookings}
                  className="flex-1 h-11 bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors rounded-md shadow-md hover:shadow-lg"
                >
                  <span className="w-5 h-5 mr-2">{ICONS.SEARCH}</span>
                  Lọc Đặt Phòng
                </Button>
                <Button
                  onClick={onReset}
                  variant="outline"
                  className="h-11 px-6 border-2 border-gray-300 font-bold hover:bg-gray-100 rounded-md"
                >
                  <span className="w-5 h-5 mr-2">{ICONS.X}</span>
                  Đặt lại
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <span className="font-bold">💡 Gợi ý:</span> Dùng các bộ lọc để tìm các đặt phòng cụ thể theo tiêu chí của bạn
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
