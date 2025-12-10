"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Employee } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface EmployeeDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const STATUS_COLORS = {
  "Đang làm việc": "bg-success-100 text-success-700",
  "Tạm nghỉ": "bg-warning-100 text-warning-700",
  "Đã nghỉ việc": "bg-gray-100 text-gray-700",
};

export function EmployeeDetailsModal({
  open,
  onOpenChange,
  employee,
}: EmployeeDetailsModalProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết nhân viên</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {employee.fullName}
              </h3>
              <p className="text-gray-600 mt-1">{employee.position}</p>
            </div>
            <Badge
              className={`${STATUS_COLORS[employee.status]} border-0 text-sm`}
            >
              {employee.status}
            </Badge>
          </div>

          <Separator />

          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {ICONS.USER}
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã nhân viên</p>
                <p className="font-medium">{employee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Chức vụ</p>
                <p className="font-medium">{employee.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{employee.phoneNumber}</p>
              </div>
              {employee.dateOfBirth && (
                <div>
                  <p className="text-sm text-gray-600">Ngày sinh</p>
                  <p className="font-medium">
                    {format(new Date(employee.dateOfBirth), "dd/MM/yyyy")}
                  </p>
                </div>
              )}
              {employee.identityCard && (
                <div>
                  <p className="text-sm text-gray-600">Số CCCD/CMND</p>
                  <p className="font-medium">{employee.identityCard}</p>
                </div>
              )}
              {employee.address && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-medium">{employee.address}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Employment Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {ICONS.CLIPBOARD_LIST}
              Thông tin công việc
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ngày bắt đầu làm việc</p>
                <p className="font-medium">
                  {format(new Date(employee.startDate), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge
                  className={`${STATUS_COLORS[employee.status]} border-0 mt-1`}
                >
                  {employee.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {ICONS.USER_COG}
              Tài khoản hệ thống
            </h4>
            {employee.hasAccount ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Trạng thái tài khoản</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-primary-100 text-primary-700 border-0">
                      Đã kích hoạt
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vai trò</p>
                  <Badge className="bg-info-100 text-info-700 border-0 mt-1">
                    {employee.accountRole}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-gray-400">{ICONS.ALERT}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Chưa có tài khoản
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Nhân viên này chưa được cấp tài khoản đăng nhập hệ thống
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
