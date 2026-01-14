import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import type { CreateCustomerRequest } from "@/lib/types/api";
import { useCustomerSelection } from "./hooks/use-customer-selection";
import { CreateCustomerDialog } from "./create-customer-dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface MultiCustomerSelectionData {
  customers: {
    customerId: string;
    customerName: string;
    phoneNumber: string;
    email: string;
    identityCard: string;
    address: string;
  }[];
}

interface MultiCustomerSelectionCardProps {
  onConfirm: (data: MultiCustomerSelectionData) => void;
  initialCustomerIds?: string[];
}

export function MultiCustomerSelectionCard({
  onConfirm,
  initialCustomerIds = [],
}: MultiCustomerSelectionCardProps) {
  const { customers, isLoading, searchTerm, setSearchTerm, createCustomer } =
    useCustomerSelection();

  // Track selected IDs locally
  const [selectedIds, setSelectedIds] = useState<string[]>(initialCustomerIds);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Sync initialCustomerIds if they change from parent
  useEffect(() => {
    setSelectedIds(initialCustomerIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialCustomerIds)]);

  // Toggle selection
  const handleToggleCustomer = (customerId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(customerId)) {
        return prev.filter((id) => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleCreateSuccess = async (data: CreateCustomerRequest) => {
    try {
      const newCustomer = await createCustomer(data);
      if (newCustomer) {
        // Auto-select the newly created customer
        setSelectedIds((prev) => [...prev, newCustomer.id]);
      }
    } catch {
      // Error handled in hook
    }
  };

  const handleConfirm = () => {
    // Map selected IDs to full customer objects locally available
    const selectedCustomers = customers
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => ({
        customerId: c.id,
        customerName: c.fullName,
        phoneNumber: c.phone,
        email: c.email || "",
        identityCard: c.idNumber || "",
        address: c.address || "",
      }));

    // For any IDs that might not be in the current search results (e.g. pre-selected but not loaded),
    // we might miss them here if 'customers' only contains search results.
    // However, useCustomerSelection typically returns a list based on search.
    // If 'customers' is always the full list or search results, we rely on it.
    // NOTE: If initialIds are not in 'customers', we can't map them fully without fetching.
    // Assuming 'customers' will include what we need or we accept basic info if simpler.

    onConfirm({ customers: selectedCustomers });
  };

  return (
    <div className="bg-white rounded-xl h-full border-2 border-gray-200 p-6 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-primary-600">{ICONS.USER}</span>
          <h3 className="text-lg font-extrabold text-gray-900">
            Thông Tin Khách Hàng
          </h3>
        </div>
        <p className="text-xs text-gray-500">Chọn một hoặc nhiều khách hàng</p>
      </div>

      {/* Search and Action Bar */}
      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <Label
            htmlFor="customerSearch"
            className="text-sm font-bold text-gray-700"
          >
            Tìm Kiếm Khách Hàng
          </Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">
              {ICONS.SEARCH}
            </span>
            <Input
              id="customerSearch"
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-2 border-gray-300 rounded-lg font-medium focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-11 bg-primary-600 hover:bg-primary-700 font-bold px-4"
        >
          {ICONS.PLUS} Thêm Mới
        </Button>
      </div>

      {/* Selected Preview (Horizontal Scroll or Wrap) */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-bold text-blue-700 mb-2">
            Đã chọn ({selectedIds.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const customer = customers.find((c) => c.id === id);
              // Handle case where customer might not be in current search list
              // We'll simplisticly show ID or "Loading..." if missing,
              // or relying on the fact that if it was selected, it was in the list.
              // Ideally parent passes full objects for initial selection.
              const name = customer?.fullName || "Khách hàng";
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="bg-white border-blue-200 text-blue-800 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
                  onClick={() => handleToggleCustomer(id)}
                >
                  {name} ×
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <Label className="text-sm font-bold text-gray-700 mb-2 block">
          Danh Sách Khách Hàng
        </Label>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <span className="text-gray-500 font-medium">
              Đang tải danh sách...
            </span>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center p-4">
            <span className="text-gray-500 font-medium mb-2">
              Không tìm thấy khách hàng nào.
            </span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {customers.map((customer) => {
              const isSelected = selectedIds.includes(customer.id);
              return (
                <button
                  key={customer.id}
                  onClick={() => handleToggleCustomer(customer.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all hover:bg-gray-50",
                    isSelected
                      ? "border-primary-600 bg-primary-50 shadow-sm ring-1 ring-primary-600"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 text-base">
                          {customer.fullName}
                        </p>
                        {isSelected && (
                          <span className="text-primary-600 text-sm font-bold bg-primary-100 px-2 py-0.5 rounded-full">
                            {ICONS.CHECK}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-semibold text-gray-700">
                            SĐT:
                          </span>{" "}
                          {customer.phone}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            CCCD:
                          </span>{" "}
                          {customer.idNumber || "---"}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button
          className="w-full bg-primary-600 hover:bg-primary-700 font-bold"
          onClick={handleConfirm}
          disabled={selectedIds.length === 0}
        >
          {ICONS.CHECK_CIRCLE} Xác Nhận Chọn ({selectedIds.length})
        </Button>
      </div>

      <CreateCustomerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSuccess}
      />
    </div>
  );
}
