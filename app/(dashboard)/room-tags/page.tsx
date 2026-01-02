"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tag,
  Plus,
  Search,
  Grid3x3,
  List,
  AlertCircle,
  Loader2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useRoomTags } from "@/hooks/use-room-tags";
import { RoomTagFormModal } from "@/components/room-tags/room-tag-form-modal";
import { RoomTagCard } from "@/components/room-tags/room-tag-card";
import { RoomTagTable } from "@/components/room-tags/room-tag-table";

export default function RoomTagsPage() {
  const {
    roomTags,
    allRoomTags,
    loading,
    modalOpen,
    editingTag,
    isDeleting,
    error,
    setModalOpen,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    clearError,
    handleSearch,
  } = useRoomTags();

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleSearch(value);
  };

  // Stats
  const totalTags = allRoomTags.length;
  // Count recent tags (created in last 7 days based on createdAt)
  const recentTags = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return allRoomTags.filter((tag) => {
      const createdDate = new Date(tag.createdAt);
      return createdDate >= sevenDaysAgo;
    }).length;
  }, [allRoomTags]);

  return (
    <div className="space-y-8 pb-8">
      {/* Modern Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary-600 via-primary-500 to-blue-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  Quản lý Tiện Nghi
                </h1>
                <p className="text-white/90 font-medium text-base mt-1">
                  Quản lý các tiện nghi phòng (WiFi, TV, Minibar...)
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-white text-primary-600 hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 font-semibold px-6 h-12"
          >
            <Plus className="mr-2 h-5 w-5" />
            Thêm tiện nghi mới
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-6 px-2 hover:bg-white/10"
            >
              Đóng
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Modern Statistics Cards with Gradients */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Tags */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-indigo-50 to-indigo-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-300/20 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tổng tiện nghi
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-5xl font-extrabold text-indigo-900 mb-2">
              {totalTags}
            </div>
            <div className="text-xs text-indigo-600 font-semibold">
              Tất cả tiện nghi
            </div>
          </CardContent>
        </Card>

        {/* Recent Tags */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-emerald-50 to-emerald-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300/20 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mới thêm
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-5xl font-extrabold text-emerald-900 mb-2">
              {recentTags}
            </div>
            <div className="text-xs text-emerald-600 font-semibold">
              7 ngày gần đây
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-linear-to-br from-amber-50 to-amber-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-bold text-amber-700 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cập nhật
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-extrabold text-amber-900 mb-2">
              {new Date().toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
            <div className="text-xs text-amber-600 font-semibold">
              Hôm nay
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search & Filters */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <CardContent className="p-6 relative">
          <div className="flex flex-col gap-5">
            {/* Search Bar với Enhanced Styling */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc mô tả tiện nghi..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-12 pr-4 h-14 bg-white/90 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-base font-medium placeholder:text-gray-400 rounded-xl shadow-sm relative"
                />
              </div>
              
              {/* View Toggle với Enhanced Design */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "table")} className="w-auto shrink-0">
                <TabsList className="bg-gradient-to-r from-gray-100 to-gray-200 p-1.5 h-14 rounded-xl shadow-sm">
                  <TabsTrigger 
                    value="grid" 
                    className="gap-2 px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/10 rounded-lg transition-all"
                  >
                    <Grid3x3 className="h-5 w-5" />
                    <span className="hidden sm:inline font-semibold">Lưới</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="table" 
                    className="gap-2 px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/10 rounded-lg transition-all"
                  >
                    <List className="h-5 w-5" />
                    <span className="hidden sm:inline font-semibold">Bảng</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Quick Stats & Info */}
            <div className="flex items-center justify-between text-sm pt-2">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse"></div>
                <span className="font-medium">
                  {roomTags.length} tiện nghi
                  {searchTerm && " được tìm thấy"}
                </span>
              </div>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearchChange("")}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -my-1"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-base text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : roomTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 shadow-inner">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {searchTerm ? "Không tìm thấy kết quả" : "Chưa có tiện nghi nào"}
              </h3>
              <p className="text-base text-gray-500 mb-6 max-w-md leading-relaxed">
                {searchTerm
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc"
                  : "Bắt đầu bằng cách thêm tiện nghi đầu tiên cho khách sạn của bạn"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleAddNew}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Thêm tiện nghi đầu tiên
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roomTags.map((tag) => (
                <RoomTagCard
                  key={tag.id}
                  tag={tag}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={isDeleting === tag.id}
                />
              ))}
            </div>
          ) : (
            <RoomTagTable
              tags={roomTags}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <RoomTagFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editingTag={editingTag}
      />
    </div>
  );
}
