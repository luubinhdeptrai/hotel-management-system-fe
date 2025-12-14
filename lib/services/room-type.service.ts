/**
 * Room Type Service
 * API calls for room type management
 * Endpoint: /v1/rooms/types
 */

import { api } from "./api";
import type {
  ApiRoomType,
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest,
  RoomTypesListResponse,
  RoomType,
} from "@/lib/types/room";
import { transformApiRoomTypeToUI } from "@/lib/types/room";

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  ROOM_TYPES: "/rooms/types",
  ROOM_TYPE_BY_ID: (id: number) => `/rooms/types/${id}`,
} as const;

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface RoomTypeListParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// Room Type API Functions
// ============================================================================

/**
 * Get all room types
 * Endpoint: GET /v1/rooms/types
 */
export async function getRoomTypes(
  params?: RoomTypeListParams
): Promise<RoomTypesListResponse> {
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
// UI Data Transformation Functions
// ============================================================================

/**
 * Get all room types transformed to UI format
 */
export async function getRoomTypesForUI(params?: RoomTypeListParams): Promise<{
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

/**
 * Check if a room type is in use (has rooms assigned)
 * Note: This should be implemented on the backend
 * For now, we'll try to delete and handle the error
 */
export async function checkRoomTypeInUse(roomTypeId: number): Promise<boolean> {
  // TODO: Backend should provide an endpoint to check if room type is in use
  // For now, return false and handle deletion errors
  return false;
}

/**
 * Transform UI RoomType to API CreateRoomTypeRequest
 */
export function transformUIToApiCreate(
  roomType: Omit<RoomType, "roomTypeID">
): CreateRoomTypeRequest {
  return {
    code: roomType.roomTypeName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 3),
    name: roomType.roomTypeName,
    basePrice: roomType.price,
    maxGuests: roomType.capacity,
    description: roomType.amenities.join(", "),
  };
}

/**
 * Transform UI RoomType to API UpdateRoomTypeRequest
 */
export function transformUIToApiUpdate(
  roomType: Partial<RoomType>
): UpdateRoomTypeRequest {
  const update: UpdateRoomTypeRequest = {};
  if (roomType.roomTypeName) update.name = roomType.roomTypeName;
  if (roomType.price !== undefined) update.basePrice = roomType.price;
  if (roomType.capacity !== undefined) update.maxGuests = roomType.capacity;
  if (roomType.amenities) update.description = roomType.amenities.join(", ");
  return update;
}
