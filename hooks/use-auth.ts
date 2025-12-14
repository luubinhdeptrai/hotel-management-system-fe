"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Employee, AuthTokens } from "@/lib/types/auth";
import { authService } from "@/lib/services/auth.service";
import { ApiError } from "@/lib/services/api";

interface UseAuthReturn {
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // First check local storage for stored user
        const storedUser = authService.getStoredUser();

        if (storedUser && authService.isAuthenticated()) {
          setUser(storedUser);

          // Optionally verify with backend
          try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
          } catch {
            // If API fails but we have stored user, keep using it
            console.warn("Failed to refresh user from API, using stored user");
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.login(email, password);
        setUser(response.user);
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.statusCode === 401) {
            setError("Email hoặc mật khẩu không đúng");
          } else {
            setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
          }
        } else {
          setError(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
          );
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear local state even if API fails
      setUser(null);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };
}

export default useAuth;
