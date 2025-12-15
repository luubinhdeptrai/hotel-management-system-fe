"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

interface SearchAndFilterSectionProps {
  onSearch: (searchTerm: string) => void;
  onFilterByPrice: (range: string) => void;
  onFilterByCapacity: (capacity: string) => void;
  onReset: () => void;
}

export function SearchAndFilterSection({
  onSearch,
  onFilterByPrice,
  onFilterByCapacity,
  onReset,
}: SearchAndFilterSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handlePriceChange = (value: string) => {
    setPriceRange(value);
    onFilterByPrice(value);
  };

  const handleCapacityChange = (value: string) => {
    setCapacityFilter(value);
    onFilterByCapacity(value);
  };

  const handleReset = () => {
    setSearchTerm("");
    setPriceRange("all");
    setCapacityFilter("all");
    onReset();
  };

  return (
    <Card className="bg-linear-to-br from-gray-50 via-white to-gray-50 border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="w-6 h-6 text-white">{ICONS.SEARCH}</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-extrabold text-gray-900">
                Tìm kiếm & Lọc
              </CardTitle>
              <CardDescription className="text-base text-gray-600 font-medium">
                Tìm kiếm nhanh và lọc loại phòng theo tiêu chí
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="h-11 px-5 border-2 border-gray-300 font-bold hover:bg-gray-100 hover:border-gray-400 hover:scale-105 transition-all"
          >
            <span className="w-4 h-4 mr-2">{ICONS.X_CIRCLE}</span>
            Đặt lại
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Search Input - Chiếm nhiều không gian hơn */}
          <div className="flex-1 space-y-3">
            <Label htmlFor="search" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Tìm kiếm theo tên
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                {ICONS.SEARCH}
              </span>
              <Input
                id="search"
                type="text"
                placeholder="Nhập tên loại phòng..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-12 pl-12 pr-4 border-2 border-gray-300 rounded-lg font-medium text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Ví dụ: Standard, Deluxe, Suite...
            </p>
          </div>

          {/* 2 Filters nằm gần nhau với khoảng cách đủ để tránh đè */}
          <div className="flex gap-8">
            {/* Price Range Filter */}
            <div className="w-full md:w-60 space-y-3">
              <Label htmlFor="price-range" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Khoảng giá
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10">
                  {ICONS.DOLLAR_SIGN}
                </span>
                <Select value={priceRange} onValueChange={handlePriceChange}>
                  <SelectTrigger className="h-12 pl-12 pr-4 border-2 border-gray-300 rounded-lg font-bold text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all">
                    <SelectValue placeholder="Chọn khoảng giá" />
                  </SelectTrigger>
                  <SelectContent className="z-100 max-w-xs" position="popper" align="start" sideOffset={4}>
                    <SelectItem value="all" className="font-medium">Tất cả giá</SelectItem>
                    <SelectItem value="budget" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success-500"></span>
                        Tiết kiệm (&lt; 500k)
                      </div>
                    </SelectItem>
                    <SelectItem value="standard" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Tiêu chuẩn (500k - 1tr)
                      </div>
                    </SelectItem>
                    <SelectItem value="premium" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning-500"></span>
                        Cao cấp (1tr - 2tr)
                      </div>
                    </SelectItem>
                    <SelectItem value="luxury" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-error-500"></span>
                        Sang trọng (&gt; 2tr)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Lọc theo mức giá cơ bản
              </p>
            </div>

            {/* Capacity Filter */}
            <div className="w-full md:w-60 space-y-3">
              <Label htmlFor="capacity" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Sức chứa
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10">
                  {ICONS.USERS}
                </span>
                <Select value={capacityFilter} onValueChange={handleCapacityChange}>
                  <SelectTrigger className="h-12 pl-12 pr-4 border-2 border-gray-300 rounded-lg font-medium text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all">
                    <SelectValue placeholder="Chọn sức chứa" />
                  </SelectTrigger>
                  <SelectContent className="z-100 max-w-xs" position="popper" align="start" sideOffset={4}>
                    <SelectItem value="all" className="font-medium">Tất cả</SelectItem>
                    <SelectItem value="1-2" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        1-2 người
                      </div>
                    </SelectItem>
                    <SelectItem value="3-4" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        3-4 người
                      </div>
                    </SelectItem>
                    <SelectItem value="5+" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        5+ người
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Lọc theo số người tối đa
              </p>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || priceRange !== "all" || capacityFilter !== "all") && (
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-gray-700">Bộ lọc đang áp dụng:</span>
              {searchTerm && (
                <div className="flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg border-2 border-primary-300 font-semibold text-sm">
                  <span className="w-4 h-4">{ICONS.SEARCH}</span>
                  &ldquo;{searchTerm}&rdquo;
                  <button
                    onClick={() => handleSearch("")}
                    className="w-4 h-4 hover:scale-125 transition-transform"
                  >
                    {ICONS.CLOSE}
                  </button>
                </div>
              )}
              {priceRange !== "all" && (
                <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border-2 border-blue-300 font-semibold text-sm">
                  <span className="w-4 h-4">{ICONS.DOLLAR_SIGN}</span>
                  {priceRange === "budget" && "Tiết kiệm"}
                  {priceRange === "standard" && "Tiêu chuẩn"}
                  {priceRange === "premium" && "Cao cấp"}
                  {priceRange === "luxury" && "Sang trọng"}
                  <button
                    onClick={() => handlePriceChange("all")}
                    className="w-4 h-4 hover:scale-125 transition-transform"
                  >
                    {ICONS.CLOSE}
                  </button>
                </div>
              )}
              {capacityFilter !== "all" && (
                <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg border-2 border-purple-300 font-semibold text-sm">
                  <span className="w-4 h-4">{ICONS.USERS}</span>
                  {capacityFilter === "1-2" && "1-2 người"}
                  {capacityFilter === "3-4" && "3-4 người"}
                  {capacityFilter === "5+" && "5+ người"}
                  <button
                    onClick={() => handleCapacityChange("all")}
                    className="w-4 h-4 hover:scale-125 transition-transform"
                  >
                    {ICONS.CLOSE}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
