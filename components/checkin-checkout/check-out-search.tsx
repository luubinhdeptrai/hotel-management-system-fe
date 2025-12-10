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
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Tìm theo mã phòng hoặc mã phiếu thuê..."
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
  );
}
