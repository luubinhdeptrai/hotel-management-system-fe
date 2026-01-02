"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Search,
  X,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Phone,
  Mail,
  Gift,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { CustomerFormModal } from "@/components/customers/customer-form-modal";
import { customerService } from "@/lib/services/customer.service";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/lib/types/api";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [promotionsDialogOpen, setPromotionsDialogOpen] = useState(false);
  const [selectedCustomerForPromotions, setSelectedCustomerForPromotions] = useState<Customer | null>(null);
  const [bookingsDialogOpen, setBookingsDialogOpen] = useState(false);
  const [selectedCustomerForBookings, setSelectedCustomerForBookings] = useState<Customer | null>(null);

  // Load customers
  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Load all customers (for stats)
      const allResponse = await customerService.getCustomers({
        page: 1,
        limit: 100,
      });
      setAllCustomers(allResponse.data);

      // Load filtered customers (for display)
      const params: Record<string, number | string> = {
        page: 1,
        limit: 100,
      };
      if (searchQuery) params.search = searchQuery;

      const response = await customerService.getCustomers(params);
      setCustomers(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Vui lòng thử lại sau";
      toast.error("Không thể tải danh sách khách hàng", {
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể lưu khách hàng";
      throw new Error(errorMessage);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Khách hàng có thể đang có lịch sử đặt phòng";
      toast.error("Không thể xóa khách hàng", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Show promotions modal
  const handleShowPromotions = (customer: Customer) => {
    setSelectedCustomerForPromotions(customer);
    setPromotionsDialogOpen(true);
  };

  // Show bookings modal
  const handleShowBookings = (customer: Customer) => {
    setSelectedCustomerForBookings(customer);
    setBookingsDialogOpen(true);
  };

  // Statistics - Always use ALL customers (not filtered)
  const stats = {
    total: allCustomers.length,
    withBookings: allCustomers.filter((c) => c._count && c._count.bookings > 0).length,
    withPromotions: allCustomers.filter((c) => c._count && c._count.customerPromotions > 0).length,
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
                Quản lý thông tin và khuyến mại cho khách hàng
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

      {/* Statistics Cards - Only 3 cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                  Tổng số khách
                </p>
                <p className="text-5xl font-extrabold text-emerald-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <Users className="h-14 w-14 text-emerald-600 opacity-15" />
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
                <p className="text-5xl font-extrabold text-blue-900 mt-2">
                  {stats.withBookings}
                </p>
              </div>
              <Calendar className="h-14 w-14 text-blue-600 opacity-15" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-pink-700 uppercase tracking-wide">
                  Có khuyến mại
                </p>
                <p className="text-5xl font-extrabold text-pink-900 mt-2">
                  {stats.withPromotions}
                </p>
              </div>
              <Gift className="h-14 w-14 text-pink-600 opacity-15" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-2 border-emerald-300 shadow-xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/30">
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
                className="pl-12 h-12 bg-white border-2 border-transparent hover:border-emerald-300 focus:border-emerald-500 transition-colors"
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
            <span className="text-sm font-semibold text-gray-700">
              📊 Tìm thấy <strong className="text-emerald-600">{customers.length}</strong> khách hàng
              {hasFilters && " (đã lọc)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Cards Grid */}
      <div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Card Content */}
                <div className="relative p-6 space-y-4">
                  {/* Header with Avatar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                        <UserIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                          {customer.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
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
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-emerald-600" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Bookings */}
                    <div 
                      onClick={() => handleShowBookings(customer)}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-colors"
                    >
                      <p className="text-xs text-blue-600 font-semibold uppercase">Booking</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {customer._count?.bookings || 0}
                      </p>
                    </div>

                    {/* Promotions */}
                    <div 
                      onClick={() => handleShowPromotions(customer)}
                      className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-3 text-center cursor-pointer hover:from-pink-100 hover:to-pink-200 transition-colors"
                    >
                      <p className="text-xs text-pink-600 font-semibold uppercase">Khuyến mại</p>
                      <p className="text-2xl font-bold text-pink-900 mt-1">
                        {customer._count?.customerPromotions || 0}
                      </p>
                    </div>
                  </div>

                  {/* ID Number */}
                  {customer.idNumber && (
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-amber-600 font-semibold">CMND/CCCD</p>
                      <p className="text-sm font-bold text-amber-900 mt-1">{customer.idNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
        onSave={handleSave}
      />

      {/* Promotions Details Modal */}
      <Dialog open={promotionsDialogOpen} onOpenChange={setPromotionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Khuyến mại của {selectedCustomerForPromotions?.fullName}</DialogTitle>
            <DialogDescription>
              Danh sách tất cả khuyến mại đã claim
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedCustomerForPromotions?._count?.customerPromotions ? (
              <div className="text-sm space-y-2">
                <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-300 block w-full text-center py-2">
                  {selectedCustomerForPromotions._count?.customerPromotions} khuyến mại
                </Badge>
                <p className="text-gray-600 text-center py-4">
                  ℹ️ Xem chi tiết khuyến mại tại trang quản lý khuyến mại
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có khuyến mại nào</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bookings Details Modal */}
      <Dialog open={bookingsDialogOpen} onOpenChange={setBookingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking của {selectedCustomerForBookings?.fullName}</DialogTitle>
            <DialogDescription>
              Danh sách tất cả booking của khách hàng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedCustomerForBookings?._count?.bookings ? (
              <div className="text-sm space-y-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 block w-full text-center py-2">
                  {selectedCustomerForBookings._count?.bookings} booking
                </Badge>
                <p className="text-gray-600 text-center py-4">
                  ℹ️ Xem chi tiết booking tại trang quản lý booking
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có booking nào</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
