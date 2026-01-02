import { logger } from "@/lib/utils/logger";
import { useState, useEffect, useMemo } from "react";
import { roomService, roomTagService } from "@/lib/services";
import { getAccessToken } from "@/lib/services/api";
import type { 
  RoomType as ApiRoomType, 
  Room as ApiRoom,
  RoomTag as ApiRoomTag,
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest
} from "@/lib/types/api";
import { ApiError } from "@/lib/services/api";

// Local RoomType for UI compatibility (temporary - should migrate to API types)
export interface RoomType {
  roomTypeID: string;
  roomTypeName: string;
  capacity: number;
  totalBed: number;
  price: number;
  tags: string[]; // Array of tag IDs
  tagDetails?: ApiRoomTag[]; // Full tag objects
}

// Map API RoomType to local RoomType format
function mapApiToRoomType(apiType: ApiRoomType): RoomType {
  const tagIds = apiType.roomTypeTags?.map(rtt => rtt.roomTagId) || [];
  const tagDetails = apiType.roomTypeTags?.map(rtt => rtt.roomTag) || [];

  return {
    roomTypeID: apiType.id,
    roomTypeName: apiType.name,
    capacity: apiType.capacity,
    totalBed: apiType.totalBed,
    price: parseFloat(apiType.pricePerNight),
    tags: tagIds,
    tagDetails: tagDetails,
  };
}

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTags, setRoomTags] = useState<ApiRoomTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");

  useEffect(() => {
    loadRoomTypes();
    loadRoomTags();
    loadRooms();
  }, []);

  const loadRoomTypes = async () => {
    try {
      if (!getAccessToken()) {
        setError("Vui lòng đăng nhập để tiếp tục");
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await roomService.getRoomTypes({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      });
      setRoomTypes(result.data.map(mapApiToRoomType));
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể tải danh sách loại phòng";
      logger.error("Error loading room types:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomTags = async () => {
    try {
      if (!getAccessToken()) return;

      const tags = await roomTagService.getRoomTags();
      setRoomTags(tags);
    } catch (err) {
      logger.error("Error loading room tags:", err);
    }
  };

  const loadRooms = async () => {
    try {
      if (!getAccessToken()) return;

      const result = await roomService.getRooms({
        page: 1,
        limit: 100,
      });
      setRooms(result.data);
    } catch (err) {
      logger.error("Error loading rooms:", err);
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
        const updateData: UpdateRoomTypeRequest = {
          name: roomTypeData.roomTypeName,
          capacity: roomTypeData.capacity,
          totalBed: roomTypeData.totalBed,
          pricePerNight: roomTypeData.price,
          tagIds: roomTypeData.tags,
        };
        const updated = await roomService.updateRoomType(editingRoomType.roomTypeID, updateData);
        setRoomTypes(prev => prev.map(rt => 
          rt.roomTypeID === editingRoomType.roomTypeID ? mapApiToRoomType(updated) : rt
        ));
      } else {
        // Create new room type
        const createData: CreateRoomTypeRequest = {
          name: roomTypeData.roomTypeName!,
          capacity: roomTypeData.capacity!,
          totalBed: roomTypeData.totalBed!,
          pricePerNight: roomTypeData.price!,
          tagIds: roomTypeData.tags,
        };
        const created = await roomService.createRoomType(createData);
        setRoomTypes(prev => [...prev, mapApiToRoomType(created)]);
      }
      setModalOpen(false);
      setEditingRoomType(null);
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể lưu loại phòng";
      throw new Error(message);
    }
  };

  const handleDelete = async (roomTypeID: string) => {
    // Check if room type is in use
    const roomsUsingType = rooms.filter(r => r.roomTypeId === roomTypeID);
    
    if (roomsUsingType.length > 0) {
      setError(
        `Không thể xóa loại phòng này vì đang có ${roomsUsingType.length} phòng sử dụng`
      );
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setIsDeleting(roomTypeID);
      await roomService.deleteRoomType(roomTypeID);
      setRoomTypes(prev => prev.filter((rt) => rt.roomTypeID !== roomTypeID));
      setError(null);
    } catch (err) {
      logger.error("Error deleting room type:", err);
      const message = err instanceof ApiError ? err.message : 
        (err instanceof Error ? err.message : "Không thể xóa loại phòng");
      setError(message);
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
  const totalRooms = rooms.length;

  // Calculate most popular room type (based on number of rooms using that type)
  const mostPopularRoomType = useMemo(() => {
    if (rooms.length === 0) return null;

    const roomTypeCounts: Record<string, { name: string; count: number }> = {};

    rooms.forEach((room) => {
      const typeId = room.roomTypeId;
      const roomType = roomTypes.find(rt => rt.roomTypeID === typeId);
      const typeName = roomType?.roomTypeName || typeId;

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
  }, [rooms, roomTypes]);

  return {
    roomTypes: filteredRoomTypes,
    allRoomTypes: roomTypes, // Unfiltered for stats
    roomTags, // Available room tags for selection
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
