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
import { transactionService } from "@/lib/services/transaction.service";
import { customerService } from "@/lib/services/customer.service";
import type { CreateBookingRequest, Booking } from "@/lib/types/api";
import { useAuth } from "@/hooks/use-auth";

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
      roomName: br.room?.roomNumber || `Phòng ${br.roomId}` || "Room",
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
  const { user, isLoading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bookings from backend on mount
  useEffect(() => {
    const loadBookings = async () => {
      // Skip if authentication is still loading or user is not authenticated
      if (authLoading || !user) {
        return;
      }

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
  }, [authLoading, user]);

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
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");

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
    // VALIDATION: Check if booking can be edited (match Backend logic)
    // Backend constraints from booking.service.ts line 691-700:
    // - Cannot update if status = CANCELLED
    // - Cannot update if status = CHECKED_OUT
    // - Can update if status = PENDING, CONFIRMED, CHECKED_IN, PARTIALLY_CHECKED_OUT
    const cannotEditStatuses: ReservationStatus[] = [
      "Đã hủy",       // CANCELLED
      "Đã trả phòng", // CHECKED_OUT
    ];

    if (cannotEditStatuses.includes(reservation.status)) {
      logger.error(
        "Cannot edit booking with status:",
        reservation.status
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
    // Backend constraints from booking.service.ts line 644-655:
    // - Cannot cancel if status = CANCELLED
    // - Cannot cancel if status = CHECKED_IN
    // - Cannot cancel if status = CHECKED_OUT
    const cannotCancelStatuses: ReservationStatus[] = [
      "Đã hủy",        // CANCELLED
      "Đã nhận phòng", // CHECKED_IN
      "Đã trả phòng",  // CHECKED_OUT
    ];

    if (cannotCancelStatuses.includes(selectedReservation.status)) {
      logger.error(
        "Cannot cancel booking with status:",
        selectedReservation.status
      );
      alert(
        `Không thể hủy đặt phòng ở trạng thái "${selectedReservation.status}". ` +
        `Chỉ có thể hủy đặt phòng ở trạng thái "Chờ xác nhận" hoặc "Đã xác nhận".`
      );
      return;
    }

    try {
      // Call cancel API (Backend does NOT accept reason parameter)
      await bookingService.cancelBooking(
        selectedReservation.reservationID
      );
      logger.log(
        "Booking cancelled successfully:",
        selectedReservation.reservationID
      );

      // Update local state after successful cancellation
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationID === selectedReservation.reservationID
            ? { ...r, status: "Đã hủy" as ReservationStatus }
            : r
        )
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

  // Handle save reservation
  const handleSaveReservation = async (data: ReservationFormData) => {
    // Don't allow saving in view mode
    if (formMode === "view") {
      return;
    }

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
        // Note: check-out time (12:00) is for the check-out DATE, which should be after check-in date
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

        // Use backend's standard times: check-in at 14:00, check-out at 12:00
        // This matches backend business rules for standard check-in/check-out times
        const checkInISO = parseToISO(checkInDateStr, 14);
        const checkOutISO = parseToISO(checkOutDateStr, 12);

        // Validate that roomSelections have roomIDs (from user selection in room-selector component)
        // The new component already provides specific roomIDs - no need for auto-selection
        const roomSelectionsWithIds = roomSelections.map((sel) => {
          if (!sel.roomID) {
            throw new Error(
              `Room selection for ${sel.roomTypeName} is missing roomID. ` +
              `Please select a specific room from the room selector.`
            );
          }
          return sel;
        });

        // Transform to backend-compatible CreateBookingRequest
        // Support both existing customer (customerId) and new customer (customer object)
        // Backend expects array of specific roomIds (not room types + count)
        const createBookingRequest: CreateBookingRequest = {
          // Include customer selection data:
          // - If useExisting = true: use customerId (backend will lookup)
          // - If useExisting = false: use customer object (backend will create or merge by phone)
          ...(data.customerSelection?.useExisting
            ? { customerId: data.customerSelection.customerId }
            : {
                customer: {
                  fullName: data.customerName,
                  phone: data.phoneNumber,
                  idNumber: data.identityCard,
                  email: data.email,
                  address: data.address,
                },
              }),
          rooms: (() => {
            // Use auto-selected roomIDs (from either user selection or auto-search above)
            return roomSelectionsWithIds.map((sel) => ({
              roomId: sel.roomID!,
            }));
          })(),
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
          // Calculate deposit as 30% of backend's total amount
          depositAmount: Math.round((response.totalAmount || totalAmount) * 0.3),
          notes: data.notes,
          status: data.depositConfirmed ? "Đã xác nhận" : "Đã đặt",
          details,
        };

        setReservations((prev) => [...prev, newReservation]);

        // If deposit was confirmed in the form, create deposit transaction
        if (data.depositConfirmed && data.depositPaymentMethod) {
          try {
            const bookingId = response.bookingId || newReservation.reservationID;
            logger.log("Creating deposit transaction for booking:", bookingId);

            await transactionService.createTransaction({
              bookingId,
              paymentMethod: data.depositPaymentMethod as "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "E_WALLET",
              transactionType: "DEPOSIT",
              employeeId: user?.id || "",
            });

            logger.log("Deposit transaction created successfully");
          } catch (depositError) {
            // Log error but don't fail the whole booking
            logger.error("Failed to create deposit transaction:", depositError);
            // Update status back to pending since deposit failed
            setReservations((prev) =>
              prev.map((r) =>
                r.reservationID === newReservation.reservationID
                  ? { ...r, status: "Đã đặt" as ReservationStatus }
                  : r
              )
            );
          }
        }
      } catch (error) {
        logger.error("Failed to create booking:", error);
        throw error;
      }
    } else if (selectedReservation) {
      // Update existing reservation
      try {
        const roomSelections = data.roomSelections || [];

        // Get dates from room selections (use first room's dates as primary)
        const allCheckIns = roomSelections
          .map((s) => s.checkInDate)
          .filter(Boolean);
        const allCheckOuts = roomSelections
          .map((s) => s.checkOutDate)
          .filter(Boolean);

        // Use existing dates if no new room selections provided
        const checkInDateStr =
          allCheckIns[0] || selectedReservation.details[0]?.checkInDate;
        const checkOutDateStr =
          allCheckOuts[0] || selectedReservation.details[0]?.checkOutDate;

        // Convert dates to ISO 8601 format
        const parseToISO = (dateStr: string, hours: number): string => {
          const [year, month, day] = dateStr.split("-").map(Number);
          if (year && month && day) {
            const d = new Date(Date.UTC(year, month - 1, day, hours, 0, 0));
            return d.toISOString();
          }
          const date = new Date(dateStr);
          date.setUTCHours(hours, 0, 0, 0);
          return date.toISOString();
        };

        const checkInISO = checkInDateStr
          ? parseToISO(checkInDateStr, 0)
          : undefined;
        const checkOutISO = checkOutDateStr
          ? parseToISO(checkOutDateStr, 23)
          : undefined;

        // Calculate total guests from room selections or use existing
        const totalGuests =
          roomSelections.length > 0
            ? roomSelections.reduce((sum, sel) => sum + sel.numberOfGuests, 0)
            : selectedReservation.details.reduce(
                (sum, d) => sum + (d.numberOfGuests || 0),
                0
              );

        // Check if deposit was already confirmed (status is not PENDING)
        const wasDepositConfirmed =
          selectedReservation.status === "Đã xác nhận" ||
          selectedReservation.status === "Đã đặt" ||
          selectedReservation.status === "Đã nhận phòng" ||
          selectedReservation.status === "Đã nhận";

        // Update customer information first (if changed)
        try {
          const customer = selectedReservation.customer;
          // Check if customer data has changed
          const hasCustomerChanged =
            customer.customerName !== data.customerName ||
            customer.phoneNumber !== data.phoneNumber ||
            customer.email !== data.email ||
            customer.identityCard !== data.identityCard ||
            customer.address !== data.address;

          if (hasCustomerChanged && customer.customerID) {
            logger.log("Updating customer information:", customer.customerID);
            await customerService.updateCustomer(customer.customerID, {
              fullName: data.customerName,
              email: data.email,
              idNumber: data.identityCard,
              address: data.address,
            });
            logger.log("Customer information updated successfully");
          }
        } catch (customerError) {
          logger.error("Failed to update customer information:", customerError);
          // Continue with booking update even if customer update fails
          // The error will be logged but won't block the reservation update
        }

        // Call update API (without status - status changes via transaction API)
        await bookingService.updateBooking(selectedReservation.reservationID, {
          checkInDate: checkInISO,
          checkOutDate: checkOutISO,
          totalGuests: totalGuests || undefined,
        });

        logger.log(
          "Booking updated successfully:",
          selectedReservation.reservationID
        );

        // Track if we successfully confirmed deposit
        let depositConfirmedSuccessfully = false;

        // If deposit was newly confirmed (checkbox checked and wasn't confirmed before), create deposit transaction
        // The transaction API will change the status from PENDING to CONFIRMED on the backend
        if (
          data.depositConfirmed &&
          !wasDepositConfirmed &&
          data.depositPaymentMethod
        ) {
          try {
            logger.log(
              "Creating deposit transaction for booking:",
              selectedReservation.reservationID
            );

            await transactionService.createTransaction({
              bookingId: selectedReservation.reservationID,
              paymentMethod: data.depositPaymentMethod as "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "E_WALLET",
              transactionType: "DEPOSIT",
              employeeId: user?.id || "",
            });

            logger.log(
              "Deposit transaction created successfully - status will be updated to CONFIRMED"
            );
            depositConfirmedSuccessfully = true;
          } catch (depositError) {
            // Log error but don't fail the whole update
            logger.error("Failed to create deposit transaction:", depositError);
          }
        }

        // Determine new status for local state update
        let newStatus: ReservationStatus = selectedReservation.status;
        if (depositConfirmedSuccessfully) {
          newStatus = "Đã xác nhận";
        }

        // Calculate new total amount if room selections changed
        const totalAmount =
          roomSelections.length > 0
            ? roomSelections.reduce((total, selection) => {
                if (!selection.checkInDate || !selection.checkOutDate)
                  return total;
                const start = new Date(selection.checkInDate);
                const end = new Date(selection.checkOutDate);
                const n = Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  total +
                  selection.pricePerNight * selection.quantity * (n > 0 ? n : 0)
                );
              }, 0)
            : selectedReservation.totalAmount;

        // Update local state
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
                  paidDeposit: data.depositConfirmed
                    ? Math.round(totalAmount * 0.3)
                    : r.paidDeposit,
                  notes: data.notes,
                  status: newStatus,
                  totalAmount,
                  totalRooms:
                    roomSelections.length > 0
                      ? roomSelections.reduce((sum, s) => sum + s.quantity, 0)
                      : r.totalRooms,
                  details:
                    roomSelections.length > 0
                      ? roomSelections.flatMap((selection, selIndex) => {
                          return Array.from(
                            { length: selection.quantity },
                            (_, index) => ({
                              detailID: `${r.reservationID}_${selIndex}_${index}`,
                              reservationID: r.reservationID,
                              roomID: `P${selection.roomTypeID}_${index + 1}`,
                              roomName: `${selection.roomTypeName} ${
                                index + 1
                              }`,
                              roomTypeID: selection.roomTypeID,
                              roomTypeName: selection.roomTypeName,
                              checkInDate: selection.checkInDate,
                              checkOutDate: selection.checkOutDate,
                              status: newStatus,
                              numberOfGuests: selection.numberOfGuests,
                              pricePerNight: selection.pricePerNight,
                            })
                          );
                        })
                      : r.details.map((d) => ({
                          ...d,
                          checkInDate: checkInDateStr || d.checkInDate,
                          checkOutDate: checkOutDateStr || d.checkOutDate,
                          status: newStatus,
                        })),
                }
              : r
          )
        );
      } catch (error) {
        logger.error("Failed to update booking:", error);
        throw error;
      }
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
