"use client";

import { useState, useMemo } from "react";
import { ServiceCard } from "./service-card";
import { ServiceItem, ServiceCategory } from "@/lib/types/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";

interface ServiceGridProps {
  services: ServiceItem[];
  categories: ServiceCategory[];
  onEdit: (service: ServiceItem) => void;
  onDelete: (serviceID: string) => void;
  onToggleActive?: (serviceID: string, isActive: boolean) => void;
  onCreate?: () => void;
}

export function ServiceGrid({
  services,
  categories,
  onEdit,
  onDelete,
  onToggleActive,
  onCreate,
}: ServiceGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Search filter
      const matchesSearch = service.serviceName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = !selectedCategory || 
        service.categoryID === selectedCategory;
      
      // Active filter
      const matchesActive = activeFilter === null || 
        service.isActive === activeFilter;

      return matchesSearch && matchesCategory && matchesActive;
    });
  }, [services, searchTerm, selectedCategory, activeFilter]);

  // Group services by category for display
  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceItem[]> = {};
    filteredServices.forEach((service) => {
      const categoryName = service.category?.categoryName || "Khác";
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(service);
    });
    return groups;
  }, [filteredServices]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setActiveFilter(null);
  };

  const hasFilters = searchTerm || selectedCategory || activeFilter !== null;

  return (
    <div className="space-y-6">
      {/* Modern Header with Search and Actions */}
      <div className="bg-linear-to-br from-white via-gray-50 to-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:max-w-xl">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                {ICONS.SEARCH}
              </div>
              <Input
                placeholder="Tìm kiếm dịch vụ theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 pr-4 border-2 border-gray-300 rounded-xl font-semibold text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  {ICONS.X}
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {hasFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-12 px-6 border-2 border-gray-300 hover:bg-gray-100 font-bold shadow-sm"
              >
                <div className="w-4 h-4 mr-2 flex items-center justify-center">{ICONS.X}</div>
                Xóa bộ lọc
              </Button>
            )}
            {onCreate && (
              <Button 
                onClick={onCreate} 
                className="h-12 px-6 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="w-5 h-5 mr-2 flex items-center justify-center">{ICONS.PLUS}</div>
                Thêm dịch vụ
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-3">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className={`cursor-pointer transition-all h-10 px-5 text-sm font-bold ${
            selectedCategory === null 
              ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg" 
              : "hover:bg-blue-50 hover:border-blue-300"
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          Tất cả ({services.length})
        </Badge>
        {categories.map((category) => {
          const count = services.filter(s => s.categoryID === category.categoryID).length;
          return (
            <Badge
              key={category.categoryID}
              variant={selectedCategory === category.categoryID ? "default" : "outline"}
              className={`cursor-pointer transition-all h-10 px-5 text-sm font-bold ${
                selectedCategory === category.categoryID 
                  ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg" 
                  : "hover:bg-blue-50 hover:border-blue-300"
              }`}
              onClick={() => setSelectedCategory(category.categoryID)}
            >
              {category.categoryName} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex gap-3">
        <Button
          variant={activeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(null)}
          className={`h-10 px-5 font-bold ${activeFilter === null ? "bg-gray-800 shadow-md" : "border-2 hover:bg-gray-50"}`}
        >
          Tất cả trạng thái
        </Button>
        <Button
          variant={activeFilter === true ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(true)}
          className={`h-10 px-5 font-bold ${activeFilter === true ? "bg-success-600 hover:bg-success-700 shadow-md" : "text-success-600 border-2 border-success-200 hover:bg-success-50"}`}
        >
          <div className="w-4 h-4 mr-1.5 flex items-center justify-center">{ICONS.CHECK_CIRCLE}</div>
          Hoạt động
        </Button>
        <Button
          variant={activeFilter === false ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(false)}
          className={`h-10 px-5 font-bold ${activeFilter === false ? "bg-gray-600 shadow-md" : "text-gray-600 border-2 border-gray-200 hover:bg-gray-50"}`}
        >
          <div className="w-4 h-4 mr-1.5 flex items-center justify-center">{ICONS.PAUSE}</div>
          Tạm ngưng
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between py-3 px-4 bg-linear-to-r from-blue-50 to-white rounded-xl border-2 border-blue-100">
        <span className="text-sm font-bold text-gray-700">
          Hiển thị <span className="text-blue-600">{filteredServices.length}</span> / {services.length} dịch vụ
        </span>
      </div>

      {/* Service Grid by Category */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-linear-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 mb-6 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-50 rounded-full">
            <div className="w-12 h-12 text-gray-400 flex items-center justify-center">
              {ICONS.PACKAGE}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy dịch vụ</h3>
          <p className="text-gray-500 mb-2 text-center max-w-md">
            {hasFilters 
              ? "Không có dịch vụ nào phù hợp với bộ lọc của bạn."
              : "Chưa có dịch vụ nào trong hệ thống."}
          </p>
          <p className="text-gray-400 text-sm mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          {hasFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="h-11 px-6 border-2 font-bold hover:bg-gray-50"
            >
              <div className="w-4 h-4 mr-2 flex items-center justify-center">{ICONS.X}</div>
              Xóa tất cả bộ lọc
            </Button>
          )}
        </div>
      ) : selectedCategory ? (
        // Show flat grid when category is selected
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.serviceID}
              service={service}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      ) : (
        // Show grouped by category
        <div className="space-y-8">
          {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
            <div key={categoryName}>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">{categoryName}</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold px-3 py-1">
                  {categoryServices.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {categoryServices.map((service) => (
                  <ServiceCard
                    key={service.serviceID}
                    service={service}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={onToggleActive}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

