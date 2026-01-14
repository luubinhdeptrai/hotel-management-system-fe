import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  TransactionDetailItem,
  TransactionDetailsFilters,
} from "@/lib/types/transaction-details";
import {
  TransactionResponse,
  CreateTransactionRequest,
  RefundRequest,
} from "@/lib/services/transaction.service";
import { PaginationMeta, StatusState } from "@/lib/types/common";
import { transactionDetailsService } from "@/lib/services/transaction-details.service";
import { transactionService } from "@/lib/services/transaction.service";

interface TransactionState {
  items: TransactionDetailItem[];
  currentTransaction: TransactionResponse | null;
  status: StatusState;
  meta: PaginationMeta | null;
}

const initialState: TransactionState = {
  items: [],
  currentTransaction: null,
  status: {
    isLoading: false,
    error: null,
    rendered: false,
  },
  meta: null,
};

export const fetchTransactions = createAsyncThunk(
  "transaction/fetchTransactions",
  async (filters: TransactionDetailsFilters) => {
    const response = await transactionDetailsService.getTransactionDetails(
      filters
    );
    return response;
  }
);

export const createTransaction = createAsyncThunk(
  "transaction/createTransaction",
  async (data: CreateTransactionRequest) => {
    const response = await transactionService.createTransaction(data);
    return response;
  }
);

export const processRefund = createAsyncThunk(
  "transaction/processRefund",
  async (data: RefundRequest) => {
    const response = await transactionService.processRefund(data);
    return response;
  }
);

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = {
        isLoading: false,
        error: null,
        rendered: true,
      };
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    // fetchTransactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.items = action.payload.details;
        state.meta = {
          ...action.payload.pagination,
          totalItems: action.payload.pagination.total,
        };
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to fetch transactions";
      });

    // createTransaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        state.currentTransaction = action.payload;
        // Optimization: Could potentially add to items if we can map it to TransactionDetailItem
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error =
          action.error.message || "Failed to create transaction";
      });

    // processRefund
    builder
      .addCase(processRefund.pending, (state) => {
        state.status.isLoading = true;
        state.status.error = null;
      })
      .addCase(processRefund.fulfilled, (state) => {
        state.status.isLoading = false;
        state.status.rendered = true;
        // Refund logic might need to update related transaction status if we tracked it
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.status.isLoading = false;
        state.status.error = action.error.message || "Failed to process refund";
      });
  },
});

export const { resetStatus, clearCurrentTransaction } =
  transactionSlice.actions;
export default transactionSlice.reducer;
