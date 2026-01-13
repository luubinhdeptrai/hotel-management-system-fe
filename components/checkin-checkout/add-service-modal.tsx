"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import { serviceManagementService } from "@/lib/services/service.service";
import type { Service as ApiService } from "@/lib/types/api";
import type { Service } from "@/lib/types/checkin-checkout";
import type { AddServiceFormData } from "@/lib/types/checkin-checkout";

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services?: Service[]; // Optional - will fetch from API if not provided
  onConfirm: (data: AddServiceFormData) => void;
}

export function AddServiceModal({
  open,
  onOpenChange,
  services: propServices,
  onConfirm,
}: AddServiceModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [services, setServices] = useState<Service[]>(propServices || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load services from API when modal opens (if no services provided)
  useEffect(() => {
    const loadServices = async () => {
      // Skip if services already provided via props
      if (propServices && propServices.length > 0) {
        setServices(propServices);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await serviceManagementService.getServices({
          // Don't filter by isActive here - let's get all and filter in FE
          limit: 100,
          page: 1,
        });

        // response is PaginatedResponse<Service> = { data: [...services], total, page, limit }
        // response.data is the array of services
        const apiServices = (response?.data as ApiService[]) || [];

        // Convert API Service to local Service format
        const converted: Service[] = apiServices
          .filter((s: ApiService) => {
            const isActive = s.isActive !== false;
            return isActive;
          })
          .map((s: ApiService) => ({
            serviceID: s.id,
            serviceName: s.name,
            price: s.price || 0,
            unit: s.unit || "lần",
            category: "Dịch vụ",
          }));

        setServices(converted);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại.");
        // Use prop services as fallback if provided
        if (propServices) {
          setServices(propServices);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadServices();
    }
  }, [open, propServices]);

  const selectedService = services.find(
    (s) => s.serviceID === selectedServiceId
  );

  const handleConfirm = () => {
    if (!selectedServiceId) return;

    const formData: AddServiceFormData = {
      serviceID: selectedServiceId,
      quantity,
      notes: notes.trim() || undefined,
    };

    onConfirm(formData);
    onOpenChange(false);
    // Reset form
    setSelectedServiceId("");
    setQuantity(1);
    setNotes("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalAmount = selectedService ? selectedService.price * quantity : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Thêm dịch vụ
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Chọn dịch vụ và số lượng để thêm vào hóa đơn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin w-6 h-6 mx-auto text-primary-600">
                  {ICONS.LOADER}
                </div>
                <p className="text-sm text-gray-600">Đang tải dịch vụ...</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                {ICONS.ALERT_CIRCLE}
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Service Selection */}
          {!isLoading && services.length > 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="service" className="text-sm font-medium">
                  Dịch vụ <span className="text-error-600">*</span>
                </Label>
                <Select
                  value={selectedServiceId}
                  onValueChange={setSelectedServiceId}
                >
                  <SelectTrigger id="service" className="h-10 border-gray-300">
                    <SelectValue placeholder="Chọn dịch vụ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem
                        key={service.serviceID}
                        value={service.serviceID}
                      >
                        {service.serviceName} - {formatCurrency(service.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Số lượng <span className="text-error-600">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="h-10 border-gray-300 focus:ring-primary-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="service-notes" className="text-sm font-medium">
                  Ghi chú
                </Label>
                <Input
                  id="service-notes"
                  placeholder="Nhập ghi chú (nếu có)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-10 border-gray-300 focus:ring-primary-500"
                />
              </div>

              {/* Total Amount Display */}
              {selectedService && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Dịch vụ:</span>
                      <span className="font-medium text-gray-900">
                        {selectedService.serviceName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Đơn giá:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(selectedService.price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Số lượng:</span>
                      <span className="font-medium text-gray-900">
                        {quantity}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          Thành tiền:
                        </span>
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && services.length === 0 && !error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="w-6 h-6 text-gray-400">{ICONS.PACKAGE}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Không có dịch vụ nào</p>
                <p className="text-xs text-gray-500">Vui lòng thêm dịch vụ trong quản lý dịch vụ</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="h-10"
          >
            {ICONS.CLOSE}
            <span className="ml-2">Hủy</span>
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedServiceId}
            className="h-10 bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50"
          >
            {ICONS.PLUS}
            <span className="ml-2">Thêm dịch vụ</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
