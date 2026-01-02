import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import type { Booking } from "@/lib/types/api";
import type { WalkInFormData, BackendCheckInRequest } from "@/lib/types/checkin-checkout";
import { bookingService } from "@/lib/services/booking.service";

export function useCheckIn() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    try {
      // Call backend API to search confirmed bookings
      const searchResults = await bookingService.searchBookings(searchQuery);
      // Filter for CONFIRMED bookings only (ready for check-in)
      const confirmedBookings = searchResults.filter(b => b.status === 'CONFIRMED');
      setResults(confirmedBookings);
    } catch (error) {
      logger.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleConfirmCheckIn = async (data: BackendCheckInRequest) => {
    setIsLoading(true);
    try {
      // Call real backend API
      const response = await bookingService.checkIn(data);
      
      logger.log("Check-in successful:", response);

      // Remove from results after successful check-in
      setResults((prev) =>
        prev.filter((b) => b.id !== selectedBooking?.id)
      );

      // Reset modal
      setShowModal(false);
      setSelectedBooking(null);

      return selectedBooking?.primaryCustomer?.fullName || "Guest";
    } catch (error) {
      logger.error("Check-in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalkIn = () => {
    setShowWalkInModal(true);
  };

  const handleConfirmWalkIn = async (data: WalkInFormData) => {
    setIsLoading(true);
    try {
      logger.log("Walk-in check-in data:", data);
      
      // TODO: Implement walk-in booking creation + immediate check-in
      // const booking = await bookingService.createBooking(...);
      // const checkin = await bookingService.checkIn(...);
      
    } catch (error) {
      logger.error("Walk-in check-in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  return {
    query,
    results,
    selectedBooking,
    showModal,
    showWalkInModal,
    isLoading,
    handleSearch,
    handleSelectBooking,
    handleConfirmCheckIn,
    handleWalkIn,
    handleConfirmWalkIn,
    setShowModal,
    setShowWalkInModal,
    resetModal,
  };
}
