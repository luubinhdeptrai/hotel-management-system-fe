import { useState, useMemo } from "react";
import {
  mockReservations,
  convertReservationsToEvents,
} from "@/lib/mock-reservations";
import {
  Reservation,
  ReservationStatus,
  ReservationFormData,
  ReservationEvent,
} from "@/lib/types/reservation";

type ViewMode = "calendar" | "list";

export function useReservations() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [reservations, setReservations] = useState(mockReservations);

  // Filters
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState<
    ReservationStatus | "Tất cả"
  >("Tất cả");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Filter reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      if (statusFilter !== "Tất cả" && reservation.status !== statusFilter) {
        return false;
      }

      if (roomTypeFilter !== "Tất cả") {
        const hasRoomType = reservation.details.some(
          (detail) => detail.roomTypeName === roomTypeFilter
        );
        if (!hasRoomType) return false;
      }

      if (checkInDate || checkOutDate) {
        const matchesDate = reservation.details.some((detail) => {
          if (checkInDate && detail.checkInDate < checkInDate) return false;
          if (checkOutDate && detail.checkOutDate > checkOutDate) return false;
          return true;
        });
        if (!matchesDate) return false;
      }

      return true;
    });
  }, [reservations, statusFilter, roomTypeFilter, checkInDate, checkOutDate]);

  // Convert to calendar events
  const calendarEvents: ReservationEvent[] = useMemo(() => {
    return convertReservationsToEvents(filteredReservations);
  }, [filteredReservations]);

  // Handle search
  const handleSearch = () => {
    // In real app, this would trigger API call
    console.log("Searching for available rooms...", {
      checkInDate,
      checkOutDate,
      roomTypeFilter,
    });
  };

  // Handle reset filters
  const handleReset = () => {
    setCheckInDate("");
    setCheckOutDate("");
    setRoomTypeFilter("Tất cả");
    setStatusFilter("Tất cả");
  };

  // Handle create new reservation
  const handleCreateNew = () => {
    setSelectedReservation(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  // Handle edit reservation
  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  // Handle cancel reservation
  const handleCancelClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedReservation) {
      // Update reservation status
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationID === selectedReservation.reservationID
            ? { ...r, status: "Đã hủy" as ReservationStatus }
            : r
        )
      );
      setIsCancelModalOpen(false);
      setSelectedReservation(null);
    }
  };

  // Handle save reservation
  const handleSaveReservation = (data: ReservationFormData) => {
    if (formMode === "create") {
      // Create new reservation with multi-room support
      const roomSelections = data.roomSelections || [];

      if (roomSelections.length === 0) {
        console.error("No room selections provided");
        return;
      }

      // Calculate total rooms and amount
      const totalRooms = roomSelections.reduce(
        (sum, sel) => sum + sel.quantity,
        0
      );
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      const totalAmount = roomSelections.reduce((sum, sel) => {
        return sum + sel.pricePerNight * sel.quantity * nights;
      }, 0);

      // Create details for each room
      let detailCounter = 1;
      const details = roomSelections.flatMap((selection) => {
        return Array.from({ length: selection.quantity }, (_, index) => ({
          detailID: `CTD${String(reservations.length + 1).padStart(
            3,
            "0"
          )}_${detailCounter++}`,
          reservationID: `DP${String(reservations.length + 1).padStart(
            3,
            "0"
          )}`,
          roomID: `P${selection.roomTypeID}_${index + 1}`, // Mock room ID
          roomName: `${selection.roomTypeName} ${index + 1}`,
          roomTypeID: selection.roomTypeID,
          roomTypeName: selection.roomTypeName,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          status: "Đã đặt" as ReservationStatus,
          numberOfGuests: selection.numberOfGuests,
          pricePerNight: selection.pricePerNight,
        }));
      });

      const newReservation: Reservation = {
        reservationID: `DP${String(reservations.length + 1).padStart(3, "0")}`,
        customerID: `KH${String(reservations.length + 1).padStart(3, "0")}`,
        customer: {
          customerID: `KH${String(reservations.length + 1).padStart(3, "0")}`,
          customerName: data.customerName,
          phoneNumber: data.phoneNumber,
          email: data.email,
          identityCard: data.identityCard,
          address: data.address,
        },
        reservationDate: new Date().toISOString().split("T")[0],
        totalRooms,
        totalAmount,
        depositAmount: data.depositAmount,
        notes: data.notes,
        status: "Đã đặt",
        details,
      };

      setReservations((prev) => [...prev, newReservation]);
    } else if (selectedReservation) {
      // Update existing reservation
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationID === selectedReservation.reservationID
            ? {
                ...r,
                customer: {
                  ...r.customer,
                  customerName: data.customerName,
                  phoneNumber: data.phoneNumber,
                  email: data.email,
                  identityCard: data.identityCard,
                  address: data.address,
                },
                depositAmount: data.depositAmount,
                notes: data.notes,
                details: r.details.map((d) => ({
                  ...d,
                  checkInDate: data.checkInDate,
                  checkOutDate: data.checkOutDate,
                })),
              }
            : r
        )
      );
    }
  };

  // Handle view details
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedReservation(null);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedReservation(null);
  };

  return {
    // State
    viewMode,
    reservations,
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

    // Actions
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
  };
}
