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
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">
              {ICONS.SEARCH}
            </span>
            <Input
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="w-4 h-4 mr-1">{ICONS.X}</span>
              Xóa bộ lọc
            </Button>
          )}
          {onCreate && (
            <Button onClick={onCreate} className="bg-primary-600 hover:bg-primary-700">
              <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
              Thêm dịch vụ
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className={`cursor-pointer transition-all ${
            selectedCategory === null 
              ? "bg-primary-600 text-white" 
              : "hover:bg-primary-50"
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
              className={`cursor-pointer transition-all ${
                selectedCategory === category.categoryID 
                  ? "bg-primary-600 text-white" 
                  : "hover:bg-primary-50"
              }`}
              onClick={() => setSelectedCategory(category.categoryID)}
            >
              {category.categoryName} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <Button
          variant={activeFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(null)}
          className={activeFilter === null ? "bg-gray-800" : ""}
        >
          Tất cả trạng thái
        </Button>
        <Button
          variant={activeFilter === true ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(true)}
          className={activeFilter === true ? "bg-success-600 hover:bg-success-700" : "text-success-600 border-success-200 hover:bg-success-50"}
        >
          <span className="w-3 h-3 mr-1">{ICONS.CHECK_CIRCLE}</span>
          Hoạt động
        </Button>
        <Button
          variant={activeFilter === false ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(false)}
          className={activeFilter === false ? "bg-gray-600" : "text-gray-600 border-gray-200 hover:bg-gray-50"}
        >
          <span className="w-3 h-3 mr-1">{ICONS.PAUSE}</span>
          Tạm ngưng
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Hiển thị {filteredServices.length} / {services.length} dịch vụ
        </span>
      </div>

      {/* Service Grid by Category */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="w-8 h-8 text-gray-400">{ICONS.PACKAGE}</span>
          </div>
          <p className="text-gray-500 text-lg">Không tìm thấy dịch vụ phù hợp</p>
          <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          {hasFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-4 text-primary-600">
              Xóa tất cả bộ lọc
            </Button>
          )}
        </div>
      ) : selectedCategory ? (
        // Show flat grid when category is selected
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                <Badge variant="secondary" className="bg-gray-100">
                  {categoryServices.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
