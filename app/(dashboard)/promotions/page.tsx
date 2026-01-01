"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tag,
  Plus,
  Search,
  Filter,
  X,
  Loader2,
  MoreVertical,
  Edit,
  AlertCircle,
  DollarSign,
  Calendar,
  Users,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PromotionFormModal } from "@/components/promotions/promotion-form-modal";
import { promotionService } from "@/lib/services/promotion.service";
import type {
  Promotion,
  PromotionType,
  PromotionScope,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "@/lib/types/promotion";
import {
  getPromotionStatus,
  formatPromotionValue,
  getScopeLabel,
} from "@/lib/types/promotion";
import { toast } from "sonner";

type FilterStatus = "ALL" | "active" | "scheduled" | "expired" | "disabled";
type FilterType = "ALL" | PromotionType;
type FilterScope = "ALL" | PromotionScope;

export default function PromotionsPage() {
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  const [scopeFilter, setScopeFilter] = useState<FilterScope>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load promotions
  const loadPromotions = async () => {
    setLoading(true);
    try {
      // Load all promotions (no filtering on server side)
      const allResponse = await promotionService.getPromotions({
        page: 1,
        limit: 100, // Get more data for accurate stats
      });
      // allResponse is already in PaginatedResponse format: { data, total, page, limit }
      const allPromoData = allResponse.data || [];
      setAllPromotions(allPromoData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Vui lòng thử lại sau";
      toast.error("Không thể tải danh sách khuyến mãi", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPromotions();
  }, []);

  // Apply client-side filtering using useMemo
  const promotions = useMemo(() => {
    let filtered = allPromotions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.code.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    // Scope filter
    if (scopeFilter !== "ALL") {
      filtered = filtered.filter((p) => p.scope === scopeFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((p) => {
        const status = getPromotionStatus(p);
        return status.status === statusFilter;
      });
    }

    return filtered;
  }, [allPromotions, searchQuery, typeFilter, scopeFilter, statusFilter]);

  // Handle add new
  const handleAddNew = () => {
    setEditingPromotion(null);
    setFormOpen(true);
  };

  // Handle edit
  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormOpen(true);
  };

  // Handle save
  const handleSave = async (data: CreatePromotionRequest | UpdatePromotionRequest) => {
    setFormLoading(true);
    try {
      if (editingPromotion) {
        await promotionService.updatePromotion(
          editingPromotion.id,
          data as UpdatePromotionRequest
        );
        toast.success("Cập nhật khuyến mãi thành công");
      } else {
        await promotionService.createPromotion(data as CreatePromotionRequest);
        toast.success("Tạo khuyến mãi mới thành công");
      }
      setFormOpen(false);
      loadPromotions();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể lưu khuyến mãi";
      toast.error("Lỗi", { description: errorMessage });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle disable/enable
  const handleToggleStatus = async (promotion: Promotion) => {
    try {
      const isCurrentlyDisabled = promotion.disabledAt !== null;
      if (isCurrentlyDisabled) {
        await promotionService.enablePromotion(promotion.id);
        toast.success("Đã kích hoạt lại khuyến mãi");
      } else {
        await promotionService.disablePromotion(promotion.id);
        toast.success("Đã vô hiệu hóa khuyến mãi");
      }
      await loadPromotions();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể cập nhật trạng thái";
      toast.error("Lỗi", { description: errorMessage });
    }
  };



  // Statistics - Always use ALL promotions (not filtered)
  const stats = {
    total: allPromotions.length,
    active: allPromotions.filter((p) => getPromotionStatus(p).status === "active").length,
    scheduled: allPromotions.filter((p) => getPromotionStatus(p).status === "scheduled").length,
    expired: allPromotions.filter((p) => getPromotionStatus(p).status === "expired").length,
    disabled: allPromotions.filter((p) => getPromotionStatus(p).status === "disabled").length,
  };

  const hasFilters =
    searchQuery || statusFilter !== "ALL" || typeFilter !== "ALL" || scopeFilter !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setScopeFilter("ALL");
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  // Get status badge variant
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300";
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "expired":
        return "bg-red-100 text-red-700 border-red-300";
      case "disabled":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "exhausted":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Get scope badge class
  const getScopeBadgeClass = (scope: PromotionScope) => {
    switch (scope) {
      case "ROOM":
        return "bg-purple-100 text-purple-700";
      case "SERVICE":
        return "bg-cyan-100 text-cyan-700";
      case "ALL":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Tag className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">
                Quản lý Khuyến mãi
              </h1>
              <p className="text-lg text-white/90 mt-1 font-medium">
                Tạo và quản lý các chương trình khuyến mãi cho khách sạn
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="bg-white text-amber-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 h-14 px-8 font-bold"
          >
            <Plus className="mr-2 h-6 w-6" />
            Tạo khuyến mãi
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  Tổng số
                </p>
                <p className="text-4xl font-extrabold text-amber-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <Package className="h-10 w-10 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                  Đang chạy
                </p>
                <p className="text-4xl font-extrabold text-green-900 mt-1">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Sắp diễn ra
                </p>
                <p className="text-4xl font-extrabold text-blue-900 mt-1">
                  {stats.scheduled}
                </p>
              </div>
              <Clock className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 via-red-100 to-rose-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                  Đã hết hạn
                </p>
                <p className="text-4xl font-extrabold text-red-900 mt-1">
                  {stats.expired}
                </p>
              </div>
              <XCircle className="h-10 w-10 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Đã vô hiệu
                </p>
                <p className="text-4xl font-extrabold text-gray-900 mt-1">
                  {stats.disabled}
                </p>
              </div>
              <XCircle className="h-10 w-10 text-gray-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-2 border-transparent hover:border-amber-300 focus-within:border-amber-300 shadow-xl bg-gradient-to-br from-white via-slate-50 to-amber-50/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Row 1: Search and Add */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="h-5 w-5 text-amber-600" />
                </div>
                <Input
                  placeholder="Tìm kiếm theo mã hoặc mô tả khuyến mãi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white border-2 border-transparent hover:border-amber-300 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-semibold">Bộ lọc:</span>
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as FilterStatus)}
              >
                <SelectTrigger className="w-full md:w-[180px] h-10">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">🟢 Đang chạy</SelectItem>
                  <SelectItem value="scheduled">🔵 Sắp diễn ra</SelectItem>
                  <SelectItem value="expired">🔴 Đã hết hạn</SelectItem>
                  <SelectItem value="disabled">⚫ Đã vô hiệu</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as FilterType)}
              >
                <SelectTrigger className="w-full md:w-[180px] h-10">
                  <SelectValue placeholder="Loại giảm giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả loại</SelectItem>
                  <SelectItem value="PERCENTAGE">% Phần trăm</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">₫ Số tiền cố định</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={scopeFilter}
                onValueChange={(value) => setScopeFilter(value as FilterScope)}
              >
                <SelectTrigger className="w-full md:w-[180px] h-10">
                  <SelectValue placeholder="Phạm vi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả phạm vi</SelectItem>
                  <SelectItem value="ROOM">🛏️ Tiền phòng</SelectItem>
                  <SelectItem value="SERVICE">🍽️ Dịch vụ</SelectItem>
                  <SelectItem value="ALL">🌐 Tất cả</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-10 text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm font-semibold text-gray-700">
              🎫 Tìm thấy <strong className="text-amber-600">{promotions.length}</strong>{" "}
              khuyến mãi
              {hasFilters && " (đã lọc)"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Cards Grid */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
          </div>
        ) : promotions.length === 0 ? (
          <Card className="border-2 border-dashed border-amber-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-amber-100 p-4 mb-4">
                <AlertCircle className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy khuyến mãi
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {hasFilters
                  ? "Không có khuyến mãi nào phù hợp với bộ lọc. Hãy thử xóa bộ lọc."
                  : "Chưa có khuyến mãi nào. Hãy tạo khuyến mãi đầu tiên!"}
              </p>
              {!hasFilters && (
                <Button
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo khuyến mãi đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              const isDisabled = promotion.disabledAt !== null;

              return (
                <Card
                  key={promotion.id}
                  className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                    isDisabled ? "opacity-60" : ""
                  }`}
                >
                  {/* Card Header with Gradient */}
                  <div
                    className={`relative h-28 bg-gradient-to-br ${
                      promotion.type === "PERCENTAGE"
                        ? "from-green-400 via-emerald-500 to-teal-600"
                        : "from-blue-400 via-indigo-500 to-purple-600"
                    }`}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={`${getStatusBadgeClass(status.status)} border font-semibold`}
                          >
                            {status.label}
                          </Badge>
                          <Badge className={`${getScopeBadgeClass(promotion.scope)} font-medium`}>
                            {getScopeLabel(promotion.scope)}
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-wide">
                          {promotion.code}
                        </h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(promotion)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(promotion)}>
                            {isDisabled ? (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4 text-green-600" />
                                Kích hoạt lại
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4 text-gray-600" />
                                Vô hiệu hóa
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Discount Value Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent py-3 px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">
                          {formatPromotionValue(promotion)}
                        </span>
                        <span className="text-white/80 text-sm">
                          {promotion.type === "PERCENTAGE" ? "giảm" : "giảm trực tiếp"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-5 space-y-4">
                    {/* Description */}
                    {promotion.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {promotion.description}
                      </p>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {/* Date Range */}
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs">Thời gian</p>
                          <p className="font-medium text-gray-900">
                            {new Date(promotion.startDate).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs">Số lượng</p>
                          <p className="font-medium text-gray-900">
                            {promotion.totalQty
                              ? `${promotion.remainingQty ?? promotion.totalQty}/${promotion.totalQty}`
                              : "Không giới hạn"}
                          </p>
                        </div>
                      </div>

                      {/* Max Discount */}
                      {promotion.maxDiscount && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-gray-500 text-xs">Giảm tối đa</p>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(promotion.maxDiscount)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Min Booking */}
                      {parseFloat(promotion.minBookingAmount) > 0 && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-gray-500 text-xs">Đơn tối thiểu</p>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(promotion.minBookingAmount)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Per Customer Limit */}
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs">Giới hạn/khách</p>
                          <p className="font-medium text-gray-900">
                            {promotion.perCustomerLimit} lần
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    {promotion._count && (
                      <div className="pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {promotion._count.customerPromotions} khách đã nhận
                        </span>
                        <span>{promotion._count.usedPromotions} lần sử dụng</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <PromotionFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        promotion={editingPromotion ?? undefined}
        mode={editingPromotion ? "edit" : "create"}
        isLoading={formLoading}
      />
    </div>
  );
}
