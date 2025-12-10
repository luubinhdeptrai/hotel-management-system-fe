import {
  Employee,
  Permission,
  Role,
  EmployeeAccount,
} from "@/lib/types/employee";

// Mock Permissions
export const mockPermissions: Permission[] = [
  {
    permissionId: "P001",
    permissionName: "Xem phòng",
    description: "Xem danh sách và trạng thái phòng",
    module: "Phòng",
  },
  {
    permissionId: "P002",
    permissionName: "Quản lý phòng",
    description: "Thêm, sửa, xóa thông tin phòng",
    module: "Phòng",
  },
  {
    permissionId: "P003",
    permissionName: "Xem đặt phòng",
    description: "Xem danh sách đặt phòng",
    module: "Đặt phòng",
  },
  {
    permissionId: "P004",
    permissionName: "Quản lý đặt phòng",
    description: "Tạo, sửa, hủy đặt phòng",
    module: "Đặt phòng",
  },
  {
    permissionId: "P005",
    permissionName: "Check-in/Check-out",
    description: "Thực hiện check-in và check-out",
    module: "Thuê phòng",
  },
  {
    permissionId: "P006",
    permissionName: "Xem dịch vụ",
    description: "Xem danh sách dịch vụ",
    module: "Dịch vụ",
  },
  {
    permissionId: "P007",
    permissionName: "Quản lý dịch vụ",
    description: "Thêm, sửa, xóa dịch vụ",
    module: "Dịch vụ",
  },
  {
    permissionId: "P008",
    permissionName: "Thanh toán",
    description: "Xử lý thanh toán và tạo hóa đơn",
    module: "Thanh toán",
  },
  {
    permissionId: "P009",
    permissionName: "Xem báo cáo",
    description: "Xem các báo cáo thống kê",
    module: "Báo cáo",
  },
  {
    permissionId: "P010",
    permissionName: "Quản lý nhân viên",
    description: "Thêm, sửa, xóa nhân viên",
    module: "Nhân viên",
  },
  {
    permissionId: "P011",
    permissionName: "Phân quyền",
    description: "Quản lý tài khoản và phân quyền",
    module: "Hệ thống",
  },
  {
    permissionId: "P012",
    permissionName: "Cấu hình hệ thống",
    description: "Thay đổi cài đặt hệ thống",
    module: "Hệ thống",
  },
];

// Mock Roles
export const mockRoles: Role[] = [
  {
    roleId: "R001",
    roleName: "Admin",
    description: "Quản trị viên hệ thống với toàn quyền",
    permissions: mockPermissions.map((p) => p.permissionId),
  },
  {
    roleId: "R002",
    roleName: "Quản lý",
    description: "Quản lý khách sạn, xem báo cáo và quản lý nhân viên",
    permissions: [
      "P001",
      "P002",
      "P003",
      "P004",
      "P005",
      "P006",
      "P007",
      "P008",
      "P009",
      "P010",
    ],
  },
  {
    roleId: "R003",
    roleName: "Lễ tân",
    description: "Nhân viên lễ tân xử lý đặt phòng và check-in/out",
    permissions: ["P001", "P003", "P004", "P005", "P006", "P008"],
  },
  {
    roleId: "R004",
    roleName: "Phục vụ",
    description: "Nhân viên phục vụ xử lý dịch vụ",
    permissions: ["P001", "P003", "P006"],
  },
];

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    employeeId: "NV001",
    fullName: "Nguyễn Văn An",
    email: "nguyenvanan@hotel.com",
    phoneNumber: "0901234567",
    position: "Quản lý",
    dateOfBirth: new Date("1985-05-15"),
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
    identityCard: "079085001234",
    startDate: new Date("2020-01-10"),
    status: "Đang làm việc",
    hasAccount: true,
    accountRole: "Admin",
  },
  {
    employeeId: "NV002",
    fullName: "Trần Thị Bình",
    email: "tranthibinh@hotel.com",
    phoneNumber: "0902345678",
    position: "Trưởng phòng Lễ tân",
    dateOfBirth: new Date("1990-08-20"),
    address: "456 Lê Lợi, Q1, TP.HCM",
    identityCard: "079090005678",
    startDate: new Date("2021-03-15"),
    status: "Đang làm việc",
    hasAccount: true,
    accountRole: "Quản lý",
  },
  {
    employeeId: "NV003",
    fullName: "Lê Văn Cường",
    email: "levancuong@hotel.com",
    phoneNumber: "0903456789",
    position: "Nhân viên Lễ tân",
    dateOfBirth: new Date("1995-03-12"),
    address: "789 Điện Biên Phủ, Q3, TP.HCM",
    identityCard: "079095009012",
    startDate: new Date("2022-06-01"),
    status: "Đang làm việc",
    hasAccount: true,
    accountRole: "Lễ tân",
  },
  {
    employeeId: "NV004",
    fullName: "Phạm Thị Dung",
    email: "phamthidung@hotel.com",
    phoneNumber: "0904567890",
    position: "Nhân viên Lễ tân",
    dateOfBirth: new Date("1996-11-25"),
    address: "321 Hai Bà Trưng, Q3, TP.HCM",
    identityCard: "079096012345",
    startDate: new Date("2022-09-15"),
    status: "Đang làm việc",
    hasAccount: true,
    accountRole: "Lễ tân",
  },
  {
    employeeId: "NV005",
    fullName: "Hoàng Văn Em",
    email: "hoangvanem@hotel.com",
    phoneNumber: "0905678901",
    position: "Nhân viên Phục vụ",
    dateOfBirth: new Date("1998-07-08"),
    address: "654 Võ Thị Sáu, Q3, TP.HCM",
    identityCard: "079098006789",
    startDate: new Date("2023-02-20"),
    status: "Đang làm việc",
    hasAccount: true,
    accountRole: "Phục vụ",
  },
  {
    employeeId: "NV006",
    fullName: "Võ Thị Phương",
    email: "vothiphuong@hotel.com",
    phoneNumber: "0906789012",
    position: "Nhân viên Phục vụ",
    dateOfBirth: new Date("1997-12-30"),
    address: "987 Cách Mạng Tháng 8, Q10, TP.HCM",
    identityCard: "079097007890",
    startDate: new Date("2023-05-10"),
    status: "Đang làm việc",
    hasAccount: true,
    accountRole: "Phục vụ",
  },
  {
    employeeId: "NV007",
    fullName: "Đặng Văn Giang",
    email: "dangvangiang@hotel.com",
    phoneNumber: "0907890123",
    position: "Kế toán",
    dateOfBirth: new Date("1992-04-18"),
    address: "159 Nguyễn Thị Minh Khai, Q3, TP.HCM",
    identityCard: "079092008901",
    startDate: new Date("2021-08-01"),
    status: "Đang làm việc",
    hasAccount: false,
  },
  {
    employeeId: "NV008",
    fullName: "Bùi Thị Hương",
    email: "buithihuong@hotel.com",
    phoneNumber: "0908901234",
    position: "Nhân viên Vệ sinh",
    dateOfBirth: new Date("1994-09-22"),
    address: "753 Trần Hưng Đạo, Q5, TP.HCM",
    identityCard: "079094009012",
    startDate: new Date("2022-01-15"),
    status: "Tạm nghỉ",
    hasAccount: false,
  },
  {
    employeeId: "NV009",
    fullName: "Ngô Văn Inh",
    email: "ngovaninh@hotel.com",
    phoneNumber: "0909012345",
    position: "Bảo vệ",
    dateOfBirth: new Date("1988-06-05"),
    address: "951 Lý Thường Kiệt, Q10, TP.HCM",
    identityCard: "079088010123",
    startDate: new Date("2020-11-20"),
    status: "Đang làm việc",
    hasAccount: false,
  },
  {
    employeeId: "NV010",
    fullName: "Trương Thị Kim",
    email: "truongthikim@hotel.com",
    phoneNumber: "0910123456",
    position: "Nhân viên Lễ tân",
    dateOfBirth: new Date("1993-02-14"),
    address: "357 Cộng Hòa, Q. Tân Bình, TP.HCM",
    identityCard: "079093011234",
    startDate: new Date("2021-05-01"),
    status: "Đã nghỉ việc",
    hasAccount: false,
  },
];

// Mock Employee Accounts
export const mockEmployeeAccounts: EmployeeAccount[] = [
  {
    employeeId: "NV001",
    username: "admin",
    password: "Admin@123",
    role: "Admin",
    isActive: true,
    createdAt: new Date("2020-01-10"),
    lastLogin: new Date("2025-11-18"),
  },
  {
    employeeId: "NV002",
    username: "letanbinh",
    password: "Binh@123",
    role: "Quản lý",
    isActive: true,
    createdAt: new Date("2021-03-15"),
    lastLogin: new Date("2025-11-17"),
  },
  {
    employeeId: "NV003",
    username: "letancuong",
    password: "Cuong@123",
    role: "Lễ tân",
    isActive: true,
    createdAt: new Date("2022-06-01"),
    lastLogin: new Date("2025-11-18"),
  },
  {
    employeeId: "NV004",
    username: "letandung",
    password: "Dung@123",
    role: "Lễ tân",
    isActive: true,
    createdAt: new Date("2022-09-15"),
    lastLogin: new Date("2025-11-18"),
  },
  {
    employeeId: "NV005",
    username: "phucvuem",
    password: "Em@123",
    role: "Phục vụ",
    isActive: true,
    createdAt: new Date("2023-02-20"),
    lastLogin: new Date("2025-11-15"),
  },
  {
    employeeId: "NV006",
    username: "phucvuphuong",
    password: "Phuong@123",
    role: "Phục vụ",
    isActive: true,
    createdAt: new Date("2023-05-10"),
    lastLogin: new Date("2025-11-16"),
  },
];

// Helper functions for employee management
export function getEmployeeById(employeeId: string): Employee | undefined {
  return mockEmployees.find((emp) => emp.employeeId === employeeId);
}

export function getEmployeeAccount(
  employeeId: string
): EmployeeAccount | undefined {
  return mockEmployeeAccounts.find((acc) => acc.employeeId === employeeId);
}

export function getRoleByName(roleName: string): Role | undefined {
  return mockRoles.find((role) => role.roleName === roleName);
}

export function getPermissionsByRole(roleName: string): Permission[] {
  const role = getRoleByName(roleName);
  if (!role) return [];
  return mockPermissions.filter((p) =>
    role.permissions.includes(p.permissionId)
  );
}
