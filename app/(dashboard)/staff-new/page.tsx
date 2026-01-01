"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Users,
  Plus,
  Search,
  Filter,
  X,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  UserCircle,
  AlertCircle,
} from "lucide-react";
import { EmployeeFormModal } from "./employee-form-modal-new";
import { employeeService } from "@/lib/services/employee.service";
import type { Employee, EmployeeRole, CreateEmployeeRequest, UpdateEmployeeRequest } from "@/lib/types/api";
import { toast } from "sonner";

const roleOptions: { value: EmployeeRole | "ALL"; label: string; color: string }[] = [
  { value: "ALL", label: "Tất cả vai trò", color: "bg-gray-500" },
  { value: "ADMIN", label: "Quản trị viên", color: "bg-purple-500" },
  { value: "RECEPTIONIST", label: "Lễ tân", color: "bg-blue-500" },
  { value: "HOUSEKEEPING", label: "Phục vụ phòng", color: "bg-green-500" },
  { value: "STAFF", label: "Nhân viên", color: "bg-gray-500" },
];

const getRoleBadgeColor = (role: EmployeeRole) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-700 border-purple-300";
    case "RECEPTIONIST":
      return "bg-blue-100 text-blue-700 border-purple-300";
    case "HOUSEKEEPING":
      return "bg-green-100 text-green-700 border-green-300";
    case "STAFF":
      return "bg-gray-100 text-gray-700 border-gray-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export default function StaffPageNew() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | "ALL">("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load employees
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 100,
      };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter !== "ALL") params.role = roleFilter;

      const response = await employeeService.getEmployees(params);
      setEmployees(response.data);
    } catch (error: any) {
      toast.error("Không thể tải danh sách nhân viên", {
        description: error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, roleFilter]);

  // Handle add new
  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  // Handle edit
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  // Handle save
  const handleSave = async (data: CreateEmployeeRequest | UpdateEmployeeRequest) => {
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, data as UpdateEmployeeRequest);
        toast.success("Cập nhật nhân viên thành công");
      } else {
        await employeeService.createEmployee(data as CreateEmployeeRequest);
        toast.success("Tạo nhân viên mới thành công");
      }
      loadEmployees();
    } catch (error: any) {
      throw new Error(error.message || "Không thể lưu nhân viên");
    }
  };

  // Handle delete
  const handleDeleteClick = (employee: Employee) => {
    setDeletingEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingEmployee) return;

    setIsDeleting(true);
    try {
      await employeeService.deleteEmployee(deletingEmployee.id);
      toast.success("Xóa nhân viên thành công");
      loadEmployees();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Không thể xóa nhân viên", {
        description: error.message || "Nhân viên có thể đang có lịch sử giao dịch",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Statistics
  const stats = {
    total: employees.length,
    admin: employees.filter((e) => e.role === "ADMIN").length,
    receptionist: employees.filter((e) => e.role === "RECEPTIONIST").length,
    housekeeping: employees.filter((e) => e.role === "HOUSEKEEPING").length,
    staff: employees.filter((e) => e.role === "STAFF").length,
  };

  const hasFilters = searchQuery || roleFilter !== "ALL";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Users className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">
                Quản lý Nhân viên
              </h1>
              <p className="text-lg text-white/90 mt-1 font-medium">
                Quản lý tài khoản và phân quyền nhân viên trong hệ thống
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="bg-white text-blue-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 h-14 px-8 font-bold"
          >
            <Plus className="mr-2 h-6 w-6" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                  Tổng số
                </p>
                <p className="text-4xl font-extrabold text-blue-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                  Admin
                </p>
                <p className="text-4xl font-extrabold text-purple-900 mt-2">
                  {stats.admin}
                </p>
              </div>
              <Shield className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-sky-50 via-sky-100 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-sky-700 uppercase tracking-wide">
                  Lễ tân
                </p>
                <p className="text-4xl font-extrabold text-sky-900 mt-2">
                  {stats.receptionist}
                </p>
              </div>
              <UserCircle className="h-12 w-12 text-sky-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">
                  Phục vụ
                </p>
                <p className="text-4xl font-extrabold text-green-900 mt-2">
                  {stats.housekeeping}
                </p>
              </div>
              <Users className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Nhân viên
                </p>
                <p className="text-4xl font-extrabold text-gray-900 mt-2">
                  {stats.staff}
                </p>
              </div>
              <Users className="h-12 w-12 text-gray-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <Input
                placeholder="Tìm kiếm theo tên hoặc tên đăng nhập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as EmployeeRole | "ALL")}>
              <SelectTrigger className="w-full md:w-[250px] h-12 bg-white border-2 border-gray-200 hover:border-blue-300">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${option.color}`} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("ALL");
                }}
                className="h-12"
              >
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              Tìm thấy {employees.length} nhân viên
              {hasFilters && " (đã lọc)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Đang tải danh sách nhân viên...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {hasFilters ? "Không tìm thấy kết quả" : "Chưa có nhân viên"}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasFilters
                  ? "Thử thay đổi bộ lọc để xem kết quả khác"
                  : "Thêm nhân viên đầu tiên để bắt đầu"}
              </p>
              {!hasFilters && (
                <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm nhân viên
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold">Tên nhân viên</TableHead>
                  <TableHead className="font-bold">Tên đăng nhập</TableHead>
                  <TableHead className="font-bold">Vai trò</TableHead>
                  <TableHead className="font-bold">Cập nhật lần cuối</TableHead>
                  <TableHead className="text-right font-bold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-blue-50/50 transition-colors">
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell className="text-gray-600">{employee.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(employee.role)}>
                        {roleOptions.find(r => r.value === employee.role)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(employee.updatedAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(employee)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(employee)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee Form Modal */}
      <EmployeeFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên <strong>{deletingEmployee?.name}</strong>?
              Hành động này không thể hoàn tác.
              {deletingEmployee && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Lưu ý: Không thể xóa nếu nhân viên có lịch sử giao dịch trong hệ thống.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
