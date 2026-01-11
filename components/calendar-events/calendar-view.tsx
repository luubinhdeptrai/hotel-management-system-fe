/**
 * Calendar View Component
 * 
 * Visual calendar grid showing events by week/month
 * Inspired by professional calendar UIs
 */

"use client";

import { useState, useMemo } from "react";
import { CalendarEvent, EventType } from "@/lib/types/pricing";
import { formatDateRange, getEventTypeColor, getEventTypeLabel, shouldEventOccurOnDate } from "@/lib/services/calendar-event.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  view?: "month" | "week";
  compact?: boolean; // Compact mode for more items
}

export function CalendarView({ events, onEventClick, view = "week", compact = true }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get start and end of current view
  const { viewStart, viewEnd, dates } = useMemo(() => {
    if (view === "week") {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // End of week (Saturday)

      const dates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }

      return { viewStart: start, viewEnd: end, dates };
    } else {
      // Month view
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const dates: Date[] = [];
      const firstDayOfWeek = start.getDay();
      
      // Add previous month days
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(start);
        date.setDate(date.getDate() - i - 1);
        dates.push(date);
      }
      
      // Add current month days
      for (let i = 1; i <= end.getDate(); i++) {
        dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
      }
      
      // Add next month days to complete the grid
      const remainingDays = 42 - dates.length; // 6 weeks * 7 days
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(end);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }

      return { viewStart: start, viewEnd: end, dates };
    }
  }, [currentDate, view]);

  // Filter events for current view
  const visibleEvents = useMemo(() => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= viewEnd && eventEnd >= viewStart;
    });
  }, [events, viewStart, viewEnd]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return visibleEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // Check if date is within event's date range
      const inDateRange = eventStart <= dateOnly && eventEnd >= dateOnly;
      
      // If in range, check if RRule allows this date
      if (inDateRange) {
        return shouldEventOccurOnDate(event.rrule, date, event.startDate);
      }
      
      return false;
    });
  };

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format header
  const formatViewHeader = () => {
    if (view === "week") {
      const start = dates[0];
      const end = dates[dates.length - 1];
      return `${start.toLocaleDateString("vi-VN", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("vi-VN", { month: "long", day: "numeric", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hôm nay
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-bold">{formatViewHeader()}</h2>
        </div>
      </div>

      {/* Week View */}
      {view === "week" && (
        <Card className="overflow-hidden border-2 shadow-lg">
          <div className="grid grid-cols-8 border-b bg-gradient-to-r from-blue-50 to-teal-50">
            <div className="p-3 text-center text-sm font-semibold text-muted-foreground border-r">
              Giờ
            </div>
            {dates.map((date, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 text-center border-r last:border-r-0",
                  isToday(date) && "bg-blue-500 text-white font-bold"
                )}
              >
                <div className="text-xs font-medium">
                  {date.toLocaleDateString("vi-VN", { weekday: "short" })}
                </div>
                <div className={cn("text-2xl font-bold", !isToday(date) && "text-blue-600")}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative" style={{ maxHeight: "800px", overflowY: "auto" }}>
            {/* Hour rows - show all 24 hours */}
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="grid grid-cols-8 border-b min-h-[40px] hover:bg-blue-50/30">
                <div className="p-1.5 text-center text-xs text-muted-foreground border-r bg-gray-50 font-medium sticky left-0 z-10">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {dates.map((date, dayIdx) => {
                  const dayEvents = getEventsForDate(date);
                  const hourEvents = dayEvents.filter(event => {
                    const startHour = new Date(event.startDate).getHours();
                    const endHour = new Date(event.endDate).getHours();
                    return hour >= startHour && hour <= endHour;
                  });

                  return (
                    <div
                      key={dayIdx}
                      className="relative border-r last:border-r-0 p-0.5 hover:bg-blue-50"
                    >
                      {hourEvents.map((event, eventIdx) => {
                        // Only show on first hour of event
                        const startHour = new Date(event.startDate).getHours();
                        if (hour !== startHour) return null;

                        const color = getEventTypeColor(event.type);
                        const duration = Math.ceil(
                          (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) /
                            (1000 * 60 * 60)
                        );

                        return (
                          <div
                            key={event.id}
                            onClick={() => onEventClick?.(event)}
                            className="absolute inset-x-0.5 rounded px-1.5 py-1 text-xs font-semibold shadow cursor-pointer hover:shadow-lg transition-all overflow-hidden line-clamp-2"
                            style={{
                              backgroundColor: `${color}`,
                              color: "white",
                              height: `${Math.max(Math.min(duration * 40, 120), 32)}px`,
                              zIndex: 10 + eventIdx,
                            }}
                            title={event.name}
                          >
                            <div className="font-bold truncate text-xs">{event.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Month View */}
      {view === "month" && (
        <Card className="overflow-hidden border-2 shadow-lg">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b bg-gradient-to-r from-blue-50 to-teal-50">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-bold text-blue-700 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7" style={{ maxHeight: "800px", overflowY: "auto" }}>
            {dates.map((date, idx) => {
              const dayEvents = getEventsForDate(date);
              const today = isToday(date);
              const currentMonth = isCurrentMonth(date);

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[140px] border-r border-b p-2 hover:bg-blue-50/50 transition-colors",
                    !currentMonth && "bg-gray-50/50 text-muted-foreground",
                    (idx + 1) % 7 === 0 && "border-r-0"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-semibold mb-2",
                      today && "w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white"
                    )}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 4).map((event) => {
                      const color = getEventTypeColor(event.type);
                      return (
                        <div
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity font-medium truncate shadow-sm"
                          style={{
                            backgroundColor: `${color}`,
                            color: "white",
                          }}
                          title={event.name}
                        >
                          {event.name}
                        </div>
                      );
                    })}
                    {dayEvents.length > 4 && (
                      <div className="text-xs text-muted-foreground font-semibold">
                        +{dayEvents.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getEventTypeColor(EventType.HOLIDAY) }}></div>
          <span className="text-sm font-medium">{getEventTypeLabel(EventType.HOLIDAY)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getEventTypeColor(EventType.SEASONAL) }}></div>
          <span className="text-sm font-medium">{getEventTypeLabel(EventType.SEASONAL)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getEventTypeColor(EventType.SPECIAL_EVENT) }}></div>
          <span className="text-sm font-medium">{getEventTypeLabel(EventType.SPECIAL_EVENT)}</span>
        </div>
      </div>
    </div>
  );
}
