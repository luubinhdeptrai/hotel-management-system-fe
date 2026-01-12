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
  if (user?.role === "ADMIN") {
    return <>{children}</>;
  }

  // Show nothing while loading permissions for non-admin users
  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}