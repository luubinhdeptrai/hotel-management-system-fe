import type {
  CustomerFilters,
  CustomerRecord,
  CustomerStatistics,
} from "@/lib/types/customer";

const normalize = (value: string) => value.toLowerCase().trim();

export const getDefaultCustomerFilters = (): CustomerFilters => ({
  searchQuery: "",
  typeFilter: "Tất cả",
  vipFilter: "Tất cả",
});

export const filterCustomers = (
  customers: CustomerRecord[],
  filters: CustomerFilters
): CustomerRecord[] => {
  const search = normalize(filters.searchQuery);

  return customers.filter((customer) => {
    const matchesSearch = search
      ? [
          customer.customerId,
          customer.customerName,
          customer.phoneNumber,
          customer.email,
          customer.identityCard,
        ]
          .filter(Boolean)
          .some((value) => normalize(String(value)).includes(search))
      : true;

    const matchesType =
      filters.typeFilter === "Tất cả" ||
      customer.customerType === filters.typeFilter;

    const matchesVip =
      filters.vipFilter === "Tất cả" ||
      (filters.vipFilter === "VIP" && customer.isVip) ||
      (filters.vipFilter === "Thường" && !customer.isVip);

    return matchesSearch && matchesType && matchesVip;
  });
};

export const hasCustomerFilters = (filters: CustomerFilters): boolean =>
  Boolean(
    filters.searchQuery.trim() ||
      filters.typeFilter !== "Tất cả" ||
      filters.vipFilter !== "Tất cả"
  );

export const calculateCustomerStatistics = (
  customers: CustomerRecord[]
): CustomerStatistics => {
  return customers.reduce<CustomerStatistics>(
    (acc, customer) => {
      acc.totalCustomers += 1;
      acc.totalLifetimeValue += customer.totalSpent;
      if (customer.isVip) acc.vipCustomers += 1;
      if (customer.customerType === "Doanh nghiệp") acc.corporateCustomers += 1;
      if (customer.status === "Đã vô hiệu") acc.inactiveCustomers += 1;
      return acc;
    },
    {
      totalCustomers: 0,
      vipCustomers: 0,
      inactiveCustomers: 0,
      corporateCustomers: 0,
      totalLifetimeValue: 0,
    }
  );
};
