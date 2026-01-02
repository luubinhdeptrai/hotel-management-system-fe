"use client";

import * as React from "react";
import { ICONS } from "@/src/constants/icons.enum";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/mock-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function Navbar() {
  const user = getCurrentUser();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-primary-100 bg-linear-to-r from-white via-primary-50/30 to-white px-4 shadow-sm backdrop-blur-sm">
        <SidebarTrigger className="h-10 w-10 hover:bg-primary-100 transition-all duration-200 rounded-lg" />

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-linear-to-b from-primary-600 to-primary-400 rounded-full" />
            <h1 className="text-lg font-bold bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Hệ Thống Quản Lý Khách Sạn
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-primary-100 transition-all duration-200 text-gray-700 hover:text-primary-600 hover:scale-110"
            >
              <span className="w-5 h-5">{ICONS.SEARCH}</span>
            </button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-10 items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 hover:bg-primary-50 hover:border-primary-300 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-600 to-primary-500 text-white shadow-sm">
                    <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.USER}</span>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">
                      {user?.role || "User"}
                    </span>
                  </div>
                  <span className="inline-flex items-center justify-center w-4 h-4 text-gray-500">{ICONS.CHEVRON_DOWN}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-primary-200 shadow-lg">
                <DropdownMenuLabel className="font-semibold text-gray-900">
                  Tài khoản của tôi
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary-100" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary-50 focus:bg-primary-50 focus:text-primary-700">
                  <Link href="/profile">
                    <span className="w-4 h-4 mr-2">{ICONS.USER}</span>
                    Xem Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-primary-50 focus:bg-primary-50 focus:text-primary-700">
                  <span className="w-4 h-4 mr-2">{ICONS.SETTINGS}</span>
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary-100" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-error-50 focus:bg-error-50 focus:text-error-700">
                  <Link href="/logout">
                    <span className="w-4 h-4 mr-2">{ICONS.LOGOUT}</span>
                    Đăng xuất
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-primary-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 text-primary-600">{ICONS.SEARCH}</span>
              Tìm kiếm
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                {ICONS.SEARCH}
              </span>
              <Input
                placeholder="Tìm kiếm phòng, khách hàng, đặt phòng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                autoFocus
              />
            </div>
            <div className="rounded-lg border border-primary-100 bg-primary-50/30 p-4 text-center text-sm text-gray-600">
              {searchQuery ? (
                <p>Đang tìm kiếm: <span className="font-semibold text-primary-600">{searchQuery}</span></p>
              ) : (
                <p>Nhập từ khóa để tìm kiếm...</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
