import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import type { PaymentMethod } from "@/lib/types/payment";
import type { Booking, BookingRoom } from "@/lib/types/api";
import type {
  AddServiceFormData,
  AddPenaltyFormData,
  CheckOutFormData,
  ServiceUsageResponse,
} from "@/lib/types/checkin-checkout";
import type { AddSurchargeFormData } from "@/components/checkin-checkout/add-surcharge-modal";
import { bookingService } from "@/lib/services/booking.service";
import { checkinCheckoutService } from "@/lib/services/checkin-checkout.service";

export function useCheckOut() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingRooms, setSelectedBookingRooms] = useState<
    BookingRoom[]
  >([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);
  const [showAddSurchargeModal, setShowAddSurchargeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFinalPaymentModal, setShowFinalPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceUsages, setServiceUsages] = useState<ServiceUsageResponse[]>(
    []
  );

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    try {
      // Call backend API to search checked-in bookings
      const searchResults = await bookingService.searchBookings(searchQuery);
      // Filter for CHECKED_IN bookings only (ready for check-out)
      const checkedInBookings = searchResults.filter(
        (b) => b.status === "CHECKED_IN"
      );
      setResults(checkedInBookings);
    } catch (error) {
      logger.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    // Get booking rooms that are OCCUPIED (not yet checked out)
    const occupiedRooms = (booking.bookingRooms || []).filter(
      (br) => br.room?.status === "OCCUPIED"
    );
    setSelectedBookingRooms(occupiedRooms);
  };

  const handleBackToSearch = () => {
    setSelectedBooking(null);
    setSelectedBookingRooms([]);
  };

  const handleAddService = async (
    data: AddServiceFormData
  ): Promise<string> => {
    if (!selectedBooking || selectedBookingRooms.length === 0) return "";

    try {
      // Use the first selected booking room for service usage
      const bookingRoomId = selectedBookingRooms[0].id;

      const response = await checkinCheckoutService.addServiceUsage({
        bookingId: selectedBooking.id,
        bookingRoomId: bookingRoomId,
        serviceId: data.serviceID,
        quantity: data.quantity,
      });

      logger.log("Service usage added:", response);

      // Track service usage locally
      setServiceUsages((prev) => [...prev, response]);

      return response.service?.name || "Service";
    } catch (error) {
      logger.error("Failed to add service:", error);
      throw error;
    }
  };

  const handleAddPenalty = (data: AddPenaltyFormData): boolean => {
    if (!selectedBooking) return false;
    logger.log("Add penalty:", data);
    // TODO: Implement penalty addition to booking
    return true;
  };

  const handleAddSurcharge = (data: AddSurchargeFormData): boolean => {
    if (!selectedBooking) return false;
    logger.log("Add surcharge:", data);
    // TODO: Implement surcharge addition to booking
    return true;
  };

  const handleCompleteCheckout = () => {
    // Open payment modal instead of native confirm
    setShowPaymentModal(true);
  };

  // Open final payment modal to view bill and pay remaining balance
  const handleViewBill = () => {
    setShowFinalPaymentModal(true);
  };

  // Handle final payment success - refresh booking data
  const handleFinalPaymentSuccess = async () => {
    setShowFinalPaymentModal(false);
    // Refresh booking data to reflect payment
    if (selectedBooking) {
      try {
        const updatedBookings = await bookingService.searchBookings(
          selectedBooking.bookingCode || ""
        );
        const updated = updatedBookings.find(
          (b) => b.id === selectedBooking.id
        );
        if (updated) {
          setSelectedBooking(updated);
        }
      } catch (error) {
        logger.error("Failed to refresh booking:", error);
      }
    }
  };

  const handleConfirmPayment = async (
    method: PaymentMethod
  ): Promise<string> => {
    if (!selectedBooking || selectedBookingRooms.length === 0) return "";

    setIsLoading(true);
    try {
      logger.log("Confirm payment with method:", method);

      const checkoutData: CheckOutFormData = {
        bookingRoomIds: selectedBookingRooms.map((br) => br.id),
        notes: `Checked out with payment method: ${method}`,
      };

      // Call real backend API
      const response = await bookingService.checkOut(checkoutData);

      logger.log("Check-out successful:", response);

      const roomName = selectedBookingRooms
        .map((br) => br.room?.roomNumber)
        .join(", ");

      // Remove from results and reset selected checkout
      setResults((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      setSelectedBooking(null);
      setSelectedBookingRooms([]);
      setShowPaymentModal(false);

      return roomName;
    } catch (error) {
      logger.error("Check-out failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    results,
    selectedBooking,
    selectedBookingRooms,
    serviceUsages,
    showAddServiceModal,
    showAddPenaltyModal,
    showAddSurchargeModal,
    showPaymentModal,
    showFinalPaymentModal,
    isLoading,
    handleSearch,
    handleSelectBooking,
    handleBackToSearch,
    handleAddService,
    handleAddPenalty,
    handleAddSurcharge,
    handleCompleteCheckout,
    handleConfirmPayment,
    handleViewBill,
    handleFinalPaymentSuccess,
    setShowAddServiceModal,
    setShowAddPenaltyModal,
    setShowAddSurchargeModal,
    setShowPaymentModal,
    setShowFinalPaymentModal,
  };
}
