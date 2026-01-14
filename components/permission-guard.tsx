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

  // Development-only debug logging to help diagnose permission problems (no logs in production)
  if (process.env.NODE_ENV !== "production") {
    try {
      const safeUser = user
        ? {
            id: (user as any).id,
            role: (user as any).role,
            roleRefName: (user as any).roleRef?.name,
            email: (user as any).email,
          }
        : null;

      // More explicit admin detection reason to make debugging easier
      const adminReason = safeUser
        ? (safeUser.role === "ADMIN" || safeUser.roleRefName === "ADMIN" || (user as any).role === "ADMIN")
          ? "role"
          : hasPermission("employee:create")
          ? "permission:employee:create"
          : null
        : null;

      if (adminReason === "role") {
        console.debug("[PermissionGuard][ADMIN DETECTED] user has ADMIN role", { user: safeUser, permission });
      } else if (adminReason === "permission:employee:create") {
        console.debug("[PermissionGuard][ADMIN-LIKE] user has admin-like permission 'employee:create'", { user: safeUser, permission });
      }

      console.debug("[PermissionGuard] permission check", {
        permission,
        user: safeUser,
        isAdmin,
        isLoading,
        hasPermissionForRequested: hasPermission(permission),
      });
    } catch (e) {
      // Guard against logging causing runtime errors
      console.debug("[PermissionGuard] debug error", e);
    }
  }

  if (isAdmin) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[PermissionGuard] admin allowed", { permission });
    }
    return <>{children}</>;
  }

  // Show nothing while loading permissions for non-admin users
  if (isLoading) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[PermissionGuard] permissions loading, showing fallback", { permission });
    }
    return <>{fallback}</>;
  }

  const hasPerm = hasPermission(permission);
  
  if (!hasPerm) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[PermissionGuard] permission denied, rendering fallback", { permission });
    }
    return <>{fallback}</>;
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[PermissionGuard] permission granted, rendering children", { permission });
  }

  return <>{children}</>;
}