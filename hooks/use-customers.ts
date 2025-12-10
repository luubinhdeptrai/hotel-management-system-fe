"use client";

import { useState } from "react";
import type { CustomerFormData, CustomerRecord } from "@/lib/types/customer";

const generateCustomerId = (index: number) =>
  `KH${String(index).padStart(3, "0")}`;

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { mockCustomerRecords } = await import("@/lib/mock-customers");
      setCustomers(mockCustomerRecords);
    } catch (error) {
      console.error("Error loading customers", error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (data: CustomerFormData) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const newCustomer: CustomerRecord = {
        customerId: generateCustomerId(customers.length + 1),
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        identityCard: data.identityCard,
        address: data.address,
        nationality: data.nationality,
        customerType: data.customerType,
        isVip: data.isVip,
        notes: data.notes,
        status: "Hoạt động",
        createdAt: new Date().toISOString(),
        lastVisit: "",
        totalBookings: 0,
        totalSpent: 0,
        tags: data.isVip ? ["VIP"] : undefined,
        history: [],
      };

      setCustomers((prev) => [...prev, newCustomer]);
    } catch (error) {
      console.error("Error creating customer", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (customerId: string, data: CustomerFormData) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.customerId === customerId
            ? {
                ...customer,
                customerName: data.customerName,
                phoneNumber: data.phoneNumber,
                email: data.email,
                identityCard: data.identityCard,
                address: data.address,
                nationality: data.nationality,
                customerType: data.customerType,
                isVip: data.isVip,
                notes: data.notes,
              }
            : customer
        )
      );
    } catch (error) {
      console.error("Error updating customer", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deactivateCustomer = async (customerId: string) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.customerId === customerId
            ? { ...customer, status: "Đã vô hiệu" }
            : customer
        )
      );
    } catch (error) {
      console.error("Error deactivating customer", error);
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
      console.error("Error reactivating customer", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deactivateCustomer,
    reactivateCustomer,
  };
}
