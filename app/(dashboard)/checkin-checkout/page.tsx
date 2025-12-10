"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckInSearch } from "@/components/checkin-checkout/check-in-search";
import { CheckInResultsTable } from "@/components/checkin-checkout/check-in-results-table";
import { CheckInModal } from "@/components/checkin-checkout/check-in-modal";
import { CheckOutSearch } from "@/components/checkin-checkout/check-out-search";
import { CheckOutResultsTable } from "@/components/checkin-checkout/check-out-results-table";
import { CheckOutDetails } from "@/components/checkin-checkout/check-out-details";
import { AddServiceModal } from "@/components/checkin-checkout/add-service-modal";
import { AddPenaltyModal } from "@/components/checkin-checkout/add-penalty-modal";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Check-in / Check-out
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Xử lý quy trình check-in và check-out cho khách hàng
        </p>
      </div>

      {/* Success Message */}
      {notification.message && (
        <Alert className="bg-success-100 border-success-600">
          <div className="text-success-600">{ICONS.CHECK}</div>
          <AlertDescription className="text-success-600">
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="checkin" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="checkin" className="gap-2">
            {ICONS.CALENDAR_CHECK}
            Check-in
          </TabsTrigger>
          <TabsTrigger value="checkout" className="gap-2">
            {ICONS.DOOR_OPEN}
            Check-out
          </TabsTrigger>
        </TabsList>

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

      <PaymentModal
        open={checkOut.showPaymentModal}
        onOpenChange={checkOut.setShowPaymentModal}
        summary={checkOut.selectedCheckout}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
