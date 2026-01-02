"use client";

import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import {
  Employee,
  EmployeeFormData,
  AccountFormData,
  EmployeeRole,
} from "@/lib/types/employee";
import { employeeService } from "@/lib/services";
import type { Employee as ApiEmployee } from "@/lib/types/api";
import { ApiError } from "@/lib/services/api";

// Map EmployeeRole to API role format
function mapRoleToApi(role: EmployeeRole): "ADMIN" | "RECEPTIONIST" | "HOUSEKEEPING" | "STAFF" {
  const roleMap: Record<EmployeeRole, "ADMIN" | "RECEPTIONIST" | "HOUSEKEEPING" | "STAFF"> = {
    "Admin": "ADMIN",
    "Quản lý": "ADMIN",
    "Lễ tân": "RECEPTIONIST",
    "Phục vụ": "STAFF",
  };
  return roleMap[role] || "STAFF";
}

// Map API Employee to local Employee format
function mapApiToEmployee(apiEmployee: ApiEmployee): Employee {
  const roleMap = {
    "ADMIN": "Admin" as EmployeeRole,
    "RECEPTIONIST": "Lễ tân" as EmployeeRole,
    "HOUSEKEEPING": "Phục vụ" as EmployeeRole,
    "STAFF": "Phục vụ" as EmployeeRole,
  };

  return {
    employeeId: apiEmployee.id,
    fullName: apiEmployee.name,
    email: "", // Not in API
    phoneNumber: "", // Not in API
    position: apiEmployee.role,
    startDate: new Date(), // Not in API
    status: "Đang làm việc",
    hasAccount: true,
    accountRole: roleMap[apiEmployee.role] || "Phục vụ",
  };
}

export function useStaff() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await employeeService.getEmployees({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      });
      setEmployees(result.data.map(mapApiToEmployee));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error loading employees";
      logger.error("Error loading employees:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (data: EmployeeFormData): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Create employee with account
      const apiEmployee = await employeeService.createEmployee({
        name: data.fullName,
        username: data.email.split("@")[0] || `emp_${Date.now()}`, // Generate username from email
        password: "DefaultPassword123", // TODO: Add password field or generate secure password
        role: "STAFF", // Default role
      });

      const newEmployee = mapApiToEmployee(apiEmployee);
      setEmployees([...employees, newEmployee]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error adding employee";
      logger.error("Error adding employee:", err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (
    employeeId: string,
    data: EmployeeFormData
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const apiEmployee = await employeeService.updateEmployee(employeeId, {
        name: data.fullName,
      });

      const updatedEmployee = mapApiToEmployee(apiEmployee);
      setEmployees(
        employees.map((emp) =>
          emp.employeeId === employeeId ? updatedEmployee : emp
        )
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error updating employee";
      logger.error("Error updating employee:", err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (
    employeeId: string,
    accountData: AccountFormData
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Update employee role
      const apiEmployee = await employeeService.updateEmployee(employeeId, {
        role: mapRoleToApi(accountData.role),
      });

      const updatedEmployee = mapApiToEmployee(apiEmployee);
      setEmployees(
        employees.map((emp) =>
          emp.employeeId === employeeId ? updatedEmployee : emp
        )
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error creating account";
      logger.error("Error creating account:", err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivateEmployee = async (employeeId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await employeeService.deleteEmployee(employeeId);
      setEmployees(
        employees.map((emp) =>
          emp.employeeId === employeeId
            ? { ...emp, status: "Đã nghỉ việc", hasAccount: false }
            : emp
        )
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error deactivating employee";
      logger.error("Error deactivating employee:", err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    error,
    loadEmployees,
    addEmployee,
    updateEmployee,
    createAccount,
    deactivateEmployee,
  };
}
