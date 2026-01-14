import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Employee,
  GetEmployeesParams,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/lib/types/api";
import { PaginationMeta, StatusState } from "@/lib/types/common";
import { employeeService } from "@/lib/services/employee.service";

interface EmployeeState {
  items: Employee[];
  currentEmployee: Employee | null;
  status: StatusState;
  meta: PaginationMeta | null;
}

const initialState: EmployeeState = {
  items: [],
  currentEmployee: null,
  status: {
    isLoading: false,
    error: null,
    rendered: false,
  },
  meta: null,
};

export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async (params?: GetEmployeesParams) => {
    const response = await employeeService.getEmployees(params);
    return response;
  }
);

export const fetchEmployeeById = createAsyncThunk(
  "employee/fetchEmployeeById",
  async (id: string) => {
    const response = await employeeService.getEmployeeById(id);
    return response;
  }
);

export const createEmployee = createAsyncThunk(
  "employee/createEmployee",
  async (data: CreateEmployeeRequest) => {
    const response = await employeeService.createEmployee(data);
    return response;
  }
);

export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async ({ id, data }: { id: string; data: UpdateEmployeeRequest }) => {
    const response = await employeeService.updateEmployee(id, data);
    return response;
  }
);

export const deleteEmployee = createAsyncThunk(
  "employee/deleteEmployee",
  async (id: string) => {
    await employeeService.deleteEmployee(id);
    return id;
  }
);

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = {
        isLoading: false,
        error: null,
        rendered: true,
      };
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
  },
  extraReducers: (builder) => {
    // fetchEmployees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
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
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to fetch employees";
      });

    // fetchEmployeeById
    builder
      .addCase(fetchEmployeeById.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error = action.error.message || "Failed to fetch employee";
      });

    // createEmployee
    builder
      .addCase(createEmployee.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.items.unshift(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to create employee";
      });

    // updateEmployee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to update employee";
      });

    // deleteEmployee
    builder
      .addCase(deleteEmployee.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentEmployee?.id === action.payload) {
          state.currentEmployee = null;
        }
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to delete employee";
      });
  },
});

export const { resetStatus, clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
