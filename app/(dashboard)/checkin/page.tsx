"use client";

import { CheckInSearch } from "@/components/checkin-checkout/check-in-search";
import { CheckInResultsTable } from "@/components/checkin-checkout/check-in-results-table";
import { ModernCheckInModal } from "@/components/checkin-checkout/modern-check-in-modal";
import { WalkInModal } from "@/components/checkin-checkout/walk-in-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ICONS } from "@/src/constants/icons.enum";
import { useCheckIn } from "@/hooks/use-checkin";
import { useNotification } from "@/hooks/use-notification";
import type { Booking } from "@/lib/types/api";
import { useAppDispatch } from "@/lib/redux/hooks";
import { initCheckIn } from "@/lib/redux/slices/checkin.slice";

export default function CheckInPage() {
  // Custom hooks for business logic
  const checkIn = useCheckIn();
  const notification = useNotification();
  const dispatch = useAppDispatch();

  // Check-in handlers
  // Check-in handlers (moved to modal)

  // Walk-in handler
  const handleWalkInConfirm = async (
    data: Parameters<typeof checkIn.handleConfirmWalkIn>[0]
  ) => {
    try {
      await checkIn.handleConfirmWalkIn(data);
      notification.showSuccess(
        `Check-in khách vãng lai thành công cho ${data.customerName}!`
      );
    } catch (error) {
      notification.showError("Walk-in check-in thất bại. Vui lòng thử lại.");
      console.error("Walk-in error:", error);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Modern Header with Gradient */}
      <div className="bg-linear-to-r from-primary-600 via-primary-500 to-primary-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <span className="w-8 h-8 text-white">{ICONS.CALENDAR_CHECK}</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Check-in</h1>
            <p className="text-sm text-white/90 mt-1 font-medium">
              Xử lý quy trình check-in cho khách hàng đã đặt phòng hoặc khách
              vãng lai
            </p>
          </div>
        </div>
      </div>

      {/* Notification Message */}
      {notification.message && (
        <Alert
          className={`shadow-md flex items-center gap-4 ${
            notification.type === "error"
              ? "bg-red-100 border-2 border-red-600"
              : "bg-success-100 border-2 border-success-600"
          }`}
        >
          <div
            className={
              notification.type === "error"
                ? "text-red-600 shrink-0"
                : "text-success-600 shrink-0"
            }
          >
            {notification.type === "error" ? ICONS.ALERT_CIRCLE : ICONS.CHECK}
          </div>
          <AlertDescription
            className={
              notification.type === "error"
                ? "text-red-700 font-semibold"
                : "text-success-700 font-semibold"
            }
          >
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Check-in Content */}
      <div className="space-y-6">
        <CheckInSearch
          onSearch={checkIn.handleSearch}
          onWalkIn={checkIn.handleWalkIn}
        />

        {checkIn.isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
            <Spinner className="size-10 text-primary-600" />
            <p className="mt-4 text-gray-600 font-medium">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : (
          <CheckInResultsTable
            reservations={checkIn.results}
            onCheckIn={(booking) => {
              checkIn.handleSelectBooking(booking);
              dispatch(initCheckIn({ bookingId: booking.id }));
            }}
          />
        )}
      </div>

      {/* Modals */}
      <ModernCheckInModal
        open={checkIn.showModal}
        onOpenChange={checkIn.setShowModal}
        booking={checkIn.selectedBooking as Booking | null}
      />

      <WalkInModal
        open={checkIn.showWalkInModal}
        onOpenChange={checkIn.setShowWalkInModal}
        onConfirm={handleWalkInConfirm}
      />
    </div>
  );
}
