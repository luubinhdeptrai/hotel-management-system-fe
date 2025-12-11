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
        <SidebarHeader className="border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
              {ICONS.HOTEL}
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-base font-semibold text-gray-900 truncate">
                UIT Hotel System
              </span>
              <span className="text-xs text-gray-500 truncate">
                Quản lý khách sạn
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-gray-50 scrollbar-hide">
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
                              "transition-colors",
                              isActive
                                ? "bg-primary-100 text-primary-600 border-l-4 border-primary-600 hover:bg-primary-100"
                                : "hover:bg-primary-100 hover:text-primary-600 text-gray-700"
                            )}
                          >
                            <Link href={item.url}>
                              {item.icon}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
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
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Quản lý Phòng
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
                              "transition-colors",
                              isActive
                                ? "bg-primary-100 text-primary-600 border-l-4 border-primary-600 hover:bg-primary-100"
                                : "hover:bg-primary-100 hover:text-primary-600 text-gray-700"
                            )}
                          >
                            <Link href={item.url}>
                              {item.icon}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
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
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Đặt Phòng & Check-in/out
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
                              "transition-colors",
                              isActive
                                ? "bg-primary-100 text-primary-600 border-l-4 border-primary-600 hover:bg-primary-100"
                                : "hover:bg-primary-100 hover:text-primary-600 text-gray-700"
                            )}
                          >
                            <Link href={item.url}>
                              {item.icon}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
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
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Dịch Vụ & Thanh Toán
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
                              "transition-colors",
                              isActive
                                ? "bg-primary-100 text-primary-600 border-l-4 border-primary-600 hover:bg-primary-100"
                                : "hover:bg-primary-100 hover:text-primary-600 text-gray-700"
                            )}
                          >
                            <Link href={item.url}>
                              {item.icon}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Quản Trị
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
                              "transition-colors",
                              isActive
                                ? "bg-primary-100 text-primary-600 border-l-4 border-primary-600 hover:bg-primary-100"
                                : "hover:bg-primary-100 hover:text-primary-600 text-gray-700"
                            )}
                          >
                            <Link href={item.url}>
                              {item.icon}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Operational Management */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Vận hành
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
                              "transition-colors",
                              isActive
                                ? "bg-primary-100 text-primary-600 border-l-4 border-primary-600 hover:bg-primary-100"
                                : "hover:bg-primary-100 hover:text-primary-600 text-gray-700"
                            )}
                          >
                            <Link href={item.url}>
                              {item.icon}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
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

        <SidebarFooter className="border-t border-gray-200 bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-error-100 hover:text-error-600 transition-colors"
                  >
                    <Link href="/logout">
                      {ICONS.LOGOUT}
                      <span>Đăng Xuất</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">Đăng Xuất</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
