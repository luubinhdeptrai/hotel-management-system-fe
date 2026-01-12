/**
 * Permission Service
 * Handles permission-related API calls
 */

import { api } from "./api";
import type { ApiResponse } from "@/lib/types/api";

export interface PermissionResponse {
  actions: string[];
  permissions: Array<{
    action: string;
    subject: string;
  }>;
}

export const permissionService = {
  /**
   * Get current user's permissions
   * GET /employee/auth/permissions
   */
  async getUserPermissions(): Promise<PermissionResponse> {
    const response = await api.get<ApiResponse<PermissionResponse>>(
      "/employee/auth/permissions",
      { requiresAuth: true }
    );

    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Check if user has specific action permission
   * @param action - Action string like "booking:create"
   */
  async checkActionPermission(action: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions();
      return permissions.actions.includes(action);
    } catch {
      return false;
    }
  },
};