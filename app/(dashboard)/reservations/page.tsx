"use client";

import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import { ReservationFilters } from "@/components/reservations/reservation-filters";
import { ReservationCalendar } from "@/components/reservations/reservation-calendar";
import { ReservationList } from "@/components/reservations/reservation-list";
import { ReservationFormModal } from "@/components/reservations/reservation-form-modal";
import { CancelReservationDialog } from "@/components/reservations/cancel-reservation-dialog";
import { mockRoomTypes } from "@/lib/mock-room-types";
import { useReservations } from "@/hooks/use-reservations";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Quản lý Đặt Phòng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo, xem, sửa và hủy đặt phòng cho khách hàng
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-primary-600 hover:bg-primary-500"
        >
          <span className="mr-2">{ICONS.PLUS}</span>
          Tạo đặt phòng mới
        </Button>
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

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          onClick={() => setViewMode("calendar")}
          className={
            viewMode === "calendar" ? "bg-primary-600 hover:bg-primary-500" : ""
          }
        >
          <span className="mr-2">{ICONS.CALENDAR}</span>
          Lịch
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
          className={
            viewMode === "list" ? "bg-primary-600 hover:bg-primary-500" : ""
          }
        >
          <span className="mr-2">{ICONS.CLIPBOARD_LIST}</span>
          Danh sách
        </Button>
      </div>

      {/* Content */}
      {viewMode === "calendar" ? (
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
      ) : (
        <ReservationList
          reservations={filteredReservations}
          onEdit={handleEdit}
          onCancel={handleCancelClick}
          onViewDetails={handleViewDetails}
        />
      )}

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
