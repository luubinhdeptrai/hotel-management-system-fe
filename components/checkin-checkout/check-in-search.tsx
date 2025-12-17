"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

interface CheckInSearchProps {
  onSearch: (query: string) => void;
  onWalkIn: () => void;
}

export function CheckInSearch({ onSearch, onWalkIn }: CheckInSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-linear-to-br from-white via-gray-50 to-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
              {ICONS.SEARCH}
            </div>
            <Input
              placeholder="Tìm theo mã đặt phòng hoặc tên khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-14 pl-12 pr-4 border-2 border-gray-300 rounded-xl font-semibold text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all shadow-sm"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-14 px-8 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="w-5 h-5">{ICONS.SEARCH}</span>
            <span className="ml-2">Tìm kiếm</span>
          </Button>
        </div>
        <div className="flex justify-center lg:justify-end">
          <Button
            onClick={onWalkIn}
            variant="outline"
            className="h-14 px-8 border-2 border-success-600 text-success-600 hover:bg-success-50 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <span className="w-5 h-5">{ICONS.USER_CHECK}</span>
            <span className="ml-2">Khách vãng lai (Walk-in)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

