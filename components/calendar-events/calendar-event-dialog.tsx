/**
 * Calendar Event Dialog Component
 * 
 * Modal dialog for creating/editing calendar events
 */

"use client";

import { CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest } from "@/lib/types/pricing";
import { CalendarEventForm } from "./calendar-event-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Edit2, Plus } from "lucide-react";

interface CalendarEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent; // If provided, dialog is in edit mode
  onSubmit: (data: CreateCalendarEventRequest | UpdateCalendarEventRequest) => Promise<boolean>;
  loading?: boolean;
}

export function CalendarEventDialog({
  open,
  onOpenChange,
  event,
  onSubmit,
  loading = false,
}: CalendarEventDialogProps) {
  const handleSubmit = async (data: CreateCalendarEventRequest | UpdateCalendarEventRequest) => {
    const success = await onSubmit(data);
    if (success) {
      onOpenChange(false);
    }
    return success;
  };

  const isEditMode = !!event;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl">
        {/* Header with Gradient */}
        <div className={`p-6 border-b-2 ${isEditMode 
          ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" 
          : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
        }`}>
          <div className="flex items-center gap-4">
            {isEditMode ? (
              <>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Edit2 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-amber-900">
                    Chỉnh Sửa Sự Kiện
                  </DialogTitle>
                  <DialogDescription className="text-amber-700 mt-1">
                    Cập nhật thông tin sự kiện: <strong>{event.name}</strong>
                  </DialogDescription>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-blue-900">
                    Tạo Sự Kiện Mới
                  </DialogTitle>
                  <DialogDescription className="text-blue-700 mt-1">
                    Thêm sự kiện mới vào lịch (Lễ, Mùa vụ, hoặc Sự kiện đặc biệt)
                  </DialogDescription>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6">
          <CalendarEventForm
            event={event}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
