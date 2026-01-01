"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  User,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { CustomerFormModal } from "@/components/customers/customer-form-modal-new";
import { customerService } from "@/lib/services/customer.service";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/lib/types/api";
import { toast } from "sonner";

export default function CustomersPageNew() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load customers
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 100,
      };
      if (searchQuery) params.search = searchQuery;

      const response = await customerService.getCustomers(params);
      setCustomers(response.data);
    } catch (error: any) {
      toast.error("Không thể tải danh sách khách hàng", {
        description: error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Handle add new
  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  // Handle edit
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  // Handle save
  const handleSave = async (data: CreateCustomerRequest | UpdateCustomerRequest) => {
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, data as UpdateCustomerRequest);
        toast.success("Cập nhật khách hàng thành công");
      } else {
        await customerService.createCustomer(data as CreateCustomerRequest);
        toast.success("Tạo khách hàng mới thành công");
      }
      loadCustomers();
    } catch (error: any) {
      throw new Error(error.message || "Không thể lưu khách hàng");
    }
  };

  // Handle delete
  const handleDeleteClick = (customer: Customer) => {
    setDeletingCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCustomer) return;

    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(deletingCustomer.id);
      toast.success("Xóa khách hàng thành công");
      loadCustomers();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Không thể xóa khách hàng", {
        description: error.message || "Khách hàng có thể đang có lịch sử đặt phòng",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Statistics
  const stats = {
    total: customers.length,
    withBookings: customers.filter((c) => c._count && c._count.bookings > 0).length,
    withEmail: customers.filter((c) => c.email).length,
    withIdNumber: customers.filter((c) => c.idNumber).length,
  };

  const hasFilters = searchQuery;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Users className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">
                Quản lý Khách hàng
              </h1>
              <p className="text-lg text-white/90 mt-1 font-medium">
                Quản lý thông tin khách hàng và lịch sử đặt phòng
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="bg-white text-emerald-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 h-14 px-8 font-bold"
          >
            <Plus className="mr-2 h-6 w-6" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                  Tổng số
                </p>
                <p className="text-4xl font-extrabold text-emerald-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <Users className="h-12 w-12 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                  Có booking
                </p>
                <p className="text-4xl font-extrabold text-blue-900 mt-2">
                  {stats.withBookings}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                  Có email
                </p>
                <p className="text-4xl font-extrabold text-purple-900 mt-2">
                  {stats.withEmail}
                </p>
              </div>
              <Mail className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">
                  Có CMND
                </p>
                <p className="text-4xl font-extrabold text-orange-900 mt-2">
                  {stats.withIdNumber}
                </p>
              </div>
              <User className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-emerald-600" />
              </div>
              <Input
                placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border-2 border-gray-200 hover:border-emerald-300 focus:border-emerald-500"
              />
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="h-12"
              >
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Filter className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-700">
              Tìm thấy {customers.length} khách hàng
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
              <Loader2 className="h-16 w-16 animate-spin text-emerald-600 mb-4" />
              <p className="text-gray-600">Đang tải danh sách khách hàng...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {hasFilters ? "Không tìm thấy kết quả" : "Chưa có khách hàng"}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasFilters
                  ? "Thử thay đổi từ khóa tìm kiếm để xem kết quả khác"
                  : "Thêm khách hàng đầu tiên để bắt đầu"}
              </p>
              {!hasFilters && (
                <Button onClick={handleAddNew} className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm khách hàng
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold">Họ tên</TableHead>
                  <TableHead className="font-bold">Số điện thoại</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">CMND/CCCD</TableHead>
                  <TableHead className="font-bold">Số booking</TableHead>
                  <TableHead className="font-bold">Ngày tạo</TableHead>
                  <TableHead className="text-right font-bold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-emerald-50/50 transition-colors">
                    <TableCell className="font-medium">{customer.fullName}</TableCell>
                    <TableCell className="text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {customer.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {customer.email}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Chưa cập nhật</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {customer.idNumber || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </TableCell>
                    <TableCell>
                      {customer._count && customer._count.bookings > 0 ? (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                          {customer._count.bookings} lần
                        </Badge>
                      ) : (
                        <span className="text-gray-400 italic">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(customer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(customer)}
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

      {/* Customer Form Modal */}
      <CustomerFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng <strong>{deletingCustomer?.fullName}</strong>?
              Hành động này không thể hoàn tác.
              {deletingCustomer && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Lưu ý: Không thể xóa nếu khách hàng có lịch sử đặt phòng trong hệ thống.
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
