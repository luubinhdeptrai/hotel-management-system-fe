"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

interface CheckOutSearchProps {
  onSearch: (query: string) => void;
}

export function CheckOutSearch({ onSearch }: CheckOutSearchProps) {
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
      <div className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
            {ICONS.SEARCH}
          </div>
          <Input
            placeholder="Tìm theo mã phòng hoặc mã phiếu thuê..."
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
    </div>
  );
}

