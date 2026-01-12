/**
 * Calendar Events Hook
 * 
 * Custom hook for managing calendar events state and operations
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/services/calendar-event.service";
import type {
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/lib/types/pricing";

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all events
  const loadEvents = useCallback(async (filters?: { startDate?: string; endDate?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCalendarEvents(filters);
      setEvents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load calendar events";
      setError(message);
      console.error("Error loading calendar events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Get event by ID
  const getEventById = useCallback(async (id: string): Promise<CalendarEvent | null> => {
    try {
      const event = await getCalendarEventById(id);
      return event;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load calendar event";
      setError(message);
      console.error("Error loading calendar event:", err);
      return null;
    }
  }, []);

  // Create event
  const createEvent = useCallback(async (data: CreateCalendarEventRequest): Promise<boolean> => {
    setError(null);
    try {
      const newEvent = await createCalendarEvent(data);
      setEvents((prev) => [...prev, newEvent].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create calendar event";
      setError(message);
      console.error("Error creating calendar event:", err);
      return false;
    }
  }, []);

  // Update event
  const updateEvent = useCallback(
    async (id: string, data: UpdateCalendarEventRequest): Promise<boolean> => {
      setError(null);
      try {
        const updatedEvent = await updateCalendarEvent(id, data);
        setEvents((prev) =>
          prev.map((event) => (event.id === id ? updatedEvent : event))
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        );
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update calendar event";
        setError(message);
        console.error("Error updating calendar event:", err);
        return false;
      }
    },
    []
  );

  // Delete event
  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      await deleteCalendarEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete calendar event";
      setError(message);
      console.error("Error deleting calendar event:", err);
      return false;
    }
  }, []);

  // Filter events by type
  const filterByType = useCallback(
    (type: "HOLIDAY" | "SEASONAL" | "SPECIAL_EVENT" | "ALL") => {
      if (type === "ALL") return events;
      return events.filter((event) => event.type === type);
    },
    [events]
  );

  // Get upcoming events
  const getUpcomingEvents = useCallback(
    (limit?: number) => {
      const now = new Date();
      const upcoming = events
        .filter((event) => new Date(event.startDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      return limit ? upcoming.slice(0, limit) : upcoming;
    },
    [events]
  );

  // Get active events (currently happening)
  const getActiveEvents = useCallback(() => {
    const now = new Date();
    return events.filter(
      (event) => new Date(event.startDate) <= now && new Date(event.endDate) >= now
    );
  }, [events]);

  // Get past events
  const getPastEvents = useCallback(
    (limit?: number) => {
      const now = new Date();
      const past = events
        .filter((event) => new Date(event.endDate) < now)
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
      
      return limit ? past.slice(0, limit) : past;
    },
    [events]
  );

  // Search events by name
  const searchEvents = useCallback(
    (query: string) => {
      const lowercaseQuery = query.toLowerCase();
      return events.filter((event) =>
        event.name.toLowerCase().includes(lowercaseQuery) ||
        event.description?.toLowerCase().includes(lowercaseQuery)
      );
    },
    [events]
  );

  return {
    // State
    events,
    loading,
    error,

    // Operations
    loadEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,

    // Filters & Search
    filterByType,
    getUpcomingEvents,
    getActiveEvents,
    getPastEvents,
    searchEvents,
  };
}
