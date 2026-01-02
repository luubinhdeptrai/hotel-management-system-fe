import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import type { PaymentMethod } from "@/lib/types/payment";
import type { Booking, BookingRoom } from "@/lib/types/api";
import type {
  AddServiceFormData,
  AddPenaltyFormData,
  CheckOutFormData,
} from "@/lib/types/checkin-checkout";
import type { AddSurchargeFormData } from "@/components/checkin-checkout/add-surcharge-modal";
import { bookingService } from "@/lib/services/booking.service";

export function useCheckOut() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingRooms, setSelectedBookingRooms] = useState<BookingRoom[]>([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);
  const [showAddSurchargeModal, setShowAddSurchargeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    try {
      // Call backend API to search checked-in bookings
      const searchResults = await bookingService.searchBookings(searchQuery);
      // Filter for CHECKED_IN bookings only (ready for check-out)
      const checkedInBookings = searchResults.filter(b => b.status === 'CHECKED_IN');
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
    const occupiedRooms = (booking.bookingRooms || []).filter(br => br.room?.status === 'OCCUPIED');
    setSelectedBookingRooms(occupiedRooms);
  };

  const handleBackToSearch = () => {
    setSelectedBooking(null);
    setSelectedBookingRooms([]);
  };

  const handleAddService = (data: AddServiceFormData): string => {
    if (!selectedBooking) return "";
    logger.log("Add service:", data);
    // TODO: Implement service addition to booking
    return "";
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

  const handleConfirmPayment = async (method: PaymentMethod): Promise<string> => {
    if (!selectedBooking || selectedBookingRooms.length === 0) return "";

    setIsLoading(true);
    try {
      logger.log("Confirm payment with method:", method);

      const checkoutData: CheckOutFormData = {
        bookingRoomIds: selectedBookingRooms.map(br => br.id),
        notes: `Checked out with payment method: ${method}`
      };

      // Call real backend API
      const response = await bookingService.checkOut(checkoutData);
      
      logger.log("Check-out successful:", response);

      const roomName = selectedBookingRooms.map(br => br.room?.roomNumber).join(", ");
      
      // Remove from results and reset selected checkout
      setResults((prev) =>
        prev.filter((b) => b.id !== selectedBooking.id)
      );
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
    showAddServiceModal,
    showAddPenaltyModal,
    showAddSurchargeModal,
    showPaymentModal,
    isLoading,
    handleSearch,
    handleSelectBooking,
    handleBackToSearch,
    handleAddService,
    handleAddPenalty,
    handleAddSurcharge,
    handleCompleteCheckout,
    handleConfirmPayment,
    setShowAddServiceModal,
    setShowAddPenaltyModal,
    setShowAddSurchargeModal,
    setShowPaymentModal,
  };
}
