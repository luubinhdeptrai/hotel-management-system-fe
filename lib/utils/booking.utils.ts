import { BookingFormValues } from "@/lib/schemas/booking.schema";
import { CreateBookingRequest } from "@/lib/types/api";

export const mapBookingFormToRequest = (
  data: BookingFormValues
): CreateBookingRequest => {
  const roomSelections = data.selectedRooms || [];

  if (roomSelections.length === 0) {
    throw new Error("No room selections provided");
  }

  // Get dates from first room selection (assuming all rooms have same dates for now as per page.tsx logic)
  const checkInDateStr = data.dateRange.from.toISOString().split("T")[0];
  const checkOutDateStr = data.dateRange.to.toISOString().split("T")[0];

  // Helper to parse to ISO with specific time
  const parseToISO = (dateStr: string, hours: number): string => {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (year && month && day) {
      const d = new Date(Date.UTC(year, month - 1, day, hours, 0, 0));
      return d.toISOString();
    }
    const date = new Date(dateStr);
    date.setUTCHours(hours, 0, 0, 0);
    return date.toISOString();
  };

  const checkInISO = parseToISO(checkInDateStr, 14);
  const checkOutISO = parseToISO(checkOutDateStr, 12);

  const request: CreateBookingRequest = {
    // Customer logic
    ...(data.customer.useExisting && data.customer.id
      ? { customerId: data.customer.id }
      : {
          customer: {
            fullName: data.customer.fullName,
            phone: data.customer.phoneNumber,
            idNumber: data.customer.identityCard,
            email: data.customer.email,
            address: data.customer.address,
          },
        }),

    // Rooms logic
    rooms: roomSelections.map((room) => {
      const id = room.roomID || room.id;
      if (!id) {
        throw new Error(`Room selection is missing ID`);
      }
      return {
        roomId: id,
      };
    }),

    checkInDate: checkInISO,
    checkOutDate: checkOutISO,
    totalGuests: data.totalGuests || 1, // Use total guests from form
    ...(data.deposit?.confirmed && data.deposit.amount > 0
      ? {
          depositAmount: data.deposit.amount,
          depositPaymentMethod: data.deposit
            .paymentMethod as import("@/lib/types/api").PaymentMethod,
        }
      : {}),
  };

  return request;
};
