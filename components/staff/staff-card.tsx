"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee, EmployeeStatus, EmployeeRole } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";

// Status colors
const STATUS_STYLES: Record<EmployeeStatus, string> = {
  "Đang làm việc": "bg-success-100 text-success-700",
  "Tạm nghỉ": "bg-warning-100 text-warning-700",
  "Đã nghỉ việc": "bg-gray-100 text-gray-700",
};

// Role badge colors
const ROLE_STYLES: Record<EmployeeRole, string> = {
  "Admin": "bg-purple-100 text-purple-700",
  "Quản lý": "bg-blue-100 text-blue-700",
  "Lễ tân": "bg-teal-100 text-teal-700",
  "Phục vụ": "bg-orange-100 text-orange-700",
};

// Generate avatar URL from name - using professional avatars
function getAvatarUrl(name: string, employeeId: string): string {
  // Use UI Avatars with better styling for professional look
  const encodedName = encodeURIComponent(name);
  // Generate a consistent color based on employee ID - professional palette
  const colors = ["4F46E5", "7C3AED", "2563EB", "0891B2", "059669", "D97706", "DC2626", "DB2777"];
  const colorIndex = employeeId.charCodeAt(employeeId.length - 1) % colors.length;
  const bgColor = colors[colorIndex];
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${bgColor}&color=ffffff&size=200&font-size=0.4&bold=true&format=png`;
}

interface StaffCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onCreateAccount: (employee: Employee) => void;
  onDeactivate: (employeeId: string) => void;
  onViewDetails: (employee: Employee) => void;
}

export function StaffCard({
  employee,
  onEdit,
  onCreateAccount,
  onDeactivate,
  onViewDetails,
}: StaffCardProps) {
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);

  const avatarUrl = getAvatarUrl(employee.fullName, employee.employeeId);

  const handleDeactivateConfirm = () => {
    onDeactivate(employee.employeeId);
    setDeactivateConfirm(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <>
      <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300">
        {/* Card Header with Avatar and Status */}
        <div className="relative p-6 pb-4 bg-linear-to-br from-primary-50 via-white to-gray-50">
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${STATUS_STYLES[employee.status]} text-xs`}>
              {employee.status}
            </Badge>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-md mb-3 group-hover:ring-primary-100 transition-all">
              <Image
                src={avatarUrl}
                alt={employee.fullName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <h3 className="font-semibold text-gray-900 text-center group-hover:text-primary-600 transition-colors">
              {employee.fullName}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{employee.position}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-0 space-y-3">
          {/* Role badge if has account */}
          {employee.hasAccount && employee.accountRole && (
            <div className="flex justify-center">
              <Badge className={`${ROLE_STYLES[employee.accountRole]} text-xs`}>
                <span className="w-3 h-3 mr-1">{ICONS.SHIELD}</span>
                {employee.accountRole}
              </Badge>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="w-4 h-4 text-gray-400">{ICONS.MAIL}</span>
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="w-4 h-4 text-gray-400">{ICONS.PHONE}</span>
              <span>{employee.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="w-4 h-4 text-gray-400">{ICONS.CALENDAR}</span>
              <span>Bắt đầu: {formatDate(employee.startDate)}</span>
            </div>
          </div>

          {/* Account status indicator */}
          <div className="flex items-center justify-center gap-2 py-2 bg-gray-50 rounded-lg text-sm">
            {employee.hasAccount ? (
              <>
                <span className="w-4 h-4 text-success-500">{ICONS.CHECK_CIRCLE}</span>
                <span className="text-success-700">Đã có tài khoản</span>
              </>
            ) : (
              <>
                <span className="w-4 h-4 text-warning-500">{ICONS.ALERT_CIRCLE}</span>
                <span className="text-warning-700">Chưa có tài khoản</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(employee)}
              className="flex-1 h-9 text-xs"
            >
              <span className="w-3.5 h-3.5 mr-1">{ICONS.EYE}</span>
              Chi tiết
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2.5">
                  <span className="w-4 h-4">{ICONS.MORE_VERTICAL}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(employee)}>
                  <span className="w-4 h-4 mr-2">{ICONS.EDIT}</span>
                  Chỉnh sửa
                </DropdownMenuItem>
                {!employee.hasAccount && (
                  <DropdownMenuItem onClick={() => onCreateAccount(employee)}>
                    <span className="w-4 h-4 mr-2">{ICONS.USER_PLUS}</span>
                    Tạo tài khoản
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {employee.status === "Đang làm việc" && (
                  <DropdownMenuItem
                    onClick={() => setDeactivateConfirm(true)}
                    className="text-error-600 focus:text-error-600"
                  >
                    <span className="w-4 h-4 mr-2">{ICONS.USER_X}</span>
                    Vô hiệu hóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation */}
      <Dialog open={deactivateConfirm} onOpenChange={setDeactivateConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác nhận vô hiệu hóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn vô hiệu hóa nhân viên này?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={avatarUrl}
                  alt={employee.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">{employee.fullName}</p>
                <p className="text-sm text-gray-500">{employee.position}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeactivateConfirm(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeactivateConfirm}>
              Vô hiệu hóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
