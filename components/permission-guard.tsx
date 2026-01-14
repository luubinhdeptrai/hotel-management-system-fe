"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";

interface PermissionGuardProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermissions();

  // For admin users, show content immediately (don't wait for permission loading)
  // Check both role field and roleRef.name - be more defensive
  const isAdmin = user && (
    user.role === "ADMIN" || 
    user.roleRef?.name === "ADMIN" ||
    (user as any).role === "ADMIN" ||
    // Also consider admin if they have admin-level permissions
    hasPermission("employee:create") // Check for a known admin permission
  );
  
  if (isAdmin) {
    return <>{children}</>;
  }

  // Show nothing while loading permissions for non-admin users
  if (isLoading) {
    return <>{fallback}</>;
  }

  const hasPerm = hasPermission(permission);
  
  if (!hasPerm) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}