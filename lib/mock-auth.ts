import { User } from "../lib/types/auth";

// Mock users for testing
export const mockUsers: User[] = [
  {
    employeeId: "NV001",
    fullName: "Nguyễn Văn Admin",
    email: "admin@hotel.com",
    password: "admin123",
    role: "Admin",
    phoneNumber: "0901234567",
  },
  {
    employeeId: "NV002",
    fullName: "Trần Thị Quản Lý",
    email: "manager@hotel.com",
    password: "manager123",
    role: "Quản lý",
    phoneNumber: "0902345678",
  },
  {
    employeeId: "NV003",
    fullName: "Lê Văn Lễ Tân",
    email: "receptionist@hotel.com",
    password: "letan123",
    role: "Lễ tân",
    phoneNumber: "0903456789",
  },
];

export interface LoginCredentials {
  username: string; // Can be maNhanVien or email
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/**
 * Mock authentication function
 * Simulates login by checking credentials against mock users
 */
export async function mockLogin(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const { username, password } = credentials;

  // Find user by employeeId or email
  const user = mockUsers.find(
    (u) =>
      (u.employeeId.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === username.toLowerCase()) &&
      u.password === password
  );

  if (user) {
    // Store user in sessionStorage (for mock purposes) and localStorage (for AuthGuard compatibility)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("currentUser", JSON.stringify(user));

      // Set tokens for AuthGuard and real service compatibility
      localStorage.setItem(
        "auth_access_token",
        "mock_access_token_" + user.employeeId
      );
      localStorage.setItem(
        "auth_refresh_token",
        "mock_refresh_token_" + user.employeeId
      );
      localStorage.setItem("auth_user", JSON.stringify(user));

      // Set auth cookie for middleware
      document.cookie = `auth-token=${user.employeeId}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`; // 7 days
    }

    return {
      success: true,
      user: { ...user, password: "" }, // Don't return password
      message: "Đăng nhập thành công",
    };
  }

  return {
    success: false,
    message: "Tên đăng nhập hoặc mật khẩu không đúng",
  };
}

/**
 * Get current logged-in user from session
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = sessionStorage.getItem("currentUser");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Mock logout function
 */
export function mockLogout(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("currentUser");

    // Clear tokens for AuthGuard and real service compatibility
    localStorage.removeItem("auth_access_token");
    localStorage.removeItem("auth_refresh_token");
    localStorage.removeItem("auth_user");

    // Clear auth cookie
    document.cookie = "auth-token=; path=/; max-age=0";
  }
}
