"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ICONS } from "@/src/constants/icons.enum";
import { Customer } from "@/lib/types/api";
import { customerService } from "@/lib/services/customer.service";

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
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [existingCustomers, setExistingCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    identityCard: "",
    address: "",
  });

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Pre-fill for edit mode
  useEffect(() => {
    if (mode === "edit" && initialCustomerId && initialData) {
      setActiveTab("existing");
      setSelectedCustomerId(initialCustomerId);
    }
  }, [mode, initialCustomerId, initialData]);

  // Filter customers based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers(existingCustomers);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = existingCustomers.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(term) ||
          c.phone?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, existingCustomers]);

  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const result = await customerService.getCustomers({
        limit: 100,
      });
      setExistingCustomers(result.data);
      setFilteredCustomers(result.data);
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Handle existing customer selection
  const handleSelectCustomer = (customerId: string) => {
    const customer = existingCustomers.find((c) => c.id === customerId);
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

  // Handle new customer input
  const handleNewCustomerChange = (field: string, value: string) => {
    setNewCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit new customer
  const handleNewCustomerSubmit = () => {
    // Validate
    if (!newCustomer.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    if (
      !newCustomer.phoneNumber.trim() ||
      !/^[0-9]{10}$/.test(newCustomer.phoneNumber)
    ) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ (10 chữ số)");
      return;
    }
    if (
      !newCustomer.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)
    ) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    if (!newCustomer.identityCard.trim()) {
      toast.error("Vui lòng nhập CMND/CCCD");
      return;
    }
    if (!newCustomer.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ");
      return;
    }

    // Callback with new customer data
    onCustomerSelected({
      useExisting: false,
      customerName: newCustomer.fullName,
      phoneNumber: newCustomer.phoneNumber,
      email: newCustomer.email,
      identityCard: newCustomer.identityCard,
      address: newCustomer.address,
    });

    toast.success("Thông tin khách hàng đã sẵn sàng");
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "existing" | "new");

    // Clear data when switching tabs
    if (tab === "existing") {
      setNewCustomer({
        fullName: "",
        phoneNumber: "",
        email: "",
        identityCard: "",
        address: "",
      });
      // Auto-load customers when switching to existing tab
      if (existingCustomers.length === 0 && !isLoadingCustomers) {
        loadCustomers();
      }
    } else {
      setSelectedCustomerId("");
      setSearchTerm("");
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-5 h-5 text-primary-600">{ICONS.USER}</span>
        <h3 className="text-lg font-extrabold text-gray-900">
          Thông Tin Khách Hàng
        </h3>
        <p className="text-xs text-gray-500 ml-auto">
          {mode === "create"
            ? "Chọn khách hàng hoặc thêm mới"
            : "Chỉnh sửa khách hàng"}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Tab List */}
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="existing"
            className="rounded-md font-bold data-[state=active]:bg-white data-[state=active]:text-primary-600"
          >
            <span className="mr-2">{ICONS.SEARCH}</span>
            Khách Hàng Có Tài Khoản
          </TabsTrigger>
          <TabsTrigger
            value="new"
            className="rounded-md font-bold data-[state=active]:bg-white data-[state=active]:text-primary-600"
          >
            <span className="mr-2 flex items-center justify-center w-5 h-5">
              {ICONS.USER_PLUS}
            </span>
            Khách Hàng Mới
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Existing Customer */}
        <TabsContent value="existing" className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 shrink-0 text-lg">ℹ️</span>
              <div>
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Mẹo:</span> Tìm kiếm khách hàng
                  theo tên hoặc số điện thoại. Nếu khách hàng đã có tài khoản
                  nhưng không tìm thấy, hãy chuyển sang tab &quot;Khách hàng
                  mới&quot; để nhập số điện thoại - hệ thống sẽ tự động liên
                  kết.
                </p>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div>
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
                onFocus={() => {
                  if (existingCustomers.length === 0 && !isLoadingCustomers) {
                    loadCustomers();
                  }
                }}
                className="pl-10 h-11 border-2 border-gray-300 rounded-lg font-medium focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
          </div>

          {/* Customer List - Display as Cards */}
          <div>
            <Label
              htmlFor="existingCustomer"
              className="text-sm font-bold text-gray-700"
            >
              Chọn Khách Hàng <span className="text-red-600">*</span>
            </Label>
            {isLoadingCustomers ? (
              <div className="mt-3 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-gray-500 font-medium">
                  Đang tải danh sách khách hàng...
                </span>
              </div>
            ) : !filteredCustomers || filteredCustomers.length === 0 ? (
              <div className="mt-3 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-gray-500 font-medium">
                  {searchTerm
                    ? "Không tìm thấy khách hàng"
                    : "Nhập tên hoặc số điện thoại để tìm kiếm"}
                </span>
              </div>
            ) : (
              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedCustomerId === customer.id
                        ? "border-primary-600 bg-primary-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-gray-900">
                            {customer.fullName}
                          </p>
                          {selectedCustomerId === customer.id && (
                            <span className="text-primary-600 text-sm">✓</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                          <p>
                            <span className="font-semibold">Điện thoại:</span>{" "}
                            {customer.phone}
                          </p>
                          <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {customer.email || "-"}
                          </p>
                          <p className="col-span-2">
                            <span className="font-semibold">CMND/CCCD:</span>{" "}
                            {customer.idNumber || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Info Preview */}
          {selectedCustomerId && (
            <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-600 text-lg">
                  {ICONS.CHECK_CIRCLE}
                </span>
                <h4 className="font-bold text-green-900">
                  Thông tin khách hàng
                </h4>
              </div>
              {(() => {
                const customer = existingCustomers.find(
                  (c) => c.id === selectedCustomerId
                );
                return customer ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs font-semibold">
                        Họ Tên
                      </p>
                      <p className="text-gray-900 font-bold">
                        {customer.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold">
                        Số Điện Thoại
                      </p>
                      <p className="text-gray-900 font-bold">
                        {customer.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold">
                        Email
                      </p>
                      <p className="text-gray-900 font-bold">
                        {customer.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-semibold">
                        CMND/CCCD
                      </p>
                      <p className="text-gray-900 font-bold">
                        {customer.idNumber || "N/A"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600 text-xs font-semibold">
                        Địa Chỉ
                      </p>
                      <p className="text-gray-900 font-bold">
                        {customer.address || "N/A"}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: New Customer */}
        <TabsContent value="new" className="space-y-4">
          <Alert className="border-2 border-amber-200 bg-amber-50 mb-4">
            <span className="text-amber-600">{ICONS.ALERT}</span>
            <AlertDescription className="text-amber-800 ml-2">
              <span className="font-bold ml-5">Lưu ý:</span> Nếu khách hàng sử
              dụng số điện thoại đã tồn tại trong hệ thống, booking sẽ được tạo
              dưới tài khoản hiện có.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="md:col-span-2">
              <Label
                htmlFor="newFullName"
                className="text-sm font-bold text-gray-700"
              >
                Họ Và Tên <span className="text-red-600">*</span>
              </Label>
              <Input
                id="newFullName"
                type="text"
                placeholder="Nguyễn Văn An"
                value={newCustomer.fullName}
                onChange={(e) =>
                  handleNewCustomerChange("fullName", e.target.value)
                }
                className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
              />
            </div>

            {/* Phone */}
            <div>
              <Label
                htmlFor="newPhone"
                className="text-sm font-bold text-gray-700"
              >
                Số Điện Thoại <span className="text-red-600">*</span>
              </Label>
              <Input
                id="newPhone"
                type="tel"
                placeholder="0901234567"
                value={newCustomer.phoneNumber}
                onChange={(e) =>
                  handleNewCustomerChange("phoneNumber", e.target.value)
                }
                className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
              />
              <p className="text-xs text-gray-500 mt-1">10 chữ số</p>
            </div>

            {/* Email */}
            <div>
              <Label
                htmlFor="newEmail"
                className="text-sm font-bold text-gray-700"
              >
                Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="example@email.com"
                value={newCustomer.email}
                onChange={(e) =>
                  handleNewCustomerChange("email", e.target.value)
                }
                className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
              />
            </div>

            {/* ID Number */}
            <div>
              <Label
                htmlFor="newIdNumber"
                className="text-sm font-bold text-gray-700"
              >
                CMND/CCCD <span className="text-red-600">*</span>
              </Label>
              <Input
                id="newIdNumber"
                type="text"
                placeholder="079012345678"
                value={newCustomer.identityCard}
                onChange={(e) =>
                  handleNewCustomerChange("identityCard", e.target.value)
                }
                className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <Label
                htmlFor="newAddress"
                className="text-sm font-bold text-gray-700"
              >
                Địa Chỉ <span className="text-red-600">*</span>
              </Label>
              <Input
                id="newAddress"
                type="text"
                placeholder="123 Lê Lợi, Q.1, TP.HCM"
                value={newCustomer.address}
                onChange={(e) =>
                  handleNewCustomerChange("address", e.target.value)
                }
                className="h-11 mt-2 border-2 border-gray-300 rounded-lg font-medium"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleNewCustomerSubmit}
            className="w-full h-11 bg-primary-600 hover:bg-primary-500 font-bold text-white rounded-lg mt-4"
          >
            {ICONS.SAVE}
            Xác Nhận Thông Tin
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CustomerSelectionCard;
