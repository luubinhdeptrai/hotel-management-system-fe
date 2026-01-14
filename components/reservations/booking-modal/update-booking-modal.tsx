"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Reservation } from "@/lib/types/reservation";
import { ICONS } from "@/src/constants/icons.enum";
import { useAppDispatch } from "@/lib/redux/hooks";
import { updateBooking, fetchBookings } from "@/lib/redux/slices/booking.slice";
import { format } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionService } from "@/lib/services/transaction.service";
import { PaymentMethod, PAYMENT_METHOD_LABELS } from "@/lib/types/api";

// Schema for updating booking
const updateBookingSchema = z
  .object({
    checkInDate: z.date({ required_error: "Vui lòng chọn ngày nhận phòng" }),
    checkOutDate: z.date({ required_error: "Vui lòng chọn ngày trả phòng" }),
    totalGuests: z.number().min(1, "Số khách phải ít nhất là 1"),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Ngày trả phòng phải sau ngày nhận phòng",
    path: ["checkOutDate"],
  });

type UpdateBookingValues = z.infer<typeof updateBookingSchema>;

interface UpdateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

export function UpdateBookingModal({
  isOpen,
  onClose,
  reservation,
}: UpdateBookingModalProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeposit, setConfirmDeposit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  // Determine if deposit confirmation is allowed/needed
  // Allowed if status is PENDING or deposit not fully paid
  const canConfirmDeposit =
    reservation &&
    (reservation.backendStatus === "PENDING" ||
      (reservation.depositRequired > 0 &&
        (reservation.paidDeposit || 0) < reservation.depositRequired));

  const form = useForm<UpdateBookingValues>({
    resolver: zodResolver(updateBookingSchema),
    defaultValues: {
      checkInDate: new Date(),
      checkOutDate: new Date(),
      totalGuests: 1,
    },
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    if (reservation && isOpen) {
      reset({
        checkInDate: new Date(reservation.checkInDate),
        checkOutDate: new Date(reservation.checkOutDate),
        // Calculate total guests from details if possible, otherwise use default
        totalGuests:
          reservation.details.reduce(
            (sum, detail) => sum + detail.numberOfGuests,
            0
          ) || 1,
      });
      // Reset deposit confirmation state when modal opens
      setConfirmDeposit(false);
      setPaymentMethod("CASH");
    }
  }, [reservation, isOpen, reset]);

  const onSubmit = async (data: UpdateBookingValues) => {
    if (!reservation) return;
    setIsSubmitting(true);
    try {
      // 1. Update Booking
      await dispatch(
        updateBooking({
          id: reservation.id,
          data: {
            checkInDate: data.checkInDate.toISOString(),
            checkOutDate: data.checkOutDate.toISOString(),
            totalGuests: data.totalGuests,
          },
        })
      ).unwrap();

      // 2. Confirm Deposit if checked
      if (confirmDeposit && canConfirmDeposit) {
        await transactionService.createTransaction({
          bookingId: reservation.id,
          paymentMethod: paymentMethod,
          transactionType: "DEPOSIT",
          // Amount is auto-calculated by backend
        });
        toast.success("Đã xác nhận tiền cọc thành công");
      }

      await dispatch(fetchBookings({ limit: 1000 }));
      toast.success("Cập nhật đặt phòng thành công");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        "Cập nhật thất bại: " +
          (error instanceof Error ? error.message : "Có lỗi xảy ra")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-50 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-blue-600">
              {ICONS.EDIT} Cập Nhật Đặt Phòng #
              {reservation.bookingCode || reservation.reservationID}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Read-only info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border shadow-sm">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Khách hàng
                </label>
                <p className="font-bold text-gray-900 mt-1">
                  {reservation.customer.customerName}
                </p>
                <p className="text-sm text-gray-600">
                  {reservation.customer.phoneNumber}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Phòng hiện tại
                </label>
                <div className="flex flex-col gap-2 mt-1">
                  {reservation.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="text-sm font-semibold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 flex justify-between"
                    >
                      <span>{detail.roomName}</span>
                      <span className="text-gray-500 text-xs self-center">
                        {detail.roomTypeName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                  {ICONS.CALENDAR}
                </span>
                Thông tin lưu trú
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dates */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ngày nhận phòng
                  </label>
                  <Controller
                    control={control}
                    name="checkInDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal border-gray-300 h-10",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ngày trả phòng
                  </label>
                  <Controller
                    control={control}
                    name="checkOutDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal border-gray-300 h-10",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date <= form.getValues("checkInDate")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tổng số khách
                </label>
                <Controller
                  control={control}
                  name="totalGuests"
                  render={({ field }) => (
                    <input
                      type="number"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      min={1}
                    />
                  )}
                />
              </div>
            </div>

            {/* Deposit Section */}
            {canConfirmDeposit && (
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm space-y-4">
                <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-yellow-200 text-yellow-700 rounded-full flex items-center justify-center text-xs">
                    $
                  </span>
                  Xác nhận đặt cọc
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="flex items-start space-x-3 pt-2">
                    <Checkbox
                      id="confirmDeposit"
                      checked={confirmDeposit}
                      onCheckedChange={(checked) =>
                        setConfirmDeposit(checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="confirmDeposit"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Xác nhận đã nhận tiền cọc
                      </Label>
                      <p className="text-sm text-yellow-700">
                        Tiền cọc yêu cầu:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(reservation.depositRequired)}
                      </p>
                    </div>
                  </div>

                  {confirmDeposit && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="paymentMethod"
                        className="text-sm font-medium text-gray-700"
                      >
                        Phương thức thanh toán
                      </Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(val) =>
                          setPaymentMethod(val as PaymentMethod)
                        }
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Chọn phương thức" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAYMENT_METHOD_LABELS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 hover:bg-gray-100"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 h-10 font-bold px-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Cập nhật & Lưu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
