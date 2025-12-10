"use client";

import { useState, useCallback, useMemo } from "react";
import { useStaff } from "./use-staff";
import {
  Employee,
  EmployeeFormData,
  AccountFormData,
} from "@/lib/types/employee";
import {
  filterEmployees,
  hasActiveFilters,
  getDefaultFilters,
  type StaffFilterOptions,
} from "@/lib/utils/staff-filters";

export function useStaffPage() {
  const {
    employees,
    loading,
    loadEmployees,
    addEmployee,
    updateEmployee,
    createAccount,
    deactivateEmployee,
  } = useStaff();

  // Tab state
  const [activeTab, setActiveTab] = useState("employees");

  // Filter state
  const [filters, setFilters] = useState<StaffFilterOptions>(
    getDefaultFilters()
  );

  // Modal state
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  // Filtered employees
  const filteredEmployees = useMemo(
    () => filterEmployees(employees, filters),
    [employees, filters]
  );

  // Filter handlers
  const updateFilter = useCallback(
    (key: keyof StaffFilterOptions, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  // Employee handlers
  const handleAddEmployee = useCallback(() => {
    setSelectedEmployee(null);
    setEmployeeFormOpen(true);
  }, []);

  const handleEditEmployee = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeFormOpen(true);
  }, []);

  const handleViewDetails = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailsModalOpen(true);
  }, []);

  const handleCreateAccount = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setAccountFormOpen(true);
  }, []);

  const handleSaveEmployee = useCallback(
    async (data: EmployeeFormData) => {
      try {
        if (selectedEmployee) {
          await updateEmployee(selectedEmployee.employeeId, data);
        } else {
          await addEmployee(data);
        }
        setEmployeeFormOpen(false);
      } catch {
        // Error handled by hook
      }
    },
    [selectedEmployee, updateEmployee, addEmployee]
  );

  const handleSaveAccount = useCallback(
    async (employeeId: string, data: AccountFormData) => {
      try {
        await createAccount(employeeId, data);
        setAccountFormOpen(false);
      } catch {
        // Error handled by hook
      }
    },
    [createAccount]
  );

  const handleDeactivate = useCallback(
    async (employeeId: string) => {
      try {
        await deactivateEmployee(employeeId);
      } catch {
        // Error handled by hook
      }
    },
    [deactivateEmployee]
  );

  return {
    // Data
    employees,
    filteredEmployees,
    loading,

    // Tab state
    activeTab,
    setActiveTab,

    // Filter state
    filters,
    updateFilter,
    clearFilters,
    hasFilters: hasActiveFilters(filters),

    // Modal state
    employeeFormOpen,
    setEmployeeFormOpen,
    accountFormOpen,
    setAccountFormOpen,
    detailsModalOpen,
    setDetailsModalOpen,
    selectedEmployee,

    // Actions
    loadEmployees,
    handleAddEmployee,
    handleEditEmployee,
    handleViewDetails,
    handleCreateAccount,
    handleSaveEmployee,
    handleSaveAccount,
    handleDeactivate,
  };
}
