import { Employee } from "@/lib/types/employee";

export interface StaffFilterOptions {
  searchQuery: string;
  statusFilter: string;
  accountFilter: string;
}

export function filterEmployees(
  employees: Employee[],
  filters: StaffFilterOptions
): Employee[] {
  return employees.filter((employee) => {
    const matchesSearch =
      employee.fullName
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase()) ||
      employee.employeeId
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase()) ||
      employee.email
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase()) ||
      employee.phoneNumber.includes(filters.searchQuery);

    const matchesStatus =
      filters.statusFilter === "all" ||
      employee.status === filters.statusFilter;

    const matchesAccount =
      filters.accountFilter === "all" ||
      (filters.accountFilter === "has-account" && employee.hasAccount) ||
      (filters.accountFilter === "no-account" && !employee.hasAccount);

    return matchesSearch && matchesStatus && matchesAccount;
  });
}

export function hasActiveFilters(filters: StaffFilterOptions): boolean {
  return (
    filters.searchQuery !== "" ||
    filters.statusFilter !== "all" ||
    filters.accountFilter !== "all"
  );
}

export function getDefaultFilters(): StaffFilterOptions {
  return {
    searchQuery: "",
    statusFilter: "all",
    accountFilter: "all",
  };
}
