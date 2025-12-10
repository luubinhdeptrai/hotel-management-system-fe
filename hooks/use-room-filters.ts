import { useState, useMemo } from "react";
import { Room, RoomFilterOptions } from "@/lib/types/room";

interface UseRoomFiltersProps {
  rooms: Room[];
}

interface UseRoomFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: RoomFilterOptions;
  setFilters: (filters: RoomFilterOptions) => void;
  filteredRooms: Room[];
  resetFilters: () => void;
}

export function useRoomFilters({
  rooms,
}: UseRoomFiltersProps): UseRoomFiltersReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<RoomFilterOptions>({
    status: "Tất cả",
    roomType: "Tất cả",
    floor: "Tất cả",
  });

  // Filter rooms based on search query and filters
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Search filter
      const matchesSearch =
        room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomType.roomTypeName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        filters.status === "Tất cả" || room.roomStatus === filters.status;

      // Room type filter
      const matchesRoomType =
        filters.roomType === "Tất cả" || room.roomTypeID === filters.roomType;

      // Floor filter
      const matchesFloor =
        filters.floor === "Tất cả" || room.floor === filters.floor;

      return matchesSearch && matchesStatus && matchesRoomType && matchesFloor;
    });
  }, [rooms, searchQuery, filters]);

  // Reset all filters to default state
  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "Tất cả",
      roomType: "Tất cả",
      floor: "Tất cả",
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredRooms,
    resetFilters,
  };
}
