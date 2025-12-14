/**
 * Authentication Service
 * Handles all auth-related API calls to the backend
 */

import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokensRequest,
  RefreshTokensResponse,
  ChangePasswordRequest,
  Employee,
  AuthTokens,
} from "@/lib/types/auth";
import {
  api,
  setTokens,
  getRefreshToken,
  clearTokens,
  AUTH_STORAGE_KEYS,
} from "./api";

// ============================================================================
// Auth Service
// ============================================================================

export const authService = {
  /**
   * Login with email and password
   * POST /auth/login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const payload: LoginRequest = { email, password };
    const response = await api.post<LoginResponse>("/auth/login", payload);

    // Store tokens and user data
    if (response.tokens) {
      setTokens(response.tokens.access.token, response.tokens.refresh.token);
    }
    if (response.user && typeof window !== "undefined") {
      localStorage.setItem(
        AUTH_STORAGE_KEYS.USER,
        JSON.stringify(response.user)
      );
    }

    return response;
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        const payload: LogoutRequest = { refreshToken };
        await api.post("/auth/logout", payload, { requiresAuth: true });
      } catch (error) {
        // Even if logout API fails, still clear local tokens
        console.warn("Logout API call failed:", error);
      }
    }

    // Always clear tokens locally
    clearTokens();
  },

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh-tokens
   */
  async refreshTokens(): Promise<AuthTokens | null> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const payload: RefreshTokensRequest = { refreshToken };
      const response = await api.post<RefreshTokensResponse>(
        "/auth/refresh-tokens",
        payload
      );

      // Update stored tokens
      setTokens(response.access.token, response.refresh.token);

      return {
        access: response.access,
        refresh: response.refresh,
      };
    } catch (error) {
      // If refresh fails, clear all tokens
      clearTokens();
      throw error;
    }
  },

  /**
   * Change user password
   * POST /auth/change-password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const payload: ChangePasswordRequest = { currentPassword, newPassword };
    await api.post("/auth/change-password", payload, { requiresAuth: true });
  },

  /**
   * Get current user profile
   * GET /auth/me
   */
  async getCurrentUser(): Promise<Employee> {
    return api.get<Employee>("/auth/me", { requiresAuth: true });
  },

  /**
   * Get stored user from localStorage
   * For quick access without API call
   */
  getStoredUser(): Employee | null {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is currently authenticated
   * Based on presence of access token
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },
};

export default authService;
