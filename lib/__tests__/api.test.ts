/**
 * API Integration Tests
 * Tests for critical API flows
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { authService } from "../services/auth.service";
import { customerService } from "../services/customer.service";
import { roomService } from "../services/room.service";
import * as api from "../services/api";

// Mock fetch globally
global.fetch = vi.fn();

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should login successfully with username and password", async () => {
    const mockResponse = {
      data: {
        employee: {
          id: "emp_123",
          name: "Test Employee",
          username: "testuser",
          role: "RECEPTIONIST",
          updatedAt: "2025-12-27T00:00:00Z",
        },
        tokens: {
          access: {
            token: "access_token_123",
            expires: "2025-12-27T01:00:00Z",
          },
          refresh: {
            token: "refresh_token_123",
            expires: "2025-12-28T00:00:00Z",
          },
        },
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });

    const result = await authService.login("testuser", "password123");

    expect(result.employee.username).toBe("testuser");
    expect(result.tokens.access.token).toBe("access_token_123");
    expect(localStorage.getItem("auth_access_token")).toBe("access_token_123");
  });

  it("should handle login failure with 401 error", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        code: 401,
        message: "Incorrect username or password",
      }),
    });

    await expect(
      authService.login("wronguser", "wrongpass")
    ).rejects.toThrow();
  });

  it("should logout and clear tokens", async () => {
    localStorage.setItem("auth_access_token", "test_token");
    localStorage.setItem("auth_refresh_token", "refresh_token");

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers(),
    });

    await authService.logout();

    expect(localStorage.getItem("auth_access_token")).toBeNull();
    expect(localStorage.getItem("auth_refresh_token")).toBeNull();
  });

  it("should refresh tokens successfully", async () => {
    localStorage.setItem("auth_refresh_token", "old_refresh_token");

    const mockResponse = {
      data: {
        tokens: {
          access: {
            token: "new_access_token",
            expires: "2025-12-27T02:00:00Z",
          },
          refresh: {
            token: "new_refresh_token",
            expires: "2025-12-29T00:00:00Z",
          },
        },
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });

    const result = await authService.refreshTokens();

    expect(result?.tokens.access.token).toBe("new_access_token");
    expect(localStorage.getItem("auth_access_token")).toBe("new_access_token");
  });
});

describe("Customer Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("auth_access_token", "test_token");
  });

  it("should fetch customers with pagination", async () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: "cust_1",
            fullName: "Nguyễn Văn A",
            phone: "0901234567",
            email: "customer@example.com",
            createdAt: "2025-12-27T00:00:00Z",
            updatedAt: "2025-12-27T00:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });

    const result = await customerService.getCustomers({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].fullName).toBe("Nguyễn Văn A");
    expect(result.total).toBe(1);
  });

  it("should create a new customer", async () => {
    const newCustomer = {
      fullName: "Trần Văn B",
      phone: "0987654321",
      password: "password123",
      email: "tran@example.com",
    };

    const mockResponse = {
      data: {
        id: "cust_2",
        ...newCustomer,
        createdAt: "2025-12-27T00:00:00Z",
        updatedAt: "2025-12-27T00:00:00Z",
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });

    const result = await customerService.createCustomer(newCustomer);

    expect(result.fullName).toBe("Trần Văn B");
    expect(result.phone).toBe("0987654321");
  });
});

describe("Room Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("auth_access_token", "test_token");
  });

  it("should fetch rooms with filters", async () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: "room_1",
            roomNumber: "101",
            floor: 1,
            status: "AVAILABLE",
            roomTypeId: "type_1",
            createdAt: "2025-12-27T00:00:00Z",
            updatedAt: "2025-12-27T00:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });

    const result = await roomService.getRooms({ status: "AVAILABLE" });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].status).toBe("AVAILABLE");
  });

  it("should update room status", async () => {
    const mockResponse = {
      data: {
        id: "room_1",
        roomNumber: "101",
        floor: 1,
        status: "CLEANING",
        roomTypeId: "type_1",
        createdAt: "2025-12-27T00:00:00Z",
        updatedAt: "2025-12-27T00:00:00Z",
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    });

    const result = await roomService.updateRoom("room_1", {
      status: "CLEANING",
    });

    expect(result.status).toBe("CLEANING");
  });
});

describe("API Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle 404 Not Found errors", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        code: 404,
        message: "Not found",
      }),
    });

    await expect(customerService.getCustomerById("nonexistent")).rejects.toThrow(
      "Not found"
    );
  });

  it("should handle validation errors", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        code: 400,
        message: "Validation error",
        errors: [
          { field: "phone", message: "Phone number already exists" },
        ],
      }),
    });

    await expect(
      customerService.createCustomer({
        fullName: "Test",
        phone: "0901234567",
        password: "pass",
      })
    ).rejects.toThrow("Validation error");
  });

  it("should handle network errors", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    await expect(
      authService.login("user", "pass")
    ).rejects.toThrow("Network error");
  });
});
