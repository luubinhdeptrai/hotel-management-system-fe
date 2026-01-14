"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  bookingFormSchema,
  BookingFormValues,
} from "@/lib/schemas/booking.schema";
import { ICONS } from "@/src/constants/icons.enum";
import { BookingRoomSelection } from "./booking-room-selection";
import { useAppDispatch } from "@/lib/redux/hooks";
import { fetchRoomTypes } from "@/lib/redux/slices/room-type.slice";
import { BookingCustomerStep } from "./booking-customer-step";
import { updateBooking, fetchBookings } from "@/lib/redux/slices/booking.slice";
import { Reservation } from "@/lib/types/reservation";
import { UpdateBookingRequest } from "@/lib/types/api";
import { X } from "lucide-react";

interface UpdateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

const STEPS = {
  CUSTOMER: 0,
  ROOMS: 1,
  SUMMARY: 2,
};

export function UpdateBookingModal({
  isOpen,
  onClose,
  reservation,
}: UpdateBookingModalProps) {
  const [step, setStep] = useState(STEPS.CUSTOMER);
  const dispatch = useAppDispatch();
  const calculateNights = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema) as any,
    defaultValues: {
      customer: {
        fullName: "",
        phoneNumber: "",
        identityCard: "",
        useExisting: false,
      },
      selectedRooms: [],
      dateRange: {
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 1)),
      },
      totalGuests: 1,
      deposit: {
        amount: 0,
        confirmed: false,
        paymentMethod: "CASH",
      },
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  // Watch values
  const customer = useWatch({ control, name: "customer" });
  const selectedRooms = useWatch({ control, name: "selectedRooms" });
  const dateRange = useWatch({ control, name: "dateRange" });

  // Load initial data
  useEffect(() => {
    if (isOpen && reservation) {
      dispatch(fetchRoomTypes({ limit: 100 }));

      // Map existing reservation to form values
      const defaultValues: Partial<BookingFormValues> = {
        customer: {
          fullName: reservation.customer.customerName,
          phoneNumber: reservation.customer.phoneNumber,
          identityCard: reservation.customer.identityCard,
          email: reservation.customer.email,
          address: reservation.customer.address,
          useExisting: true, // Assuming editing existing customer
          id: reservation.customer.customerID,
        },
        selectedRooms: reservation.details.map((detail) => ({
          roomID: detail.roomId,
          roomName: detail.roomName,
          roomType: {
            id: detail.roomTypeId,
            name: detail.roomTypeName || "Phòng",
            capacity: 0, // Fallback
            totalBed: 0, // Fallback
            basePrice: detail.pricePerNight,
            roomTypeID: detail.roomTypeId,
            roomTypeName: detail.roomTypeName,
            price: detail.pricePerNight,
          },
          roomTypeID: detail.roomTypeId || "", // fallback
          pricePerNight: detail.pricePerNight,
          checkInDate: detail.checkInDate,
          checkOutDate: detail.checkOutDate,
          numberOfGuests: detail.numberOfGuests,
          totalPrice:
            detail.pricePerNight *
            calculateNights(detail.checkInDate, detail.checkOutDate),
          id: detail.roomId,
        })),
        dateRange: {
          from: new Date(reservation.checkInDate),
          to: new Date(reservation.checkOutDate),
        },
        totalGuests: reservation.details.reduce(
          (sum, d) => sum + d.numberOfGuests,
          0
        ),
        deposit: {
          amount: reservation.depositAmount,
          confirmed: reservation.status !== "Chờ xác nhận", // Simplify logic based on status
          paymentMethod: "CASH", // We don't have this in Reservation type, defaulting
        },
        notes: reservation.notes,
      };

      reset(defaultValues as BookingFormValues);
      setStep(STEPS.CUSTOMER);
    }
  }, [isOpen, reservation, dispatch, reset]);

  const handleNext = async () => {
    let isValid = false;
    if (step === STEPS.CUSTOMER) {
      isValid = await trigger("customer");
      if (!customer) {
        toast.error("Vui lòng chọn khách hàng");
        return;
      }
    } else if (step === STEPS.ROOMS) {
      isValid = await trigger(["dateRange", "selectedRooms", "totalGuests"]);
      if (selectedRooms?.length === 0) {
        toast.error("Vui lòng chọn ít nhất một phòng");
        return;
      }
    }

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Determine if full edit is allowed based on status
  // "if booking status still not is CONFIRMED" -> Allow full edit
  // CONFIRMED implies deposit paid.
  // PENDING = Chờ xác nhận
  // CONFIRMED = Đã xác nhận
  const isPending =
    reservation?.status === "Chờ xác nhận" ||
    reservation?.backendStatus === "PENDING";

  const onSubmit = async (data: BookingFormValues) => {
    if (!reservation) return;

    try {
      // Construct update request
      // Note: Backend currently only supports updating checkInDate, checkOutDate, totalGuests
      // This implementation assumes we might be able to update more or the backend needs update
      // For now, we maximize what we send.

      const updateData: UpdateBookingRequest = {
        checkInDate: data.dateRange.from.toISOString(),
        checkOutDate: data.dateRange.to.toISOString(),
        totalGuests: data.totalGuests,
      };

      await dispatch(
        updateBooking({ id: reservation.id, data: updateData })
      ).unwrap();
      await dispatch(fetchBookings({ limit: 1000 }));

      toast.success("Cập nhật đặt phòng thành công");
      onClose();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(`Cập nhật thất bại: ${message}`);
    }
  };

  // Calculate generic total
  const totalAmount =
    selectedRooms?.reduce((sum, room) => sum + (room.totalPrice || 0), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-7xl w-[95vw] max-h-[95vh] h-[90vh] flex flex-col p-0 overflow-hidden bg-gray-50"
      >
        <DialogHeader className="px-6 py-4 bg-white border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {ICONS.EDIT} Cập Nhật Đặt Phòng
              {!isPending && (
                <span className="text-sm font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-2">
                  (Chế độ hạn chế - Đã xác nhận)
                </span>
              )}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: CUSTOMER */}
          {step === STEPS.CUSTOMER && (
            <BookingCustomerStep
              control={control}
              errors={errors}
              // If not pending, maybe disable customer editing?
              // readOnly={!isPending}
            />
          )}

          {/* STEP 2: ROOMS */}
          {step === STEPS.ROOMS && (
            <BookingRoomSelection control={control} errors={errors} />
          )}

          {/* STEP 3: SUMMARY */}
          {step === STEPS.SUMMARY && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-bold mb-4">Xác nhận thay đổi</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Khách hàng</p>
                    <p className="font-medium">{customer?.fullName}</p>
                    <p className="text-sm">{customer?.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian</p>
                    <p className="font-medium">
                      {dateRange.from.toLocaleDateString("vi-VN")} -{" "}
                      {dateRange.to.toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">
                    Phòng đã chọn ({selectedRooms?.length})
                  </p>
                  {selectedRooms?.map((room, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm py-1"
                    >
                      <span>
                        {room.roomName} ({(room as any).roomTypeName || "Phòng"}
                        )
                      </span>
                      <span>{(room.totalPrice || 0).toLocaleString()}₫</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                    <span>Tổng tiền dự kiến</span>
                    <span className="text-primary-600">
                      {totalAmount.toLocaleString()}₫
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  {ICONS.EDIT} Ghi chú
                </h3>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Ghi chú thêm..."
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t shrink-0">
          {step > STEPS.CUSTOMER && (
            <Button
              variant={"outline"}
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
          )}

          {step < STEPS.SUMMARY ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleNext}
            >
              Tiếp theo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Đang xử lý..." : "Lưu Thay Đổi"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
