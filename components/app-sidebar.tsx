"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ICONS } from "@/src/constants/icons.enum";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Navigation items based on page-description.md
const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ICONS.DASHBOARD,
  },
];

const roomManagement = [
  {
    title: "Quản lý Phòng",
    url: "/rooms",
    icon: ICONS.BED_DOUBLE,
  },
  {
    title: "Loại Phòng",
    url: "/room-types",
    icon: ICONS.DOOR_OPEN,
  },
  {
    title: "Tiện Nghi",
    url: "/room-tags",
    icon: ICONS.TAG,
  },
];

const bookingManagement = [
  {
    title: "Đặt Phòng",
    url: "/reservations",
    icon: ICONS.CALENDAR,
  },
  {
    title: "Check-in / Check-out",
    url: "/checkin-checkout",
    icon: ICONS.CLIPBOARD_LIST,
  },
];

const serviceManagement = [
  {
    title: "Dịch Vụ",
    url: "/services",
    icon: ICONS.UTENSILS,
  },
  {
    title: "Khuyến Mại",
    url: "/promotions",
    icon: ICONS.TAG,
  },
  {
    title: "Phụ Thu",
    url: "/surcharges",
    icon: ICONS.SURCHARGE,
  },
  {
    title: "Phí Phạt",
    url: "/penalties",
    icon: ICONS.PENALTY,
  },
  {
    title: "Folio",
    url: "/folio",
    icon: ICONS.FILE_TEXT,
  },
  {
    title: "Thanh Toán",
    url: "/payments",
    icon: ICONS.RECEIPT,
  },
];

const adminManagement = [
  {
    title: "Khách hàng",
    url: "/customers",
    icon: ICONS.USER,
  },
  {
    title: "Khách Lưu Trú",
    url: "/nguoio",
    icon: ICONS.USERS,
  },
  {
    title: "Nhân Viên",
    url: "/staff",
    icon: ICONS.USER_COG,
  },
  {
    title: "Hoạt Động",
    url: "/activities",
    icon: ICONS.ACTIVITY,
  },
  {
    title: "Báo Cáo",
    url: "/reports",
    icon: ICONS.BAR_CHART,
  },
];

const operationalManagement = [
  {
    title: "Housekeeping",
    url: "/housekeeping",
    icon: ICONS.CLIPBOARD_LIST,
  },
  {
    title: "Chuyển Phòng",
    url: "/room-move",
    icon: ICONS.DOOR_OPEN,
  },
  {
    title: "Quản lý Ca",
    url: "/shift-management",
    icon: ICONS.CLOCK,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        data-sidebar-state={state}
        {...props}
      >
        <SidebarHeader className="border-b border-primary-100 bg-linear-to-br from-primary-700 via-primary-600 to-primary-500 shadow-lg shadow-primary-600/30">
          <div className="flex items-center gap-3 px-4 py-5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30">
              <span className="text-xl drop-shadow-lg">{ICONS.HOTEL}</span>
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold text-white drop-shadow-sm">
                UIT Hotel System
              </span>
              <span className="text-xs text-white/80 font-semibold drop-shadow-sm">
                Quản lý khách sạn
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-gradient-to-b from-gray-50 via-white to-gray-50/50 scrollbar-hide">
          {/* Dashboard */}
          <SidebarGroup className="py-3">
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "transition-all duration-300 h-12 text-sm font-semibold mx-1 rounded-xl",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 via-primary-500 to-primary-500 text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 border-0"
                                : "hover:bg-primary-100/60 text-gray-700 hover:text-primary-700 hover:shadow-md"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-md")}>{item.icon}</span>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Room Management */}
          <SidebarGroup className="bg-gradient-to-r from-blue-50/60 to-transparent border-t-2 border-b border-blue-200/50 py-3 mt-2">
            <SidebarGroupLabel className="text-[10px] font-bold text-blue-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
              Quản lý Phòng
              <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {roomManagement.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "transition-all duration-300 h-11 text-sm font-semibold mx-1 rounded-xl",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 via-primary-500 to-primary-500 text-white shadow-lg shadow-primary-500/40"
                                : "hover:bg-blue-100/60 text-gray-700 hover:text-blue-700 hover:shadow-md"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-md")}>{item.icon}</span>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Booking Management */}
          <SidebarGroup className="bg-gradient-to-r from-emerald-50/60 to-transparent border-t-2 border-b border-emerald-200/50 py-3 mt-2">
            <SidebarGroupLabel className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-sm"></div>
              Booking & Check-in/out
              <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-sm"></div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {bookingManagement.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "transition-all duration-300 h-11 text-sm font-semibold mx-1 rounded-xl",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 via-primary-500 to-primary-500 text-white shadow-lg shadow-primary-500/40"
                                : "hover:bg-emerald-100/60 text-gray-700 hover:text-emerald-700 hover:shadow-md"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-md")}>{item.icon}</span>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Service & Payment */}
          <SidebarGroup className="bg-gradient-to-r from-rose-50/60 to-transparent border-t-2 border-b border-rose-200/50 py-3 mt-2">
            <SidebarGroupLabel className="text-[10px] font-bold text-rose-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-rose-600 shadow-sm"></div>
              Dịch Vụ & Thanh Toán
              <div className="w-2 h-2 rounded-full bg-rose-600 shadow-sm"></div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {serviceManagement.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "transition-all duration-300 h-11 text-sm font-semibold mx-1 rounded-xl",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 via-primary-500 to-primary-500 text-white shadow-lg shadow-primary-500/40"
                                : "hover:bg-rose-100/60 text-gray-700 hover:text-rose-700 hover:shadow-md"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-md")}>{item.icon}</span>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Operational Management - Moved to top with accent styling */}
          <SidebarGroup className="bg-gradient-to-r from-amber-50/60 to-transparent border-t-2 border-b border-amber-200/50 py-3 mt-2">
            <SidebarGroupLabel className="text-[10px] font-bold text-amber-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-600 shadow-sm"></div>
              Vận hành
              <div className="w-2 h-2 rounded-full bg-amber-600 shadow-sm"></div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {operationalManagement.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "transition-all duration-300 h-11 text-sm font-semibold mx-1 rounded-xl",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 via-primary-500 to-primary-500 text-white shadow-lg shadow-primary-500/40"
                                : "hover:bg-amber-100/60 text-gray-700 hover:text-amber-700 hover:shadow-md"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-md")}>{item.icon}</span>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin - Moved below Operational */}
          <SidebarGroup className="bg-gradient-to-r from-purple-50/60 to-transparent border-t-2 border-b border-purple-200/50 py-3 mt-2">
            <SidebarGroupLabel className="text-[10px] font-bold text-purple-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-purple-600 shadow-sm"></div>
              Quản Trị
              <div className="w-2 h-2 rounded-full bg-purple-600 shadow-sm"></div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminManagement.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "transition-all duration-300 h-11 text-sm font-semibold mx-1 rounded-xl",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 via-primary-500 to-primary-500 text-white shadow-lg shadow-primary-500/40"
                                : "hover:bg-purple-100/60 text-gray-700 hover:text-purple-700 hover:shadow-md"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-md")}>{item.icon}</span>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
