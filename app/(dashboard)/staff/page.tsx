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
import { EmployeeFormModal } from "@/components/staff/employee-form-modal";
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

// Mock avatar generator (will be replaced with real URLs from backend later)
const getMockAvatar = (name: string, role: EmployeeRole) => {
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarStyles = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`,
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`,
  ];
  return avatarStyles[seed % avatarStyles.length];
};

export default function StaffPageNew() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
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
      // Load ALL employees (for stats)
      const allResponse = await employeeService.getEmployees({
        page: 1,
        limit: 100,
      });
      setAllEmployees(allResponse.data);

      // Load filtered employees (for display)
      const params: Record<string, number | string> = {
        page: 1,
        limit: 100,
      };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter !== "ALL") params.role = roleFilter;

      const response = await employeeService.getEmployees(params);
      setEmployees(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Vui lòng thử lại sau";
      toast.error("Không thể tải danh sách nhân viên", {
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể lưu nhân viên";
      throw new Error(errorMessage);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Nhân viên có thể đang có lịch sử giao dịch";
      toast.error("Không thể xóa nhân viên", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Statistics - Always use ALL employees (not filtered)
  const stats = {
    total: allEmployees.length,
    admin: allEmployees.filter((e) => e.role === "ADMIN").length,
    receptionist: allEmployees.filter((e) => e.role === "RECEPTIONIST").length,
    housekeeping: allEmployees.filter((e) => e.role === "HOUSEKEEPING").length,
    staff: allEmployees.filter((e) => e.role === "STAFF").length,
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
      <Card className="border-2 border-blue-300 shadow-xl bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
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
                className="pl-12 h-12 bg-white border-2 border-transparent hover:border-blue-300 focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as EmployeeRole | "ALL")}>
              <SelectTrigger className="w-full md:w-[250px] h-12 bg-white border-2 border-transparent hover:border-purple-300 focus:border-purple-500 transition-colors shadow-sm">
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

      {/* Employee Cards Grid */}
      <div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => {
              const avatarUrl = getMockAvatar(employee.name, employee.role);
              const roleOption = roleOptions.find(r => r.value === employee.role);
              
              return (
                <div
                  key={employee.id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Card Content */}
                  <div className="relative p-6 space-y-4">
                    {/* Header with Avatar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden shadow-lg ring-4 ring-white group-hover:ring-blue-100 transition-all">
                          <img
                            src={avatarUrl}
                            alt={employee.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {employee.name}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium mt-1">
                            @{employee.username}
                          </p>
                        </div>
                      </div>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                    </div>

                    {/* Role Badge */}
                    <div className="flex items-center justify-center pt-2">
                      <Badge 
                        variant="outline" 
                        className={`${getRoleBadgeColor(employee.role)} px-4 py-2 text-sm font-bold uppercase tracking-wide`}
                      >
                        <div className={`h-2 w-2 rounded-full ${roleOption?.color} mr-2`} />
                        {roleOption?.label}
                      </Badge>
                    </div>

                    {/* Update Date */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <span className="font-semibold">Cập nhật:</span>
                        <span>{new Date(employee.updatedAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
