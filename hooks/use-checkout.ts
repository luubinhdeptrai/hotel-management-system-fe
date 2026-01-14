import { logger } from "@/lib/utils/logger";
import { useState, useEffect, useCallback } from "react";
import type { PaymentMethod as UIPaymentMethod } from "@/lib/types/payment";
import type { Booking, BookingRoom, PaymentMethod } from "@/lib/types/api";
import type {
  AddServiceFormData,
  AddPenaltyFormData,
  CheckOutFormData,
  ServiceUsageResponse,
  CheckoutSummary,
  RentalReceipt,
} from "@/lib/types/checkin-checkout";
import type { AddSurchargeFormData } from "@/components/checkin-checkout/add-surcharge-modal";
import { bookingService } from "@/lib/services/booking.service";
import { checkinCheckoutService } from "@/lib/services/checkin-checkout.service";
import { transactionService } from "@/lib/services/transaction.service";
import { useAuth } from "@/hooks/use-auth";

export function useCheckOut() {  
  const { user, isLoading: authLoading } = useAuth();
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
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null);

  // Fetch initial bookings on mount (only after auth is ready)
  const fetchInitialBookings = useCallback(async () => {
    // Skip if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch all bookings without a search query
      const searchResults = await bookingService.searchBookings("");
      // Filter for CHECKED_IN bookings only (ready for check-out)
      const checkedInBookings = searchResults.filter(
        (b) => b.status === "CHECKED_IN"
      );
      setResults(checkedInBookings);
    } catch (error) {
      logger.error("Failed to fetch initial bookings:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    fetchInitialBookings();
  }, [fetchInitialBookings]);

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

  const handleCompleteCheckout = async () => {
    // Calculate checkout summary for payment modal
    if (!selectedBooking || selectedBookingRooms.length === 0) return;

    setIsLoading(true);
    try {
      // Step 1: Verify all charges are paid by checking transactions
      const bookingBalance = parseFloat(selectedBooking.balance);

      // Format currency helper
      const formatCurrency = (amount: number | string) => {
        const value = typeof amount === "string" ? parseFloat(amount) : amount;
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value);
      };

      // If there's a significant balance remaining, require payment first
      if (bookingBalance > 100) {
        // More than 100 VND unpaid
        setIsLoading(false);
        throw new Error(
          `Còn ${formatCurrency(bookingBalance)} chưa thanh toán. Vui lòng thanh toán trước khi trả phòng.`
        );
      }

      // Step 2: Calculate checkout summary for confirmation
      const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const calculateNights = () => {
      const checkIn = new Date(selectedBooking.checkInDate);
      const checkOut = new Date(selectedBooking.checkOutDate);
      return Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
    };

    const nights = calculateNights();
    const roomTotal = selectedBookingRooms.reduce(
      (sum, br) => sum + parseFloat(br.totalAmount),
      0
    );

    // Create rental receipt for first room
    const firstRoom = selectedBookingRooms[0];
    const rentalReceipt: RentalReceipt = {
      receiptID: selectedBooking.id,
      reservationID: selectedBooking.id,
      roomID: firstRoom.roomId,
      roomName: firstRoom.room?.roomNumber || "N/A",
      roomTypeName: firstRoom.roomType?.name || "N/A",
      customerName: selectedBooking.primaryCustomer?.fullName || "Guest",
      phoneNumber: selectedBooking.primaryCustomer?.phone || "",
      identityCard: selectedBooking.primaryCustomer?.idNumber || "",
      checkInDate: formatDate(selectedBooking.checkInDate),
      checkOutDate: formatDate(selectedBooking.checkOutDate),
      numberOfGuests: selectedBooking.totalGuests,
      pricePerNight: parseFloat(firstRoom.pricePerNight),
      totalNights: nights,
      roomTotal: roomTotal,
      status: "Đang thuê",
    };

    const summary: CheckoutSummary = {
      receiptID: selectedBooking.id,
      receipt: rentalReceipt,
      services: [],
      penalties: [],
      surcharges: [],
      roomTotal,
      servicesTotal: 0,
      penaltiesTotal: 0,
      surchargesTotal: 0,
      grandTotal: roomTotal,
    };

    setCheckoutSummary(summary);
    setShowPaymentModal(true);
    } catch (error) {
      logger.error("Complete checkout failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
    method: UIPaymentMethod
  ): Promise<string> => {
    if (!selectedBooking || selectedBookingRooms.length === 0) return "";

    setIsLoading(true);
    try {
      // Convert UI payment method to API format
      const apiPaymentMethod: PaymentMethod =
        method === "Tiền mặt"
          ? "CASH"
          : method === "Thẻ tín dụng"
            ? "CREDIT_CARD"
            : "BANK_TRANSFER";

      logger.log("Creating transaction with method:", apiPaymentMethod);

      // Step 1: Create transaction (ROOM_CHARGE for room payment)
      const transactionResponse = await transactionService.createTransaction({
        bookingId: selectedBooking.id,
        bookingRoomIds: selectedBookingRooms.map((br) => br.id),
        paymentMethod: apiPaymentMethod,
        transactionType: "ROOM_CHARGE",
        description: `Payment for rooms: ${selectedBookingRooms.map((br) => br.room?.roomNumber).join(", ")}`,
      });

      logger.log("Transaction created:", transactionResponse);

      // Step 2: Perform check-out
      const checkoutData: CheckOutFormData = {
        bookingRoomIds: selectedBookingRooms.map((br) => br.id),
        notes: `Checked out with payment method: ${method}`,
      };

      const response = await bookingService.checkOut(checkoutData);

      logger.log("Check-out successful:", response);

      const roomName = selectedBookingRooms
        .map((br) => br.room?.roomNumber)
        .join(", ");

      // Remove from results and reset selected checkout
      setResults((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      setSelectedBooking(null);
      setSelectedBookingRooms([]);
      setCheckoutSummary(null);
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
    checkoutSummary,
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
