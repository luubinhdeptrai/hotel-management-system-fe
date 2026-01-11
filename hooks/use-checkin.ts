import { logger } from "@/lib/utils/logger";
import { useState, useEffect, useCallback } from "react";
import type { Booking } from "@/lib/types/api";
import type {
  WalkInFormData,
  BackendCheckInRequest,
} from "@/lib/types/checkin-checkout";
import { bookingService } from "@/lib/services/booking.service";
import { useAuth } from "@/hooks/use-auth";

export function useCheckIn() {
  const { user, isLoading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      // Filter for CONFIRMED bookings only (ready for check-in)
      const confirmedBookings = searchResults.filter(
        (b) => b.status === "CONFIRMED"
      );
      setResults(confirmedBookings);
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
      // Call backend API to search confirmed bookings
      const searchResults = await bookingService.searchBookings(searchQuery);
      // Filter for CONFIRMED bookings only (ready for check-in)
      const confirmedBookings = searchResults.filter(
        (b) => b.status === "CONFIRMED"
      );
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

      // Refresh booking details from backend to get updated state
      if (selectedBooking?.id) {
        try {
          const bookingResponse = await bookingService.getBookingById(selectedBooking.id);
          const updatedBooking = bookingResponse.booking;
          
          if (updatedBooking) {
            // Update results with fresh data from backend
            setResults((prev) =>
              prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
            );
          }
        } catch (refreshError) {
          logger.warn("Failed to refresh booking details:", refreshError);
          // Still remove from CONFIRMED list even if refresh fails
          setResults((prev) => prev.filter((b) => b.id !== selectedBooking?.id));
        }
      }

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

      // AUTO-SELECT ROOMS: If rooms don't have specific roomIDs,
      // search for available rooms and auto-select them
      const roomsWithIds = await Promise.all(
        (data.rooms || []).map(async (roomSelection) => {
          // If roomID is already specified, use it
          if ('roomId' in roomSelection && roomSelection.roomId) {
            return roomSelection;
          }

          // Otherwise, search for available rooms of this type
          // Handle both old format (roomTypeId + count) and new format (roomId)
          const roomTypeId = (roomSelection as any).roomTypeId;
          const count = (roomSelection as any).count || 1;

          if (!roomTypeId) {
            throw new Error('Room type ID is required for walk-in booking');
          }

          logger.log(`Searching for ${count} available rooms of type ${roomTypeId}...`);

          try {
            const availableRooms = await bookingService.getAvailableRooms({
              checkInDate: data.checkInDate,
              checkOutDate: data.checkOutDate,
              roomTypeId: roomTypeId,
            });

            if (availableRooms.length < count) {
              throw new Error(
                `Not enough rooms available. Need ${count}, but only ${availableRooms.length} available.`
              );
            }

            // Use first available room
            return {
              roomId: availableRooms[0].id,
            };
          } catch (err) {
            logger.error(`Failed to auto-select rooms:`, err);
            throw err;
          }
        })
      );

      // Step 1: Create booking (with customer + room IDs)
      const bookingResponse = await bookingService.createBooking({
        customer: {
          fullName: data.customerName,
          phone: data.phoneNumber,
          idNumber: data.identityCard,
          email: data.email,
          address: data.address,
        },
        rooms: roomsWithIds as any, // Array of { roomId }
        checkInDate: new Date(data.checkInDate).toISOString(),
        checkOutDate: new Date(data.checkOutDate).toISOString(),
        totalGuests: data.numberOfGuests,
      });

      logger.log("Booking created:", bookingResponse);

      // Step 2: CRITICAL - Confirm booking first and WAIT for completion
      // ⚠️ KNOWN ISSUE: Backend does NOT have API `/employee/bookings/:id/confirm`
      // This call uses a mock fallback in bookingService.confirmBooking()
      // The booking will remain in PENDING status, causing check-in to FAIL
      // 
      // SOLUTION NEEDED:
      // - Option A: Backend adds manual confirmation API
      // - Option B: Use Transaction API to create a payment transaction
      //             which will automatically confirm the booking
      // 
      // Current workaround attempts confirmBooking but it returns mock data.
      // TODO: Replace with Transaction API for actual payment/confirmation
      await bookingService.confirmBooking(bookingResponse.bookingId);
      logger.log("Booking confirmed:", bookingResponse.bookingId);
      logger.warn("⚠️ confirmBooking used mock response - booking may still be PENDING");
      
      // Step 3: AFTER confirmation, fetch fresh booking data with updated status
      const confirmedBooking = await bookingService.getBookingById(bookingResponse.bookingId);
      logger.log("Booking refetched after confirmation:", confirmedBooking);
      
      // Step 4: NOW check-in with confirmed rooms
      if (confirmedBooking?.bookingRooms) {
        const primaryId = confirmedBooking.booking?.primaryCustomerId || confirmedBooking.booking?.primaryCustomer?.id || "";
        const checkInInfo = confirmedBooking.bookingRooms.map((br) => ({
          bookingRoomId: br.id,
          customerIds: [primaryId], // Assign primary customer
        }));

        await bookingService.checkIn({
          checkInInfo,
        });

        logger.log("Walk-in check-in successful");
        
        // Refresh search results
        await handleSearch(query);
      }

      setShowWalkInModal(false);
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
