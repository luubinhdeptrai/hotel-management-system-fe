import { api } from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  Permission,
} from "@/lib/types/api";

export interface GetPermissionsParams {
  search?: string;
  type?: "SCREEN" | "ACTION";
  subject?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "type" | "subject" | "action" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface PermissionGrouped {
  subject: string;
  screens: Permission[];
  actions: Permission[];
}

export const permissionService = {
  /**
   * Get all permissions with pagination and filters
   * GET /employee/permissions
   */
  async getPermissions(
    params?: GetPermissionsParams
  ): Promise<PaginatedResponse<Permission>> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.search) queryParams.append("search", params.search);
      if (params.type) queryParams.append("type", params.type);
      if (params.subject) queryParams.append("subject", params.subject);
      if (params.page) queryParams.append("page", String(params.page));
      if (params.limit) queryParams.append("limit", String(params.limit));
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    }

    const query = queryParams.toString();
    const endpoint = `/employee/permissions${query ? `?${query}` : ""}`;

    const response = await api.get<ApiResponse<PaginatedResponse<Permission>>>(
      endpoint,
      {
        requiresAuth: true,
      }
    );

    return response && typeof response === "object" && "data" in response
      ? response.data
      : response;
  },

  /**
   * Get permissions grouped by subject
   * GET /employee/permissions/grouped
   */
  async getPermissionsGrouped(): Promise<PermissionGrouped[]> {
    const response = await api.get<ApiResponse<PermissionGrouped[]>>(
      "/employee/permissions/grouped",
      {
        requiresAuth: true,
      }
    );
    return response && typeof response === "object" && "data" in response
      ? response.data
      : response;
  },

  /**
   * Get screen permissions
   * GET /employee/permissions/screens
   */
  async getScreenPermissions(): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>(
      "/employee/permissions/screens",
      {
        requiresAuth: true,
      }
    );
    return response && typeof response === "object" && "data" in response
      ? response.data
      : response;
  },

  /**
   * Get action permissions
   * GET /employee/permissions/actions
   */
  async getActionPermissions(): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>(
      "/employee/permissions/actions",
      {
        requiresAuth: true,
      }
    );
    return response && typeof response === "object" && "data" in response
      ? response.data
      : response;
  },

  /**
   * Get permission by ID
   * GET /employee/permissions/{id}
   */
  async getPermissionById(id: string): Promise<Permission> {
    const response = await api.get<ApiResponse<Permission>>(
      `/employee/permissions/${id}`,
      {
        requiresAuth: true,
      }
    );
    return response && typeof response === "object" && "data" in response
      ? response.data
      : response;
  },

  /**
   * Get current user's permissions (Legacy/Helper)
   * GET /employee/auth/permissions
   */
  async getUserPermissions(): Promise<{
    actions: string[];
    permissions: Array<{ action: string; subject: string }>;
  }> {
    const response = await api.get<
      ApiResponse<{
        actions: string[];
        permissions: Array<{ action: string; subject: string }>;
      }>
    >("/employee/auth/permissions", { requiresAuth: true });

    const data =
      response && typeof response === "object" && "data" in response
        ? response.data
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
