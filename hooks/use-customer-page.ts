"use client";

import { useCallback, useMemo, useState } from "react";
import { useCustomers } from "@/hooks/use-customers";
import type {
  CustomerFilters,
  CustomerFormData,
  CustomerRecord,
} from "@/lib/types/customer";
import {
  calculateCustomerStatistics,
  filterCustomers,
  getDefaultCustomerFilters,
  hasCustomerFilters,
} from "@/lib/utils/customer-filters";

export function useCustomerPage() {
  const {
    customers,
    loading,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deactivateCustomer,
    reactivateCustomer,
  } = useCustomers();

  const [filters, setFilters] = useState<CustomerFilters>(
    getDefaultCustomerFilters()
  );
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerRecord | null>(null);
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [pendingStatusAction, setPendingStatusAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, filters),
    [customers, filters]
  );

  const statistics = useMemo(
    () => calculateCustomerStatistics(customers),
    [customers]
  );

  const updateFilter = useCallback(
    <K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(getDefaultCustomerFilters());
  }, []);

  const handleAddCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setFormOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setFormOpen(true);
  }, []);

  const handleViewDetails = useCallback((customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  }, []);

  const handleSaveCustomer = useCallback(
    async (data: CustomerFormData) => {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.customerId, data);
      } else {
        await createCustomer(data);
      }
      setFormOpen(false);
    },
    [createCustomer, selectedCustomer, updateCustomer]
  );

  const requestStatusChange = useCallback((customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setPendingStatusAction(
      customer.status === "Hoạt động" ? "deactivate" : "reactivate"
    );
    setConfirmActionOpen(true);
  }, []);

  const confirmStatusChange = useCallback(async () => {
    if (!selectedCustomer || !pendingStatusAction) return;

    if (pendingStatusAction === "deactivate") {
      await deactivateCustomer(selectedCustomer.customerId);
    } else {
      await reactivateCustomer(selectedCustomer.customerId);
    }

    setConfirmActionOpen(false);
    setPendingStatusAction(null);
    setSelectedCustomer(null);
  }, [
    deactivateCustomer,
    pendingStatusAction,
    reactivateCustomer,
    selectedCustomer,
  ]);

  const cancelStatusChange = useCallback(() => {
    setConfirmActionOpen(false);
    setPendingStatusAction(null);
    setSelectedCustomer(null);
  }, []);

  return {
    customers,
    filteredCustomers,
    loading,
    statistics,
    filters,
    hasFilters: hasCustomerFilters(filters),
    updateFilter,
    clearFilters,
    formOpen,
    setFormOpen,
    detailsOpen,
    setDetailsOpen,
    selectedCustomer,
    setSelectedCustomer,
    confirmActionOpen,
    setConfirmActionOpen,
    pendingStatusAction,
    cancelStatusChange,
    loadCustomers,
    handleAddCustomer,
    handleEditCustomer,
    handleViewDetails,
    handleSaveCustomer,
    requestStatusChange,
    confirmStatusChange,
  };
}
