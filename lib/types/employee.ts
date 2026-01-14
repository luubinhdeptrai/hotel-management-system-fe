export type EmployeeRole = "Admin" | "Quản lý" | "Lễ tân" | "Phục vụ";

export type EmployeeStatus = "Đang làm việc" | "Tạm nghỉ" | "Đã nghỉ việc";

export interface Employee {
  // Schema fields
  id: string;
  name: string;
  username: string;
  roleId: string | null;
  createdAt: string;
  updatedAt: string;

  // Legacy / UI fields
  employeeId?: string; // alias id
  fullName?: string; // alias name
  email?: string; // Not in schema
  phoneNumber?: string; // Not in schema
  position?: string;
  dateOfBirth?: Date;
  address?: string;
  identityCard?: string;
  imageUrl?: string;
  startDate?: Date;
  status?: EmployeeStatus;
  hasAccount?: boolean;
  accountRole?: EmployeeRole;

  // Relations
  role?: Role;
}

export interface Permission {
  id: string; // was permissionId
  name: string; // was permissionName
  type: "SCREEN" | "ACTION";
  subject: string;
  action: string;
  description: string | null;

  // Legacy
  permissionId?: string;
  permissionName?: string;
  module?: string;
}

export interface Role {
  id: string; // was roleId
  name: string; // was roleName
  description: string | null;
  isActive: boolean;
  permissions?: Permission[]; // Relation

  // Legacy
  roleId?: string;
  roleName?: string;
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
