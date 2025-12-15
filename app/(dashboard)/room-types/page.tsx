"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICONS } from "@/src/constants/icons.enum";
import { RoomTypeFormModal } from "@/components/room-types/room-type-form-modal";
import { RoomTypeGrid } from "@/components/room-types/room-type-grid";
import { StatsCards } from "@/components/room-types/stats-cards";
import { QuickAddSection } from "@/components/room-types/quick-add-section";
import { PricingEngineTab } from "@/components/room-types/pricing-engine-tab";
import { useRoomTypes } from "@/hooks/use-room-types";
import { useMemo } from "react";

export default function RoomTypesPage() {
  const [activeTab, setActiveTab] = useState("room-types");

  const {
    roomTypes,
    loading,
    modalOpen,
    editingRoomType,
    isDeleting,
    error,
    setModalOpen,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    handleSelectTemplate,
    clearError,
  } = useRoomTypes();

  const stats = useMemo(() => {
    if (roomTypes.length === 0) {
      return {
        total: 0,
        minPrice: null,
        maxPrice: null,
      };
    }

    const prices = roomTypes.map((rt) => rt.price);
    return {
      total: roomTypes.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [roomTypes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Quản lý Loại Phòng & Giá
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các loại phòng và cấu hình động giá theo ngày
          </p>
        </div>
        {activeTab === "room-types" && (
          <Button
            onClick={handleAddNew}
            className="h-10 px-5 bg-primary-blue-600 text-white hover:bg-primary-blue-700 font-medium"
          >
            <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
            Thêm loại phòng mới
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="relative">
          <span className="w-4 h-4">{ICONS.ALERT}</span>
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button
            onClick={clearError}
            className="absolute top-3 right-3 text-current hover:opacity-70 transition-opacity"
            aria-label="Đóng"
          >
            <span className="w-4 h-4">{ICONS.CLOSE}</span>
          </button>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="room-types">Loại Phòng</TabsTrigger>
          <TabsTrigger value="pricing">Cấu hình Giá</TabsTrigger>
        </TabsList>

        {/* Tab 1: Room Types */}
        <TabsContent value="room-types" className="space-y-6">
          {/* Stats Cards */}
          <StatsCards
            totalRoomTypes={stats.total}
            minPrice={stats.minPrice}
            maxPrice={stats.maxPrice}
          />

          {/* Quick Add Section */}
          <QuickAddSection
            onAddNew={handleAddNew}
            onSelectTemplate={handleSelectTemplate}
          />

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu...</p>
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
        onSave={handleSave}
      />
    </div>
  );
}
