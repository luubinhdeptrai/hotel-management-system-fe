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
  console.log("PermissionGuard called with permission:", permission);
  
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermissions();

  // Debug logging
  console.log("PermissionGuard Debug:", {
    permission,
    user,
    userRole: user?.role,
    userRoleRef: user?.roleRef?.name,
    isLoading,
    hasPermission: hasPermission(permission)
  });

  // For admin users, show content immediately (don't wait for permission loading)
  // Check both role field and roleRef.name - be more defensive
  const isAdmin = user && (
    user.role === "ADMIN" || 
    user.roleRef?.name === "ADMIN" ||
    (user as any).role === "ADMIN" ||
    // Also consider admin if they have admin-level permissions
    hasPermission("employee:create") // Check for a known admin permission
  );
  
  console.log("PermissionGuard - isAdmin check result:", isAdmin, "user exists:", !!user);
  
  if (isAdmin) {
    console.log("PermissionGuard - Admin detected, showing content for permission:", permission);
    return <>{children}</>;
  }

  // Show nothing while loading permissions for non-admin users
  if (isLoading) {
    console.log("PermissionGuard - Loading permissions, showing fallback for permission:", permission);
    return <>{fallback}</>;
  }

  const hasPerm = hasPermission(permission);
  console.log("PermissionGuard - hasPermission result:", hasPerm, "for permission:", permission);
  
  if (!hasPerm) {
    console.log("PermissionGuard - No permission, showing fallback for permission:", permission);
    return <>{fallback}</>;
  }

  console.log("PermissionGuard - Has permission, showing content for permission:", permission);
  return <>{children}</>;
}