/**
 * Employee Service
 * Handles all employee-related API calls
 */

import { api } from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  GetEmployeesParams,
} from "@/lib/types/api";

export const employeeService = {
  /**
   * Get all employees with pagination and filters
   * GET /employee/employees
   */
  async getEmployees(
    params?: GetEmployeesParams
  ): Promise<PaginatedResponse<Employee>> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const endpoint = `/employee/employees${query ? `?${query}` : ""}`;

    const response = await api.get<ApiResponse<PaginatedResponse<Employee>>>(
      endpoint,
      { requiresAuth: true }
    );

    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Get employee by ID
   * GET /employee/employees/{employeeId}
   */
  async getEmployeeById(employeeId: string): Promise<Employee> {
    const response = await api.get<ApiResponse<Employee>>(
      `/employee/employees/${employeeId}`,
      { requiresAuth: true }
    );
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

  /**
   * Create a new employee
   * POST /employee/employees
   */
  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    const response = await api.post<ApiResponse<Employee>>(
      "/employee/employees",
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Update employee
   * PUT /employee/employees/{employeeId}
   */
  async updateEmployee(
    employeeId: string,
    data: UpdateEmployeeRequest
  ): Promise<Employee> {
    const response = await api.put<ApiResponse<Employee>>(
      `/employee/employees/${employeeId}`,
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Delete employee
   * DELETE /employee/employees/{employeeId}
   */
  async deleteEmployee(employeeId: string): Promise<void> {
    await api.delete(`/employee/employees/${employeeId}`, {
      requiresAuth: true,
    });
  },
};
