export type EmployeeRole = "Admin" | "Quản lý" | "Lễ tân" | "Phục vụ";

export type EmployeeStatus = "Đang làm việc" | "Tạm nghỉ" | "Đã nghỉ việc";

export interface Employee {
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  dateOfBirth?: Date;
  address?: string;
  identityCard?: string;
  imageUrl?: string;
  startDate: Date;
  status: EmployeeStatus;
  hasAccount: boolean;
  accountRole?: EmployeeRole;
}

export interface Permission {
  permissionId: string;
  permissionName: string;
  description: string;
  module: string; // e.g., "Phòng", "Đặt phòng", "Dịch vụ", "Báo cáo"
}

export interface Role {
  roleId: string;
  roleName: EmployeeRole;
  description: string;
  permissions: string[]; // Array of permissionIds
}

export interface EmployeeAccount {
  employeeId: string;
  username: string;
  password: string;
  role: EmployeeRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface EmployeeFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  dateOfBirth?: Date;
  address?: string;
  identityCard?: string;
  imageUrl?: string;
  startDate: Date;
}

export interface AccountFormData {
  username: string;
  password: string;
  confirmPassword: string;
  role: EmployeeRole;
}
