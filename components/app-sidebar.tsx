"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ICONS } from "@/src/constants/icons.enum";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
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
import { PermissionGuard } from "@/components/permission-guard";
import { authService } from "@/lib/services/auth.service";

// Navigation items based on page-description.md
const navItems = [
  {
    title: "Reports",
    url: "/reports",
    icon: ICONS.BAR_CHART,
    permission: "report:read",
  },
];

const roomManagement = [
  {
    title: "Quản lý Phòng",
    url: "/rooms",
    icon: ICONS.BED_DOUBLE,
    permission: "room:read",
  },
  {
    title: "Loại Phòng",
    url: "/room-types",
    icon: ICONS.DOOR_OPEN,
    permission: "roomType:read",
  },
  {
    title: "Tiện Nghi",
    url: "/room-tags",
    icon: ICONS.TAG,
    permission: "roomTag:read",
  },
];

const bookingManagement = [
  {
    title: "Đặt Phòng",
    url: "/reservations",
    icon: ICONS.CALENDAR,
    permission: "booking:read",
  },
];

const serviceManagement = [
  {
    title: "Dịch Vụ",
    url: "/services",
    icon: ICONS.UTENSILS,
    permission: "service:read",
  },
  {
    title: "Sự Kiện & Lịch",
    url: "/calendar-events",
    icon: ICONS.CALENDAR,
    permission: "calendar:read",
  },
  {
    title: "Khuyến Mại",
    url: "/promotions",
    icon: ICONS.TAG,
    permission: "promotion:read",
  },
  {
    title: "Phụ Thu",
    url: "/surcharges",
    icon: ICONS.SURCHARGE,
    permission: "surcharge:read",
  },
  {
    title: "Phí Phạt",
    url: "/penalties",
    icon: ICONS.PENALTY,
    permission: "penalty:read",
  },
  {
    title: "Giao Dịch",
    url: "/transactions",
    icon: ICONS.CREDIT_CARD,
    permission: "transaction:read",
  },
  {
    title: "Folio",
    url: "/folio",
    icon: ICONS.FILE_TEXT,
    permission: "transaction:read",
  },
  {
    title: "Thanh Toán",
    url: "/payments",
    icon: ICONS.RECEIPT,
    permission: "transaction:create",
  },
];

const adminManagement = [
  {
    title: "Khách hàng",
    url: "/customers",
    icon: ICONS.USER,
    permission: "customer:read",
  },
  {
    title: "Hạng Khách Hàng",
    url: "/customer-ranks",
    icon: ICONS.STAR,
    permission: "customerRank:read",
  },

  {
    title: "Nhân Viên",
    url: "/staff",
    icon: ICONS.USER_COG,
    permission: "employee:read",
  },
  {
    title: "Hoạt Động",
    url: "/activities",
    icon: ICONS.ACTIVITY,
    permission: "report:read",
  },
  {
    title: "Cài đặt",
    url: "/app-settings",
    icon: ICONS.SETTINGS,
    permission: "appSettings:read",
  },
];

const operationalManagement = [
  {
    title: "Housekeeping",
    url: "/housekeeping",
    icon: ICONS.CLIPBOARD_LIST,
    permission: "room:updateStatus",
  },
  {
    title: "Chuyển Phòng",
    url: "/room-move",
    icon: ICONS.DOOR_OPEN,
    permission: "room:update",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();

  const renderMenuItems = (items: any[]) => {
    return items.map((item) => {
      const isActive = pathname === item.url;

      // Special case: Always render RoomType for authenticated users (read-only for non-admin)
      if (item.title === "Loại Phòng" && authService.isAuthenticated()) {
        return (
          <SidebarMenuItem key={item.title}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "transition-all duration-200 h-10 text-sm font-medium mx-2 rounded-lg",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-600 hover:to-teal-500"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-3 px-2"
                  >
                    <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-slate-800 text-white border-slate-700"
              >
                {item.title}
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        );
      }

      // If permission is required, wrap with PermissionGuard
      if (item.permission) {
        return (
          <PermissionGuard key={item.title} permission={item.permission}>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "transition-all duration-200 h-10 text-sm font-medium mx-2 rounded-lg",
                      isActive
                        ? "bg-linear-to-r from-blue-600 to-teal-500 text-white hover:from-blue-600 hover:to-teal-500"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-2"
                    >
                      <span className="w-5 h-5 shrink-0">{item.icon}</span>
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-slate-800 text-white border-slate-700"
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </PermissionGuard>
        );
      }

      // No permission required, render normally
      return (
        <SidebarMenuItem key={item.title}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                className={cn(
                  "transition-all duration-200 h-10 text-sm font-medium mx-2 rounded-lg",
                  isActive
                    ? "bg-linear-to-r from-blue-600 to-teal-500 text-white hover:from-blue-600 hover:to-teal-500"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <Link href={item.url} className="flex items-center gap-3 px-2">
                  <span className="w-5 h-5 shrink-0">{item.icon}</span>
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-slate-800 text-white border-slate-700"
            >
              {item.title}
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        data-sidebar-state={state}
        {...props}
      >
        <SidebarHeader className="border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3 px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-teal-600 text-white shadow-lg">
              <span className="text-xl">{ICONS.HOTEL}</span>
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold text-white">
                UIT Hotel System
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Quản lý khách sạn
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-slate-900 scrollbar-hide">
          <SidebarGroup className="py-3 border-b border-slate-700">
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
                              "transition-all duration-200 h-11 text-sm font-medium mx-2 rounded-lg",
                              isActive
                                ? "bg-linear-to-r from-blue-600 to-teal-500 text-white hover:from-blue-600 hover:to-teal-500"
                                : "text-slate-300 hover:text-white hover:bg-slate-800"
                            )}
                          >
                            <Link
                              href={item.url}
                              className="flex items-center gap-3 px-2"
                            >
                              <span className="w-5 h-5 shrink-0">
                                {item.icon}
                              </span>
                              <span className="group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-slate-800 text-white border-slate-700"
                        >
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
          <SidebarGroup className="border-b border-slate-700 py-3">
            <SidebarGroupLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-2 mb-2">
              Quản lý Phòng
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(roomManagement)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Booking Management */}
          <SidebarGroup className="border-b border-slate-700 py-3">
            <SidebarGroupLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-2 mb-2">
              Booking
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(bookingManagement)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Service & Payment */}
          <SidebarGroup className="border-b border-slate-700 py-3">
            <SidebarGroupLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-2 mb-2">
              Dịch Vụ & Thanh Toán
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(serviceManagement)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Operational Management */}
          <SidebarGroup className="border-b border-slate-700 py-3">
            <SidebarGroupLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-2 mb-2">
              Vận hành
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {renderMenuItems(operationalManagement)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin */}
          <SidebarGroup className="border-b border-slate-700 py-3">
            <SidebarGroupLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-2 mb-2">
              Quản Trị
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(adminManagement)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
