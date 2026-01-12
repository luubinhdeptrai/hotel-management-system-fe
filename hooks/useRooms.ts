/**
 * useRooms Hook
 * React Query hook for room management and housekeeping workflow
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import roomsApi, {
  RoomFilters,
  RoomStatusFE,
  RoomFE,
} from "@/lib/api/rooms.api";

// ===== QUERY KEYS =====
export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (filters?: RoomFilters) => [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, "detail"] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
  housekeeping: () => [...roomKeys.all, "housekeeping"] as const,
  stats: () => [...roomKeys.all, "stats"] as const,
};

// ===== HOOKS =====

/**
 * Fetch all rooms with filters
 */
export const useRooms = (filters?: RoomFilters) => {
  return useQuery({
    queryKey: roomKeys.list(filters),
    queryFn: () => roomsApi.getRooms(filters),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Fetch rooms for Housekeeping (CLEANING status)
 */
export const useHousekeepingRooms = () => {
  return useQuery({
    queryKey: roomKeys.housekeeping(),
    queryFn: () => roomsApi.getHousekeepingRooms(),
    refetchInterval: 60000, // Auto-refresh every minute for housekeeping
    staleTime: 30000,
  });
};

/**
 * Fetch single room by ID
 */
export const useRoom = (roomId: string) => {
  return useQuery({
    queryKey: roomKeys.detail(roomId),
    queryFn: () => roomsApi.getRoomById(roomId),
    enabled: !!roomId,
  });
};

/**
 * Fetch housekeeping statistics
 */
export const useHousekeepingStats = () => {
  return useQuery({
    queryKey: roomKeys.stats(),
    queryFn: () => roomsApi.getHousekeepingStats(),
    refetchInterval: 60000, // Auto-refresh every minute
    staleTime: 30000,
  });
};

/**
 * Update room status mutation
 */
export const useUpdateRoomStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      newStatus,
    }: {
      roomId: string;
      newStatus: RoomStatusFE;
    }) => roomsApi.updateRoomStatus(roomId, newStatus),

    onMutate: async ({ roomId, newStatus }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: roomKeys.all });

      // Snapshot previous value
      const previousRooms = queryClient.getQueryData(roomKeys.housekeeping());

      // Optimistically update
      queryClient.setQueryData(roomKeys.housekeeping(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((room: RoomFE) =>
            room.roomID === roomId ? { ...room, roomStatus: newStatus } : room
          ),
        };
      });

      return { previousRooms };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRooms) {
        queryClient.setQueryData(
          roomKeys.housekeeping(),
          context.previousRooms
        );
      }
      toast.error("Lỗi cập nhật trạng thái phòng", {
        description: err instanceof Error ? err.message : "Vui lòng thử lại",
      });
    },

    onSuccess: (data, variables) => {
      toast.success("Cập nhật thành công", {
        description: `Phòng ${data.roomNumber} → ${variables.newStatus}`,
      });
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
};

/**
 * Batch update multiple room statuses
 */
export const useBatchUpdateRoomStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      updates: Array<{ roomId: string; status: RoomStatusFE }>
    ) => roomsApi.updateMultipleRoomStatuses(updates),

    onSuccess: (data) => {
      toast.success("Cập nhật hàng loạt thành công", {
        description: `Đã cập nhật ${data.length} phòng`,
      });
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },

    onError: (err) => {
      toast.error("Lỗi cập nhật hàng loạt", {
        description: err instanceof Error ? err.message : "Vui lòng thử lại",
      });
    },
  });
};
