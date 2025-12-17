"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckInSearch } from "@/components/checkin-checkout/check-in-search";
import { CheckInResultsTable } from "@/components/checkin-checkout/check-in-results-table";
import { CheckInModal } from "@/components/checkin-checkout/check-in-modal";
import { WalkInModal } from "@/components/checkin-checkout/walk-in-modal";
import { CheckOutSearch } from "@/components/checkin-checkout/check-out-search";
import { CheckOutResultsTable } from "@/components/checkin-checkout/check-out-results-table";
import { CheckOutDetails } from "@/components/checkin-checkout/check-out-details";
import { AddServiceModal } from "@/components/checkin-checkout/add-service-modal";
import { AddPenaltyModal } from "@/components/checkin-checkout/add-penalty-modal";
import { AddSurchargeModal } from "@/components/checkin-checkout/add-surcharge-modal";
import { PaymentModal } from "@/components/payments/payment-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import { useCheckIn } from "@/hooks/use-checkin";
import { useCheckOut } from "@/hooks/use-checkout";
import { useNotification } from "@/hooks/use-notification";
import { mockServices } from "@/lib/mock-checkin-checkout";

export default function CheckinCheckoutPage() {
  // Custom hooks for business logic
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const notification = useNotification();

  // Check-in handlers
  const handleCheckInConfirm = (
    data: Parameters<typeof checkIn.handleConfirmCheckIn>[0]
  ) => {
    const customerName = checkIn.handleConfirmCheckIn(data);
    notification.showSuccess(
      `Đã check-in thành công cho khách ${customerName}!`
    );
  };

  // Check-out handlers
  const handleAddService = (
    data: Parameters<typeof checkOut.handleAddService>[0]
  ) => {
    const serviceName = checkOut.handleAddService(data);
    if (serviceName) {
      notification.showSuccess(`Đã thêm dịch vụ ${serviceName}!`);
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
            <span className="w-8 h-8 text-white">{ICONS.CALENDAR_CHECK}</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Check-in / Check-out
            </h1>
            <p className="text-sm text-white/90 mt-1 font-medium">
              Xử lý quy trình check-in và check-out cho khách hàng
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {notification.message && (
        <Alert className="bg-success-100 border-2 border-success-600 shadow-md">
          <div className="text-success-600">{ICONS.CHECK}</div>
          <AlertDescription className="text-success-700 font-semibold">
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="checkin" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="inline-flex h-16 items-center justify-center rounded-2xl bg-linear-to-br from-white via-gray-50 to-white p-1.5 shadow-lg border-2 border-gray-200/50">
            <TabsTrigger 
              value="checkin" 
              className="gap-3 h-full px-8 rounded-xl data-[state=active]:bg-linear-to-br data-[state=active]:from-primary-600 data-[state=active]:to-primary-500 data-[state=active]:shadow-lg data-[state=active]:text-white font-bold text-base transition-all hover:scale-105"
            >
              <span className="w-5 h-5">{ICONS.CALENDAR_CHECK}</span>
              Check-in
            </TabsTrigger>
            <TabsTrigger 
              value="checkout" 
              className="gap-3 h-full px-8 rounded-xl data-[state=active]:bg-linear-to-br data-[state=active]:from-primary-600 data-[state=active]:to-primary-500 data-[state=active]:shadow-lg data-[state=active]:text-white font-bold text-base transition-all hover:scale-105"
            >
              <span className="w-5 h-5">{ICONS.DOOR_OPEN}</span>
              Check-out
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Check-in Tab */}
        <TabsContent value="checkin" className="space-y-6">
          <CheckInSearch
            onSearch={checkIn.handleSearch}
            onWalkIn={checkIn.handleWalkIn}
          />

          <CheckInResultsTable
            reservations={checkIn.results}
            onCheckIn={checkIn.handleSelectReservation}
          />
        </TabsContent>

        {/* Check-out Tab */}
        <TabsContent value="checkout" className="space-y-6">
          {!checkOut.selectedCheckout ? (
            <>
              <CheckOutSearch onSearch={checkOut.handleSearch} />

              <CheckOutResultsTable
                rentals={checkOut.results}
                onSelectRental={checkOut.handleSelectRental}
              />
            </>
          ) : (
            <CheckOutDetails
              summary={checkOut.selectedCheckout}
              onAddService={() => checkOut.setShowAddServiceModal(true)}
              onAddPenalty={() => checkOut.setShowAddPenaltyModal(true)}
              onAddSurcharge={() => checkOut.setShowAddSurchargeModal(true)}
              onCompleteCheckout={handleCompleteCheckout}
              onBack={checkOut.handleBackToSearch}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CheckInModal
        open={checkIn.showModal}
        onOpenChange={checkIn.setShowModal}
        reservation={checkIn.selectedReservation}
        onConfirm={handleCheckInConfirm}
      />

      <WalkInModal
        open={checkIn.showWalkInModal}
        onOpenChange={checkIn.setShowWalkInModal}
        onConfirm={(data) => {
          checkIn.handleConfirmWalkIn(data);
          notification.showSuccess(`Đã check-in thành công cho khách vãng lai ${data.customerName}!`);
        }}
      />

      <AddServiceModal
        open={checkOut.showAddServiceModal}
        onOpenChange={checkOut.setShowAddServiceModal}
        services={mockServices}
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
        summary={checkOut.selectedCheckout}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}

