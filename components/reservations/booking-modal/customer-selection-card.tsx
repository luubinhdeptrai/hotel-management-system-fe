import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import { Customer } from "@/lib/types/api";
import { useCustomerSelection } from "./hooks/use-customer-selection";
import { CreateCustomerDialog } from "./create-customer-dialog";
import { cn } from "@/lib/utils";

export interface CustomerSelectionData {
  useExisting: boolean;
  customerId?: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  identityCard: string;
  address: string;
}

interface CustomerSelectionCardProps {
  onCustomerSelected: (data: CustomerSelectionData) => void;
  mode: "create" | "edit";
  initialCustomerId?: string;
  initialData?: Customer;
}

export function CustomerSelectionCard({
  onCustomerSelected,
  mode,
  initialCustomerId,
  initialData,
}: CustomerSelectionCardProps) {
  const { customers, isLoading, searchTerm, setSearchTerm, createCustomer } =
    useCustomerSelection();

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    mode === "edit" && initialCustomerId ? initialCustomerId : ""
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Update selected ID if initialCustomerId changes
  // Sync state with props (Derived State)
  const [prevDeps, setPrevDeps] = useState({ mode, initialCustomerId });

  if (
    prevDeps.mode !== mode ||
    prevDeps.initialCustomerId !== initialCustomerId
  ) {
    setPrevDeps({ mode, initialCustomerId });
    if (mode === "edit" && initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }

  // Handle existing customer selection
  const handleSelectCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomerId(customerId);
      onCustomerSelected({
        useExisting: true,
        customerId: customer.id,
        customerName: customer.fullName,
        phoneNumber: customer.phone,
        email: customer.email || "",
        identityCard: customer.idNumber || "",
        address: customer.address || "",
      });
    }
  };

  const handleCreateSuccess = async (data: any) => {
    try {
      const newCustomer = await createCustomer(data);
      if (newCustomer) {
        handleSelectCustomer(newCustomer.id);
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="bg-white rounded-xl h-full border-2 border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-primary-600">{ICONS.USER}</span>
          <h3 className="text-lg font-extrabold text-gray-900">
            Thông Tin Khách Hàng
          </h3>
        </div>
        <p className="text-xs text-gray-500">
          {mode === "create"
            ? "Chọn khách hàng hoặc thêm mới"
            : "Chỉnh sửa khách hàng"}
        </p>
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

      {/* Customer List */}
      <div className="space-y-4">
        <Label className="text-sm font-bold text-gray-700">
          Danh Sách Khách Hàng <span className="text-red-600">*</span>
        </Label>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <span className="text-gray-500 font-medium">
              Đang tải danh sách...
            </span>
          </div>
        ) : customers.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center p-4">
            <span className="text-gray-500 font-medium mb-2">
              Không tìm thấy khách hàng nào.
            </span>
            <Button
              variant="link"
              className="text-primary-600 font-bold"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Tạo khách hàng mới ngay?
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:bg-gray-50",
                  selectedCustomerId === customer.id
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
                      {selectedCustomerId === customer.id && (
                        <span className="text-primary-600 text-sm font-bold bg-primary-100 px-2 py-0.5 rounded-full">
                          Đã chọn
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
                        {customer.idNumber
                          ? customer.idNumber.length > 4
                            ? "*".repeat(customer.idNumber.length - 4) +
                              customer.idNumber.slice(-4)
                            : customer.idNumber
                          : "---"}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Info Preview */}
      {selectedCustomerId && (
        <div className="mt-6 bg-green-50 rounded-lg border border-green-200 p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600">{ICONS.CHECK_CIRCLE}</span>
            <h4 className="font-bold text-green-900 border-b border-green-200 pb-1 flex-1">
              Khách hàng đã chọn
            </h4>
          </div>
          {(() => {
            const customer =
              customers.find((c) => c.id === selectedCustomerId) ||
              (initialData?.id === selectedCustomerId
                ? initialData
                : undefined);
            return customer ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Họ tên</p>
                  <p className="font-bold text-gray-900">{customer.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Số điện thoại
                  </p>
                  <p className="font-bold text-gray-900">{customer.phone}</p>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      <CreateCustomerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSuccess}
      />
    </div>
  );
}

export default CustomerSelectionCard;
