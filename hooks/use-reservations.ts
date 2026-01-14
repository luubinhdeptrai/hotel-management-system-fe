import { logger } from "@/lib/utils/logger";
import { useState, useMemo, useEffect } from "react";
import { getRoomTypePrice } from "@/lib/utils";
import {
  Reservation,
  ReservationStatus,
  ReservationEvent,
} from "@/lib/types/reservation";
import { Room } from "@/lib/types/room";
import { bookingService } from "@/lib/services/booking.service";
import type { Booking } from "@/lib/types/api";
import { useAuth } from "@/hooks/use-auth";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchBookings, cancelBooking } from "@/lib/redux/slices/booking.slice";

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
      // Normalize roomName - ensure it's always in consistent format
      const normalizedRoomName = detail.roomName
        ? String(detail.roomName).trim()
        : `Phòng ${detail.roomID}`;

      events.push({
        id: detail.detailID,
        reservationID: reservation.reservationID,
        roomID: detail.roomID,
        roomName: normalizedRoomName,
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

  // Map booking status to reservation status
  const statusMap: Record<string, ReservationStatus> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đã nhận phòng",
    PARTIALLY_CHECKED_OUT: "Trả phòng một phần",
    CHECKED_OUT: "Đã trả phòng",
    CANCELLED: "Đã hủy",
  };

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    primaryCustomerId: booking.primaryCustomerId,
    checkInDate: checkInDate.toISOString().split("T")[0],
    checkOutDate: checkOutDate.toISOString().split("T")[0],
    depositRequired: parseFloat(booking.depositRequired || "0"),

    reservationID: booking.id, // Legacy
    customerID: booking.primaryCustomerId, // Legacy
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
      id: br.id,
      bookingId: booking.id,
      roomId: br.roomId,
      roomTypeId: br.roomTypeId,

      detailID: br.id,
      reservationID: booking.id,
      roomID: br.roomId,
      roomName: br.room?.roomNumber || `Phòng ${br.roomId}` || "Room",
      roomTypeID: br.roomTypeId,
      roomTypeName: br.roomType?.name || "Standard",
      checkInDate: checkInDate.toISOString().split("T")[0],
      checkOutDate: checkOutDate.toISOString().split("T")[0],
      status: (br.status as any) || (booking.status as any),
      uiStatus:
        statusMap[br.status] || statusMap[booking.status] || "Chờ xác nhận",
      numberOfGuests:
        br.bookingCustomers?.length ||
        Math.ceil(booking.totalGuests / (booking.bookingRooms?.length || 1)),
      pricePerNight: parseFloat(br.pricePerNight || "0"),
    })),
    // Use actual totalAmount from backend (sum of all BookingRoom.totalAmount)
    totalAmount: parseFloat(booking.totalAmount || "0"),
    // Backend calculates depositRequired = totalAmount * depositPercentage (from AppSettings)
    // Default depositPercentage = 30% (can be configured via AppSetting)
    depositAmount: parseFloat(booking.depositRequired || "0"),
    status: statusMap[booking.status] || "Chờ xác nhận",
    // Store backend data for accurate deposit logic
    backendStatus: booking.status, // "PENDING", "CONFIRMED", etc. - used for logic checks
    backendData: booking, // Full booking data from backend
  };
}

export function useReservations() {
  const { user, isLoading: authLoading } = useAuth();
  const dispatch = useAppDispatch();
  const { items: bookings, status } = useAppSelector((state) => state.booking);

  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const reservations = useMemo(() => {
    return bookings.map(convertBookingToReservation);
  }, [bookings]);

  const isLoading = status.isLoading;
  const error = status.error;

  // Load bookings from backend on mount
  useEffect(() => {
    if (authLoading || !user) {
      return;
    }
    dispatch(fetchBookings({ limit: 1000 }));
  }, [authLoading, user, dispatch]);

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
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );

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

    setIsSearchLoading(true);

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
          price: getRoomTypePrice(r.roomType),
          capacity: r.roomType.capacity,
        },
        roomStatus: "Sẵn sàng" as const,
        floor: r.floor,
      }));
      setAvailableRooms(convertedRooms as any);
      setIsAvailableRoomsModalOpen(true);
    } catch (err) {
      logger.error("Room search failed:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tìm phòng trống. Vui lòng thử lại.";
      alert(errorMessage);
    } finally {
      setIsSearchLoading(false);
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
    // VALIDATION: Check if booking can be edited (match Backend logic)
    // Backend constraints from booking.service.ts line 713-716:
    // - Cannot update if status = CANCELLED
    // - Cannot update if status = CHECKED_OUT
    // - Can update if status = PENDING, CONFIRMED, CHECKED_IN, PARTIALLY_CHECKED_OUT
    // MUST use backendStatus (not UI status labels) for accurate checks
    const cannotEditBackendStatuses = ["CANCELLED", "CHECKED_OUT"];

    if (cannotEditBackendStatuses.includes(reservation.backendStatus || "")) {
      logger.error(
        "Cannot edit booking with backend status:",
        reservation.backendStatus
      );
      alert(
        `Không thể chỉnh sửa đặt phòng ở trạng thái "${reservation.status}". ` +
          `Chỉ có thể chỉnh sửa đặt phòng ở trạng thái "Chờ xác nhận", "Đã xác nhận", hoặc "Đã nhận phòng".`
      );
      return;
    }

    setSelectedReservation(reservation);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  // Handle cancel reservation
  const handleCancelClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (reason?: string) => {
    if (!selectedReservation) return;

    // VALIDATION: Check if booking can be cancelled (match Backend logic)
    // Backend constraints from booking.service.ts line 664-673:
    // - Cannot cancel if status = CANCELLED
    // - Cannot cancel if status = CHECKED_IN
    // - Cannot cancel if status = CHECKED_OUT
    // MUST use backendStatus (not UI status labels) for accurate checks
    const cannotCancelBackendStatuses = [
      "CANCELLED",
      "CHECKED_IN",
      "CHECKED_OUT",
      "PARTIALLY_CHECKED_OUT",
    ];

    if (
      cannotCancelBackendStatuses.includes(
        selectedReservation.backendStatus || ""
      )
    ) {
      logger.error(
        "Cannot cancel booking with backend status:",
        selectedReservation.backendStatus
      );
      alert(
        `Không thể hủy đặt phòng ở trạng thái "${selectedReservation.status}". ` +
          `Chỉ có thể hủy đặt phòng ở trạng thái "Chờ xác nhận" hoặc "Đã xác nhận".`
      );
      return;
    }

    try {
      await dispatch(cancelBooking(selectedReservation.reservationID)).unwrap();
      await dispatch(fetchBookings({ limit: 1000 }));

      logger.log(
        "Booking cancelled successfully:",
        selectedReservation.reservationID
      );

      setIsCancelModalOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      logger.error("Failed to cancel booking:", error);
      alert(
        "Không thể hủy đặt phòng. " +
          (error instanceof Error ? error.message : "Vui lòng thử lại.")
      );
    }
  };

  // Handle view details - always open in view-only mode to see details without editing
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormMode("view");
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
