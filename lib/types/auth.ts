/**
 * Authentication Types
 * Based on swagger documentation for Hotel Management System API
 */

// ============================================================================
// User/Employee Types
// ============================================================================

import { Employee } from "./employee";

// ============================================================================
// User/Employee Types
// ============================================================================

// Legacy/UI alias if needed
export type UserGroup = {
  id: string;
  name: string;
  description?: string;
};

// Legacy User type for backwards compatibility with mock-auth
export interface User {
  employeeId: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  phoneNumber: string;
}

// ============================================================================
// Token Types
// ============================================================================

export interface Token {
  token: string;
  expires: string;
}

export interface AuthTokens {
  access: Token;
  refresh: Token;
}

// ============================================================================
// Request Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshTokensRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface LoginResponse {
  user: Employee;
  tokens: AuthTokens;
}

export interface RefreshTokensResponse {
  access: Token;
  refresh: Token;
}

// Generic API Error response
export interface ApiError {
  code: number;
  message: string;
}

// ============================================================================
// Auth State Types
// ============================================================================

export interface AuthState {
  user: Employee | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================================
// Helper function to convert Employee to legacy User type
// ============================================================================

export function employeeToUser(employee: Employee): User {
  return {
    employeeId: employee.id || employee.employeeId || "",
    fullName: employee.name || employee.fullName || "",
    email: employee.email || "",
    role: employee.role?.name || "Unknown",
    phoneNumber: employee.phoneNumber || "",
  };
}

// ============================================================================
// Helper function to convert legacy User to Employee type
// ============================================================================

export function userToEmployee(user: User): Partial<Employee> {
  return {
    id: user.employeeId,
    name: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
}
