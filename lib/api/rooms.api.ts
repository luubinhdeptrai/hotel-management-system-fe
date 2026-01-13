/**
 * Rooms API Service
 * Handles room management and status updates for Housekeeping workflow
 */

import { apiFetch } from "../services/api";

// ===== TYPE DEFINITIONS =====

/**
 * Backend Room Status Enum (from Prisma)
 */
export type RoomStatusBE =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

/**
 * Frontend Room Status (Vietnamese labels for UI)
 */
export type RoomStatusFE =
  | "Sẵn sàng"      // AVAILABLE
  | "Đã đặt"        // RESERVED
  | "Đang thuê"     // OCCUPIED
  | "Đang dọn"      // CLEANING
  | "Bảo trì"       // MAINTENANCE
  | "Ngừng phục vụ" // OUT_OF_SERVICE
  | "Bẩn"           // Special housekeeping state (needs cleaning)
  | "Đang kiểm tra"; // Special housekeeping state (inspection)

/**
 * Room data from Backend API
 */
export interface RoomBE {
  id: string;
  roomNumber: string;
  floor: number;
  code?: string;
  status: RoomStatusBE;
  roomTypeId: string;
  roomType: {
    id: string;
    name: string;
    capacity: number;
    pricePerNight: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookingRooms: number;
  };
}

/**
 * Room data for Frontend usage
 */
export interface RoomFE {
  roomID: string;
  roomName: string;
  roomNumber: string;
  floor: number;
  roomStatus: RoomStatusFE;
  roomTypeID: string;
  roomType: {
    roomTypeID: string;
    roomTypeName: string;
    capacity: number;
    pricePerNight: number;
  };
}

/**
 * Filters for room queries
 */
export interface RoomFilters {
  search?: string;
  status?: RoomStatusBE;
  floor?: number;
  roomTypeId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ===== STATUS MAPPING =====

/**
 * Map Backend status to Frontend Vietnamese labels
 */
export const mapStatusBEtoFE = (status: RoomStatusBE): RoomStatusFE => {
  const mapping: Record<RoomStatusBE, RoomStatusFE> = {
    AVAILABLE: "Sẵn sàng",
    RESERVED: "Đã đặt",
    OCCUPIED: "Đang thuê",
    CLEANING: "Đang dọn",
    MAINTENANCE: "Bảo trì",
    OUT_OF_SERVICE: "Ngừng phục vụ",
  };
  return mapping[status];
};

/**
 * Map Frontend status to Backend enum
 * Note: "Bẩn" and "Đang kiểm tra" are special FE-only states for housekeeping workflow
 */
export const mapStatusFEtoBE = (status: RoomStatusFE): RoomStatusBE => {
  const mapping: Record<RoomStatusFE, RoomStatusBE> = {
    "Sẵn sàng": "AVAILABLE",
    "Đã đặt": "RESERVED",
    "Đang thuê": "OCCUPIED",
    "Đang dọn": "CLEANING",
    "Bảo trì": "MAINTENANCE",
    "Ngừng phục vụ": "OUT_OF_SERVICE",
    // Housekeeping special states map to CLEANING
    "Bẩn": "CLEANING",
    "Đang kiểm tra": "CLEANING",
  };
  return mapping[status];
};

/**
 * Transform Backend Room to Frontend format
 */
export const transformRoomBEtoFE = (roomBE: RoomBE): RoomFE => {
  return {
    roomID: roomBE.id,
    roomName: `Phòng ${roomBE.roomNumber}`,
    roomNumber: roomBE.roomNumber,
    floor: roomBE.floor,
    roomStatus: mapStatusBEtoFE(roomBE.status),
    roomTypeID: roomBE.roomTypeId,
    roomType: {
      roomTypeID: roomBE.roomType.id,
      roomTypeName: roomBE.roomType.name,
      capacity: roomBE.roomType.capacity,
      pricePerNight: parseFloat(roomBE.roomType.pricePerNight),
    },
  };
};

// ===== API FUNCTIONS =====

/**
 * Fetch all rooms with filters
 */
export const getRooms = async (filters?: RoomFilters) => {
  const params = new URLSearchParams();

  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.floor) params.append("floor", filters.floor.toString());
  if (filters?.roomTypeId) params.append("roomTypeId", filters.roomTypeId);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", Math.min(filters.limit, 50).toString()); // Cap at 50
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const endpoint = `/employee/rooms${params.toString() ? '?' + params.toString() : ''}`;
  console.log('[getRooms] Fetching from:', endpoint);

  // API response is wrapped: { data: { data: [...], total, page, limit } }
  const apiResponse = await apiFetch<{
    data: {
      data: RoomBE[];
      total: number;
      page: number;
      limit: number;
    };
  }>(endpoint, {
    requiresAuth: true,
  });

  const response = apiResponse.data; // Unwrap outer data wrapper
  console.log('[getRooms] Response:', { total: response.total, count: response.data.length, data: response.data });
  
  const transformed = {
    ...response,
    data: response.data.map(transformRoomBEtoFE),
  };
  
  console.log('[getRooms] Transformed:', { count: transformed.data.length });
  return transformed;
};

/**
 * Fetch rooms for Housekeeping (CLEANING status only)
 */
export const getHousekeepingRooms = async () => {
  console.log('[getHousekeepingRooms] Fetching CLEANING status rooms...');
  const result = await getRooms({
    status: "CLEANING",
    limit: 50, // Safe limit
  });
  console.log('[getHousekeepingRooms] Result:', result);
  return result;
};

/**
 * Get single room by ID
 */
export const getRoomById = async (roomId: string) => {
  const response = await apiFetch<{ data: RoomBE }>(
    `/employee/rooms/${roomId}`,
    { requiresAuth: true }
  );
  return transformRoomBEtoFE(response.data);
};

/**
 * Update room status
 * This is the KEY function for Housekeeping workflow
 */
export const updateRoomStatus = async (
  roomId: string,
  newStatus: RoomStatusFE
): Promise<RoomFE> => {
  const statusBE = mapStatusFEtoBE(newStatus);

  const response = await apiFetch<{ data: RoomBE }>(
    `/employee/rooms/${roomId}`,
    {
      method: "PUT",
      body: JSON.stringify({ status: statusBE }),
      requiresAuth: true,
    }
  );

  return transformRoomBEtoFE(response.data);
};

/**
 * Batch update multiple room statuses
 */
export const updateMultipleRoomStatuses = async (
  updates: Array<{ roomId: string; status: RoomStatusFE }>
) => {
  const promises = updates.map(({ roomId, status }) =>
    updateRoomStatus(roomId, status)
  );
  return Promise.all(promises);
};

/**
 * Get room statistics for Housekeeping dashboard
 */
export const getHousekeepingStats = async () => {
  // Fetch all rooms with safe limit
  const allRooms = await getRooms({ limit: 50 }); // Safe limit

  const stats = {
    total: allRooms.total,
    cleaning: 0, // CLEANING status
    available: 0, // AVAILABLE
    occupied: 0, // OCCUPIED
    maintenance: 0, // MAINTENANCE
  };

  allRooms.data.forEach((room) => {
    switch (room.roomStatus) {
      case "Đang dọn":
      case "Bẩn":
      case "Đang kiểm tra":
        stats.cleaning++;
        break;
      case "Sẵn sàng":
        stats.available++;
        break;
      case "Đang thuê":
        stats.occupied++;
        break;
      case "Bảo trì":
        stats.maintenance++;
        break;
    }
  });

  return stats;
};

export default {
  getRooms,
  getHousekeepingRooms,
  getRoomById,
  updateRoomStatus,
  updateMultipleRoomStatuses,
  getHousekeepingStats,
  mapStatusBEtoFE,
  mapStatusFEtoBE,
};
