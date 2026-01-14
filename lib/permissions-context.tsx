"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { permissionService, type PermissionResponse } from "@/lib/services/permission.service";
import { useAuth } from "@/hooks/use-auth";
import { logger } from "@/lib/utils/logger";

interface PermissionsContextType {
  actions: string[];
  permissions: PermissionResponse['permissions'];
  isLoading: boolean;
  error: string | null;
  hasPermission: (action: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
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

      // Even if API succeeds, ensure admin gets all permissions
      // Check for admin in multiple ways: role field, roleRef, or admin-level permissions
      const isAdmin = user && (
        user.role === "ADMIN" ||
        user.roleRef?.name === "ADMIN" ||
        (user as any).role === "ADMIN" ||
        // Also consider admin if they have admin-level permissions
        userPermissions.actions.some(action => action.includes('employee:') || action.includes('role:'))
      );

      if (isAdmin) {
        setActions([
          // All permissions for admin
          "employee:create", "employee:read", "employee:update", "employee:delete",
          "booking:create", "booking:read", "booking:update", "booking:checkIn", "booking:checkOut", "booking:cancel",
          "room:create", "room:read", "room:update", "room:updateStatus", "room:delete",
          "customer:create", "customer:read", "customer:update", "customer:delete",
          "service:create", "service:read", "service:update", "service:delete",
          "transaction:create", "transaction:read", "transaction:update", "transaction:delete",
          "report:create", "report:read", "report:update", "report:delete", "report:view",
          "promotion:create", "promotion:read", "promotion:update", "promotion:delete",
          "penalty:create", "penalty:read", "penalty:update", "penalty:delete",
          "surcharge:create", "surcharge:read", "surcharge:update", "surcharge:delete",
          "roomType:create", "roomType:read", "roomType:update", "roomType:delete",
          "roomTag:create", "roomTag:read", "roomTag:update", "roomTag:delete",
          "appSettings:create", "appSettings:read", "appSettings:update", "appSettings:delete"
        ]);
        setPermissions([
          { action: "manage", subject: "all" } // Admin can do everything
        ]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể tải quyền hạn";
      setError(errorMessage);
      logger.error("Failed to load permissions:", err);

      // Fallback: If permission endpoint fails, grant permissions based on role
      const isAdmin = user && (
        user.role === "ADMIN" ||
        user.roleRef?.name === "ADMIN" ||
        (user as any).role === "ADMIN"
      );

      if (isAdmin) {
        setActions([
          // All permissions for admin
          "employee:create", "employee:read", "employee:update", "employee:delete",
          "booking:create", "booking:read", "booking:update", "booking:checkIn", "booking:checkOut", "booking:cancel",
          "room:create", "room:read", "room:update", "room:updateStatus", "room:delete",
          "customer:create", "customer:read", "customer:update", "customer:delete",
          "service:create", "service:read", "service:update", "service:delete",
          "transaction:create", "transaction:read", "transaction:update", "transaction:delete",
          "report:create", "report:read", "report:update", "report:delete", "report:view",
          "promotion:create", "promotion:read", "promotion:update", "promotion:delete",
          "penalty:create", "penalty:read", "penalty:update", "penalty:delete",
          "surcharge:create", "surcharge:read", "surcharge:update", "surcharge:delete",
          "roomType:create", "roomType:read", "roomType:update", "roomType:delete",
          "roomTag:create", "roomTag:read", "roomTag:update", "roomTag:delete",
          "appSettings:create", "appSettings:read", "appSettings:update", "appSettings:delete"
        ]);
        setPermissions([
          { action: "manage", subject: "all" } // Admin can do everything
        ]);
      } else if (user?.role === "RECEPTIONIST") {
        setActions([
          // Receptionist permissions
          "booking:create", "booking:read", "booking:update", "booking:checkIn", "booking:checkOut", "booking:cancel",
          "room:read", "room:updateStatus",
          "roomType:read",
          "customer:create", "customer:read", "customer:update",
          "service:read",
          "transaction:create", "transaction:read",
          "report:view"
        ]);
        setPermissions([
          { action: "read", subject: "Booking" },
          { action: "create", subject: "Booking" },
          { action: "update", subject: "Booking" },
          { action: "read", subject: "Room" },
          { action: "update", subject: "Room" },
          { action: "read", subject: "Customer" },
          { action: "create", subject: "Customer" },
          { action: "update", subject: "Customer" },
          { action: "read", subject: "Service" },
          { action: "read", subject: "Transaction" },
          { action: "create", subject: "Transaction" },
          { action: "read", subject: "Report" }
        ]);
      } else if (user?.role === "HOUSEKEEPING") {
        setActions([
          // Housekeeping permissions
          "room:read", "room:updateStatus",
          "roomType:read",
          "booking:read"
        ]);
        setPermissions([
          { action: "read", subject: "Room" },
          { action: "update", subject: "Room" },
          { action: "read", subject: "Booking" }
        ]);
      } else if (user?.role === "STAFF") {
        setActions([
          // Staff permissions (view-only)
          "booking:read",
          "room:read",
          "roomType:read",
          "customer:read",
          "service:read"
        ]);
        setPermissions([
          { action: "read", subject: "Booking" },
          { action: "read", subject: "Room" },
          { action: "read", subject: "Customer" },
          { action: "read", subject: "Service" }
        ]);
      } else {
        setActions([]);
        setPermissions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, user?.roleRef?.name]);

  useEffect(() => {
    if (user) {
      loadPermissions();
    } else {
      // Reset permissions when user logs out
      setActions([]);
      setPermissions([]);
      setIsLoading(false);
      setError(null);
    }
  }, [loadPermissions, user]);

  const hasPermission = useCallback(
    (action: string): boolean => {
      // Admin always has all permissions as fallback
      const isAdmin = user && (
        user.role === "ADMIN" ||
        user.roleRef?.name === "ADMIN" ||
        (user as any).role === "ADMIN" ||
        // Also consider admin if they have admin-level permissions
        actions.some(act => act.includes('employee:') || act.includes('role:'))
      );

      if (isAdmin) {
        return true;
      }
      return actions.includes(action);
    },
    [actions, user?.role, user?.roleRef?.name]
  );

  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  const value: PermissionsContextType = {
    actions,
    permissions,
    isLoading,
    error,
    hasPermission,
    refreshPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextType {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}