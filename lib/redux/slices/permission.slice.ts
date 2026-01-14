import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Permission } from "@/lib/types/api";
import {
  PermissionGrouped,
  GetPermissionsParams,
} from "@/lib/services/permission.service";
import { PaginationMeta, StatusState } from "@/lib/types/common";
import { permissionService } from "@/lib/services/permission.service";

interface PermissionState {
  items: Permission[];
  screenPermissions: Permission[];
  actionPermissions: Permission[];
  groupedPermissions: PermissionGrouped[];
  status: StatusState;
  meta: PaginationMeta | null;
}

const initialState: PermissionState = {
  items: [],
  screenPermissions: [],
  actionPermissions: [],
  groupedPermissions: [],
  status: {
    isLoading: false,
    error: null,
    rendered: false,
  },
  meta: null,
};

export const fetchPermissions = createAsyncThunk(
  "permission/fetchPermissions",
  async (params?: GetPermissionsParams) => {
    const response = await permissionService.getPermissions(params);
    return response;
  }
);

export const fetchPermissionsGrouped = createAsyncThunk(
  "permission/fetchPermissionsGrouped",
  async () => {
    const response = await permissionService.getPermissionsGrouped();
    return response;
  }
);

export const fetchScreenPermissions = createAsyncThunk(
  "permission/fetchScreenPermissions",
  async () => {
    const response = await permissionService.getScreenPermissions();
    return response;
  }
);

export const fetchActionPermissions = createAsyncThunk(
  "permission/fetchActionPermissions",
  async () => {
    const response = await permissionService.getActionPermissions();
    return response;
  }
);

const permissionSlice = createSlice({
  name: "permission",
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
    // fetchPermissions
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
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
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to fetch permissions";
      });

    // fetchPermissionsGrouped
    builder.addCase(fetchPermissionsGrouped.fulfilled, (state, action) => {
      state.groupedPermissions = action.payload;
    });

    // fetchScreenPermissions
    builder.addCase(fetchScreenPermissions.fulfilled, (state, action) => {
      state.screenPermissions = action.payload;
    });

    // fetchActionPermissions
    builder.addCase(fetchActionPermissions.fulfilled, (state, action) => {
      state.actionPermissions = action.payload;
    });
  },
});

export const { resetStatus } = permissionSlice.actions;
export default permissionSlice.reducer;
