"use client";

import { useNotification } from "@/hooks/use-notification";
import { useState, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setModalOpen,
  setActiveBookingRoomId,
  setRoomGuests,
} from "@/lib/redux/slices/checkin.slice";
import { MultiCustomerSelectionData } from "../reservations/booking-modal/multi-customer-selection-card";
import { MultiCustomerSelectionDialog } from "./multi-customer-selection-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// Removed unused Checkbox import
import { ICONS } from "@/src/constants/icons.enum";
import type { BackendCheckInRequest } from "@/lib/types/checkin-checkout";
import type { Booking } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { bookingService } from "@/lib/services";

interface ModernCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  // onConfirm removed as it's internal now
  isLoading?: boolean; // Kept for compatibility but unused
}

export function ModernCheckInModal({
  open,
  onOpenChange,
  booking,
}: ModernCheckInModalProps) {
  const dispatch = useAppDispatch();
  const notification = useNotification();
  const { roomGuests, activeBookingRoomId } = useAppSelector(
    (state) => state.checkin
  );
  // Remove onConfirm from props as we handle it internally now, or keep it optional?
  // ideally checking in is now verified inside this component.
  // actually, let's use the bookingService directly here for the single room action.

  const [notes, setNotes] = useState("");
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [detailedBooking, setDetailedBooking] = useState<Booking | null>(
    booking
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Redux state when modal opens
  useEffect(() => {
    const initData = async () => {
      if (open && booking) {
        try {
          // Fetch full booking details to get nested bookingCustomers
          // The booking prop from search results might not have deep nested data
          const fullBookingData = await bookingService.getBookingById(
            booking.id
          );

          if (fullBookingData?.booking) {
            setDetailedBooking(fullBookingData.booking);

            // Initialize roomGuests from fetched booking data
            if (fullBookingData.booking.bookingRooms) {
              fullBookingData.booking.bookingRooms.forEach((br) => {
                if (br.bookingCustomers && br.bookingCustomers.length > 0) {
                  const guests = br.bookingCustomers
                    .filter((bc) => bc.customer)
                    .map((bc) => ({
                      customerId: bc.customer!.id,
                      fullName: bc.customer!.fullName,
                    }));

                  if (guests.length > 0) {
                    dispatch(
                      setRoomGuests({
                        bookingRoomId: br.id,
                        guests,
                      })
                    );
                  }
                }
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch booking details:", error);
          // Fallback to prop data if fetch fails
          setDetailedBooking(booking);
        }
      }
    };

    initData();
  }, [open, booking, dispatch]);

  const activeBooking = detailedBooking || booking;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
      dispatch(setModalOpen(newOpen));
    },
    [onOpenChange, dispatch]
  );

  const handleCheckInClick = (bookingRoomId: string) => {
    dispatch(setActiveBookingRoomId(bookingRoomId));
    setShowCustomerSelection(true);
  };

  const handleCustomerSelected = async (data: MultiCustomerSelectionData) => {
    if (activeBookingRoomId && activeBooking) {
      if (data.customers.length === 0) {
        notification.showError("Vui lòng chọn ít nhất một khách hàng!");
        return;
      }

      setIsProcessing(true);
      try {
        // 1. Prepare Check-in Request
        const checkInInfo = [
          {
            bookingRoomId: activeBookingRoomId,
            customerIds: data.customers.map((c) => c.customerId),
          },
        ];

        const requestData: BackendCheckInRequest = {
          checkInInfo,
        };

        // 2. Call API
        await bookingService.checkIn(requestData);

        // 3. Update UI - Refresh data
        const fullBookingData = await bookingService.getBookingById(
          activeBooking.id
        );
        if (fullBookingData?.booking) {
          setDetailedBooking(fullBookingData.booking);
        }

        // 4. Update Redux state local to this session (optional but correct)
        const newGuests = data.customers.map((c) => ({
          customerId: c.customerId,
          fullName: c.customerName,
        }));
        dispatch(
          setRoomGuests({
            bookingRoomId: activeBookingRoomId,
            guests: newGuests,
          })
        );

        notification.showSuccess("Check-in phòng thành công!");
        setShowCustomerSelection(false);
        dispatch(setActiveBookingRoomId(null));
      } catch (error) {
        console.error("Check-in failed:", error);
        notification.showError(
          "Check-in thất bại: " +
            (error instanceof Error ? error.message : "Đã có lỗi xảy ra")
        );
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleQuickCheckInAll = async () => {
    if (!activeBooking || !activeBooking.bookingRooms) return;

    const confirmedRooms = activeBooking.bookingRooms.filter(
      (br) => br.status === "CONFIRMED"
    );

    if (confirmedRooms.length === 0) {
      notification.showError("Không có phòng nào cần check-in!");
      return;
    }

    // Prepare data: Check in ALL confirmed rooms
    // If a room has guests assigned in Redux, use them.
    // Otherwise, AUTO-ASSIGN the Primary Customer (Test Mode / Quick Mode).
    const checkInInfo = confirmedRooms.map((br) => {
      const assignedGuests = roomGuests[br.id] || [];
      const customerIds =
        assignedGuests.length > 0
          ? assignedGuests.map((g) => g.customerId)
          : activeBooking.primaryCustomer
          ? [activeBooking.primaryCustomer.id]
          : []; // Should not happen if booking has primary customer

      return {
        bookingRoomId: br.id,
        customerIds,
      };
    });

    // Validate if any room has no customer (edge case)
    if (checkInInfo.some((info) => info.customerIds.length === 0)) {
      notification.showError(
        "Không tìm thấy thông tin khách hàng để gán tự động!"
      );
      return;
    }

    setIsProcessing(true);
    try {
      const requestData: BackendCheckInRequest = {
        checkInInfo,
      };

      await bookingService.checkIn(requestData);

      // Refresh data
      const fullBookingData = await bookingService.getBookingById(
        activeBooking.id
      );
      if (fullBookingData?.booking) {
        setDetailedBooking(fullBookingData.booking);
      }

      notification.showSuccess(
        `Đã check-in nhanh cho ${confirmedRooms.length} phòng!`
      );

      // Clear selections if any
      dispatch(setActiveBookingRoomId(null));
    } catch (error) {
      console.error("Quick check-in failed:", error);
      notification.showError(
        "Check-in nhanh thất bại: " +
          (error instanceof Error ? error.message : "Đã có lỗi xảy ra")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!activeBooking) return null;

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modern Header with Gradient */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="w-7 h-7 text-white">{ICONS.CALENDAR_CHECK}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                Chi Tiết Booking & Check-in
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Mã Booking:{" "}
                <span className="font-mono font-semibold text-blue-600">
                  {activeBooking.bookingCode}
                </span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                {activeBooking.bookingRooms?.length || 0}{" "}
                {activeBooking.bookingRooms?.length === 1 ? "Phòng" : "Phòng"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={() => handleOpenChange(false)}
              >
                <div className="w-5 h-5 text-gray-500">{ICONS.CLOSE}</div>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Guest Information Card */}
          {activeBooking.primaryCustomer && (
            <Card className="border-2 border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="w-5 h-5 text-white">{ICONS.USER}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Thông Tin Khách Đặt
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Họ tên</p>
                    <p className="font-semibold text-gray-900">
                      {activeBooking.primaryCustomer.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Số điện thoại</p>
                    <p className="font-semibold text-gray-900">
                      {activeBooking.primaryCustomer.phone}
                    </p>
                  </div>
                  {activeBooking.primaryCustomer.email && (
                    <div className="col-span-2">
                      <p className="text-gray-500 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">
                        {activeBooking.primaryCustomer.email}
                      </p>
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
                  <span className="w-5 h-5 text-white">
                    {ICONS.CALENDAR_DAYS}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi Tiết Lưu Trú
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Ngày Check-in</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(activeBooking.checkInDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Ngày Check-out</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(activeBooking.checkOutDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Tổng khách</p>
                  <p className="font-semibold text-gray-900">
                    {activeBooking.totalGuests} khách
                  </p>
                </div>
                <div className="col-span-3">
                  <Separator className="my-2" />
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Tổng Tiền
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(activeBooking.totalAmount)}
                      </span>
                    </div>
                    {activeBooking.depositRequired && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                          Tiền Cọc Yêu Cầu
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(activeBooking.depositRequired)}
                        </span>
                      </div>
                    )}
                    {activeBooking.balance !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                          Số Dư Còn Lại
                        </span>
                        <span
                          className={`font-bold ${
                            parseFloat(activeBooking.balance) > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatCurrency(activeBooking.balance)}
                        </span>
                      </div>
                    )}
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
              <h3 className="text-lg font-semibold text-gray-900">
                Danh Sách Phòng
              </h3>
            </div>

            <div className="space-y-3">
              {activeBooking.bookingRooms?.map((bookingRoom) => {
                const isConfirmed = bookingRoom.status === "CONFIRMED";
                const isCheckedIn = bookingRoom.status === "CHECKED_IN";
                // Only show guests if they are assigned
                const currentGuests = roomGuests[bookingRoom.id] || [];
                // const guestCount = currentGuests.length; // unused

                return (
                  <Card
                    key={bookingRoom.id}
                    className={cn(
                      "border-2 transition-all duration-200",
                      isCheckedIn
                        ? "border-green-200 bg-green-50/30 opacity-80"
                        : isConfirmed
                        ? "border-blue-100 bg-white"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        {/* Row 1: Room Info */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4
                                className={cn(
                                  "font-bold",
                                  isCheckedIn
                                    ? "text-green-800"
                                    : "text-gray-900"
                                )}
                              >
                                Phòng{" "}
                                {bookingRoom.room?.roomNumber ||
                                  bookingRoom.roomId}
                              </h4>
                              <Badge
                                variant={isCheckedIn ? "default" : "outline"}
                                className={cn(
                                  "text-xs",
                                  isCheckedIn
                                    ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                    : ""
                                )}
                              >
                                {isCheckedIn
                                  ? "Đã Check-in"
                                  : bookingRoom.roomType?.name || "Phòng"}
                              </Badge>
                              {!isConfirmed && !isCheckedIn && (
                                <Badge variant="secondary" className="text-xs">
                                  {bookingRoom.status}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs">Giá</p>
                                <p className="font-semibold">
                                  {formatCurrency(bookingRoom.totalAmount)}
                                </p>
                              </div>
                              {currentGuests.length > 0 && (
                                <div className="col-span-2">
                                  <p className="text-xs font-medium text-blue-600">
                                    {currentGuests
                                      .map((g) => g.fullName)
                                      .join(", ")}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="flex items-center gap-2">
                            {isConfirmed && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                onClick={() =>
                                  handleCheckInClick(bookingRoom.id)
                                }
                                disabled={isProcessing}
                              >
                                {isProcessing ? ICONS.LOADING : ICONS.CHECK}
                                <span className="ml-2">Check-in</span>
                              </Button>
                            )}
                            {isCheckedIn && (
                              <div className="flex items-center text-green-600 gap-1 text-sm font-medium px-3 py-1.5 bg-green-50 rounded-md">
                                <span className="w-4 h-4">
                                  {ICONS.CHECK_CIRCLE}
                                </span>
                                <span>Đã xong</span>
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

          {/* Notes - kept same */}
          <div>
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Ghi Chú Check-in
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú thêm cho lần check-in này..."
              className="resize-none text-sm"
            />
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="pt-4 border-t flex justify-between sm:justify-between items-center bg-gray-50/50 p-6 -mx-6 -mb-6 mt-4">
          {/* Left side: Notes or Status if needed */}
          <div className="text-xs text-gray-500 italic">
            * Check-in nhanh sẽ tự động gán khách hàng chính nếu chưa chọn
            khách.
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="min-w-[100px]"
              disabled={isProcessing}
            >
              Đóng
            </Button>

            {activeBooking.bookingRooms?.some(
              (br) => br.status === "CONFIRMED"
            ) && (
              <Button
                onClick={handleQuickCheckInAll}
                disabled={isProcessing}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 mr-2 animate-spin">
                      {ICONS.LOADING}
                    </span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 mr-2">{ICONS.CHECK_CIRCLE}</span>
                    Check-in Tất Cả (
                    {
                      activeBooking.bookingRooms.filter(
                        (br) => br.status === "CONFIRMED"
                      ).length
                    }
                    )
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      <MultiCustomerSelectionDialog
        open={showCustomerSelection}
        onOpenChange={setShowCustomerSelection}
        onConfirm={handleCustomerSelected}
        initialCustomerIds={
          activeBookingRoomId
            ? roomGuests[activeBookingRoomId]?.map((g) => g.customerId)
            : []
        }
        title="Chọn Khách Hàng & Check-in Ngay"
      />
    </Dialog>
  );
}
