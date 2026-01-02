"use client";

import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import type { CustomerFormData, CustomerRecord } from "@/lib/types/customer";
import { customerService } from "@/lib/services";
import type { Customer } from "@/lib/types/api";
import { ApiError } from "@/lib/services/api";

// Map API Customer to CustomerRecord (for backward compatibility)
function mapCustomerToRecord(customer: Customer): CustomerRecord {
  return {
    customerId: customer.id,
    customerName: customer.fullName,
    phoneNumber: customer.phone,
    email: customer.email || "",
    identityCard: customer.idNumber || "",
    address: customer.address || "",
    nationality: "", // Not in API
    customerType: "Cá nhân",
    isVip: false,
    vipTier: "STANDARD",
    status: "Hoạt động",
    notes: "",
    createdAt: customer.createdAt,
    lastVisit: "",
    totalBookings: customer._count?.bookings || 0,
    totalSpent: 0,
    history: [],
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerService.getCustomers({
        page: 1,
        limit: 100,
        sortBy: "fullName",
        sortOrder: "asc",
      });
      setCustomers(result.data.map(mapCustomerToRecord));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error loading customers";
      logger.error("Error loading customers", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (data: CustomerFormData) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await customerService.createCustomer({
        fullName: data.customerName,
        phone: data.phoneNumber,
        password: "DefaultPassword123", // TODO: Add password field to form
        email: data.email,
        idNumber: data.identityCard,
        address: data.address,
      });

      const newCustomer = mapCustomerToRecord(customer);
      setCustomers((prev) => [...prev, newCustomer]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error creating customer";
      logger.error("Error creating customer", err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (customerId: string, data: CustomerFormData) => {
    setLoading(true);
    setError(null);
    try {
      const customer = await customerService.updateCustomer(customerId, {
        fullName: data.customerName,
        email: data.email,
        idNumber: data.identityCard,
        address: data.address,
      });

      const updatedCustomer = mapCustomerToRecord(customer);
      setCustomers((prev) =>
        prev.map((c) =>
          c.customerId === customerId ? updatedCustomer : c
        )
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error updating customer";
      logger.error("Error updating customer", err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivateCustomer = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await customerService.deleteCustomer(customerId);
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.customerId === customerId
            ? { ...customer, status: "Đã vô hiệu" }
            : customer
        )
      );
    } catch (error) {
      logger.error("Error deactivating customer", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reactivateCustomer = async (customerId: string) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.customerId === customerId
            ? { ...customer, status: "Hoạt động" }
            : customer
        )
      );
    } catch (error) {
      logger.error("Error reactivating customer", error);
      const message = error instanceof ApiError ? error.message : "Error reactivating customer";
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deactivateCustomer,
    reactivateCustomer,
  };
}
