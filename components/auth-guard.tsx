"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { logger } from "@/lib/utils/logger";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();

      if (!isAuthenticated) {
        logger.log("User not authenticated, redirecting to login");
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Set up interval to check token expiration every minute
    // This helps catch token expiration proactively
    const tokenCheckInterval = setInterval(() => {
      const isAuthenticated = authService.isAuthenticated();
      if (!isAuthenticated) {
        logger.log("Token expired during check, redirecting to login");
        clearInterval(tokenCheckInterval);
        router.push("/login");
      }
    }, 60000); // Check every 1 minute

    return () => clearInterval(tokenCheckInterval);
  }, [router]);

  // Show nothing while checking auth to prevent flash of protected content
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
