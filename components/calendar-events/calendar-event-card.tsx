/**
 * Calendar Event Card Component
 * 
 * Displays a single calendar event with all details
 */

"use client";

import { CalendarEvent } from "@/lib/types/pricing";
import { formatDateRange, formatRRule, isRecurringEvent } from "@/lib/services/calendar-event.service";
import { EventTypeBadge } from "./event-type-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Edit, Trash2, RefreshCw, Tag } from "lucide-react";

interface CalendarEventCardProps {
  event: CalendarEvent;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

export function CalendarEventCard({ event, onEdit, onDelete }: CalendarEventCardProps) {
  const isRecurring = isRecurringEvent(event);
  const dateRange = formatDateRange(event.startDate, event.endDate);
  const rruleText = formatRRule(event.rrule);

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: getEventTypeColor(event.type) }}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl font-bold">{event.name}</CardTitle>
              <EventTypeBadge type={event.type} />
              {isRecurring && (
                <Badge variant="secondary" className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Lặp lại
                </Badge>
              )}
            </div>
            {event.description && (
              <CardDescription className="text-sm text-muted-foreground">
                {event.description}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(event)}
                className="hover:bg-blue-50 hover:text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(event)}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{dateRange}</span>
          </div>
          {isRecurring && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              <span>{rruleText}</span>
            </div>
          )}
          {event.pricingRules && event.pricingRules.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span>{event.pricingRules.length} pricing rule(s) linked</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ children, variant, className, style }: { children: React.ReactNode; variant?: string; className?: string; style?: React.CSSProperties }) {
  const baseClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variantClass = variant === "secondary" 
    ? "bg-secondary text-secondary-foreground" 
    : "border";
  
  return (
    <span className={`${baseClass} ${variantClass} ${className || ""}`} style={style}>
      {children}
    </span>
  );
}

function getEventTypeColor(type: string): string {
  switch (type) {
    case "HOLIDAY": return "#ef4444";
    case "SEASONAL": return "#3b82f6";
    case "SPECIAL_EVENT": return "#8b5cf6";
    default: return "#6b7280";
  }
}
