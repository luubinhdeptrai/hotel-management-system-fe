/**
 * Authentication Service
 * Handles all auth-related API calls to the backend
 */

import { logger } from "@/lib/utils/logger";
import type {
  ApiResponse,
  EmployeeLoginRequest,
  EmployeeAuthResponse,
  LogoutRequest,
  RefreshTokensRequest,
  RefreshTokensResponse,
  ChangePasswordRequest,
  Employee,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
} from "@/lib/types/api";
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
   * Login with username and password (Employee)
   * POST /employee/auth/login
   */
  async login(
    username: string,
    password: string
  ): Promise<EmployeeAuthResponse> {
    const payload: EmployeeLoginRequest = { username, password };
    const response = await api.post<ApiResponse<EmployeeAuthResponse>>(
      "/employee/auth/login",
      payload
    );

    logger.log("API Response:", response);

    // Handle response that's already unwrapped or wrapped
    const authData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;

    logger.log("Auth Data after unwrap:", authData);

    // Store tokens and user data
    if (authData?.tokens) {
      setTokens(
        authData.tokens.access.token,
        authData.tokens.refresh.token
      );
    }
    if (authData?.employee && typeof window !== "undefined") {
      localStorage.setItem(
        AUTH_STORAGE_KEYS.USER,
        JSON.stringify(authData.employee)
      );
    }

    return authData;
  },

  /**
   * Logout user (Employee)
   * POST /employee/auth/logout
   */
  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        const payload: LogoutRequest = { refreshToken };
        await api.post("/employee/auth/logout", payload);
      } catch (error) {
        // Even if logout API fails, still clear local tokens
        logger.warn("Logout API call failed:", error);
      }
    }

    // Always clear tokens locally
    clearTokens();
  },

  /**
   * Refresh access token using refresh token (Employee)
   * POST /employee/auth/refresh-tokens
   */
  async refreshTokens(): Promise<RefreshTokensResponse | null> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const payload: RefreshTokensRequest = { refreshToken };
      const response = await api.post<ApiResponse<RefreshTokensResponse>>(
        "/employee/auth/refresh-tokens",
        payload
      );

      // Handle response that's already unwrapped or wrapped
      const tokenData = (response && typeof response === "object" && "data" in response)
        ? (response as any).data
        : response;

      // Update stored tokens
      setTokens(
        tokenData.tokens.access.token,
        tokenData.tokens.refresh.token
      );

      return tokenData;
    } catch (error) {
      // If refresh fails, clear all tokens
      clearTokens();
      throw error;
    }
  },

  /**
   * Change employee password
   * POST /employee/profile/change-password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const payload: ChangePasswordRequest = { currentPassword, newPassword };
    await api.post("/employee/profile/change-password", payload, {
      requiresAuth: true,
    });
  },

  /**
   * Get current employee profile
   * GET /employee/profile
   */
  async getCurrentUser(): Promise<Employee> {
    const response = await api.get<ApiResponse<Employee>>(
      "/employee/profile",
      { requiresAuth: true }
    );
    const userData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return userData;
  },

  /**
   * Update employee profile
   * PATCH /employee/profile
   */
  async updateProfile(data: { name?: string }): Promise<Employee> {
    const response = await api.patch<ApiResponse<Employee>>(
      "/employee/profile",
      data,
      { requiresAuth: true }
    );
    const userData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return userData;
  },

  /**
   * Forgot password (Employee)
   * POST /employee/auth/forgot-password
   */
  async forgotPassword(username: string): Promise<ForgotPasswordResponse> {
    const payload: ForgotPasswordRequest = { username };
    const response = await api.post<ApiResponse<ForgotPasswordResponse>>(
      "/employee/auth/forgot-password",
      payload
    );
    const forgotData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return forgotData;
  },

  /**
   * Reset password (Employee)
   * POST /employee/auth/reset-password?token={token}
   */
  async resetPassword(token: string, password: string): Promise<void> {
    const payload: ResetPasswordRequest = { password };
    await api.post(
      `/employee/auth/reset-password?token=${encodeURIComponent(token)}`,
      payload
    );
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
