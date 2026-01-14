import { useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchRoomTypes } from "@/lib/redux/slices/room-type.slice";
import { RoomType } from "@/lib/types/room";

export function useBookingRoomSelection() {
  const dispatch = useAppDispatch();
  const { items: apiRoomTypes, status } = useAppSelector(
    (state) => state.roomType
  );

  const isLoading = status.isLoading;

  useEffect(() => {
    // Only fetch if empty or likely stale - or just ensure data availability
    // Decided to always fetch like original component to ensure fresh availability
    dispatch(fetchRoomTypes({ limit: 100 }));
  }, [dispatch]);

  const roomTypes: RoomType[] = useMemo(() => {
    // Check if apiRoomTypes is undefined or null before mapping
    if (!apiRoomTypes) return [];

    return apiRoomTypes.map((rt: any) => ({
      roomTypeID: rt.id,
      roomTypeName: rt.name,
      price: rt.pricePerNight || rt.basePrice || 0,
      capacity: rt.capacity,
      totalBed: rt.totalBed,
      amenities: [], // Populate if available
      // Add missing fields required by RoomType interface (compatibility)
      id: rt.id,
      name: rt.name,
      basePrice: rt.pricePerNight || rt.basePrice || 0,
      roomTypeImages: [],
      createdAt: rt.createdAt || new Date().toISOString(),
      updatedAt: rt.updatedAt || new Date().toISOString(),
    }));
  }, [apiRoomTypes]);

  return {
    roomTypes,
    isLoading,
  };
}
