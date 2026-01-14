import { useState, useCallback, useEffect } from "react";
import { transactionService } from "@/lib/services/transaction.service";
import { logger } from "@/lib/utils/logger";
import type {
  Transaction,
  GetTransactionsParams,
  TransactionType,
  TransactionStatus,
} from "@/lib/types/api";
import type { CreateTransactionRequest } from "@/lib/services/transaction.service";

export function useTransactions(initialBookingId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [bookingId, setBookingId] = useState(initialBookingId || "");
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>();
  const [statusFilter, setStatusFilter] = useState<
    TransactionStatus | undefined
  >();

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: GetTransactionsParams = {
        page: currentPage,
        limit: 10,
        sortBy: "occurredAt",
        sortOrder: "desc",
      };

      if (bookingId) params.bookingId = bookingId;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await transactionService.getTransactions(params);

      setTransactions(response.data);
      setTotalPages(Math.ceil(response.total / response.limit));
      setTotalItems(response.total);
    } catch (error) {
      logger.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, bookingId, typeFilter, statusFilter]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Create transaction
  const handleCreateTransaction = useCallback(
    async (data: CreateTransactionRequest): Promise<void> => {
      setIsLoading(true);
      try {
        await transactionService.createTransaction(data);
        setShowCreateModal(false);
        await fetchTransactions(); // Refresh list
      } catch (error) {
        logger.error("Failed to create transaction:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTransactions]
  );

  // View transaction details
  const handleViewTransaction = useCallback(async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setBookingId(initialBookingId || "");
    setTypeFilter(undefined);
    setStatusFilter(undefined);
    setCurrentPage(1);
  }, [initialBookingId]);

  return {
    // Data
    transactions,
    selectedTransaction,
    totalPages,
    totalItems,
    currentPage,

    // Filters
    bookingId,
    typeFilter,
    statusFilter,

    // UI state
    isLoading,
    showCreateModal,
    showDetailsModal,

    // Actions
    fetchTransactions,
    handleCreateTransaction,
    handleViewTransaction,
    handleClearFilters,

    // Setters
    setBookingId,
    setTypeFilter,
    setStatusFilter,
    setCurrentPage,
    setShowCreateModal,
    setShowDetailsModal,
    setSelectedTransaction,
  };
}
