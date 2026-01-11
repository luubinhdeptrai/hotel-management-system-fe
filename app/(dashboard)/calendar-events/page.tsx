/**
 * Calendar Events Page
 * 
 * Main page for managing calendar events (holidays, seasonal events, special events)
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest } from "@/lib/types/pricing";
import { CalendarEventsList, CalendarEventDialog, CalendarView } from "@/components/calendar-events";
import { NotificationDialog, useNotification } from "@/components/calendar-events/notification-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Info, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarEventsPage() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent, getActiveEvents, getUpcomingEvents } = useCalendarEvents();
  const { notification, show, close } = useNotification();

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [calendarView, setCalendarView] = useState<"month" | "week">("week");

  // Handle create/update
  const handleSubmit = async (data: CreateCalendarEventRequest | UpdateCalendarEventRequest) => {
    setSubmitting(true);
    try {
      let success = false;
      if (editingEvent) {
        success = await updateEvent(editingEvent.id, data);
        if (success) {
          show("success", "✅ Thành công", "Đã cập nhật sự kiện thành công");
        } else {
          show("error", "❌ Lỗi", "Cập nhật sự kiện thất bại");
        }
      } else {
        success = await createEvent(data as CreateCalendarEventRequest);
        if (success) {
          show("success", "✅ Thành công", "Đã tạo sự kiện mới thành công");
        } else {
          show("error", "❌ Lỗi", "Tạo sự kiện mới thất bại");
        }
      }
      return success;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      show("error", "❌ Lỗi", errorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingEvent) return;

    setSubmitting(true);
    try {
      const success = await deleteEvent(deletingEvent.id);
      if (success) {
        show("success", "✅ Thành công", `Đã xóa sự kiện "${deletingEvent.name}"`);
        setDeletingEvent(null);
      } else {
        show("error", "❌ Lỗi", "Xóa sự kiện thất bại");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      show("error", "❌ Lỗi", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open create dialog
  const handleCreate = () => {
    setEditingEvent(undefined);
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  // Statistics
  const activeEventsCount = getActiveEvents().length;
  const upcomingEventsCount = getUpcomingEvents().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header Section with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  📅 Sự Kiện & Lịch
                </h1>
                <p className="text-blue-100 text-lg">
                  Quản lý ngày lễ, mùa vụ và sự kiện đặc biệt cho định giá động
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/room-types?tab=pricing">
                  <Button
                    variant="outline"
                    className="bg-white border-white hover:bg-gray-50 text-blue-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Quy Tắc Giá
                  </Button>
                </Link>
                <Button
                  onClick={handleCreate}
                  className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo Sự Kiện
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Events Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Tổng Sự Kiện
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-xl">📊</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{events.length}</div>
              <p className="text-xs text-gray-500 mt-2">Tất cả sự kiện trong hệ thống</p>
            </CardContent>
          </Card>

          {/* Active Events Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Đang Diễn Ra
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-xl">⏱️</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{activeEventsCount}</div>
              <p className="text-xs text-gray-500 mt-2">Sự kiện đang hoạt động ngày hôm nay</p>
            </CardContent>
          </Card>

          {/* Upcoming Events Card */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-purple-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Sắp Tới
                </CardTitle>
                <div className="p-2 bg-violet-100 rounded-lg">
                  <span className="text-xl">🚀</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-violet-600">{upcomingEventsCount}</div>
              <p className="text-xs text-gray-500 mt-2">Sự kiện trong 30 ngày tới</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links to Related Features */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Calendar Events Link */}
          <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <CardTitle className="text-blue-900">Calendar Events</CardTitle>
                    <p className="text-sm text-blue-700">Sự kiện đặc biệt</p>
                  </div>
                </div>
                <span className="text-2xl">{events.length}</span>
              </div>
            </CardHeader>
          </Card>

          {/* Pricing Rules Link */}
          <Link href="/room-types?tab=pricing">
            <Card className="border-2 border-teal-200 bg-teal-50 hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-200 rounded-lg group-hover:bg-teal-300 transition-colors">
                      <TrendingUp className="w-6 h-6 text-teal-900" />
                    </div>
                    <div>
                      <CardTitle className="text-teal-900">Pricing Rules</CardTitle>
                      <p className="text-sm text-teal-700">Quy tắc định giá động</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Info Card */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-blue-900 text-lg mb-3">
                  ℹ️ Calendar Events là gì?
                </CardTitle>
                <CardDescription className="text-blue-700 space-y-2">
                  <p>Calendar Events được dùng để định nghĩa các sự kiện đặc biệt ảnh hưởng đến giá phòng:</p>
                  <ul className="list-none space-y-2 mt-3">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold">🎉</span>
                      <div>
                        <strong className="text-blue-900">Ngày Lễ:</strong> Tết, 30/4, Quốc Khánh (thường tăng giá)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">☀️</span>
                      <div>
                        <strong className="text-blue-900">Mùa Vụ:</strong> Mùa Hè, Mùa Đông (giá theo mùa)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 font-bold">🎭</span>
                      <div>
                        <strong className="text-blue-900">Sự Kiện:</strong> Concert, Festival, Hội nghị (giá đặc biệt)
                      </div>
                    </li>
                  </ul>
                  <p className="mt-3">✨ Các sự kiện có thể <strong>lặp lại</strong> theo RRule pattern (RFC 5545).</p>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* View Tabs with Enhanced Styling */}
        <div className="mt-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "calendar")}>
            <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <TabsList className="bg-gray-100 p-1">
                <TabsTrigger value="calendar" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  📅 Calendar View
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  📋 List View
                </TabsTrigger>
              </TabsList>
              {viewMode === "calendar" && (
                <div className="flex gap-2">
                  <Button
                    variant={calendarView === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalendarView("week")}
                    className={calendarView === "week" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    🗓️ Tuần
                  </Button>
                  <Button
                    variant={calendarView === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCalendarView("month")}
                    className={calendarView === "month" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    📆 Tháng
                  </Button>
                </div>
              )}
            </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mt-4">
            <CardContent className="pt-6">
              <p className="text-red-600">Lỗi: {error}</p>
            </CardContent>
          </Card>
        )}

        <TabsContent value="calendar" className="mt-4">
          <CalendarView
            events={events}
            onEventClick={handleEdit}
            view={calendarView}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <CalendarEventsList
            events={events}
            onEdit={handleEdit}
            onDelete={setDeletingEvent}
            loading={loading}
          />
        </TabsContent>
          </Tabs>
        </div>

      {/* Create/Edit Dialog */}
      <CalendarEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEvent} onOpenChange={() => setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sự kiện <strong>{deletingEvent?.name}</strong>?
              {deletingEvent?.pricingRules && deletingEvent.pricingRules.length > 0 && (
                <div className="mt-2 text-amber-600">
                  ⚠️ Sự kiện này được liên kết với {deletingEvent.pricingRules.length} pricing rule(s).
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notification Dialog */}
      {notification && (
        <NotificationDialog
          type={notification.type}
          title={notification.title}
          message={notification.message}
          open={!!notification}
          onOpenChange={close}
          autoClose={true}
        />
      )}
      </div>
    </div>
  );
}
