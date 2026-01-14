import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import { BookingFormValues } from "@/lib/schemas/booking.schema";
import { useBookingRoomSelection } from "./hooks/use-booking-room-selection";
import { RoomSelector, SelectedRoom } from "./room-selector";
import { ICONS } from "@/src/constants/icons.enum";

interface BookingRoomSelectionProps {
  control: Control<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

export function BookingRoomSelection({
  control,
  errors,
}: BookingRoomSelectionProps) {
  const { roomTypes } = useBookingRoomSelection();
  const dateRange = useWatch({ control, name: "dateRange" });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {ICONS.CALENDAR} Thời Gian Lưu Trú
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ngày nhận phòng</label>
            <Controller
              control={control}
              name="dateRange.from"
              render={({ field }) => (
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={
                    field.value ? field.value.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ngày trả phòng</label>
            <Controller
              control={control}
              name="dateRange.to"
              render={({ field }) => (
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={
                    field.value ? field.value.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              )}
            />
          </div>
        </div>
      </div>

      {dateRange.from && dateRange.to && (
        <Controller
          control={control}
          name="selectedRooms"
          render={({ field }) => (
            <RoomSelector
              checkInDate={dateRange.from.toISOString().split("T")[0]}
              checkOutDate={dateRange.to.toISOString().split("T")[0]}
              roomTypes={roomTypes}
              selectedRooms={(field.value as unknown as SelectedRoom[]) || []}
              onRoomsSelected={(rooms: SelectedRoom[]) => {
                const mapped = rooms.map((r: SelectedRoom) => ({
                  ...r,
                  roomID: r.id || r.roomID,
                  roomName: r.roomNumber || r.roomName,
                  roomTypeID: r.roomTypeID,
                  pricePerNight: r.pricePerNight,
                  checkInDate: r.checkInDate,
                  checkOutDate: r.checkOutDate,
                  numberOfGuests: r.numberOfGuests,
                  totalPrice: r.totalPrice,
                }));
                field.onChange(mapped);
              }}
              maxRooms={5}
            />
          )}
        />
      )}
      {errors.selectedRooms && (
        <p className="text-red-500 font-medium">
          {errors.selectedRooms.message}
        </p>
      )}
    </div>
  );
}
