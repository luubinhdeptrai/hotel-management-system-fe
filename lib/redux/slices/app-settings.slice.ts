import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  AppSetting,
  CheckInTimeConfig,
  CheckOutTimeConfig,
  UpdateTimeConfigRequest,
  UpdateDepositPercentageRequest,
} from "@/lib/types/app-settings";
import { StatusState } from "@/lib/types/common";
import { appSettingsService } from "@/lib/services/app-settings.service";

interface AppSettingsState {
  settings: AppSetting[];
  checkInTime: CheckInTimeConfig | null;
  checkOutTime: CheckOutTimeConfig | null;
  depositPercentage: number | null;
  status: StatusState;
}

const initialState: AppSettingsState = {
  settings: [],
  checkInTime: null,
  checkOutTime: null,
  depositPercentage: null,
  status: {
    isLoading: false,
    error: null,
    rendered: false,
  },
};

export const fetchSettings = createAsyncThunk(
  "appSettings/fetchSettings",
  async () => {
    const response = await appSettingsService.getAllSettings();
    return response;
  }
);

export const fetchCheckInTime = createAsyncThunk(
  "appSettings/fetchCheckInTime",
  async () => {
    const response = await appSettingsService.getCheckInTime();
    return response;
  }
);

export const updateCheckInTime = createAsyncThunk(
  "appSettings/updateCheckInTime",
  async (config: UpdateTimeConfigRequest) => {
    const response = await appSettingsService.updateCheckInTime(config);
    return response;
  }
);

export const fetchCheckOutTime = createAsyncThunk(
  "appSettings/fetchCheckOutTime",
  async () => {
    const response = await appSettingsService.getCheckOutTime();
    return response;
  }
);

export const updateCheckOutTime = createAsyncThunk(
  "appSettings/updateCheckOutTime",
  async (config: UpdateTimeConfigRequest) => {
    const response = await appSettingsService.updateCheckOutTime(config);
    return response;
  }
);

export const fetchDepositPercentage = createAsyncThunk(
  "appSettings/fetchDepositPercentage",
  async () => {
    const response = await appSettingsService.getDepositPercentage();
    return response;
  }
);

export const updateDepositPercentage = createAsyncThunk(
  "appSettings/updateDepositPercentage",
  async (config: UpdateDepositPercentageRequest) => {
    const response = await appSettingsService.updateDepositPercentage(config);
    return response;
  }
);

const appSettingsSlice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = {
        isLoading: false,
        error: null,
        rendered: true,
      };
    },
  },
  extraReducers: (builder) => {
    // fetchSettings
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error = action.error.message || "Failed to fetch settings";
      });

    // fetchCheckInTime
    builder.addCase(fetchCheckInTime.fulfilled, (state, action) => {
      state.checkInTime = action.payload;
    });

    // updateCheckInTime
    builder.addCase(updateCheckInTime.fulfilled, (state, action) => {
      state.checkInTime = action.payload;
    });

    // fetchCheckOutTime
    builder.addCase(fetchCheckOutTime.fulfilled, (state, action) => {
      state.checkOutTime = action.payload;
    });

    // updateCheckOutTime
    builder.addCase(updateCheckOutTime.fulfilled, (state, action) => {
      state.checkOutTime = action.payload;
    });

    // fetchDepositPercentage
    builder.addCase(fetchDepositPercentage.fulfilled, (state, action) => {
      state.depositPercentage = action.payload;
    });

    // updateDepositPercentage
    builder.addCase(updateDepositPercentage.fulfilled, (state, action) => {
      state.depositPercentage = action.payload;
    });
  },
});

export const { resetStatus } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
