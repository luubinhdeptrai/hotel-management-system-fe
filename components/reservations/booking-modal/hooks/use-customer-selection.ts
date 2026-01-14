import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchCustomers,
  createCustomer,
} from "@/lib/redux/slices/customer.slice";
import { CreateCustomerRequest } from "@/lib/types/api";
import { toast } from "sonner";

export function useCustomerSelection() {
  const dispatch = useAppDispatch();
  const {
    items: customers,
    status: { isLoading },
  } = useAppSelector((state) => state.customer);

  const [searchTerm, setSearchTerm] = useState("");

  // Initial load
  useEffect(() => {
    dispatch(fetchCustomers({ limit: 100 }));
  }, [dispatch]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchCustomers({ search: searchTerm, limit: 100 }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch]);

  const handleCreateCustomer = useCallback(
    async (data: CreateCustomerRequest) => {
      try {
        const result = await dispatch(createCustomer(data)).unwrap();
        toast.success("Thêm khách hàng thành công");
        return result;
      } catch (error: any) {
        toast.error(error.message || "Thêm khách hàng thất bại");
        throw error;
      }
    },
    [dispatch]
  );

  return {
    customers,
    isLoading,
    searchTerm,
    setSearchTerm,
    createCustomer: handleCreateCustomer,
  };
}
