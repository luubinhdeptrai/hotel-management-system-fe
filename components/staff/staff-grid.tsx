"use client";

import { StaffCard } from "./staff-card";
import { Employee } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";

interface StaffGridProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onCreateAccount: (employee: Employee) => void;
  onDeactivate: (employeeId: string) => void;
  onViewDetails: (employee: Employee) => void;
}

export function StaffGrid({
  employees,
  onEdit,
  onCreateAccount,
  onDeactivate,
  onViewDetails,
}: StaffGridProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="w-8 h-8 text-gray-400">{ICONS.USERS}</span>
        </div>
        <p className="text-gray-500 text-lg">Không tìm thấy nhân viên phù hợp</p>
        <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <StaffCard
          key={employee.employeeId}
          employee={employee}
          onEdit={onEdit}
          onCreateAccount={onCreateAccount}
          onDeactivate={onDeactivate}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
