import { useState } from "react";
import type { Reservation } from "@/lib/types/reservation";
import type { CheckInFormData } from "@/lib/types/checkin-checkout";
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
    console.log("Check-in data:", data);

    // Remove from results after successful check-in
    setResults((prev) =>
      prev.filter((r) => r.reservationID !== data.reservationID)
    );

    return selectedReservation?.customer.customerName || "";
  };

  const handleWalkIn = () => {
    // This would open a walk-in form modal
    alert("Chức năng khách vãng lai (Walk-in) đang được phát triển...");
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
    handleSearch,
    handleSelectReservation,
    handleConfirmCheckIn,
    handleWalkIn,
    resetModal,
    setShowModal,
  };
}
