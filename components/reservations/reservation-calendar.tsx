"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReservationEvent } from "@/lib/types/reservation";
import { cn } from "@/lib/utils";

interface ReservationCalendarProps {
  events: ReservationEvent[];
  onEventClick?: (event: ReservationEvent) => void;
}

const STATUS_COLORS = {
  "Đã đặt": "bg-blue-100 text-blue-700 border-blue-300",
  "Đã nhận": "bg-green-100 text-green-700 border-green-300",
  "Đã hủy": "bg-red-100 text-red-700 border-red-300",
  "Không đến": "bg-gray-100 text-gray-700 border-gray-300",
};

export function ReservationCalendar({
  events,
  onEventClick,
}: ReservationCalendarProps) {
  // Get unique rooms from events
  const rooms = Array.from(new Set(events.map((e) => e.roomName))).sort();

  // Get date range from events
  const today = new Date();
  const dates: Date[] = [];
  for (let i = -3; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  // Helper to check if event overlaps with date
  const getEventForRoomAndDate = (roomName: string, date: Date) => {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return events.find((event) => {
      if (event.roomName !== roomName) return false;
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return eventStart <= dateEnd && eventEnd >= dateStart;
    });
  };

  // Helper to format date
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  // Helper to check if date is today
  const isToday = (date: Date) => {
    const todayDate = new Date();
    return (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    );
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <div className="p-5 min-w-[1000px]">
          {/* Header with dates */}
          <div className="flex border-b border-gray-300">
            <div className="w-32 shrink-0 p-3 font-semibold text-gray-700">
              Phòng
            </div>
            {dates.map((date, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex-1 min-w-[60px] p-2 text-center text-sm border-l border-gray-300",
                  isToday(date) && "bg-primary-50"
                )}
              >
                <div className="font-medium text-gray-700">
                  {formatDate(date)}
                </div>
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString("vi-VN", { weekday: "short" })}
                </div>
              </div>
            ))}
          </div>

          {/* Rows for each room */}
          {rooms.map((roomName) => (
            <div key={roomName} className="flex border-b border-gray-200">
              <div className="w-32 shrink-0 p-3 font-medium text-gray-700">
                {roomName}
              </div>
              {dates.map((date, idx) => {
                const event = getEventForRoomAndDate(roomName, date);
                const isFirstDay =
                  event &&
                  new Date(event.start).toDateString() === date.toDateString();

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex-1 min-w-[60px] p-1 border-l border-gray-200 relative",
                      isToday(date) && "bg-primary-50"
                    )}
                  >
                    {event && isFirstDay && (
                      <button
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "absolute left-1 right-1 top-1 bottom-1 rounded text-xs p-1 border transition-all z-10 hover:z-20 hover:shadow-md",
                          STATUS_COLORS[event.status],
                          "text-left overflow-hidden"
                        )}
                        style={{
                          width: `calc(${
                            Math.ceil(
                              (event.end.getTime() - event.start.getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) * 100
                          }% - 8px)`,
                        }}
                      >
                        <div className="font-medium truncate">
                          {event.customerName}
                        </div>
                        <div className="text-[10px] opacity-75">
                          {event.numberOfGuests} người
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-5 pt-0 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            Đã đặt
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-300">
            Đã nhận
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-100 text-red-700 border-red-300">
            Đã hủy
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gray-100 text-gray-700 border-gray-300">
            Không đến
          </Badge>
        </div>
      </div>
    </Card>
  );
}
