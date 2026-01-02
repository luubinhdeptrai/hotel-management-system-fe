"use client";

import { StaffGrid } from "./staff-grid";
import { StaffFilters } from "./staff-filters";
import { Employee } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";

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
        onClearFilters={onClearFilters}
        hasFilters={hasFilters}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Hiển thị <span className="font-medium text-info-600">{employees.length}</span> nhân
          viên
        </p>
      </div>

      {/* Employee Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 animate-spin text-primary-500">
              <span className="w-5 h-5 animate-spin">{ICONS.LOADER}</span>
            </div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <StaffGrid
          employees={employees}
          onEdit={onEdit}
          onCreateAccount={onCreateAccount}
          onDeactivate={onDeactivate}
          onViewDetails={onViewDetails}
        />
      )}
    </div>
  );
}
