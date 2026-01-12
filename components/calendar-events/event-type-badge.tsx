/**
 * Event Type Badge Component
 * 
 * Displays event type with color coding
 */

"use client";

import { EventType } from "@/lib/types/pricing";
import { getEventTypeColor, getEventTypeLabel } from "@/lib/services/calendar-event.service";
import { Badge } from "@/components/ui/badge";

interface EventTypeBadgeProps {
  type: EventType;
  className?: string;
}

export function EventTypeBadge({ type, className }: EventTypeBadgeProps) {
  const color = getEventTypeColor(type);
  const label = getEventTypeLabel(type);

  return (
    <Badge
      className={className}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: color,
      }}
      variant="outline"
    >
      {label}
    </Badge>
  );
}
