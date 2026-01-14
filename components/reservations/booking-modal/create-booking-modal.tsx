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
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchRoomTypes } from "@/lib/redux/slices/room-type.slice";
import { fetchDepositPercentage } from "@/lib/redux/slices/app-settings.slice";
import { BookingCustomerStep } from "./booking-customer-step";
import { createBooking, fetchBookings } from "@/lib/redux/slices/booking.slice";
import { mapBookingFormToRequest } from "@/lib/utils/booking.utils";
import { X } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = {
  CUSTOMER: 0,
  ROOMS: 1,
  SUMMARY: 2,
};

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(STEPS.CUSTOMER);
  const dispatch = useAppDispatch();

  // Redux Selectors
  const { depositPercentage: reduxDepositPercentage } = useAppSelector(
    (state) => state.appSettings
  );

  const depositPercentage = reduxDepositPercentage ?? 30; // Default fallback

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
        to: new Date(new Date().setDate(new Date().getDate() + 1)), // Next day default
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
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  // Watch values for conditional rendering and summary
  const customer = useWatch({ control, name: "customer" });
  const selectedRooms = useWatch({ control, name: "selectedRooms" });
  const dateRange = useWatch({ control, name: "dateRange" });
  const depositConfirmed = useWatch({ control, name: "deposit.confirmed" });

  // Load initial data via Redux
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRoomTypes({ limit: 100 }));
      dispatch(fetchDepositPercentage());
    } else {
      // Reset form on close if needed
      form.reset();
      setStep(STEPS.CUSTOMER);
    }
  }, [isOpen, form, dispatch]);

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

  const onSubmit = async (data: BookingFormValues) => {
    try {
      const request = mapBookingFormToRequest(data);
      await dispatch(createBooking(request)).unwrap();
      await dispatch(fetchBookings({ limit: 1000 })); // Refresh list
      toast.success("Tạo đặt phòng thành công");
      onClose();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(`Tạo đặt phòng thất bại: ${message}`);
    }
  };

  // Calculate generic total for deposit suggestion
  const totalAmount =
    selectedRooms?.reduce((sum, room) => sum + (room.totalPrice || 0), 0) || 0;
  const suggestedDeposit = (totalAmount * depositPercentage) / 100;

  // Update deposit amount when rooms change
  useEffect(() => {
    if (step === STEPS.SUMMARY) {
      setValue("deposit.amount", suggestedDeposit);
    }
  }, [step, suggestedDeposit, setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-7xl w-[95vw] max-h-[95vh] h-[90vh] flex flex-col p-0 overflow-hidden bg-gray-50"
      >
        <DialogHeader className="px-6 py-4 bg-white border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-blue-600">
              {ICONS.PLUS} Tạo Đặt Phòng Mới
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
            <BookingCustomerStep control={control} errors={errors} />
          )}

          {/* STEP 2: ROOMS */}
          {step === STEPS.ROOMS && (
            <BookingRoomSelection control={control} errors={errors} />
          )}

          {/* STEP 3: SUMMARY */}
          {step === STEPS.SUMMARY && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              {/* Reusing BookingSummary component if possible, or render manually */}
              {/* For now, let's assume we can reuse BookingSummary or just render a simple summary */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-bold mb-4">Xác nhận thông tin</h3>
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
                  {ICONS.DOLLAR_SIGN} Đặt Cọc
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <Controller
                    control={control}
                    name="deposit.confirmed"
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="deposit-confirmed"
                        className="w-4 h-4 rounded border-gray-300 text-primary-600"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="deposit-confirmed"
                    className="text-sm font-medium"
                  >
                    Xác nhận đã thu tiền cọc
                  </label>
                </div>

                {depositConfirmed && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Số tiền cọc ({depositPercentage}%)
                      </label>
                      <Controller
                        control={control}
                        name="deposit.amount"
                        render={({ field }) => (
                          <input
                            type="number"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Phương thức thanh toán
                      </label>
                      <Controller
                        control={control}
                        name="deposit.paymentMethod"
                        render={({ field }) => (
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="CASH">Tiền mặt</option>
                            <option value="BANK_TRANSFER">Chuyển khoản</option>
                            <option value="CREDIT_CARD">Thẻ tín dụng</option>
                            <option value="DEBIT_CARD">Thẻ ghi nợ</option>
                          </select>
                        )}
                      />
                    </div>
                  </div>
                )}
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
                      placeholder="Ghi chú thêm về dặt phòng..."
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
              {isSubmitting ? "Đang xử lý..." : "Xác Nhận Đặt Phòng"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
