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
    title: "Nhân Viên",
    url: "/staff",
    icon: ICONS.USER_COG,
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
        <SidebarHeader className="border-b border-primary-100 bg-gradient-to-br from-primary-50 via-white to-primary-50/30">
          <div className="flex items-center gap-3 px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/20">
              <span className="text-lg">{ICONS.HOTEL}</span>
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-base font-bold text-gray-900 truncate">
                UIT Hotel System
              </span>
              <span className="text-xs text-gray-600 truncate font-medium">
                Quản lý khách sạn
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-gradient-to-b from-gray-50 to-white scrollbar-hide">
          {/* Dashboard */}
          <SidebarGroup>
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
                              "transition-all duration-200 h-11 text-sm font-medium",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white border-l-4 border-primary-700 hover:from-primary-700 hover:to-primary-600 shadow-md"
                                : "hover:bg-primary-50 hover:text-primary-700 text-gray-700 hover:border-l-4 hover:border-primary-300"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-sm")}>{item.icon}</span>
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
          <SidebarGroup className="bg-linear-to-br from-primary-50/40 via-transparent to-transparent border-t border-b border-primary-100/50 py-2">
            <SidebarGroupLabel className="text-[11px] font-bold text-primary-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary-600"></span>
              Quản lý Phòng
              <span className="w-1 h-1 rounded-full bg-primary-600"></span>
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
                              "transition-all duration-200 h-11 text-sm font-medium",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white border-l-4 border-primary-700 hover:from-primary-700 hover:to-primary-600 shadow-md"
                                : "hover:bg-primary-50 hover:text-primary-700 text-gray-700 hover:border-l-4 hover:border-primary-300"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-sm")}>{item.icon}</span>
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
          <SidebarGroup className="bg-linear-to-br from-success-50/40 via-transparent to-transparent border-t border-b border-success-100/50 py-2">
            <SidebarGroupLabel className="text-[11px] font-bold text-success-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-success-600"></span>
              Booking & Check-in/out
              <span className="w-1 h-1 rounded-full bg-success-600"></span>
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
                              "transition-all duration-200 h-11 text-sm font-medium",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white border-l-4 border-primary-700 hover:from-primary-700 hover:to-primary-600 shadow-md"
                                : "hover:bg-success-50 hover:text-primary-700 text-gray-700 hover:border-l-4 hover:border-primary-300"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-sm")}>{item.icon}</span>
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
          <SidebarGroup className="bg-linear-to-br from-error-50/40 via-transparent to-transparent border-t border-b border-error-100/50 py-2">
            <SidebarGroupLabel className="text-[11px] font-bold text-error-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-error-600"></span>
              Dịch Vụ & Thanh Toán
              <span className="w-1 h-1 rounded-full bg-error-600"></span>
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
                              "transition-all duration-200 h-11 text-sm font-medium",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white border-l-4 border-primary-700 hover:from-primary-700 hover:to-primary-600 shadow-md"
                                : "hover:bg-error-50 hover:text-primary-700 text-gray-700 hover:border-l-4 hover:border-primary-300"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-sm")}>{item.icon}</span>
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
          <SidebarGroup className="bg-linear-to-br from-warning-50/40 via-transparent to-transparent border-t border-b border-warning-100/50 py-2">
            <SidebarGroupLabel className="text-[11px] font-bold text-warning-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-warning-600"></span>
              Vận hành
              <span className="w-1 h-1 rounded-full bg-warning-600"></span>
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
                              "transition-all duration-200 h-11 text-sm font-medium",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white border-l-4 border-primary-700 hover:from-primary-700 hover:to-primary-600 shadow-md"
                                : "hover:bg-warning-50 hover:text-primary-700 text-gray-700 hover:border-l-4 hover:border-primary-300"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-sm")}>{item.icon}</span>
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
          <SidebarGroup className="bg-linear-to-br from-info-50/40 via-transparent to-transparent border-t border-b border-info-100/50 py-2">
            <SidebarGroupLabel className="text-[11px] font-bold text-info-700 uppercase tracking-widest px-4 py-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-info-600"></span>
              Quản Trị
              <span className="w-1 h-1 rounded-full bg-info-600"></span>
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
                              "transition-all duration-200 h-11 text-sm font-medium",
                              isActive
                                ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white border-l-4 border-primary-700 hover:from-primary-700 hover:to-primary-600 shadow-md"
                                : "hover:bg-info-50 hover:text-primary-700 text-gray-700 hover:border-l-4 hover:border-primary-300"
                            )}
                          >
                            <Link href={item.url} className="flex items-center gap-3">
                              <span className={cn("w-5 h-5", isActive && "drop-shadow-sm")}>{item.icon}</span>
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

        <SidebarFooter className="border-t border-primary-100 bg-gradient-to-br from-error-50/50 via-white to-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className="h-11 hover:bg-error-50 hover:text-error-600 transition-all duration-200 text-gray-700 font-medium hover:border-l-4 hover:border-error-400"
                  >
                    <Link href="/logout" className="flex items-center gap-3">
                      <span className="w-5 h-5">{ICONS.LOGOUT}</span>
                      <span>Đăng Xuất</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                  Đăng Xuất
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
