/**
 * Calendar Event Service
 * 
 * API service for managing calendar events (holidays, seasonal events, special events)
 * Backend: roommaster-be/src/controllers/employee/employee.calendar-event.controller.ts
 */

import type {
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/lib/types/pricing";
import { getAccessToken } from "./api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
const API_PREFIX = "/employee/calendar-events";

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || "API request failed");
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ==============================
// RRule Parsing Helper
// ==============================

/**
 * Parse RRule and check if event occurs on specific date
 * Supports: FREQ=WEEKLY;BYDAY=SA,SU and other common patterns
 * 
 * @param rrule - RFC 5545 RRule pattern (or null for non-recurring)
 * @param date - Date to check
 * @param startDate - Event start date
 * @returns true if event should occur on this date
 */
export function shouldEventOccurOnDate(
  rrule: string | null | undefined,
  date: Date,
  startDate: string
): boolean {
  // Non-recurring events occur only on their date
  if (!rrule) {
    const eventStart = new Date(startDate);
    const eventDateOnly = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
    const checkDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return eventDateOnly.getTime() === checkDateOnly.getTime();
  }

  // Parse RRule pattern
  try {
    // Handle FREQ=WEEKLY;BYDAY=XX pattern
    if (rrule.includes("FREQ=WEEKLY") && rrule.includes("BYDAY=")) {
      const byDayMatch = rrule.match(/BYDAY=([^;]+)/);
      if (byDayMatch) {
        const daysOfWeek = byDayMatch[1].split(',');
        const dayMap: Record<string, number> = {
          'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
        };
        
        const dateDay = date.getDay();
        return daysOfWeek.some(day => dayMap[day.toUpperCase()] === dateDay);
      }
    }

    // Handle FREQ=YEARLY;BYMONTH=XX;BYMONTHDAY=XX pattern
    if (rrule.includes("FREQ=YEARLY")) {
      const byMonthMatch = rrule.match(/BYMONTH=(\d+)/);
      const byDayMatch = rrule.match(/BYMONTHDAY=(\d+)/);
      
      if (byMonthMatch && byDayMatch) {
        const month = parseInt(byMonthMatch[1]) - 1; // 0-indexed
        const day = parseInt(byDayMatch[1]);
        return date.getMonth() === month && date.getDate() === day;
      } else if (byMonthMatch) {
        // Only month specified, use start date's day
        const eventStart = new Date(startDate);
        const month = parseInt(byMonthMatch[1]) - 1;
        return date.getMonth() === month && date.getDate() === eventStart.getDate();
      }
    }

    // Handle FREQ=MONTHLY;BYMONTHDAY=XX pattern
    if (rrule.includes("FREQ=MONTHLY") && rrule.includes("BYMONTHDAY=")) {
      const byDayMatch = rrule.match(/BYMONTHDAY=(\d+)/);
      if (byDayMatch) {
        const day = parseInt(byDayMatch[1]);
        return date.getDate() === day;
      }
    }

    // Default: if can't parse, assume event spans entire range
    return true;
  } catch (err) {
    console.error("Error parsing RRule:", err);
    return true;
  }
}

// ==============================
// Calendar Events CRUD
// ==============================

/**
 * Get all calendar events
 * Optional filters: startDate, endDate
 * 
 * Backend logic:
 * - If startDate: filters events where endDate >= startDate
 * - If endDate: filters events where startDate <= endDate
 * - Results sorted by startDate ASC
 * - Includes active pricing rules
 * 
 * @param filters - Optional date range filters
 * @returns Array of calendar events
 */
export async function getCalendarEvents(filters?: {
  startDate?: string; // ISO date (YYYY-MM-DD)
  endDate?: string; // ISO date (YYYY-MM-DD)
}): Promise<CalendarEvent[]> {
  const url = new URL(`${API_BASE_URL}${API_PREFIX}`);

  if (filters?.startDate) {
    url.searchParams.set("startDate", filters.startDate);
  }
  if (filters?.endDate) {
    url.searchParams.set("endDate", filters.endDate);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<CalendarEvent[]>(response);
}

/**
 * Get calendar event by ID
 * Includes active pricing rules sorted by rank
 * 
 * @param id - Calendar event ID
 * @returns Calendar event with pricing rules
 */
export async function getCalendarEventById(id: string): Promise<CalendarEvent> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<CalendarEvent>(response);
}

/**
 * Create a new calendar event
 * 
 * @param data - Calendar event data
 * @returns Created calendar event
 */
export async function createCalendarEvent(
  data: CreateCalendarEventRequest
): Promise<CalendarEvent> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<CalendarEvent>(response);
}

/**
 * Update calendar event
 * 
 * @param id - Calendar event ID
 * @param data - Updated calendar event data
 * @returns Updated calendar event
 */
export async function updateCalendarEvent(
  id: string,
  data: UpdateCalendarEventRequest
): Promise<CalendarEvent> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<CalendarEvent>(response);
}

/**
 * Delete calendar event
 * 
 * @param id - Calendar event ID
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse<void>(response);
}

// ==============================
// Utility Functions
// ==============================

/**
 * Get color for event type (for UI)
 */
export function getEventTypeColor(type: "HOLIDAY" | "SEASONAL" | "SPECIAL_EVENT"): string {
  switch (type) {
    case "HOLIDAY":
      return "#ef4444"; // red-500
    case "SEASONAL":
      return "#3b82f6"; // blue-500
    case "SPECIAL_EVENT":
      return "#8b5cf6"; // violet-500
    default:
      return "#6b7280"; // gray-500
  }
}

/**
 * Get label for event type (Vietnamese)
 */
export function getEventTypeLabel(type: "HOLIDAY" | "SEASONAL" | "SPECIAL_EVENT"): string {
  switch (type) {
    case "HOLIDAY":
      return "Ngày Lễ";
    case "SEASONAL":
      return "Mùa Vụ";
    case "SPECIAL_EVENT":
      return "Sự Kiện";
    default:
      return "Không xác định";
  }
}

/**
 * Format RRule for display (basic patterns)
 */
export function formatRRule(rrule: string | null): string {
  if (!rrule) return "Không lặp lại";

  // Common patterns
  if (rrule.includes("FREQ=YEARLY")) {
    return "Lặp lại hàng năm";
  }
  if (rrule.includes("FREQ=MONTHLY")) {
    return "Lặp lại hàng tháng";
  }
  if (rrule.includes("FREQ=WEEKLY")) {
    return "Lặp lại hàng tuần";
  }
  if (rrule.includes("FREQ=DAILY")) {
    return "Lặp lại hàng ngày";
  }

  return `RRule: ${rrule}`;
}

/**
 * Check if event is recurring
 */
export function isRecurringEvent(event: CalendarEvent): boolean {
  return !!event.rrule;
}

/**
 * Validate RRule pattern (basic)
 */
export function isValidRRule(rrule: string): boolean {
  return /^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/i.test(rrule);
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (start.toDateString() === end.toDateString()) {
    return formatDate(start);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
}
