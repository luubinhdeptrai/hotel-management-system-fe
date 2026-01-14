import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Customer,
  GetCustomersParams,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/lib/types/api";
import { PaginationMeta, StatusState } from "@/lib/types/common";
import { customerService } from "@/lib/services/customer.service";

interface CustomerState {
  items: Customer[];
  currentItem: Customer | null;
  status: StatusState;
  meta: PaginationMeta | null;
}

const initialState: CustomerState = {
  items: [],
  currentItem: null,
  status: {
    isLoading: false,
    error: null,
    rendered: false,
  },
  meta: null,
};

export const fetchCustomers = createAsyncThunk(
  "customer/fetchCustomers",
  async (params?: GetCustomersParams) => {
    const response = await customerService.getCustomers(params);
    return response;
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customer/fetchCustomerById",
  async (id: string) => {
    const response = await customerService.getCustomerById(id);
    return response;
  }
);

export const createCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (data: CreateCustomerRequest) => {
    const response = await customerService.createCustomer(data);
    return response;
  }
);

export const updateCustomer = createAsyncThunk(
  "customer/updateCustomer",
  async ({ id, data }: { id: string; data: UpdateCustomerRequest }) => {
    const response = await customerService.updateCustomer(id, data);
    return response;
  }
);

export const deleteCustomer = createAsyncThunk(
  "customer/deleteCustomer",
  async (id: string) => {
    await customerService.deleteCustomer(id);
    return id;
  }
);

const customerSlice = createSlice({
  name: "customer",
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
    resetCustomers: (state) => {
      state.items = [];
      state.meta = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCustomers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.status.rendered = true;
        state.items = action.payload.items;
        state.meta = {
          page: action.payload.currentPage,
          limit: action.payload.perPage,
          totalItems: action.payload.totalItems,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to fetch customers";
      });

    // fetchCustomerById
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.currentItem = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error = action.error.message || "Failed to fetch customer";
      });

    // createCustomer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.items.unshift(action.payload);
        state.currentItem = action.payload; // Set as current for immediate use
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to create customer";
      });

    // updateCustomer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
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
      .addCase(updateCustomer.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to update customer";
      });

    // deleteCustomer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to delete customer";
      });
  },
});

export const { resetStatus, clearCurrentItem, resetCustomers } =
  customerSlice.actions;
export default customerSlice.reducer;
