import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Booking,
  GetBookingsParams,
  CreateBookingRequest,
  CreateBookingEmployeeRequest,
  UpdateBookingRequest,
  CheckInRequest,
  CheckOutRequest,
} from "@/lib/types/api";
import { PaginationMeta, StatusState } from "@/lib/types/common";
import {
  bookingService,
  BookingResponse,
} from "@/lib/services/booking.service";

interface BookingState {
  items: Booking[];
  currentBooking: BookingResponse | null;
  status: StatusState;
  meta: PaginationMeta | null;
}

const initialState: BookingState = {
  items: [],
  currentBooking: null,
  status: {
    isLoading: false,
    error: null,
    rendered: false,
  },
  meta: null,
};

export const fetchBookings = createAsyncThunk(
  "booking/fetchBookings",
  async (params?: GetBookingsParams) => {
    const response = await bookingService.getAllBookings(params);
    return response;
  }
);

export const fetchBookingById = createAsyncThunk(
  "booking/fetchBookingById",
  async (id: string) => {
    const response = await bookingService.getBookingById(id);
    return response;
  }
);

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (data: CreateBookingRequest | CreateBookingEmployeeRequest) => {
    const response = await bookingService.createBooking(data);
    return response;
  }
);

export const updateBooking = createAsyncThunk(
  "booking/updateBooking",
  async ({ id, data }: { id: string; data: UpdateBookingRequest }) => {
    const response = await bookingService.updateBooking(id, data);
    return response;
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (id: string) => {
    await bookingService.cancelBooking(id);
    return id;
  }
);

export const checkIn = createAsyncThunk(
  "booking/checkIn",
  async (data: CheckInRequest) => {
    const response = await bookingService.checkIn(data);
    return response;
  }
);

export const checkOut = createAsyncThunk(
  "booking/checkOut",
  async (data: CheckOutRequest) => {
    const response = await bookingService.checkOut(data);
    return response;
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = {
        isLoading: false,
        error: null,
        rendered: true,
      };
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    // fetchBookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.items = action.payload.data;
        state.meta = {
          page: action.payload.page,
          limit: action.payload.limit,
          totalItems: action.payload.total,
          totalPages: Math.ceil(action.payload.total / action.payload.limit),
        };
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error = action.error.message || "Failed to fetch bookings";
      });

    // fetchBookingById
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error = action.error.message || "Failed to fetch booking";
      });

    // createBooking
    builder
      .addCase(createBooking.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        // Optimization: Could potentially add to items if we can map it to Booking
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error = action.error.message || "Failed to create booking";
      });

    // updateBooking
    builder
      .addCase(updateBooking.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(updateBooking.fulfilled, (state) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        // Optionally update the item in the list if present
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error = action.error.message || "Failed to update booking";
      });

    // cancelBooking
    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      // Optimistically update status to CANCELLED locally if needed
      const index = state.items.findIndex((b) => b.id === action.payload);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], status: "CANCELLED" };
      }
      if (state.currentBooking?.booking?.id === action.payload) {
        state.currentBooking.booking = {
          ...state.currentBooking.booking,
          status: "CANCELLED",
        };
      }
    });

    // checkIn & checkOut
    builder.addCase(checkIn.fulfilled, () => {
      // Update state if necessary
    });
    builder.addCase(checkOut.fulfilled, () => {
      // Update state if necessary
    });
  },
});

export const { resetStatus, clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
