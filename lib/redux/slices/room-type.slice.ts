import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  RoomType,
  GetRoomTypesParams,
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest,
} from "@/lib/types/api";
import { PaginationMeta, StatusState } from "@/lib/types/common";
import { roomService } from "@/lib/services/room.service";

interface RoomTypeState {
  items: RoomType[];
  currentItem: RoomType | null;
  status: StatusState;
  meta: PaginationMeta | null;
}

const initialState: RoomTypeState = {
  items: [],
  currentItem: null,
  status: {
    isLoading: false,
    error: null,
    rendered: false,
  },
  meta: null,
};

export const fetchRoomTypes = createAsyncThunk(
  "roomType/fetchRoomTypes",
  async (params?: GetRoomTypesParams) => {
    const response = await roomService.getRoomTypes(params);
    return response;
  }
);

export const fetchRoomTypeById = createAsyncThunk(
  "roomType/fetchRoomTypeById",
  async (id: string) => {
    const response = await roomService.getRoomTypeById(id);
    return response;
  }
);

export const createRoomType = createAsyncThunk(
  "roomType/createRoomType",
  async (data: CreateRoomTypeRequest) => {
    const response = await roomService.createRoomType(data);
    return response;
  }
);

export const updateRoomType = createAsyncThunk(
  "roomType/updateRoomType",
  async ({ id, data }: { id: string; data: UpdateRoomTypeRequest }) => {
    const response = await roomService.updateRoomType(id, data);
    return response;
  }
);

export const deleteRoomType = createAsyncThunk(
  "roomType/deleteRoomType",
  async (id: string) => {
    await roomService.deleteRoomType(id);
    return id;
  }
);

const roomTypeSlice = createSlice({
  name: "roomType",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = {
        isLoading: false,
        error: null,
        rendered: true,
      };
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    // fetchRoomTypes
    builder
      .addCase(fetchRoomTypes.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchRoomTypes.fulfilled, (state, action) => {
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
      .addCase(fetchRoomTypes.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to fetch room types";
      });

    // fetchRoomTypeById
    builder
      .addCase(fetchRoomTypeById.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchRoomTypeById.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.currentItem = action.payload;
      })
      .addCase(fetchRoomTypeById.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to fetch room type";
      });

    // createRoomType
    builder
      .addCase(createRoomType.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(createRoomType.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.items.unshift(action.payload);
      })
      .addCase(createRoomType.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to create room type";
      });

    // updateRoomType
    builder
      .addCase(updateRoomType.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(updateRoomType.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(updateRoomType.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to update room type";
      });

    // deleteRoomType
    builder
      .addCase(deleteRoomType.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(deleteRoomType.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      })
      .addCase(deleteRoomType.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to delete room type";
      });
  },
});

export const { resetStatus, clearCurrentItem } = roomTypeSlice.actions;
export default roomTypeSlice.reducer;
