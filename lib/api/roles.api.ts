/**
 * Roles API
 * - GET /employee/roles - Get all roles
 * - GET /employee/roles/{roleId} - Get role details
 */

import { apiFetch } from "@/lib/services/api";

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolesListResponse {
  data: RoleResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const rolesApi = {
  /**
   * GET /employee/roles
   * Get all roles with pagination
   */
  async getAllRoles(page = 1, limit = 100): Promise<RolesListResponse> {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      const endpoint = `/employee/roles${query ? `?${query}` : ""}`;

      const response = await apiFetch(endpoint, {
        method: "GET",
        requiresAuth: true,
      });

      // Handle the response - it could be wrapped or direct
      if (response && typeof response === "object" && "data" in response) {
        return (response as any).data;
      }

      return response as RolesListResponse;
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      throw error;
    }
  },

  /**
   * GET /employee/roles/{roleId}
   * Get role details by ID
   */
  async getRoleById(roleId: string): Promise<RoleResponse> {
    try {
      const response = await apiFetch(`/employee/roles/${roleId}`, {
        method: "GET",
        requiresAuth: true,
      });

      if (response && typeof response === "object" && "data" in response) {
        return (response as any).data;
      }

      return response as RoleResponse;
    } catch (error) {
      console.error(`Failed to fetch role ${roleId}:`, error);
      throw error;
    }
  },
};
