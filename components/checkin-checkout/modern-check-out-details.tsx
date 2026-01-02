"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import type { Booking, BookingRoom } from "@/lib/types/api";
import type { PaymentMethod } from "@/lib/types/payment";
import { cn } from "@/lib/utils";

interface ModernCheckOutDetailsProps {
  booking: Booking;
  bookingRooms: BookingRoom[];
  onBack: () => void;
  onAddService: () => void;
  onAddPenalty: () => void;
  onAddSurcharge: () => void;
  onCompleteCheckout: () => void;
  onConfirmPayment: (method: PaymentMethod) => Promise<string>;
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  isLoading?: boolean;
}

export function ModernCheckOutDetails({
  booking,
  bookingRooms,
  onBack,
  onCompleteCheckout,
  isLoading = false,
}: ModernCheckOutDetailsProps) {
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(
    new Set(bookingRooms.map((br) => br.id))
  );

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    return bookingRooms
      .filter((br) => selectedRooms.has(br.id))
      .reduce((sum, br) => sum + parseFloat(br.totalAmount), 0);
  };

  const nights = calculateNights();
  const totalAmount = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2"
          disabled={isLoading}
        >
          <span className="w-4 h-4">{ICONS.ARROW_LEFT}</span>
          Back to Search
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check-out Details</h2>
          <p className="text-sm text-gray-600">
            Booking Code: <span className="font-mono font-semibold text-blue-600">{booking.bookingCode}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Guest and Stay Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          {booking.primaryCustomer && (
            <Card className="border-2 border-gray-100 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="w-5 h-5 text-white">{ICONS.USER}</span>
                  </div>
                  <span>Guest Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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

          {/* Stay Details */}
          <Card className="border-2 border-gray-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="w-5 h-5 text-white">{ICONS.CALENDAR_DAYS}</span>
                </div>
                <span>Stay Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Check-in Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(booking.checkInDate)}</p>
                  {bookingRooms[0]?.actualCheckIn && (
                    <p className="text-xs text-gray-500 mt-1">
                      Actual: {formatDateTime(bookingRooms[0].actualCheckIn)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Check-out Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(booking.checkOutDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Number of Nights</p>
                  <p className="font-semibold text-gray-900">{nights} nights</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Total Guests</p>
                  <p className="font-semibold text-gray-900">{booking.totalGuests} guests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms to Check-out */}
          <Card className="border-2 border-gray-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="w-5 h-5 text-white">{ICONS.BUILDING}</span>
                </div>
                <span>Rooms to Check-out</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookingRooms.map((bookingRoom) => {
                  const isSelected = selectedRooms.has(bookingRoom.id);
                  
                  return (
                    <Card
                      key={bookingRoom.id}
                      className={cn(
                        "border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                        isSelected
                          ? "border-blue-500 bg-blue-50/50"
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
                              <Badge
                                variant={bookingRoom.status === "CHECKED_IN" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {bookingRoom.status}
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
                                <p className="text-gray-500 text-xs">Nights</p>
                                <p className="font-semibold text-gray-900">{nights}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Room Total</p>
                                <p className="font-semibold text-gray-900">
                                  {formatCurrency(bookingRoom.totalAmount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary and Actions */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card className="border-2 border-gray-100 shadow-md sticky top-6">
            <CardHeader className="pb-3 bg-linear-to-br from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="w-5 h-5 text-white">{ICONS.CREDIT_CARD}</span>
                </div>
                <span>Payment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Room Charges</span>
                  <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Charges</span>
                  <span className="font-semibold">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Penalties</span>
                  <span className="font-semibold">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Surcharges</span>
                  <span className="font-semibold">{formatCurrency(0)}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-700 font-medium">Amount Paid</span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(parseFloat(booking.totalAmount) - parseFloat(booking.balance))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-blue-700 font-medium">Balance Due</span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(booking.balance)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <Button
                onClick={onCompleteCheckout}
                disabled={isLoading || selectedRooms.size === 0}
                className="w-full h-12 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-base font-semibold"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 mr-2 animate-spin">{ICONS.LOADING}</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="w-5 h-5 mr-2">{ICONS.CHECK}</span>
                    Complete Check-out ({selectedRooms.size})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
