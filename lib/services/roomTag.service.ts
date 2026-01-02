/**
 * Room Tag Service
 * Handles all room tag-related API calls
 */

import { api } from "./api";
import type { ApiResponse, RoomTag } from "@/lib/types/api";

export const roomTagService = {
  /**
   * Get all room tags
   * GET /employee/room-tags
   */
  async getRoomTags(): Promise<RoomTag[]> {
    const response = await api.get<ApiResponse<RoomTag[]>>(
      "/employee/room-tags",
      { requiresAuth: true }
    );
    
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Get room tag by ID
   * GET /employee/room-tags/{tagId}
   */
  async getRoomTagById(tagId: string): Promise<RoomTag> {
    const response = await api.get<ApiResponse<RoomTag>>(
      `/employee/room-tags/${tagId}`,
      { requiresAuth: true }
    );
    
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Create new room tag
   * POST /employee/room-tags
   */
  async createRoomTag(tagData: { name: string; description?: string }): Promise<RoomTag> {
    const response = await api.post<ApiResponse<RoomTag>>(
      "/employee/room-tags",
      tagData,
      { requiresAuth: true }
    );
    
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Update room tag
   * PATCH /employee/room-tags/{tagId}
   */
  async updateRoomTag(
    tagId: string,
    tagData: { name: string; description?: string }
  ): Promise<RoomTag> {
    const response = await api.patch<ApiResponse<RoomTag>>(
      `/employee/room-tags/${tagId}`,
      tagData,
      { requiresAuth: true }
    );
    
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Delete room tag
   * DELETE /employee/room-tags/{tagId}
   */
  async deleteRoomTag(tagId: string): Promise<void> {
    await api.delete(`/employee/room-tags/${tagId}`, { requiresAuth: true });
  },
};
