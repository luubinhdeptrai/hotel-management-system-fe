import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomGuest {
  customerId: string;
  fullName: string; // Store name for display without re-fetching
}

interface CheckInState {
  bookingId: string | null;
  selectedRooms: string[]; // List of bookingRoomIds
  // Map bookingRoomId -> list of guests
  roomGuests: Record<string, RoomGuest[]>;
  isModalOpen: boolean;
  activeBookingRoomId: string | null; // Which room is currently adding a guest
}

const initialState: CheckInState = {
  bookingId: null,
  selectedRooms: [],
  roomGuests: {},
  isModalOpen: false,
  activeBookingRoomId: null,
};

const checkInSlice = createSlice({
  name: "checkin",
  initialState,
  reducers: {
    initCheckIn: (state, action: PayloadAction<{ bookingId: string }>) => {
      // Reset state for new booking
      return {
        ...initialState,
        bookingId: action.payload.bookingId,
        isModalOpen: true,
      };
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    toggleRoomSelection: (state, action: PayloadAction<string>) => {
      const bookingRoomId = action.payload;
      const index = state.selectedRooms.indexOf(bookingRoomId);
      if (index === -1) {
        state.selectedRooms.push(bookingRoomId);
      } else {
        state.selectedRooms.splice(index, 1);
      }
    },
    setActiveBookingRoomId: (state, action: PayloadAction<string | null>) => {
      state.activeBookingRoomId = action.payload;
    },
    assignGuest: (
      state,
      action: PayloadAction<{
        bookingRoomId: string;
        guest: RoomGuest;
      }>
    ) => {
      const { bookingRoomId, guest } = action.payload;
      if (!state.roomGuests[bookingRoomId]) {
        state.roomGuests[bookingRoomId] = [];
      }
      // Avoid duplicates
      if (
        !state.roomGuests[bookingRoomId].some(
          (g) => g.customerId === guest.customerId
        )
      ) {
        state.roomGuests[bookingRoomId].push(guest);
      }
    },
    removeGuest: (
      state,
      action: PayloadAction<{
        bookingRoomId: string;
        customerId: string;
      }>
    ) => {
      const { bookingRoomId, customerId } = action.payload;
      if (state.roomGuests[bookingRoomId]) {
        state.roomGuests[bookingRoomId] = state.roomGuests[
          bookingRoomId
        ].filter((g) => g.customerId !== customerId);
      }
    },
    // Initialize guests for a room (e.g. from existing booking customers)
    setRoomGuests: (
      state,
      action: PayloadAction<{
        bookingRoomId: string;
        guests: RoomGuest[];
      }>
    ) => {
      const { bookingRoomId, guests } = action.payload;
      state.roomGuests[bookingRoomId] = guests;
    },
  },
});

export const {
  initCheckIn,
  setModalOpen,
  toggleRoomSelection,
  setActiveBookingRoomId,
  assignGuest,
  removeGuest,
  setRoomGuests,
} = checkInSlice.actions;

export default checkInSlice.reducer;
