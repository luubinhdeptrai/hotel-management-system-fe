import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import type { Reservation } from "@/lib/types/reservation";
import type { CheckInFormData, WalkInFormData } from "@/lib/types/checkin-checkout";
import { searchReservations } from "@/lib/mock-checkin-checkout";

export function useCheckIn() {
  const [query, setQuery] = useState("");
  // Initialize with all reservations on first render
  const [results, setResults] = useState<Reservation[]>(() =>
    searchReservations("")
  );
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const searchResults = searchReservations(searchQuery);
    setResults(searchResults);
  };

  const handleSelectReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const handleConfirmCheckIn = (data: CheckInFormData) => {
    // In real app, this would call an API
    logger.log("Check-in data:", data);

    // Remove from results after successful check-in
    setResults((prev) =>
      prev.filter((r) => r.reservationID !== data.reservationID)
    );

    return selectedReservation?.customer.customerName || "";
  };

  const handleWalkIn = () => {
    setShowWalkInModal(true);
  };

  const handleConfirmWalkIn = (data: WalkInFormData) => {
    // In real app, this would call an API to:
    // 1. Create customer record if new
    // 2. Create ad-hoc reservation
    // 3. Create rental receipt (check-in)
    // 4. Update room status
    logger.log("Walk-in check-in data:", data);
  };

  const resetModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  return {
    query,
    results,
    selectedReservation,
    showModal,
    showWalkInModal,
    handleSearch,
    handleSelectReservation,
    handleConfirmCheckIn,
    handleWalkIn,
    handleConfirmWalkIn,
    resetModal,
    setShowModal,
    setShowWalkInModal,
  };
}
