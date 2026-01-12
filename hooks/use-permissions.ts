"use client";

import { useState, useEffect, useCallback } from "react";
import { permissionService, type PermissionResponse } from "@/lib/services/permission.service";
import { useAuth } from "@/hooks/use-auth";
import { logger } from "@/lib/utils/logger";

interface UsePermissionsReturn {
  actions: string[];
  permissions: PermissionResponse['permissions'];
  isLoading: boolean;
  error: string | null;
  hasPermission: (action: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();
  const [actions, setActions] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse['permissions']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userPermissions = await permissionService.getUserPermissions();
      setActions(userPermissions.actions);
      setPermissions(userPermissions.permissions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể tải quyền hạn";
      setError(errorMessage);
      logger.error("Failed to load permissions:", err);
      
      // Fallback: If permission endpoint fails, grant permissions based on role
      if (user?.role === "ADMIN") {
        setActions([
          "employee:create",
          "employee:update", 
          "employee:delete",
          "booking:create",
          "booking:read",
          "room:updateStatus"
        ]);
        setPermissions([
          { action: "manage", subject: "all" } // Admin can do everything
        ]);
      } else {
        setActions([]);
        setPermissions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      loadPermissions();
    }
  }, [loadPermissions, user]);

  const hasPermission = useCallback(
    (action: string): boolean => {
      // Admin always has all permissions as fallback
      if (user?.role === "ADMIN") {
        return true;
      }
      return actions.includes(action);
    },
    [actions, user?.role]
  );

  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  return {
    actions,
    permissions,
    isLoading,
    error,
    hasPermission,
    refreshPermissions,
  };
}