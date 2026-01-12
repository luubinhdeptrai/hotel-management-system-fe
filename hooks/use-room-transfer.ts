/**
 * Room Transfer Hook
 * Manages room change functionality for checked-in bookings
 */

import { useState, useCallback } from "react";
import { bookingService } from "@/lib/services/booking.service";
import { roomService } from "@/lib/services/room.service";
import type { BookingRoom, Room, Booking } from "@/lib/types/api";
import { useToast } from "@/hooks/use-toast";

export interface RoomTransferRequest {
  bookingRoomId: string;
  newRoomId: string;
  reason?: string;
}

export interface RoomTransferResponse {
  bookingRoom: BookingRoom;
  priceAdjustment: {
    oldPricePerNight: number;
    newPricePerNight: number;
    remainingNights: number;
    priceDifference: number;
  };
}

export function useRoomTransfer() {
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Execute room transfer
   * Calls Backend API to transfer guest to new room
   */
  const transferRoom = useCallback(
    async (
      bookingRoomId: string,
      newRoomId: string,
      reason?: string
    ): Promise<RoomTransferResponse | null> => {
      setIsTransferring(true);
      setError(null);

      try {
        const result = await bookingService.changeRoom(bookingRoomId, {
          newRoomId,
          reason,
        });

        toast({
          title: "Chuyển phòng thành công!",
          description: `Khách đã được chuyển sang phòng ${result.bookingRoom.room?.roomNumber || "mới"}`,
        });

        return result;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể chuyển phòng. Vui lòng thử lại.";
        setError(errorMessage);

        toast({
          title: "Chuyển phòng thất bại",
          description: errorMessage,
          variant: "destructive",
        });

        return null;
      } finally {
        setIsTransferring(false);
      }
    },
    [toast]
  );

  return {
    transferRoom,
    isTransferring,
    error,
  };
}

export interface UseCheckedInRoomsReturn {
  checkedInRooms: BookingRoom[];
  isLoading: boolean;
  error: string | null;
  refreshCheckedInRooms: () => Promise<void>;
}

/**
 * Fetch all checked-in booking rooms
 * These are rooms eligible for transfer
 */
export function useCheckedInRooms(): UseCheckedInRoomsReturn {
  const [checkedInRooms, setCheckedInRooms] = useState<BookingRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCheckedInRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all CHECKED_IN bookings
      const response = await bookingService.getAllBookings({
        status: "CHECKED_IN",
        page: 1,
        limit: 100, // Backend max limit is 100
      });

      // Extract all booking rooms from checked-in bookings
      const rooms: BookingRoom[] = [];
      response.data.forEach((booking: Booking) => {
        if (booking.bookingRooms) {
          // Only include rooms with CHECKED_IN status
          const checkedInBookingRooms = booking.bookingRooms.filter(
            (br) => br.status === "CHECKED_IN"
          );
          // Ensure booking reference is attached to each room
          checkedInBookingRooms.forEach((br) => {
            br.booking = booking;
          });
          rooms.push(...checkedInBookingRooms);
        }
      });

      setCheckedInRooms(rooms);
    } catch (err: any) {
      const errorMessage =
        err?.message || "Không thể tải danh sách phòng đang thuê";
      setError(errorMessage);
      console.error("Failed to fetch checked-in rooms:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    checkedInRooms,
    isLoading,
    error,
    refreshCheckedInRooms,
  };
}

export interface UseAvailableRoomsForTransferReturn {
  availableRooms: Room[];
  isLoading: boolean;
  error: string | null;
  searchAvailableRooms: (checkInDate: string, checkOutDate: string) => Promise<void>;
}

/**
 * Fetch available rooms for transfer
 * Rooms must be AVAILABLE status for immediate occupancy
 */
export function useAvailableRoomsForTransfer(): UseAvailableRoomsForTransferReturn {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAvailableRooms = useCallback(
    async (checkInDate: string, checkOutDate: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Get all available rooms (AVAILABLE status)
        const response = await roomService.getRooms({
          status: "AVAILABLE",
          page: 1,
          limit: 100, // Backend max limit is 100
        });

        setAvailableRooms(response.data);
      } catch (err: any) {
        const errorMessage =
          err?.message || "Không thể tải danh sách phòng trống";
        setError(errorMessage);
        console.error("Failed to fetch available rooms:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    availableRooms,
    isLoading,
    error,
    searchAvailableRooms,
  };
}
