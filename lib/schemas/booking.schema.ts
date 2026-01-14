import { z } from "zod";

// Schema for Customer data (matches CustomerSelectionData structure mostly)
export const customerSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  identityCard: z.string().min(9, "CMND/CCCD không hợp lệ"),
  address: z.string().optional(),
  useExisting: z.boolean(),
});

// Schema to match SelectedRoom interface from room-selector.tsx
// We use looser validation for UI-specific fields to avoid strict type duplication issues
export const roomSelectionSchema = z
  .object({
    // Essential fields for booking
    roomID: z.string(), // Mapped from id
    roomName: z.string(), // Mapped from roomNumber
    roomTypeID: z.string(),
    roomTypeName: z.string().optional(),
    pricePerNight: z.number(),
    checkInDate: z.string(),
    checkOutDate: z.string(),
    numberOfGuests: z.number().min(1),
    totalPrice: z.number().optional(),

    // UI/Legacy fields expected by SelectedRoom (passthrough or validated if critical)
    id: z.string().optional(),
    roomNumber: z.string().optional(),
    floor: z.number().optional(),
    roomStatus: z.string().optional(),
    // We allow other keys to pass through to support the full SelectedRoom object
  })
  .passthrough();

export const bookingFormSchema = z.object({
  customer: customerSchema,
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  selectedRooms: z
    .array(roomSelectionSchema)
    .min(1, "Vui lòng chọn ít nhất một phòng"),
  totalGuests: z.number().min(1, "Tổng số khách phải lớn hơn 0"),
  notes: z.string().optional(),
  deposit: z.object({
    amount: z.number().min(0).default(0),
    confirmed: z.boolean().default(false),
    paymentMethod: z
      .enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER"])
      .default("CASH"),
  }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
