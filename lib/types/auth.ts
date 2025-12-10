export interface User {
  employeeId: string;
  fullName: string;
  email: string;
  password: string;
  role: "Admin" | "Quản lý" | "Lễ tân";
  phoneNumber?: string;
}
