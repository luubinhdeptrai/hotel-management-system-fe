import { useState, useEffect, useMemo } from "react";
import { RoomType } from "@/lib/types/room";
import {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  checkRoomTypeInUse,
} from "@/lib/mock-room-types";
import { mockRooms } from "@/lib/mock-rooms";

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      const data = await getRoomTypes();
      setRoomTypes(data);
      setError(null);
    } catch (err) {
      console.error("Error loading room types:", err);
      setError("Không thể tải danh sách loại phòng");
    } finally {
      setLoading(false);
    }
  };

  // Filtered room types based on search and filters
  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter((rt) => {
      // Search filter
      const matchesSearch = rt.roomTypeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Price filter
      let matchesPrice = true;
      if (priceFilter === "budget") matchesPrice = rt.price < 500000;
      else if (priceFilter === "standard")
        matchesPrice = rt.price >= 500000 && rt.price < 1000000;
      else if (priceFilter === "premium")
        matchesPrice = rt.price >= 1000000 && rt.price < 2000000;
      else if (priceFilter === "luxury") matchesPrice = rt.price >= 2000000;

      // Capacity filter
      let matchesCapacity = true;
      if (capacityFilter === "1-2") matchesCapacity = rt.capacity <= 2;
      else if (capacityFilter === "3-4")
        matchesCapacity = rt.capacity >= 3 && rt.capacity <= 4;
      else if (capacityFilter === "5+") matchesCapacity = rt.capacity >= 5;

      return matchesSearch && matchesPrice && matchesCapacity;
    });
  }, [roomTypes, searchTerm, priceFilter, capacityFilter]);

  const handleAddNew = () => {
    setEditingRoomType(null);
    setModalOpen(true);
  };

  const handleEdit = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setModalOpen(true);
  };

  const handleSave = async (roomTypeData: Partial<RoomType>) => {
    try {
      if (editingRoomType) {
        // Update existing room type
        await updateRoomType(editingRoomType.roomTypeID, roomTypeData);
      } else {
        // Create new room type
        await createRoomType(roomTypeData as Omit<RoomType, "roomTypeID">);
      }
      await loadRoomTypes();
      setModalOpen(false);
      setEditingRoomType(null);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Không thể lưu loại phòng"
      );
    }
  };

  const handleDelete = async (roomTypeID: string) => {
    // Check if room type is in use
    const inUse = checkRoomTypeInUse(roomTypeID);

    if (inUse) {
      setError(
        "Không thể xóa loại phòng đang được sử dụng. Bạn chỉ có thể chỉnh sửa thông tin."
      );
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setIsDeleting(roomTypeID);
      await deleteRoomType(roomTypeID);
      await loadRoomTypes();
      setError(null);
    } catch (err) {
      console.error("Error deleting room type:", err);
      setError(err instanceof Error ? err.message : "Không thể xóa loại phòng");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSelectTemplate = (template: RoomType) => {
    setEditingRoomType(template);
    setModalOpen(true);
  };

  const clearError = () => {
    setError(null);
  };

  // Filter handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterByPrice = (range: string) => {
    setPriceFilter(range);
  };

  const handleFilterByCapacity = (capacity: string) => {
    setCapacityFilter(capacity);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setPriceFilter("all");
    setCapacityFilter("all");
  };

  // Calculate total rooms
  const totalRooms = mockRooms.length;

  // Calculate most popular room type (based on number of rooms using that type)
  const mostPopularRoomType = useMemo(() => {
    if (mockRooms.length === 0) return null;

    const roomTypeCounts: Record<string, { name: string; count: number }> = {};

    mockRooms.forEach((room) => {
      const typeId = room.roomTypeID;
      const typeName = room.roomType?.roomTypeName || typeId;

      if (!roomTypeCounts[typeId]) {
        roomTypeCounts[typeId] = { name: typeName, count: 0 };
      }
      roomTypeCounts[typeId].count++;
    });

    // Find the type with most rooms
    let maxCount = 0;
    let popularType: { name: string; count: number } | null = null;

    Object.values(roomTypeCounts).forEach((type) => {
      if (type.count > maxCount) {
        maxCount = type.count;
        popularType = type;
      }
    });

    return popularType;
  }, []);

  return {
    roomTypes: filteredRoomTypes,
    allRoomTypes: roomTypes, // Unfiltered for stats
    loading,
    modalOpen,
    editingRoomType,
    isDeleting,
    error,
    totalRooms,
    mostPopularRoomType,
    setModalOpen,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    handleSelectTemplate,
    clearError,
    handleSearch,
    handleFilterByPrice,
    handleFilterByCapacity,
    handleResetFilters,
  };
}
