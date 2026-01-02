"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ICONS } from "@/src/constants/icons.enum";
import type { BackendCheckInRequest } from "@/lib/types/checkin-checkout";
import type { Booking } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface ModernCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onConfirm: (data: BackendCheckInRequest) => Promise<void>;
  isLoading?: boolean;
}

interface RoomCheckInState {
  bookingRoomId: string;
  customerIds: string[];
  numberOfGuests: number;
}

export function ModernCheckInModal({
  open,
  onOpenChange,
  booking,
  onConfirm,
  isLoading = false,
}: ModernCheckInModalProps) {
  const [checkInStates, setCheckInStates] = useState<RoomCheckInState[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());

  // Reset state when modal closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setCheckInStates([]);
      setNotes("");
      setSelectedRooms(new Set());
    }
    onOpenChange(newOpen);
  }, [onOpenChange]);

  // Initialize state when modal opens with booking data
  // Note: Setting multiple states here is intentional - we're initializing derived state
  // based on booking data and dialog open state. The warning can be ignored as this is
  // a valid pattern for initialization effects.
  useEffect(() => {
    if (!open || !booking?.bookingRooms) {
      return;
    }

    const initialStates = booking.bookingRooms
      .filter((br) => br.status === "CONFIRMED")
      .map((br) => ({
        bookingRoomId: br.id,
        customerIds: [booking.primaryCustomerId],
        numberOfGuests: 1,
      }));
    
    // Update states together to prevent cascading renders
    const newSelectedRooms = new Set(initialStates.map((s) => s.bookingRoomId));
    setCheckInStates(initialStates);
    setSelectedRooms(newSelectedRooms);
  }, [booking?.id, booking?.primaryCustomerId, booking?.bookingRooms, open]);

  const toggleRoomSelection = (bookingRoomId: string) => {
    setSelectedRooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingRoomId)) {
        newSet.delete(bookingRoomId);
      } else {
        newSet.add(bookingRoomId);
      }
      return newSet;
    });
  };

  const updateCustomerCount = (bookingRoomId: string, count: number) => {
    setCheckInStates((prev) =>
      prev.map((state) =>
        state.bookingRoomId === bookingRoomId
          ? { ...state, numberOfGuests: Math.max(1, count) }
          : state
      )
    );
  };

  const handleConfirm = async () => {
    if (!booking || selectedRooms.size === 0) return;

    const checkInInfo = checkInStates
      .filter((state) => selectedRooms.has(state.bookingRoomId))
      .map((state) => ({
        bookingRoomId: state.bookingRoomId,
        customerIds: state.customerIds,
      }));

    const requestData: BackendCheckInRequest = {
      checkInInfo,
    };

    try {
      await onConfirm(requestData);
      handleOpenChange(false);
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  if (!booking) return null;

  const formatCurrency = (value: string | number) => {
    const amount = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const confirmedRooms =
    booking.bookingRooms?.filter((br) => br.status === "CONFIRMED") || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modern Header with Gradient */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="w-7 h-7 text-white">{ICONS.CALENDAR_CHECK}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                Check-in Confirmation
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Booking Code: <span className="font-mono font-semibold text-blue-600">{booking.bookingCode}</span>
              </DialogDescription>
            </div>
            <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              {confirmedRooms.length} {confirmedRooms.length === 1 ? "Room" : "Rooms"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Guest Information Card */}
          {booking.primaryCustomer && (
            <Card className="border-2 border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="w-5 h-5 text-white">{ICONS.USER}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">{booking.primaryCustomer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">{booking.primaryCustomer.phone}</p>
                  </div>
                  {booking.primaryCustomer.email && (
                    <div className="col-span-2">
                      <p className="text-gray-500 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{booking.primaryCustomer.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Details Card */}
          <Card className="border-2 border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="w-5 h-5 text-white">{ICONS.CALENDAR_DAYS}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Stay Details</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Check-in</p>
                  <p className="font-semibold text-gray-900">{formatDate(booking.checkInDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Check-out</p>
                  <p className="font-semibold text-gray-900">{formatDate(booking.checkOutDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Total Guests</p>
                  <p className="font-semibold text-gray-900">{booking.totalGuests} guests</p>
                </div>
                <div className="col-span-3">
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600 font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Selection */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <span className="w-5 h-5 text-white">{ICONS.BUILDING}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Select Rooms to Check-in</h3>
            </div>
            <div className="space-y-3">
              {confirmedRooms.map((bookingRoom) => {
                const isSelected = selectedRooms.has(bookingRoom.id);
                const state = checkInStates.find(s => s.bookingRoomId === bookingRoom.id);
                
                return (
                  <Card
                    key={bookingRoom.id}
                    className={cn(
                      "border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => toggleRoomSelection(bookingRoom.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        )}>
                          {isSelected && (
                            <span className="w-4 h-4 text-white">{ICONS.CHECK}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900">
                              Room {bookingRoom.room?.roomNumber || bookingRoom.roomId}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {bookingRoom.roomType?.name || "Room"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">Price/Night</p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(bookingRoom.pricePerNight)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Total</p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(bookingRoom.totalAmount)}
                              </p>
                            </div>
                            {isSelected && state && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <Label htmlFor={`guests-${bookingRoom.id}`} className="text-xs text-gray-500">
                                  Guests
                                </Label>
                                <Input
                                  id={`guests-${bookingRoom.id}`}
                                  type="number"
                                  min="1"
                                  value={state.numberOfGuests}
                                  onChange={(e) =>
                                    updateCustomerCount(bookingRoom.id, parseInt(e.target.value))
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any special requests or notes..."
              className="min-h-20 resize-none"
            />
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedRooms.size === 0}
            className="min-w-[120px] bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 mr-2 animate-spin">{ICONS.LOADING}</span>
                Processing...
              </>
            ) : (
              <>
                <span className="w-4 h-4 mr-2">{ICONS.CHECK}</span>
                Confirm Check-in ({selectedRooms.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
