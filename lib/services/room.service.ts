/**
 * Room Service
 * API calls for room and room type management
 */

import { api } from "./api";
import type {
  ApiRoom,
  ApiRoomType,
  ApiRoomStatus,
  CreateRoomRequest,
  CreateRoomTypeRequest,
  UpdateRoomRequest,
  UpdateRoomTypeRequest,
  UpdateRoomStatusRequest,
  RoomListParams,
  RoomAvailabilityParams,
  RoomsListResponse,
  RoomTypesListResponse,
  Room,
  RoomType,
} from "@/lib/types/room";
import {
  transformApiRoomToUI,
  transformApiRoomTypeToUI,
} from "@/lib/types/room";

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  // Room Types
  ROOM_TYPES: "/rooms/types",
  ROOM_TYPE_BY_ID: (id: number) => `/rooms/types/${id}`,

  // Rooms
  ROOMS: "/rooms",
  ROOM_BY_ID: (id: number) => `/rooms/${id}`,
  ROOMS_AVAILABLE: "/rooms/available",
  ROOMS_AVAILABILITY: "/rooms/availability",
  ROOM_STATUS: (id: number) => `/rooms/${id}/status`,
} as const;

// ============================================================================
// Room Type API Functions
// ============================================================================

/**
 * Get all room types
 * Endpoint: GET /v1/rooms/types
 */
export async function getRoomTypes(params?: {
  page?: number;
  limit?: number;
}): Promise<RoomTypesListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const query = queryParams.toString();
  const endpoint = query
    ? `${ENDPOINTS.ROOM_TYPES}?${query}`
    : ENDPOINTS.ROOM_TYPES;

  return api.get<RoomTypesListResponse>(endpoint, {
    requiresAuth: true,
  });
}

/**
 * Get room type by ID
 * Endpoint: GET /v1/rooms/types/{roomTypeId}
 */
export async function getRoomTypeById(
  roomTypeId: number
): Promise<ApiRoomType> {
  return api.get<ApiRoomType>(ENDPOINTS.ROOM_TYPE_BY_ID(roomTypeId), {
    requiresAuth: true,
  });
}

/**
 * Create a new room type
 * Endpoint: POST /v1/rooms/types
 */
export async function createRoomType(
  data: CreateRoomTypeRequest
): Promise<ApiRoomType> {
  return api.post<ApiRoomType>(ENDPOINTS.ROOM_TYPES, data, {
    requiresAuth: true,
  });
}

/**
 * Update room type
 * Endpoint: PATCH /v1/rooms/types/{roomTypeId}
 */
export async function updateRoomType(
  roomTypeId: number,
  data: UpdateRoomTypeRequest
): Promise<ApiRoomType> {
  return api.patch<ApiRoomType>(ENDPOINTS.ROOM_TYPE_BY_ID(roomTypeId), data, {
    requiresAuth: true,
  });
}

/**
 * Delete room type
 * Endpoint: DELETE /v1/rooms/types/{roomTypeId}
 */
export async function deleteRoomType(roomTypeId: number): Promise<void> {
  return api.delete(ENDPOINTS.ROOM_TYPE_BY_ID(roomTypeId), {
    requiresAuth: true,
  });
}

// ============================================================================
// Room API Functions
// ============================================================================

/**
 * Get all rooms
 * Endpoint: GET /v1/rooms
 */
export async function getRooms(
  params?: RoomListParams
): Promise<RoomsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.roomTypeId)
    queryParams.append("roomTypeId", params.roomTypeId.toString());
  if (params?.status) queryParams.append("status", params.status);

  const query = queryParams.toString();
  const endpoint = query ? `${ENDPOINTS.ROOMS}?${query}` : ENDPOINTS.ROOMS;

  return api.get<RoomsListResponse>(endpoint, {
    requiresAuth: true,
  });
}

/**
 * Get room by ID
 * Endpoint: GET /v1/rooms/{roomId}
 */
export async function getRoomById(roomId: number): Promise<ApiRoom> {
  return api.get<ApiRoom>(ENDPOINTS.ROOM_BY_ID(roomId), {
    requiresAuth: true,
  });
}

/**
 * Create a new room
 * Endpoint: POST /v1/rooms
 */
export async function createRoom(data: CreateRoomRequest): Promise<ApiRoom> {
  return api.post<ApiRoom>(ENDPOINTS.ROOMS, data, {
    requiresAuth: true,
  });
}

/**
 * Update room
 * Endpoint: PATCH /v1/rooms/{roomId}
 */
export async function updateRoom(
  roomId: number,
  data: UpdateRoomRequest
): Promise<ApiRoom> {
  return api.patch<ApiRoom>(ENDPOINTS.ROOM_BY_ID(roomId), data, {
    requiresAuth: true,
  });
}

/**
 * Delete room
 * Endpoint: DELETE /v1/rooms/{roomId}
 */
export async function deleteRoom(roomId: number): Promise<void> {
  return api.delete(ENDPOINTS.ROOM_BY_ID(roomId), {
    requiresAuth: true,
  });
}

/**
 * Update room status
 * Endpoint: PATCH /v1/rooms/{roomId}/status
 */
export async function updateRoomStatus(
  roomId: number,
  status: ApiRoomStatus
): Promise<ApiRoom> {
  const data: UpdateRoomStatusRequest = { status };
  return api.patch<ApiRoom>(ENDPOINTS.ROOM_STATUS(roomId), data, {
    requiresAuth: true,
  });
}

/**
 * Get available rooms
 * Endpoint: GET /v1/rooms/available
 */
export async function getAvailableRooms(
  params: RoomAvailabilityParams
): Promise<RoomsListResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append("checkInDate", params.checkInDate);
  queryParams.append("checkOutDate", params.checkOutDate);
  if (params.roomTypeId)
    queryParams.append("roomTypeId", params.roomTypeId.toString());

  return api.get<RoomsListResponse>(
    `${ENDPOINTS.ROOMS_AVAILABLE}?${queryParams.toString()}`,
    {
      requiresAuth: true,
    }
  );
}

/**
 * Check room availability
 * Endpoint: GET /v1/rooms/availability
 */
export async function checkRoomAvailability(
  params: RoomAvailabilityParams
): Promise<{ available: boolean; rooms?: ApiRoom[] }> {
  const queryParams = new URLSearchParams();
  queryParams.append("checkInDate", params.checkInDate);
  queryParams.append("checkOutDate", params.checkOutDate);
  if (params.roomTypeId)
    queryParams.append("roomTypeId", params.roomTypeId.toString());

  return api.get<{ available: boolean; rooms?: ApiRoom[] }>(
    `${ENDPOINTS.ROOMS_AVAILABILITY}?${queryParams.toString()}`,
    {
      requiresAuth: true,
    }
  );
}

// ============================================================================
// UI Data Transformation Functions
// ============================================================================

/**
 * Get all rooms transformed to UI format
 */
export async function getRoomsForUI(params?: RoomListParams): Promise<{
  rooms: Room[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}> {
  const response = await getRooms(params);
  return {
    rooms: response.results.map(transformApiRoomToUI),
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
    totalResults: response.totalResults,
  };
}

/**
 * Get all room types transformed to UI format
 */
export async function getRoomTypesForUI(params?: {
  page?: number;
  limit?: number;
}): Promise<{
  roomTypes: RoomType[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}> {
  const response = await getRoomTypes(params);
  return {
    roomTypes: response.results.map(transformApiRoomTypeToUI),
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
    totalResults: response.totalResults,
  };
}
