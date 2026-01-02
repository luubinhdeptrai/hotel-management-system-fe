"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICONS } from "@/src/constants/icons.enum";
import { RoomTypeFormModal } from "@/components/room-types/room-type-form-modal-v2";
import { RoomTypeGrid } from "@/components/room-types/room-type-grid";
import { StatsCards } from "@/components/room-types/stats-cards";
import { SearchAndFilterSection } from "@/components/room-types/search-and-filter-section";
import { PricingEngineTab } from "@/components/room-types/pricing-engine-tab";
import { useRoomTypes } from "@/hooks/use-room-types";
import { useMemo } from "react";

export default function RoomTypesPage() {
  const [activeTab, setActiveTab] = useState("room-types");

  const {
    roomTypes,
    allRoomTypes,
    roomTags,
    loading,
    modalOpen,
    editingRoomType,
    isDeleting,
    error,
    mostPopularRoomType,
    setModalOpen,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    clearError,
    handleSearch,
    handleFilterByPrice,
    handleFilterByCapacity,
    handleResetFilters,
  } = useRoomTypes();

  const stats = useMemo(() => {
    if (allRoomTypes.length === 0) {
      return {
        total: 0,
        minPrice: null,
        maxPrice: null,
        avgPrice: null,
      };
    }

    const prices = allRoomTypes.map((rt) => rt.price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    return {
      total: allRoomTypes.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice,
    };
  }, [allRoomTypes]);

  return (
    <div className="space-y-8">
      {/* Header with Gradient Background */}
      <div className="relative bg-linear-to-r from-primary-600 via-primary-500 to-blue-500 rounded-2xl shadow-2xl overflow-hidden">
        {/* SVG Pattern Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern-rt" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-rt)" />
        </svg>
        
        <div className="relative px-8 py-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
              Quản lý Loại Phòng & Giá
            </h1>
            <p className="text-base text-white/90 mt-3 font-medium">
              Quản lý các loại phòng và cấu hình động giá theo ngày
            </p>
          </div>
          {activeTab === "room-types" && (
            <Button
              onClick={handleAddNew}
              className="h-12 px-6 bg-white text-primary-600 hover:bg-gray-50 hover:scale-105 font-bold shadow-xl transition-all text-base"
            >
              <span className="w-5 h-5 mr-2">{ICONS.PLUS}</span>
              Thêm loại phòng mới
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="relative border-2 shadow-lg">
          <span className="w-5 h-5">{ICONS.ALERT}</span>
          <AlertTitle className="text-base font-bold">Lỗi</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
          <button
            onClick={clearError}
            className="absolute top-4 right-4 text-current hover:opacity-70 hover:scale-110 transition-all"
            aria-label="Đóng"
          >
            <span className="w-5 h-5">{ICONS.CLOSE}</span>
          </button>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-14 bg-gray-100 p-1.5 rounded-xl shadow-md">
          <TabsTrigger value="room-types" className="h-full text-base font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary-600 transition-all">
            <span className="w-5 h-5 mr-2">{ICONS.BED_DOUBLE}</span>
            Loại Phòng
          </TabsTrigger>
          <TabsTrigger value="pricing" className="h-full text-base font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary-600 transition-all">
            <span className="w-5 h-5 mr-2">{ICONS.DOLLAR_SIGN}</span>
            Cấu hình Giá
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Room Types */}
        <TabsContent value="room-types" className="space-y-6">
          {/* Stats Cards */}
          <StatsCards
            totalRoomTypes={stats.total}
            minPrice={stats.minPrice}
            maxPrice={stats.maxPrice}
            avgPrice={stats.avgPrice}
            mostPopularRoomType={mostPopularRoomType}
          />

          {/* Search and Filter Section */}
          <SearchAndFilterSection
            onSearch={handleSearch}
            onFilterByPrice={handleFilterByPrice}
            onFilterByCapacity={handleFilterByCapacity}
            onReset={handleResetFilters}
          />

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-100 p-20">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-base text-gray-700 font-bold">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <RoomTypeGrid
              roomTypes={roomTypes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )}
        </TabsContent>

        {/* Tab 2: Pricing Engine */}
        <TabsContent value="pricing" className="space-y-6">
          <PricingEngineTab roomTypes={roomTypes} />
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      <RoomTypeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        roomType={editingRoomType}
        roomTags={roomTags}
        onSave={handleSave}
      />
    </div>
  );
}
