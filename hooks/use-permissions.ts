"use client";

import { usePermissions as usePermissionsContext } from "@/lib/permissions-context";

interface UsePermissionsReturn {
  actions: string[];
  permissions: import("@/lib/services/permission.service").PermissionResponse['permissions'];
  isLoading: boolean;
  error: string | null;
  hasPermission: (action: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  return usePermissionsContext();
}