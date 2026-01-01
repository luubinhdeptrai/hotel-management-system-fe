"use client";

import { useState, useMemo } from "react";
import { useRooms } from "@/hooks/use-rooms";
import { useRoomTypes } from "@/hooks/use-room-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Grid3x3,
  List,
  AlertCircle,
  Loader2,
  Hotel,
  CheckCircle2,
  Users,
  TrendingUp,
  Filter,
  X,
  Layers,
} from "lucide-react";
import { RoomCard } from "@/components/rooms/room-card";
import { RoomTable } from "@/components/rooms/room-table";
import { RoomFormModal } from "@/components/rooms/room-form-modal";
import type { RoomStatus } from "@/lib/types/api";

// Status configuration for filters
const statusOptions: { value: RoomStatus | "ALL"; label: string; color: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái", color: "bg-gray-500" },
  { value: "AVAILABLE", label: "Sẵn sàng", color: "bg-emerald-500" },
  { value: "OCCUPIED", label: "Đang sử dụng", color: "bg-red-500" },
  { value: "RESERVED", label: "Đã đặt", color: "bg-blue-500" },
  { value: "CLEANING", label: "Đang dọn", color: "bg-yellow-500" },
  { value: "MAINTENANCE", label: "Bảo trì", color: "bg-gray-500" },
  { value: "OUT_OF_SERVICE", label: "Ngừng hoạt động", color: "bg-purple-500" },
];

export default function RoomsPage() {
  const {
    rooms,
    loading,
    error,
    isDeleting,
    statistics,
    uniqueFloors,
    filters,
    handleSearch,
    handleFilterChange,
    clearFilters,
    modalOpen,
    setModalOpen,
    editingRoom,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    clearError,
  } = useRooms();

  const { roomTypes } = useRoomTypes();

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "ALL">("ALL");
  const [floorFilter, setFloorFilter] = useState<string>("ALL");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("ALL");

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleSearch(value);
  };

  // Handle status filter
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as RoomStatus | "ALL");
    handleFilterChange({ status: value === "ALL" ? undefined : (value as RoomStatus) });
  };

  // Handle floor filter
  const handleFloorFilterChange = (value: string) => {
    setFloorFilter(value);
    handleFilterChange({ floor: value === "ALL" ? undefined : parseInt(value) });
  };

  // Handle room type filter
  const handleRoomTypeFilterChange = (value: string) => {
    setRoomTypeFilter(value);
    handleFilterChange({ roomTypeId: value === "ALL" ? undefined : value });
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setFloorFilter("ALL");
    setRoomTypeFilter("ALL");
    clearFilters();
  };

  // Check if any filter is active
  const hasActiveFilters = searchTerm || statusFilter !== "ALL" || floorFilter !== "ALL" || roomTypeFilter !== "ALL";

  // Client-side filtering to ensure accuracy
  const filteredRooms = useMemo(() => {
    let filtered = rooms;
    
    // Filter by floor
    if (floorFilter !== "ALL") {
      const floorNum = parseInt(floorFilter);
      filtered = filtered.filter((room) => room.floor === floorNum);
    }
    
    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((room) => room.status === statusFilter);
    }
    
    // Filter by room type
    if (roomTypeFilter !== "ALL") {
      filtered = filtered.filter((room) => room.roomTypeId === roomTypeFilter);
    }
    
    return filtered;
  }, [rooms, floorFilter, statusFilter, roomTypeFilter]);

  // Group rooms by floor for grid view
  const roomsByFloor = useMemo(() => {
    const grouped: Record<number, typeof filteredRooms> = {};
    filteredRooms.forEach((room) => {
      if (!grouped[room.floor]) {
        grouped[room.floor] = [];
      }
      grouped[room.floor].push(room);
    });
    // Sort floors
    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([floor, floorRooms]) => ({
        floor: parseInt(floor),
        rooms: floorRooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)),
      }));
  }, [filteredRooms]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Hotel className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">
                Quản lý Phòng
              </h1>
              <p className="text-lg text-white/90 mt-1 font-medium">
                Danh sách và quản lý tất cả các phòng trong khách sạn
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="bg-white text-blue-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 h-14 px-8 font-bold"
          >
            <Plus className="mr-2 h-6 w-6" />
            Thêm phòng mới
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="flex items-center justify-between flex-1">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-6 px-2 hover:bg-white/10"
            >
              Đóng
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards with Gradient */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Rooms */}
        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-blue-50 via-blue-100 to-cyan-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/20 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-blue-700 uppercase tracking-wide flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Tổng phòng
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-5xl font-extrabold text-blue-900 mb-2">
              {statistics.total}
            </div>
            <div className="text-xs text-blue-600 font-semibold">
              Tất cả các phòng
            </div>
          </CardContent>
        </Card>

        {/* Available Rooms */}
        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-emerald-50 via-emerald-100 to-teal-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300/20 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Phòng trống
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-5xl font-extrabold text-emerald-900 mb-2">
              {statistics.available}
            </div>
            <div className="text-xs text-emerald-600 font-semibold">
              Sẵn sàng đặt phòng
            </div>
          </CardContent>
        </Card>

        {/* Occupied Rooms */}
        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-orange-50 via-orange-100 to-amber-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-300/20 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-orange-700 uppercase tracking-wide flex items-center gap-2">
              <Users className="h-4 w-4" />
              Đang sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-5xl font-extrabold text-orange-900 mb-2">
              {statistics.occupied}
            </div>
            <div className="text-xs text-orange-600 font-semibold">
              Khách đang ở
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-purple-50 via-purple-100 to-pink-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-purple-700 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tỷ lệ lấp đầy
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-5xl font-extrabold text-purple-900 mb-2">
              {statistics.occupancyRate}%
            </div>
            <div className="text-xs text-purple-600 font-semibold">
              Công suất sử dụng
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search & Filters - Modern Design */}
      <div className="space-y-4">
        {/* Main Search & Filters Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-slate-50 to-blue-50/30 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Search Bar Row */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 blur transition-all duration-300"></div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg z-10">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <Input
                    placeholder="Nhập số phòng để tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-16 pr-5 h-16 bg-white border-2 border-gray-200/80 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-base font-medium placeholder:text-gray-400 rounded-2xl shadow-lg hover:shadow-xl relative w-full"
                  />
                </div>
              </div>

              {/* Filters Row with Clear Button */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-5 items-end">
                {/* Status Filter */}
                <div className="group relative sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide mb-3 pl-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    Trạng thái
                  </label>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="h-32 bg-white/90 backdrop-blur-sm border-2 border-blue-100 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-3 w-3 rounded-full ${option.color} shadow-sm`} />
                            <span className="font-medium">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Floor Filter */}
                <div className="group relative sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 uppercase tracking-wide mb-3 pl-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                    Tầng
                  </label>
                  <Select value={floorFilter} onValueChange={handleFloorFilterChange}>
                    <SelectTrigger className="h-32 bg-white/90 backdrop-blur-sm border-2 border-cyan-100 hover:border-cyan-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-2xl font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL" className="cursor-pointer">
                        <div className="flex items-center gap-2.5 font-medium">
                          <Layers className="h-4 w-4 text-cyan-600" />
                          Tất cả tầng
                        </div>
                      </SelectItem>
                      {uniqueFloors.map((floor) => (
                        <SelectItem key={floor} value={floor.toString()} className="cursor-pointer">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs font-bold">{floor}</span>
                            </div>
                            <span className="font-medium">Tầng {floor}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Type Filter */}
                <div className="group relative sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3 pl-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    Loại phòng
                  </label>
                  <Select value={roomTypeFilter} onValueChange={handleRoomTypeFilterChange}>
                    <SelectTrigger className="h-32 bg-white/90 backdrop-blur-sm border-2 border-emerald-100 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL" className="cursor-pointer">
                        <div className="flex items-center gap-2.5 font-medium">
                          <Hotel className="h-4 w-4 text-emerald-600" />
                          Tất cả loại phòng
                        </div>
                      </SelectItem>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.roomTypeID} value={type.roomTypeID} className="cursor-pointer">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                              <Hotel className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium">{type.roomTypeName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear All Button - Same Row */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearAllFilters}
                    className="h-10 px-4 border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 hover:border-red-400 hover:text-red-700 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap group flex items-center justify-center sm:col-span-1"
                  >
                    <X className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Xóa tất cả
                  </Button>
                )}
              </div>

              {/* Results Summary Bar */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                    <span className="text-white text-lg font-bold">{filteredRooms.length}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">
                      Tìm thấy {filteredRooms.length} phòng
                    </div>
                    <div className="text-xs text-gray-500">
                      {hasActiveFilters ? "Đã áp dụng bộ lọc" : "Hiển thị tất cả"}
                    </div>
                  </div>
                </div>
                {searchTerm && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                    <Search className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">"{searchTerm}"</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Filter Tags Row - Moved Below */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 flex-wrap animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-200/50">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Bộ lọc đang áp dụng</span>
            </div>
            
            {statusFilter !== "ALL" && (
              <div className="group px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg font-medium flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                <span>{statusOptions.find(s => s.value === statusFilter)?.label}</span>
                <button 
                  onClick={() => handleStatusFilterChange("ALL")} 
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {floorFilter !== "ALL" && (
              <div className="group px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm rounded-lg font-medium flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                <Layers className="h-3.5 w-3.5" />
                <span>Tầng {floorFilter}</span>
                <button 
                  onClick={() => handleFloorFilterChange("ALL")} 
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {roomTypeFilter !== "ALL" && (
              <div className="group px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm rounded-lg font-medium flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                <Hotel className="h-3.5 w-3.5" />
                <span>{roomTypes.find(t => t.roomTypeID === roomTypeFilter)?.roomTypeName}</span>
                <button 
                  onClick={() => handleRoomTypeFilterChange("ALL")} 
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-end">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "table")} className="w-auto">
            <TabsList className="bg-white border-2 border-gray-200 p-1.5 h-12 rounded-xl shadow-md">
              <TabsTrigger 
                value="grid" 
                className="gap-2 px-5 h-full data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all font-semibold"
              >
                <Grid3x3 className="h-5 w-5" />
                <span className="hidden sm:inline">Lưới</span>
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                className="gap-2 px-5 h-full data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all font-semibold"
              >
                <List className="h-5 w-5" />
                <span className="hidden sm:inline">Bảng</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
              <p className="text-base text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredRooms.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-gray-100 to-gray-200 mb-6 shadow-inner">
                <Hotel className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {hasActiveFilters ? "Không tìm thấy kết quả" : "Chưa có phòng nào"}
              </h3>
              <p className="text-base text-gray-500 mb-6 max-w-md leading-relaxed">
                {hasActiveFilters
                  ? "Thử thay đổi bộ lọc hoặc xóa bộ lọc để xem tất cả phòng"
                  : "Bắt đầu bằng cách thêm phòng đầu tiên cho khách sạn của bạn"}
              </p>
              {hasActiveFilters ? (
                <Button
                  onClick={handleClearAllFilters}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <X className="h-5 w-5" />
                  Xóa bộ lọc
                </Button>
              ) : (
                <Button
                  onClick={handleAddNew}
                  size="lg"
                  className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Thêm phòng đầu tiên
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View - Grouped by Floor */
        <div className="space-y-8">
          {roomsByFloor.map(({ floor, rooms: floorRooms }) => (
            <div key={floor} className="space-y-4">
              {/* Floor Header */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 shadow-lg">
                  <Layers className="h-5 w-5 text-white" />
                  <span className="text-lg font-bold text-white">Tầng {floor}</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm font-semibold text-white">
                    {floorRooms.length} phòng
                  </span>
                </div>
                <div className="flex-1 h-px bg-linear-to-r from-blue-200 to-transparent" />
              </div>

              {/* Floor Rooms Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {floorRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={isDeleting === room.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <RoomTable
          rooms={filteredRooms}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* Form Modal */}
      <RoomFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingRoom={editingRoom}
      />
    </div>
  );
}
