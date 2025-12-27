import { logger } from "@/lib/utils/logger";
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
import { Room } from "@/lib/types/room";
import { searchAvailableRooms } from "@/lib/mock-rooms";

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
  const [isAvailableRoomsModalOpen, setIsAvailableRoomsModalOpen] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Room selection state (for optional specific room selection during booking)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomSelectionModalOpen, setIsRoomSelectionModalOpen] =
    useState(false);

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

  // Handle search for available rooms
  const handleSearch = () => {
    if (!checkInDate || !checkOutDate) {
      alert("Vui lòng chọn ngày đến và ngày đi!");
      return;
    }

    logger.log("Searching for available rooms...", {
      checkInDate,
      checkOutDate,
      roomTypeFilter,
    });

    // Search available rooms
    const rooms = searchAvailableRooms(
      checkInDate,
      checkOutDate,
      roomTypeFilter !== "Tất cả" ? roomTypeFilter : undefined
    );

    setAvailableRooms(rooms);
    setIsAvailableRoomsModalOpen(true);
  };

  // Handle reset filters
  const handleReset = () => {
    setCheckInDate("");
    setCheckOutDate("");
    setRoomTypeFilter("Tất cả");
    setStatusFilter("Tất cả");
  };

  // Handle room selection from available rooms modal
  const handleSelectRoom = (room: Room) => {
    logger.log("Room selected:", room);
    setSelectedRoom(room);
    setIsAvailableRoomsModalOpen(false);
    setIsRoomSelectionModalOpen(true); // Show confirmation modal
  };

  // Handle confirm room selection
  const handleConfirmRoomSelection = () => {
    // The form will handle adding this room to the booking
    setIsRoomSelectionModalOpen(false);
  };

  // Handle clear room selection
  const handleClearRoomSelection = () => {
    setSelectedRoom(null);
    setIsRoomSelectionModalOpen(false);
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
        logger.error("No room selections provided");
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

  const handleCloseAvailableRoomsModal = () => {
    setIsAvailableRoomsModalOpen(false);
  };

  const handleCloseRoomSelectionModal = () => {
    setIsRoomSelectionModalOpen(false);
    setSelectedRoom(null);
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
    isAvailableRoomsModalOpen,
    availableRooms,
    selectedReservation,
    formMode,
    selectedRoom,
    isRoomSelectionModalOpen,

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
    handleCloseAvailableRoomsModal,
    handleSelectRoom,
    handleConfirmRoomSelection,
    handleClearRoomSelection,
    handleCloseRoomSelectionModal,
  };
}
