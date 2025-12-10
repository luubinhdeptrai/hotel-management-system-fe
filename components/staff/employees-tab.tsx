"use client";

import { Button } from "@/components/ui/button";
import { EmployeeTable } from "./employee-table";
import { StaffFilters } from "./staff-filters";
import { Employee } from "@/lib/types/employee";

interface EmployeesTabProps {
  employees: Employee[];
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
  accountFilter: string;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onClearFilters: () => void;
  onAddEmployee: () => void;
  onEdit: (employee: Employee) => void;
  onCreateAccount: (employee: Employee) => void;
  onDeactivate: (employeeId: string) => void;
  onViewDetails: (employee: Employee) => void;
}

export function EmployeesTab({
  employees,
  loading,
  searchQuery,
  statusFilter,
  accountFilter,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onAccountChange,
  onClearFilters,
  onAddEmployee,
  onEdit,
  onCreateAccount,
  onDeactivate,
  onViewDetails,
}: EmployeesTabProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <StaffFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        accountFilter={accountFilter}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onAccountChange={onAccountChange}
        onAddEmployee={onAddEmployee}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Hiển thị <span className="font-medium">{employees.length}</span> nhân
          viên
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onEdit={onEdit}
            onCreateAccount={onCreateAccount}
            onDeactivate={onDeactivate}
            onViewDetails={onViewDetails}
          />
        )}
      </div>
    </div>
  );
}
