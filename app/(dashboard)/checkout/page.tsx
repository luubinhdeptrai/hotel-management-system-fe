"use client";

import { CheckOutSearch } from "@/components/checkin-checkout/check-out-search";
import { CheckOutResultsTable } from "@/components/checkin-checkout/check-out-results-table";
import { ModernCheckOutDetails } from "@/components/checkin-checkout/modern-check-out-details";
import { AddServiceModal } from "@/components/checkin-checkout/add-service-modal";
import { AddPenaltyModal } from "@/components/checkin-checkout/add-penalty-modal";
import { AddSurchargeModal } from "@/components/checkin-checkout/add-surcharge-modal";
import { FinalPaymentModal } from "@/components/checkin-checkout/final-payment-modal";
import { PaymentModal } from "@/components/payments/payment-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ICONS } from "@/src/constants/icons.enum";
import { useCheckOut } from "@/hooks/use-checkout";
import { useNotification } from "@/hooks/use-notification";

export default function CheckOutPage() {
  // Custom hooks for business logic
  const checkOut = useCheckOut();
  const notification = useNotification();

  // Check-out handlers
  const handleAddService = async (
    data: Parameters<typeof checkOut.handleAddService>[0]
  ) => {
    try {
      const serviceName = await checkOut.handleAddService(data);
      if (serviceName) {
        notification.showSuccess(`Đã thêm dịch vụ ${serviceName}!`);
      }
    } catch {
      notification.showError("Không thể thêm dịch vụ. Vui lòng thử lại.");
    }
  };

  const handleAddPenalty = (
    data: Parameters<typeof checkOut.handleAddPenalty>[0]
  ) => {
    const success = checkOut.handleAddPenalty(data);
    if (success) {
      notification.showSuccess("Đã thêm phí phạt!");
    }
  };

  const handleAddSurcharge = (
    data: Parameters<typeof checkOut.handleAddSurcharge>[0]
  ) => {
    const success = checkOut.handleAddSurcharge(data);
    if (success) {
      notification.showSuccess("Đã thêm phụ thu!");
    }
  };

  const handleCompleteCheckout = () => {
    checkOut.handleCompleteCheckout();
  };

  const handleConfirmPayment = (
    method: Parameters<typeof checkOut.handleConfirmPayment>[0]
  ) => {
    const roomName = checkOut.handleConfirmPayment(method);
    if (roomName) {
      notification.showSuccess(`Đã hoàn tất check-out cho phòng ${roomName}!`);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Modern Header with Gradient */}
      <div className="bg-linear-to-r from-primary-600 via-primary-500 to-primary-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <span className="w-8 h-8 text-white">{ICONS.DOOR_OPEN}</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Check-out</h1>
            <p className="text-sm text-white/90 mt-1 font-medium">
              Xử lý quy trình trả phòng, thanh toán và hoàn tất lưu trú
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

      {/* Check-out Content */}
      <div className="space-y-6">
        {!checkOut.selectedBooking ? (
          <>
            <CheckOutSearch onSearch={checkOut.handleSearch} />

            {checkOut.isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
                <Spinner className="size-10 text-primary-600" />
                <p className="mt-4 text-gray-600 font-medium">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : (
              <CheckOutResultsTable
                bookings={checkOut.results}
                onSelectBooking={checkOut.handleSelectBooking}
              />
            )}
          </>
        ) : (
          <ModernCheckOutDetails
            booking={checkOut.selectedBooking}
            bookingRooms={checkOut.selectedBookingRooms}
            onAddService={() => checkOut.setShowAddServiceModal(true)}
            onAddPenalty={() => checkOut.setShowAddPenaltyModal(true)}
            onAddSurcharge={() => checkOut.setShowAddSurchargeModal(true)}
            onCompleteCheckout={handleCompleteCheckout}
            onViewBill={checkOut.handleViewBill}
            onBack={checkOut.handleBackToSearch}
            onConfirmPayment={checkOut.handleConfirmPayment}
            showPaymentModal={checkOut.showPaymentModal}
            setShowPaymentModal={checkOut.setShowPaymentModal}
            isLoading={checkOut.isLoading}
          />
        )}
      </div>

      {/* Modals */}
      <AddServiceModal
        open={checkOut.showAddServiceModal}
        onOpenChange={checkOut.setShowAddServiceModal}
        onConfirm={handleAddService}
      />

      <AddPenaltyModal
        open={checkOut.showAddPenaltyModal}
        onOpenChange={checkOut.setShowAddPenaltyModal}
        onConfirm={handleAddPenalty}
      />

      <AddSurchargeModal
        open={checkOut.showAddSurchargeModal}
        onOpenChange={checkOut.setShowAddSurchargeModal}
        onConfirm={handleAddSurcharge}
      />

      <PaymentModal
        open={checkOut.showPaymentModal}
        onOpenChange={checkOut.setShowPaymentModal}
        summary={null}
        onConfirm={handleConfirmPayment}
      />

      {/* Final Payment Modal - View Bill and Pay Remaining Balance */}
      {checkOut.selectedBooking && (
        <FinalPaymentModal
          isOpen={checkOut.showFinalPaymentModal}
          onClose={() => checkOut.setShowFinalPaymentModal(false)}
          onSuccess={checkOut.handleFinalPaymentSuccess}
          booking={checkOut.selectedBooking}
        />
      )}
    </div>
  );
}
