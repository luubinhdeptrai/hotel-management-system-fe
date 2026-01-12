/**
 * Calendar Events List Component
 * 
 * Displays a list of calendar events with filters
 */

"use client";

import { useState } from "react";
import { CalendarEvent, EventType } from "@/lib/types/pricing";
import { CalendarEventCard } from "./calendar-event-card";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter } from "lucide-react";

interface CalendarEventsListProps {
  events: CalendarEvent[];
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  loading?: boolean;
}

export function CalendarEventsList({ events, onEdit, onDelete, loading = false }: CalendarEventsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | EventType>("ALL");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "active" | "past">("all");

  // Filter events
  const filteredEvents = events.filter((event) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = event.name.toLowerCase().includes(query);
      const matchDesc = event.description?.toLowerCase().includes(query);
      if (!matchName && !matchDesc) return false;
    }

    // Type filter
    if (typeFilter !== "ALL" && event.type !== typeFilter) {
      return false;
    }

    // Time filter
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (timeFilter === "upcoming" && start < now) return false;
    if (timeFilter === "active" && (start > now || end < now)) return false;
    if (timeFilter === "past" && end >= now) return false;

    return true;
  });

  // Group events by status
  const upcomingCount = events.filter(e => new Date(e.startDate) >= new Date()).length;
  const activeCount = events.filter(e => {
    const now = new Date();
    return new Date(e.startDate) <= now && new Date(e.endDate) >= now;
  }).length;
  const pastCount = events.filter(e => new Date(e.endDate) < new Date()).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải sự kiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "ALL" | EventType)}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả loại</SelectItem>
            <SelectItem value={EventType.HOLIDAY}>Ngày Lễ</SelectItem>
            <SelectItem value={EventType.SEASONAL}>Mùa Vụ</SelectItem>
            <SelectItem value={EventType.SPECIAL_EVENT}>Sự Kiện</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Tabs */}
      <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as "all" | "upcoming" | "active" | "past")}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Tất cả ({events.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Sắp tới ({upcomingCount})
          </TabsTrigger>
          <TabsTrigger value="active">
            Đang diễn ra ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="past">
            Đã qua ({pastCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy sự kiện nào.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <CalendarEventCard
              key={event.id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
