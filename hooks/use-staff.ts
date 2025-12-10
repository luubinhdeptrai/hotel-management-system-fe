"use client";

import { useState } from "react";
import {
  Employee,
  EmployeeFormData,
  AccountFormData,
} from "@/lib/types/employee";

export function useStaff() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call
      const { mockEmployees } = await import("@/lib/mock-employees");
      setEmployees(mockEmployees);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (data: EmployeeFormData): Promise<void> => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newEmployee: Employee = {
        employeeId: `NV${String(employees.length + 1).padStart(3, "0")}`,
        ...data,
        status: "Đang làm việc",
        hasAccount: false,
      };

      setEmployees([...employees, newEmployee]);
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (
    employeeId: string,
    data: EmployeeFormData
  ): Promise<void> => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEmployees(
        employees.map((emp) =>
          emp.employeeId === employeeId ? { ...emp, ...data } : emp
        )
      );
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (
    employeeId: string,
    accountData: AccountFormData
  ): Promise<void> => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEmployees(
        employees.map((emp) =>
          emp.employeeId === employeeId
            ? {
                ...emp,
                hasAccount: true,
                accountRole: accountData.role,
              }
            : emp
        )
      );
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deactivateEmployee = async (employeeId: string): Promise<void> => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEmployees(
        employees.map((emp) =>
          emp.employeeId === employeeId
            ? { ...emp, status: "Đã nghỉ việc", hasAccount: false }
            : emp
        )
      );
    } catch (error) {
      console.error("Error deactivating employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    loadEmployees,
    addEmployee,
    updateEmployee,
    createAccount,
    deactivateEmployee,
  };
}
