/**
 * Base API Configuration
 * Centralized API client for making HTTP requests to the backend
 */

// API Base URL - Backend runs on port 8000
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";

// Storage keys for tokens
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER: "auth_user",
} as const;

// ============================================================================
// Token Management
// ============================================================================

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  // Also set cookie for middleware
  document.cookie = `auth-token=${accessToken}; path=/; max-age=${
    60 * 60 * 24 * 7
  }`; // 7 days
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  // Clear cookie
  document.cookie = "auth-token=; path=/; max-age=0";
}

// ============================================================================
// API Error Handling
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================================
// Token Refresh State (to prevent multiple refresh attempts)
// ============================================================================

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    return false;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/employee/auth/refresh-tokens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    const tokenData =
      data && typeof data === "object" && "data" in data
        ? (data as any).data
        : data;

    setTokens(tokenData.tokens.access.token, tokenData.tokens.refresh.token);

    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();
    return false;
  }
}

// ============================================================================
// Base Fetch Wrapper
// ============================================================================

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
  isRetry?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    requiresAuth = false,
    isRetry = false,
    headers: customHeaders,
    ...restOptions
  } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // If body is FormData, remove Content-Type header to let browser set it with boundary
  if (
    restOptions.body instanceof FormData ||
    (typeof FormData !== "undefined" && restOptions.body instanceof FormData)
  ) {
    delete (headers as Record<string, string>)["Content-Type"];
  }

  // Add authorization header if required
  if (requiresAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      (headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${accessToken}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    // If 401 and we haven't already retried, try to refresh token
    if (response.status === 401 && requiresAuth && !isRetry) {
      console.log("Access token expired, attempting to refresh...");

      // If already refreshing, wait for that refresh to complete
      if (isRefreshing && refreshPromise) {
        const refreshed = await refreshPromise;
        if (refreshed) {
          // Retry the original request with new token
          return apiFetch<T>(endpoint, { ...options, isRetry: true });
        } else {
          // Refresh failed, redirect to login
          clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new ApiError(401, "Session expired. Please login again.");
        }
      }

      // Start a new refresh
      isRefreshing = true;
      refreshPromise = refreshAccessToken();

      try {
        const refreshed = await refreshPromise;
        if (refreshed) {
          // Retry the original request with new token
          return apiFetch<T>(endpoint, { ...options, isRetry: true });
        } else {
          // Refresh failed, redirect to login
          clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new ApiError(401, "Session expired. Please login again.");
        }
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    if (!response.ok) {
      const errorData = isJson
        ? await response.json()
        : { message: response.statusText };
      throw new ApiError(
        response.status,
        errorData.message || "An error occurred",
        errorData
      );
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const jsonData = isJson ? await response.json() : ({} as T);
    
    // Unwrap data field if it exists (Backend response format: { data: {...} })
    if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
      return (jsonData as any).data as T;
    }
    
    return jsonData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other errors
    console.error("API Network Error:", {
      endpoint,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new ApiError(0, "Network error. Please check your connection.");
  }
}

// ============================================================================
// HTTP Method Shortcuts
// ============================================================================

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
