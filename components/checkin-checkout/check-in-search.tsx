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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm theo mã đặt phòng hoặc tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-10 border-gray-300 focus:ring-primary-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {ICONS.SEARCH}
          </div>
        </div>
        <Button
          onClick={handleSearch}
          className="h-10 bg-primary-600 hover:bg-primary-500 text-white rounded-md"
        >
          {ICONS.SEARCH}
          <span className="ml-2">Tìm kiếm</span>
        </Button>
      </div>
      <Button
        onClick={onWalkIn}
        variant="outline"
        className="h-10 border-primary-600 text-primary-600 hover:bg-primary-50"
      >
        {ICONS.USER_CHECK}
        <span className="ml-2">Khách vãng lai (Walk-in)</span>
      </Button>
    </div>
  );
}
