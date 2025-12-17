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
  "Đang làm việc": "bg-linear-to-r from-success-500 to-success-600 text-white border-0 font-semibold",
  "Tạm nghỉ": "bg-linear-to-r from-warning-500 to-warning-600 text-white border-0 font-semibold",
  "Đã nghỉ việc": "bg-linear-to-r from-gray-400 to-gray-500 text-white border-0 font-semibold",
};

// Role badge colors
const ROLE_STYLES: Record<EmployeeRole, string> = {
  "Admin": "bg-linear-to-r from-purple-500 to-purple-600 text-white border-0 font-semibold",
  "Quản lý": "bg-linear-to-r from-primary-500 to-primary-600 text-white border-0 font-semibold",
  "Lễ tân": "bg-linear-to-r from-info-500 to-info-600 text-white border-0 font-semibold",
  "Phục vụ": "bg-linear-to-r from-warning-500 to-warning-600 text-white border-0 font-semibold",
};

// Professional avatars from Unsplash - diverse, professional headshots
const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", // Professional man
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", // Professional woman
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&q=80", // Security guard
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80", // Business person
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", // Young professional
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", // Professional woman 2
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", // Manager
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", // Receptionist
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", // Staff member
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", // Professional woman 3
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", // Professional man 2
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80", // Business professional
];

// Generate consistent avatar URL based on employee ID
function getAvatarUrl(employeeId: string): string {
  // Use employee ID to consistently select from avatar pool
  const index = employeeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_POOL.length;
  return AVATAR_POOL[index];
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

  const avatarUrl = getAvatarUrl(employee.employeeId);

  const handleDeactivateConfirm = () => {
    onDeactivate(employee.employeeId);
    setDeactivateConfirm(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Card Header with Avatar and Status */}
        <div className="relative p-6 pb-4 bg-linear-to-br from-info-50 via-white to-gray-50">
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${STATUS_STYLES[employee.status]} text-xs px-3 py-1`}>
              {employee.status}
            </Badge>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg mb-3 group-hover:ring-info-200 transition-all">
              <Image
                src={avatarUrl}
                alt={employee.fullName}
                fill
                className="object-cover"
                sizes="96px"
                priority
              />
            </div>
            <h3 className="font-bold text-gray-900 text-center group-hover:text-info-600 transition-colors text-base">
              {employee.fullName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{employee.position}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-3 space-y-3">
          {/* Role badge if has account */}
          {employee.hasAccount && employee.accountRole && (
            <div className="flex justify-center -mt-1">
              <Badge className={`${ROLE_STYLES[employee.accountRole]} text-xs px-3 py-1.5 shadow-md flex items-center gap-1.5`}>
                <span className="w-3.5 h-3.5 flex items-center justify-center">{ICONS.SHIELD}</span>
                <span>{employee.accountRole}</span>
              </Badge>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3 text-sm bg-linear-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-info-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="w-5 h-5 text-info-600 flex items-center justify-center">{ICONS.MAIL}</span>
              </div>
              <span className="truncate text-xs font-medium text-gray-700">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-info-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="w-5 h-5 text-info-600 flex items-center justify-center">{ICONS.PHONE}</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{employee.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-info-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="w-5 h-5 text-info-600 flex items-center justify-center">{ICONS.CALENDAR}</span>
              </div>
              <span className="text-xs font-medium text-gray-700">Bắt đầu: {formatDate(employee.startDate)}</span>
            </div>
          </div>

          {/* Account status indicator */}
          <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium ${
            employee.hasAccount 
              ? "bg-linear-to-r from-success-50 to-success-100/50 text-success-700" 
              : "bg-linear-to-r from-warning-50 to-warning-100/50 text-warning-700"
          }`}>
            {employee.hasAccount ? (
              <>
                <span className="w-4 h-4 flex items-center justify-center">{ICONS.CHECK_CIRCLE}</span>
                <span>Đã có tài khoản</span>
              </>
            ) : (
              <>
                <span className="w-4 h-4 flex items-center justify-center">{ICONS.ALERT_CIRCLE}</span>
                <span>Chưa có tài khoản</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(employee)}
              className="flex-1 h-10 text-sm font-semibold border-info-200 text-info-600 hover:bg-info-50 hover:border-info-300"
            >
              <span className="w-4 h-4 mr-1.5">{ICONS.EYE}</span>
              Chi tiết
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-3 border-gray-200 hover:bg-gray-50"
                >
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
          {/* Gradient Header */}
          <div className="bg-linear-to-br from-error-600 to-error-500 -m-6 mb-0 p-6 rounded-t-xl">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Xác nhận vô hiệu hóa</DialogTitle>
              <DialogDescription className="text-white/90">
                Bạn có chắc chắn muốn vô hiệu hóa nhân viên này?
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="py-4 px-6">
            <div className="flex items-center gap-4 p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-error-200">
                <Image
                  src={avatarUrl}
                  alt={employee.fullName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{employee.fullName}</p>
                <p className="text-sm text-gray-500">{employee.position}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 px-6 pb-6">
            <Button 
              variant="outline" 
              onClick={() => setDeactivateConfirm(false)}
              className="h-10"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleDeactivateConfirm}
              className="bg-linear-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white h-10"
            >
              Vô hiệu hóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
