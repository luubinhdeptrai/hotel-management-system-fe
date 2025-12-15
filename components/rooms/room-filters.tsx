"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICONS } from "@/src/constants/icons.enum";
import { RoomStatus, RoomFilterOptions, RoomType } from "@/lib/types/room";

interface RoomFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: RoomFilterOptions;
  onFiltersChange: (filters: RoomFilterOptions) => void;
  uniqueRoomTypes: RoomType[];
  uniqueFloors: number[];
  filteredCount: number;
  totalCount: number;
  onReset: () => void;
}

export function RoomFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  uniqueRoomTypes,
  uniqueFloors,
  filteredCount,
  totalCount,
  onReset,
}: RoomFiltersProps) {
  const hasActiveFilters =
    searchQuery ||
    filters.status !== "Tất cả" ||
    filters.roomType !== "Tất cả" ||
    filters.floor !== "Tất cả";

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
      <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 shadow-sm">
              {ICONS.FILTER}
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Bộ lọc tìm kiếm
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                Lọc và tìm kiếm phòng theo tiêu chí
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-10 px-4 hover:bg-error-50 hover:text-error-600 hover:border-error-300 hover:scale-105 transition-all font-semibold"
          >
            <span className="mr-1.5">{ICONS.CLOSE}</span>
            Đặt lại
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Search - Full Width */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
              <span className="text-primary-600">{ICONS.SEARCH}</span>
              Tìm kiếm nhanh
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                {ICONS.SEARCH}
              </span>
              <Input
                placeholder="Nhập tên phòng, mã phòng để tìm kiếm..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 h-12 bg-gradient-to-r from-gray-50 to-white border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all shadow-sm text-base font-medium"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-linear-to-r from-transparent via-primary-200 to-transparent rounded-full"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 py-1 text-primary-600 font-bold uppercase tracking-wider">
                Lọc theo tiêu chí
              </span>
            </div>
          </div>

          {/* Filter Grid */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Status Filter */}
            <div className=" ml-17 flex-2 space-y-3">
              <label className="text-base font-bold text-gray-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-info-600 shadow-sm"></span>
                Trạng thái phòng
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value as RoomStatus | "Tất cả",
                  })
                }
              >
                <SelectTrigger className="h-14 bg-gradient-to-r from-gray-50 to-white border-gray-300 hover:border-primary-400 transition-all shadow-sm font-semibold text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tất cả">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      Tất cả trạng thái
                    </div>
                  </SelectItem>
                  <SelectItem value="Sẵn sàng">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success-600"></span>
                      Sẵn sàng
                    </div>
                  </SelectItem>
                  <SelectItem value="Đang thuê">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-error-600"></span>
                      Đang thuê
                    </div>
                  </SelectItem>
                  <SelectItem value="Bẩn">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning-600"></span>
                      Bẩn
                    </div>
                  </SelectItem>
                  <SelectItem value="Bảo trì">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                      Bảo trì
                    </div>
                  </SelectItem>
                  <SelectItem value="Đã đặt">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-info-600"></span>
                      Đã đặt
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Room Type Filter */}
            <div className="flex-2 space-y-3">
              <label className="text-base font-bold text-gray-700 flex items-center gap-2">
                <span className="text-primary-600">{ICONS.BED_DOUBLE}</span>
                Loại phòng
              </label>
              <Select
                value={filters.roomType}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, roomType: value })
                }
              >
                <SelectTrigger className="h-14 bg-gradient-to-r from-gray-50 to-white border-gray-300 hover:border-primary-400 transition-all shadow-sm font-semibold text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tất cả">Tất cả loại phòng</SelectItem>
                  {uniqueRoomTypes.map((type) => (
                    <SelectItem key={type.roomTypeID} value={type.roomTypeID}>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">
                          {ICONS.BED_DOUBLE}
                        </span>
                        {type.roomTypeName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Floor Filter */}
            <div className="flex-1 space-y-3">
              <label className="text-base font-bold text-gray-700 flex items-center gap-2">
                <span className="text-primary-600">{ICONS.HOME}</span>
                Tầng
              </label>
              <Select
                value={filters.floor.toString()}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    floor: value === "Tất cả" ? "Tất cả" : parseInt(value),
                  })
                }
              >
                <SelectTrigger className="h-14 bg-gradient-to-r from-gray-50 to-white border-gray-300 hover:border-primary-400 transition-all shadow-sm font-semibold text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tất cả">Tất cả tầng</SelectItem>
                  {uniqueFloors.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{ICONS.HOME}</span>
                        Tầng {floor}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-lg">
                <span className="text-primary-600 font-semibold">
                  {filteredCount}
                </span>
                <span className="text-gray-600">phòng tìm thấy</span>
              </div>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">
                Tổng <span className="font-medium">{totalCount}</span> phòng
              </span>
            </div>

            {hasActiveFilters && (
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></span>
                Đang áp dụng bộ lọc
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
