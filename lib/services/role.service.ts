/**
 * Role Service
 * Handles role management API calls
 * Backend: roommaster-be/src/routes/v1/employee/role.route.ts
 */

import { api } from "./api";
import type { Role, Permission } from "@/lib/types/employee";
import type { PaginatedResponse, ApiResponse } from "@/lib/types/api";

const BASE_PATH = "/employee/roles";

// Request Types
export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface RoleFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const roleService = {
  /**
   * Create a new role
   * POST /employee/roles
   */
  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await api.post<ApiResponse<Role>>(BASE_PATH, data, {
      requiresAuth: true,
    });
    // Handle potential wrapper
    return (response as any).data || response;
  },

  /**
   * Get all roles with pagination
   * GET /employee/roles
   */
  async getRoles(filters: RoleFilters = {}): Promise<PaginatedResponse<Role>> {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.isActive !== undefined)
      params.append("isActive", String(filters.isActive));
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await api.get<any>(`${BASE_PATH}?${params.toString()}`, {
      requiresAuth: true,
    });

    // Normalize response
    return response.data || response;
  },

  /**
   * Get role by ID
   * GET /employee/roles/:id
   */
  async getRoleById(id: string): Promise<Role> {
    const response = await api.get<ApiResponse<Role>>(`${BASE_PATH}/${id}`, {
      requiresAuth: true,
    });
    return (response as any).data || response;
  },

  /**
   * Update role
   * PATCH /employee/roles/:id
   */
  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    const response = await api.patch<ApiResponse<Role>>(
      `${BASE_PATH}/${id}`,
      data,
      {
        requiresAuth: true,
      }
    );
    return (response as any).data || response;
  },

  /**
   * Delete role
   * DELETE /employee/roles/:id
   */
  async deleteRole(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`, {
      requiresAuth: true,
    });
  },

  /**
   * Get role permissions
   * GET /employee/roles/:id/permissions
   */
  async getRolePermissions(id: string): Promise<Permission[]> {
    const response = await api.get<ApiResponse<Permission[]>>(
      `${BASE_PATH}/${id}/permissions`,
      {
        requiresAuth: true,
      }
    );
    return (response as any).data || response;
  },
};
