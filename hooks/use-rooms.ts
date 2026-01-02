"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { roomService } from "@/lib/services/room.service";
import type {
  Room,
  RoomStatus,
  CreateRoomRequest,
  UpdateRoomRequest,
  GetRoomsParams,
} from "@/lib/types/api";
import { useNotification } from "./use-notification";
import { getAccessToken } from "@/lib/services/api";

interface UseRoomsOptions {
  initialFilters?: GetRoomsParams;
  autoLoad?: boolean;
}

interface RoomFilters {
  search?: string;
  status?: RoomStatus;
  floor?: number;
  roomTypeId?: string;
}

export function useRooms(options: UseRoomsOptions = {}) {
  const { initialFilters, autoLoad = true } = options;
  const { showSuccess } = useNotification();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: initialFilters?.page || 1,
    limit: initialFilters?.limit || 100,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<RoomFilters>({
    search: initialFilters?.search,
    status: initialFilters?.status,
    floor: initialFilters?.floor,
    roomTypeId: initialFilters?.roomTypeId,
  });

  // Sort state
  const [sortBy, setSortBy] = useState<GetRoomsParams["sortBy"]>(
    initialFilters?.sortBy || "roomNumber"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    initialFilters?.sortOrder || "asc"
  );

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  /**
   * Load rooms from API
   */
  const loadRooms = useCallback(async () => {
    try {
      if (!getAccessToken()) {
        setError("Chưa đăng nhập");
        return;
      }

      setLoading(true);
      setError(null);

      const params: GetRoomsParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters,
      };

      const response = await roomService.getRooms(params);

      setRooms(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));

      // Also load all rooms for statistics (without pagination)
      if (pagination.page === 1) {
        const allResponse = await roomService.getRooms({ limit: 100 });
        setAllRooms(allResponse.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách phòng";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters]);

  /**
   * Create new room
   */
  const createRoom = useCallback(
    async (data: CreateRoomRequest) => {
      try {
        setLoading(true);
        const newRoom = await roomService.createRoom(data);
        await loadRooms();
        showSuccess("Thêm phòng thành công!");
        return newRoom;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể tạo phòng";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadRooms, showSuccess]
  );

  /**
   * Update room
   */
  const updateRoom = useCallback(
    async (roomId: string, data: UpdateRoomRequest) => {
      try {
        setLoading(true);
        const updatedRoom = await roomService.updateRoom(roomId, data);
        await loadRooms();
        showSuccess("Cập nhật phòng thành công!");
        return updatedRoom;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể cập nhật phòng";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadRooms, showSuccess]
  );

  /**
   * Delete room
   */
  const deleteRoom = useCallback(
    async (roomId: string) => {
      try {
        setIsDeleting(roomId);
        await roomService.deleteRoom(roomId);
        await loadRooms();
        showSuccess("Xóa phòng thành công!");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không thể xóa phòng";
        setError(message);
        throw err;
      } finally {
        setIsDeleting(null);
      }
    },
    [loadRooms, showSuccess]
  );

  /**
   * Handle modal operations
   */
  const handleAddNew = useCallback(() => {
    setEditingRoom(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((room: Room) => {
    setEditingRoom(room);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: CreateRoomRequest | UpdateRoomRequest) => {
      if (editingRoom) {
        await updateRoom(editingRoom.id, data as UpdateRoomRequest);
      } else {
        await createRoom(data as CreateRoomRequest);
      }
      setModalOpen(false);
    },
    [editingRoom, createRoom, updateRoom]
  );

  const handleDelete = useCallback(
    async (roomId: string) => {
      await deleteRoom(roomId);
    },
    [deleteRoom]
  );

  /**
   * Filter handlers
   */
  const handleSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<RoomFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Pagination handlers
   */
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Sort handlers
   */
  const handleSort = useCallback(
    (field: GetRoomsParams["sortBy"]) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    },
    [sortBy]
  );

  /**
   * Statistics from all rooms
   */
  const statistics = useMemo(() => {
    const total = allRooms.length;
    const available = allRooms.filter((r) => r.status === "AVAILABLE").length;
    const occupied = allRooms.filter((r) => r.status === "OCCUPIED").length;
    const maintenance = allRooms.filter((r) => r.status === "MAINTENANCE").length;
    const reserved = allRooms.filter((r) => r.status === "RESERVED").length;
    const cleaning = allRooms.filter((r) => r.status === "CLEANING").length;

    return {
      total,
      available,
      occupied,
      maintenance,
      reserved,
      cleaning,
      occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(1) : "0",
    };
  }, [allRooms]);

  /**
   * Get unique floors for filter
   */
  const uniqueFloors = useMemo(() => {
    const floors = Array.from(new Set(allRooms.map((r) => r.floor))).sort(
      (a, b) => a - b
    );
    return floors;
  }, [allRooms]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Auto-load on mount and when dependencies change
   */
  useEffect(() => {
    if (autoLoad) {
      loadRooms();
    }
  }, [autoLoad, loadRooms]);

  return {
    // Data
    rooms,
    allRooms,
    loading,
    error,
    isDeleting,
    statistics,
    uniqueFloors,

    // Pagination
    pagination,
    handlePageChange,

    // Filters
    filters,
    handleSearch,
    handleFilterChange,
    clearFilters,

    // Sort
    sortBy,
    sortOrder,
    handleSort,

    // CRUD operations
    createRoom,
    updateRoom,
    deleteRoom,
    loadRooms,

    // Modal state
    modalOpen,
    setModalOpen,
    editingRoom,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,

    // Utility
    clearError,
  };
}
