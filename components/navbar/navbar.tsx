"use client";

import * as React from "react";
import { ICONS } from "@/src/constants/icons.enum";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/mock-auth";

export function Navbar() {
  const user = getCurrentUser();
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
      <SidebarTrigger className="h-10 w-10 hover:bg-gray-100 transition-colors" />

      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">
            Hệ Thống Quản Lý Khách Sạn
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
            {ICONS.SEARCH}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              {ICONS.USER}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user?.role}
              </span>
              {/* <span className="text-xs text-gray-500">{user?.role}</span> */}
            </div>
            {ICONS.CHEVRON_DOWN}
          </div>
        </div>
      </div>
    </header>
  );
}
