/**
 * Room Service
 * Handles all room-related API calls
 */

import { api } from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  Room,
  RoomType,
  CreateRoomRequest,
  UpdateRoomRequest,
  GetRoomsParams,
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest,
  GetRoomTypesParams,
} from "@/lib/types/api";

export const roomService = {
  // ============================================================================
  // Rooms
  // ============================================================================

  /**
   * Get all rooms with pagination and filters
   * GET /employee/rooms
   */
  async getRooms(params?: GetRoomsParams): Promise<PaginatedResponse<Room>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.floor) queryParams.append("floor", params.floor.toString());
    if (params?.roomTypeId)
      queryParams.append("roomTypeId", params.roomTypeId);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const endpoint = `/employee/rooms${query ? `?${query}` : ""}`;

    const response = await api.get<ApiResponse<PaginatedResponse<Room>>>(
      endpoint,
      { requiresAuth: true }
    );

    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Get room by ID
   * GET /employee/rooms/{roomId}
   */
  async getRoomById(roomId: string): Promise<Room> {
    const response = await api.get<ApiResponse<Room>>(
      `/employee/rooms/${roomId}`,
      { requiresAuth: true }
    );
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Create a new room
   * POST /employee/rooms
   */
  async createRoom(data: CreateRoomRequest): Promise<Room> {
    const response = await api.post<ApiResponse<Room>>(
      "/employee/rooms",
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Update room
   * PUT /employee/rooms/{roomId}
   */
  async updateRoom(roomId: string, data: UpdateRoomRequest): Promise<Room> {
    const response = await api.put<ApiResponse<Room>>(
      `/employee/rooms/${roomId}`,
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Delete room
   * DELETE /employee/rooms/{roomId}
   */
  async deleteRoom(roomId: string): Promise<void> {
    await api.delete(`/employee/rooms/${roomId}`, { requiresAuth: true });
  },

  // ============================================================================
  // Room Types
  // ============================================================================

  /**
   * Get all room types with pagination and filters
   * GET /employee/room-types
   */
  async getRoomTypes(
    params?: GetRoomTypesParams
  ): Promise<PaginatedResponse<RoomType>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.minCapacity)
      queryParams.append("minCapacity", params.minCapacity.toString());
    if (params?.maxCapacity)
      queryParams.append("maxCapacity", params.maxCapacity.toString());
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const endpoint = `/employee/room-types${query ? `?${query}` : ""}`;

    const response = await api.get<ApiResponse<PaginatedResponse<RoomType>>>(
      endpoint,
      { requiresAuth: true }
    );

    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Get room type by ID
   * GET /employee/room-types/{roomTypeId}
   */
  async getRoomTypeById(roomTypeId: string): Promise<RoomType> {
    const response = await api.get<ApiResponse<RoomType>>(
      `/employee/room-types/${roomTypeId}`,
      { requiresAuth: true }
    );
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Create a new room type
   * POST /employee/room-types
   */
  async createRoomType(data: CreateRoomTypeRequest): Promise<RoomType> {
    const response = await api.post<ApiResponse<RoomType>>(
      "/employee/room-types",
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Update room type
   * PUT /employee/room-types/{roomTypeId}
   */
  async updateRoomType(
    roomTypeId: string,
    data: UpdateRoomTypeRequest
  ): Promise<RoomType> {
    const response = await api.put<ApiResponse<RoomType>>(
      `/employee/room-types/${roomTypeId}`,
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Delete room type
   * DELETE /employee/room-types/{roomTypeId}
   */
  async deleteRoomType(roomTypeId: string): Promise<void> {
    await api.delete(`/employee/room-types/${roomTypeId}`, {
      requiresAuth: true,
    });
  },
};
