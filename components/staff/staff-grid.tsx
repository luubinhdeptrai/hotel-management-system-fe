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
      <div className="text-center py-20 bg-linear-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-linear-to-br from-info-100 to-info-200 flex items-center justify-center shadow-inner">
          <span className="w-10 h-10 text-info-600">{ICONS.USERS}</span>
        </div>
        <p className="text-gray-700 text-lg font-semibold">Không tìm thấy nhân viên phù hợp</p>
        <p className="text-gray-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
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
