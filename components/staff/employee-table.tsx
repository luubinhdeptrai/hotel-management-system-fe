"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Employee, EmployeeStatus } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onCreateAccount: (employee: Employee) => void;
  onDeactivate: (employeeId: string) => void;
  onViewDetails: (employee: Employee) => void;
}

const STATUS_COLORS: Record<EmployeeStatus, string> = {
  "Đang làm việc": "bg-success-100 text-success-700",
  "Tạm nghỉ": "bg-warning-100 text-warning-700",
  "Đã nghỉ việc": "bg-gray-100 text-gray-700",
};

export function EmployeeTable({
  employees,
  onEdit,
  onCreateAccount,
  onDeactivate,
  onViewDetails,
}: EmployeeTableProps) {
  const [deactivateEmployee, setDeactivateEmployee] = useState<Employee | null>(
    null
  );

  const handleDeactivateConfirm = () => {
    if (deactivateEmployee) {
      onDeactivate(deactivateEmployee.employeeId);
      setDeactivateEmployee(null);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Mã NV</TableHead>
              <TableHead className="font-semibold">Họ và tên</TableHead>
              <TableHead className="font-semibold">Chức vụ</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Số điện thoại</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Tài khoản</TableHead>
              <TableHead className="font-semibold text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-gray-500">
                    Không có nhân viên nào được tìm thấy
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow
                  key={employee.employeeId}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewDetails(employee)}
                >
                  <TableCell className="font-medium">
                    {employee.employeeId}
                  </TableCell>
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell className="text-gray-600">
                    {employee.email}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {employee.phoneNumber}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${STATUS_COLORS[employee.status]} border-0`}
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {employee.hasAccount ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary-100 text-primary-700 border-0">
                          {employee.accountRole}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Chưa có tài khoản
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ICONS.MORE}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onViewDetails(employee);
                          }}
                        >
                          <span className="mr-2">{ICONS.INFO}</span>
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onEdit(employee);
                          }}
                        >
                          <span className="mr-2">{ICONS.EDIT}</span>
                          Chỉnh sửa
                        </DropdownMenuItem>
                        {!employee.hasAccount &&
                          employee.status === "Đang làm việc" && (
                            <DropdownMenuItem
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onCreateAccount(employee);
                              }}
                            >
                              <span className="mr-2">{ICONS.USER_CHECK}</span>
                              Tạo tài khoản
                            </DropdownMenuItem>
                          )}
                        {employee.status === "Đang làm việc" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setDeactivateEmployee(employee);
                              }}
                              className="text-red-600"
                            >
                              <span className="mr-2">{ICONS.X_CIRCLE}</span>
                              Vô hiệu hóa
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={!!deactivateEmployee}
        onOpenChange={(open: boolean) => !open && setDeactivateEmployee(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận vô hiệu hóa nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn vô hiệu hóa nhân viên{" "}
              <span className="font-semibold">
                {deactivateEmployee?.fullName}
              </span>
              ? Tài khoản đăng nhập của nhân viên này sẽ bị vô hiệu hóa và không
              thể truy cập hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Vô hiệu hóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
