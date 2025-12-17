"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICONS } from "@/src/constants/icons.enum";
import { ReservationFilters } from "@/components/reservations/reservation-filters";
import { ReservationCalendar } from "@/components/reservations/reservation-calendar";
import { ReservationList } from "@/components/reservations/reservation-list";
import { ReservationFormModal } from "@/components/reservations/reservation-form-modal";
import { CancelReservationDialog } from "@/components/reservations/cancel-reservation-dialog";
import { mockRoomTypes } from "@/lib/mock-room-types";
import { useReservations } from "@/hooks/use-reservations";
import { useMemo } from "react";

export default function ReservationsPage() {
  const {
    viewMode,
    filteredReservations,
    calendarEvents,
    checkInDate,
    checkOutDate,
    roomTypeFilter,
    statusFilter,
    isFormModalOpen,
    isCancelModalOpen,
    selectedReservation,
    formMode,
    reservations,
    setViewMode,
    setCheckInDate,
    setCheckOutDate,
    setRoomTypeFilter,
    setStatusFilter,
    handleSearch,
    handleReset,
    handleCreateNew,
    handleEdit,
    handleCancelClick,
    handleConfirmCancel,
    handleSaveReservation,
    handleViewDetails,
    handleCloseFormModal,
    handleCloseCancelModal,
  } = useReservations();

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const total = reservations.length;
    const todayReservations = reservations.filter(r => {
      if (!r.details || r.details.length === 0) return false;
      const checkIn = new Date(r.details[0].checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime();
    }).length;
    
    const upcomingCheckIns = reservations.filter(r => {
      if (!r.details || r.details.length === 0) return false;
      const checkIn = new Date(r.details[0].checkInDate);
      return checkIn >= today && checkIn <= nextWeek && (r.status === "Đã đặt" || r.status === "Đã xác nhận");
    }).length;
    
    const completed = reservations.filter(r => r.status === "Đã nhận phòng" || r.status === "Đã nhận").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const expectedRevenue = reservations
      .filter(r => r.status === "Đã đặt" || r.status === "Đã xác nhận")
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    
    return { total, todayReservations, upcomingCheckIns, completionRate, expectedRevenue };
  }, [reservations]);

  return (
    <div className="space-y-8">
      {/* Header with Gradient Background */}
      <div className="relative bg-linear-to-r from-blue-600 via-blue-500 to-purple-500 rounded-2xl shadow-2xl overflow-hidden">
        {/* SVG Pattern Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern-res" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-res)" />
        </svg>
        
        <div className="relative px-8 py-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
              Quản lý Đặt Phòng
            </h1>
            <p className="text-base text-white/90 mt-3 font-medium">
              Tạo, xem, sửa và hủy đặt phòng cho khách hàng
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
            className="h-12 px-6 bg-white text-blue-600 hover:bg-gray-50 hover:scale-105 font-bold shadow-xl transition-all text-base"
          >
            <span className="w-5 h-5 mr-2">{ICONS.PLUS}</span>
            Tạo đặt phòng mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="relative px-8 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg border-2 border-white/50 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Đặt phòng hôm nay</p>
                <p className="text-4xl font-extrabold text-blue-600 mt-2">{stats.todayReservations}</p>
                <p className="text-xs text-gray-500 font-semibold mt-1">đặt phòng mới</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-7 h-7 text-white">{ICONS.CALENDAR_DAYS}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg border-2 border-white/50 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Sắp check-in</p>
                <p className="text-4xl font-extrabold text-purple-600 mt-2">{stats.upcomingCheckIns}</p>
                <p className="text-xs text-gray-500 font-semibold mt-1">trong 7 ngày tới</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-7 h-7 text-white">{ICONS.DOOR_OPEN}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg border-2 border-white/50 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Tỷ lệ hoàn thành</p>
                <p className="text-4xl font-extrabold text-success-600 mt-2">{stats.completionRate}%</p>
                <p className="text-xs text-gray-500 font-semibold mt-1">đã nhận phòng</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-success-400 to-success-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-7 h-7 text-white">{ICONS.CHECK_CIRCLE}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg border-2 border-white/50 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Doanh thu dự kiến</p>
                <p className="text-2xl font-extrabold text-warning-600 mt-2">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(stats.expectedRevenue)}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-1">từ đặt phòng đã xác nhận</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-warning-400 to-warning-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-7 h-7 text-white">{ICONS.DOLLAR_SIGN}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ReservationFilters
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        roomTypeFilter={roomTypeFilter}
        statusFilter={statusFilter}
        roomTypes={mockRoomTypes}
        onCheckInChange={setCheckInDate}
        onCheckOutChange={setCheckOutDate}
        onRoomTypeChange={setRoomTypeFilter}
        onStatusChange={setStatusFilter}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Tabs for View Mode */}
      <Tabs value={viewMode} onValueChange={setViewMode as (value: string) => void}>
        <TabsList className="grid w-full grid-cols-2 h-14 bg-gray-100 p-1.5 rounded-xl shadow-md">
          <TabsTrigger value="calendar" className="h-full text-base font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
            <span className="mr-2">{ICONS.CALENDAR}</span>
            Lịch
          </TabsTrigger>
          <TabsTrigger value="list" className="h-full text-base font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
            <span className="mr-2">{ICONS.CLIPBOARD_LIST}</span>
            Danh sách
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <ReservationCalendar
            events={calendarEvents}
            onEventClick={(event) => {
              const reservation = reservations.find(
                (r) => r.reservationID === event.reservationID
              );
              if (reservation) {
                handleViewDetails(reservation);
              }
            }}
          />
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          <ReservationList
            reservations={filteredReservations}
            onEdit={handleEdit}
            onCancel={handleCancelClick}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      <ReservationFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveReservation}
        roomTypes={mockRoomTypes}
        reservation={selectedReservation || undefined}
        mode={formMode}
      />

      {/* Cancel Confirmation Modal */}
      <CancelReservationDialog
        isOpen={isCancelModalOpen}
        reservation={selectedReservation}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancelModal}
      />
    </div>
  );
}
