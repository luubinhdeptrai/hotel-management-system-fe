import { logger } from "@/lib/utils/logger";
import { useState, useMemo, useEffect } from "react";
import {
  Reservation,
  ReservationStatus,
  ReservationFormData,
  ReservationEvent,
} from "@/lib/types/reservation";
import { Room } from "@/lib/types/room";
import { bookingService } from "@/lib/services/booking.service";
import type { CreateBookingRequest, Booking } from "@/lib/types/api";

type ViewMode = "calendar" | "list";

/**
 * Convert reservations to calendar events
 */
function convertReservationsToEvents(
  reservations: Reservation[]
): ReservationEvent[] {
  const events: ReservationEvent[] = [];

  reservations.forEach((reservation) => {
    reservation.details.forEach((detail) => {
      events.push({
        id: detail.detailID,
        reservationID: reservation.reservationID,
        roomID: detail.roomID,
        roomName: detail.roomName,
        customerName: reservation.customer.customerName,
        start: new Date(detail.checkInDate),
        end: new Date(detail.checkOutDate),
        status: detail.status,
        numberOfGuests: detail.numberOfGuests,
      });
    });
  });

  return events;
}

/**
 * Convert Booking entity to Reservation format for UI compatibility
 */
function convertBookingToReservation(booking: Booking): Reservation {
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const numberOfNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Map booking status to reservation status
  const statusMap: Record<string, ReservationStatus> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đã nhận phòng",
    CHECKED_OUT: "Đã trả phòng",
    CANCELLED: "Đã hủy",
  };

  return {
    reservationID: booking.id,
    customerID: booking.primaryCustomerId,
    customer: {
      customerID: booking.primaryCustomerId,
      customerName: booking.primaryCustomer?.fullName || "Unknown",
      phoneNumber: booking.primaryCustomer?.phone || "",
      email: booking.primaryCustomer?.email,
      identityCard: booking.primaryCustomer?.idNumber || "",
      address: booking.primaryCustomer?.address || "",
    },
    reservationDate: booking.createdAt,
    totalRooms: booking.bookingRooms?.length || 1,
    details: (booking.bookingRooms || []).map((br) => ({
      detailID: br.id,
      reservationID: booking.id,
      roomID: br.roomId,
      roomName: br.room?.roomNumber || "Room",
      roomTypeID: br.roomTypeId,
      roomTypeName: br.roomType?.name || "Standard",
      checkInDate: checkInDate.toISOString().split("T")[0],
      checkOutDate: checkOutDate.toISOString().split("T")[0],
      status: statusMap[booking.status] || "Chờ xác nhận",
      numberOfGuests: Math.ceil(
        booking.totalGuests / (booking.bookingRooms?.length || 1)
      ),
      pricePerNight:
        parseInt(booking.totalAmount || "0") /
        numberOfNights /
        (booking.bookingRooms?.length || 1),
    })),
    totalAmount: parseInt(booking.totalAmount || "0"),
    depositAmount: parseInt(booking.depositRequired || "0"),
    status: statusMap[booking.status] || "Chờ xác nhận",
  };
}

export function useReservations() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bookings from backend on mount
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await bookingService.getAllBookings();
        const bookings = response.data || [];
        const converted = bookings.map(convertBookingToReservation);
        setReservations(converted);
        logger.log("Loaded bookings from backend:", converted);
      } catch (err) {
        logger.error("Failed to load bookings:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách đặt phòng. Vui lòng thử lại.";
        setError(errorMessage);
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

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
  const [isAvailableRoomsModalOpen, setIsAvailableRoomsModalOpen] =
    useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Room selection state (for optional specific room selection during booking)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomSelectionModalOpen, setIsRoomSelectionModalOpen] =
    useState(false);

  // Deposit modal state - for confirming deposit after booking creation
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [createdBookingInfo, setCreatedBookingInfo] = useState<{
    bookingId: string;
    bookingCode: string;
    totalAmount: number;
    depositRequired: number;
    customerName: string;
  } | null>(null);

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

  // Handle search for available rooms (Find tab)
  const handleSearch = async (
    findCheckInDate: string,
    findCheckOutDate: string,
    findRoomType: string
  ) => {
    if (!findCheckInDate || !findCheckOutDate) {
      alert("Vui lòng chọn ngày đến và ngày đi!");
      return;
    }

    logger.log("Searching for available rooms...", {
      checkInDate: findCheckInDate,
      checkOutDate: findCheckOutDate,
      roomTypeFilter: findRoomType,
    });

    setIsLoading(true);
    setError(null);

    try {
      const apiRooms = await bookingService.getAvailableRooms({
        checkInDate: findCheckInDate,
        checkOutDate: findCheckOutDate,
        roomTypeId: findRoomType !== "Tất cả" ? findRoomType : undefined,
      });

      // Convert API rooms to local Room type
      const convertedRooms: Room[] = apiRooms.map((r) => ({
        roomID: r.id,
        roomName: r.roomNumber,
        roomTypeID: r.roomType.id,
        roomType: {
          roomTypeID: r.roomType.id,
          roomTypeName: r.roomType.name,
          price: parseInt(r.roomType.pricePerNight),
          capacity: r.roomType.capacity,
        },
        roomStatus: "Sẵn sàng" as const,
        floor: r.floor,
      }));
      setAvailableRooms(convertedRooms);
      setIsAvailableRoomsModalOpen(true);
    } catch (err) {
      logger.error("Room search failed:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tìm phòng trống. Vui lòng thử lại.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter for calendar/list (Filter tab) - doesn't open modal
  const handleFilterBookings = () => {
    // Filter state is already set by onCheckInChange, onCheckOutChange, etc.
    // The calendar and list will automatically update via filteredReservations
    logger.log("Filtering bookings...", {
      checkInDate,
      checkOutDate,
      roomTypeFilter,
      statusFilter,
    });
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

  const handleConfirmCancel = async () => {
    if (selectedReservation) {
      try {
        // Call cancel API
        await bookingService.cancelBooking(
          selectedReservation.reservationID,
          "Hủy theo yêu cầu"
        );
        logger.log(
          "Booking cancelled via API:",
          selectedReservation.reservationID
        );
      } catch (error) {
        logger.error("Cancel API failed, updating local state:", error);
      }

      // Update local state regardless of API success (mock fallback in service)
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
  const handleSaveReservation = async (data: ReservationFormData) => {
    if (formMode === "create") {
      // Create new reservation with multi-room support
      const roomSelections = data.roomSelections || [];

      if (roomSelections.length === 0) {
        logger.error("No room selections provided");
        return;
      }

      try {
        // Get dates from first room selection (all rooms may have different dates)
        // For API, we use the earliest check-in and latest check-out
        const allCheckIns = roomSelections
          .map((s) => s.checkInDate)
          .filter(Boolean);
        const allCheckOuts = roomSelections
          .map((s) => s.checkOutDate)
          .filter(Boolean);

        if (allCheckIns.length === 0 || allCheckOuts.length === 0) {
          logger.error("No dates found in room selections");
          return;
        }

        // Use first room's dates (or earliest/latest if needed)
        const checkInDateStr = allCheckIns[0];
        const checkOutDateStr = allCheckOuts[0];

        // Convert dates to ISO 8601 format
        // Parse the date and set appropriate times (check-in at 14:00, check-out at 12:00)
        const parseToISO = (dateStr: string, hours: number): string => {
          // Handle both "YYYY-MM-DD" and ISO formats
          const [year, month, day] = dateStr.split("-").map(Number);
          if (year && month && day) {
            const d = new Date(Date.UTC(year, month - 1, day, hours, 0, 0));
            return d.toISOString();
          }
          // Fallback: try parsing as-is
          const date = new Date(dateStr);
          date.setUTCHours(hours, 0, 0, 0);
          return date.toISOString();
        };

        const checkInISO = parseToISO(checkInDateStr, 14);
        const checkOutISO = parseToISO(checkOutDateStr, 12);

        // Transform to backend-compatible CreateBookingRequest
        const createBookingRequest: CreateBookingRequest = {
          // Include customer info for new booking (required by backend)
          customer: {
            fullName: data.customerName,
            phone: data.phoneNumber,
            idNumber: data.identityCard,
            email: data.email,
            address: data.address,
          },
          rooms: roomSelections.map((sel) => ({
            roomTypeId: sel.roomTypeID,
            count: sel.quantity,
          })),
          checkInDate: checkInISO,
          checkOutDate: checkOutISO,
          totalGuests: roomSelections.reduce(
            (sum, sel) => sum + sel.numberOfGuests,
            0
          ),
        };

        // Call real backend API
        const response = await bookingService.createBooking(
          createBookingRequest
        );

        logger.log("Booking created successfully:", response);

        // Update local state with mock data for now (in real app, fetch from backend)
        // Calculate total rooms
        const totalRooms = roomSelections.reduce(
          (sum, sel) => sum + sel.quantity,
          0
        );

        // Calculate total amount properly based on each room's specific dates
        const totalAmount = roomSelections.reduce((sum, sel) => {
          if (!sel.checkInDate || !sel.checkOutDate) return sum;
          const start = new Date(sel.checkInDate);
          const end = new Date(sel.checkOutDate);
          const n = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + sel.pricePerNight * sel.quantity * (n > 0 ? n : 0);
        }, 0);

        // Create details for each room
        let detailCounter = 1;
        const details = roomSelections.flatMap((selection) => {
          // Use specific dates for this room selection
          const selCheckIn = selection.checkInDate;
          const selCheckOut = selection.checkOutDate;

          return Array.from({ length: selection.quantity }, (_, index) => ({
            detailID: `CTD${String(reservations.length + 1).padStart(
              3,
              "0"
            )}_${detailCounter++}`,
            reservationID:
              response.bookingCode ||
              `DP${String(reservations.length + 1).padStart(3, "0")}`,
            roomID: `P${selection.roomTypeID}_${index + 1}`, // Mock room ID
            roomName: `${selection.roomTypeName} ${index + 1}`,
            roomTypeID: selection.roomTypeID,
            roomTypeName: selection.roomTypeName,
            checkInDate: selCheckIn,
            checkOutDate: selCheckOut,
            status: "Đã đặt" as ReservationStatus,
            numberOfGuests: selection.numberOfGuests,
            pricePerNight: selection.pricePerNight,
          }));
        });

        const newReservation: Reservation = {
          reservationID:
            response.bookingCode ||
            `DP${String(reservations.length + 1).padStart(3, "0")}`,
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

        // Set booking info for deposit confirmation modal
        setCreatedBookingInfo({
          bookingId: response.id || newReservation.reservationID,
          bookingCode: response.bookingCode || newReservation.reservationID,
          totalAmount: parseInt(response.totalAmount) || totalAmount,
          depositRequired:
            parseInt(response.depositRequired) || Math.round(totalAmount * 0.3),
          customerName: data.customerName,
        });

        // Open deposit confirmation modal
        setIsDepositModalOpen(true);
      } catch (error) {
        logger.error("Failed to create booking:", error);
        throw error;
      }
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

  // Handle deposit modal close
  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
  };

  // Handle deposit success
  const handleDepositSuccess = () => {
    // Update local state to mark booking as confirmed
    if (createdBookingInfo) {
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationID === createdBookingInfo.bookingCode
            ? { ...r, status: "Đã xác nhận" as ReservationStatus }
            : r
        )
      );
    }
    setCreatedBookingInfo(null);
    setIsDepositModalOpen(false);
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
    isDepositModalOpen,
    createdBookingInfo,
    isLoading,
    error,

    // Actions
    setViewMode,
    setCheckInDate,
    setCheckOutDate,
    setRoomTypeFilter,
    setStatusFilter,
    handleSearch,
    handleFilterBookings,
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
    handleCloseDepositModal,
    handleDepositSuccess,
  };
}
