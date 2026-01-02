"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICONS } from "@/src/constants/icons.enum";
import { UnifiedReservationsFilter } from "@/components/reservations/unified-reservations-filter";
import { ReservationCalendar } from "@/components/reservations/reservation-calendar";
import { ReservationList } from "@/components/reservations/reservation-list";
import { ReservationFormModal } from "@/components/reservations/reservation-form-modal";
import { CancelReservationDialog } from "@/components/reservations/cancel-reservation-dialog";
import { AvailableRoomsModal } from "@/components/reservations/available-rooms-modal";
import { RoomSelectionModal } from "@/components/reservations/room-selection-modal";
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
    isAvailableRoomsModalOpen,
    availableRooms,
    selectedReservation,
    formMode,
    reservations,
    selectedRoom,
    isRoomSelectionModalOpen,
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
    handleCloseAvailableRoomsModal,
    handleSelectRoom,
    handleConfirmRoomSelection,
    handleCloseRoomSelectionModal,
  } = useReservations();

  // Handler for Find Available Rooms (calls handleSearch from hook with date parameters)
  const handleFindRoomsSearch = (findCheckInDate: string, findCheckOutDate: string, findRoomType: string) => {
    // Call handleSearch which is already from useReservations hook
    // It validates dates and opens AvailableRoomsModal
    handleSearch(findCheckInDate, findCheckOutDate, findRoomType);
  };

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

      {/* Modern Recent Bookings Section */}
      {reservations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                {ICONS.CLIPBOARD_LIST}
              </span>
              Đặt Phòng Gần Đây
            </h2>
          </div>

          {/* Bookings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations.slice(0, 6).map((reservation) => {
              const firstDetail = reservation.details[0];
              const statusColors: Record<string, { bg: string; text: string }> = {
                'Chờ xác nhận': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
                'Đã xác nhận': { bg: 'bg-blue-100', text: 'text-blue-700' },
                'Đã nhận phòng': { bg: 'bg-green-100', text: 'text-green-700' },
                'Đã trả phòng': { bg: 'bg-purple-100', text: 'text-purple-700' },
                'Đã hủy': { bg: 'bg-red-100', text: 'text-red-700' },
              };
              const statusColor = statusColors[reservation.status] || statusColors['Chờ xác nhận'];

              return (
                <div
                  key={reservation.reservationID}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
                  onClick={() => handleViewDetails(reservation)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Mã đặt</p>
                      <p className="text-lg font-extrabold text-blue-600 mt-1">{reservation.reservationID}</p>
                    </div>
                    <div className={`${statusColor.bg} ${statusColor.text} px-4 py-2 rounded-lg font-bold text-sm`}>
                      {reservation.status}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-bold text-gray-600">Khách hàng</p>
                    <p className="text-base font-extrabold text-gray-900 mt-1">{reservation.customer.customerName}</p>
                    <p className="text-xs text-gray-600 mt-1">{reservation.customer.phoneNumber}</p>
                  </div>

                  {/* Room & Dates */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 text-blue-600">{ICONS.DOOR_OPEN}</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {firstDetail.roomName} ({firstDetail.roomTypeName})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 text-green-600">{ICONS.CALENDAR}</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {new Date(firstDetail.checkInDate).toLocaleDateString('vi-VN')} - {new Date(firstDetail.checkOutDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 uppercase">Tổng tiền</span>
                    <span className="text-xl font-extrabold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(reservation.totalAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {reservations.length > 6 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                className="h-11 px-6 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-bold"
              >
                Xem tất cả {reservations.length} đặt phòng
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Unified Filter with Tabs - Option B */}
      <UnifiedReservationsFilter
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        roomTypeFilter={roomTypeFilter}
        statusFilter={statusFilter}
        roomTypes={mockRoomTypes}
        onCheckInChange={setCheckInDate}
        onCheckOutChange={setCheckOutDate}
        onRoomTypeChange={setRoomTypeFilter}
        onStatusChange={setStatusFilter}
        onFilterBookings={() => {}} // Filter happens automatically via filteredReservations
        onReset={handleReset}
        onFindRoomsSearch={handleFindRoomsSearch}
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

      {/* Available Rooms Modal */}
      <AvailableRoomsModal
        isOpen={isAvailableRoomsModalOpen}
        onClose={handleCloseAvailableRoomsModal}
        availableRooms={availableRooms}
        roomTypes={mockRoomTypes}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onSelectRoom={handleSelectRoom}
      />

      {/* Room Selection Confirmation Modal */}
      <RoomSelectionModal
        isOpen={isRoomSelectionModalOpen}
        onClose={handleCloseRoomSelectionModal}
        onConfirm={handleConfirmRoomSelection}
        selectedRoom={selectedRoom}
        roomTypes={mockRoomTypes}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
      />
    </div>
  );
}
