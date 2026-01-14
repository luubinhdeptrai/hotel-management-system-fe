"use client";

import { Control, Controller, FieldErrors } from "react-hook-form";
import { BookingFormValues } from "@/lib/schemas/booking.schema";
import CustomerSelectionCard, {
  CustomerSelectionData,
} from "./customer-selection-card";

interface BookingCustomerStepProps {
  control: Control<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

export function BookingCustomerStep({
  control,
  errors,
}: BookingCustomerStepProps) {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Controller
        control={control}
        name="customer"
        render={({ field }) => (
          <CustomerSelectionCard
            mode="create"
            onCustomerSelected={(data: CustomerSelectionData) => {
              // Map CustomerSelectionData to our schema shape
              field.onChange({
                id: data.customerId,
                fullName: data.customerName,
                phoneNumber: data.phoneNumber,
                email: data.email,
                identityCard: data.identityCard,
                address: data.address,
                useExisting: data.useExisting ?? false,
              });
            }}
            initialData={
              field.value
                ? ({
                    id: field.value.id || "",
                    fullName: field.value.fullName,
                    phone: field.value.phoneNumber,
                    email: field.value.email,
                    idNumber: field.value.identityCard,
                    address: field.value.address,
                  } as any)
                : undefined
            }
          />
        )}
      />
      {errors.customer && (
        <p className="text-red-500 mt-2">
          {errors.customer.message || "Vui lòng chọn khách hàng"}
        </p>
      )}
    </div>
  );
}
