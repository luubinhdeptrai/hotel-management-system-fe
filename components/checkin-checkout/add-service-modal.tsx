"use client";

import { useState } from "react";
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
import { ICONS } from "@/src/constants/icons.enum";
import type { Service } from "@/lib/types/checkin-checkout";
import type { AddServiceFormData } from "@/lib/types/checkin-checkout";

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  onConfirm: (data: AddServiceFormData) => void;
}

export function AddServiceModal({
  open,
  onOpenChange,
  services,
  onConfirm,
}: AddServiceModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

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

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

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
          {/* Service Selection */}
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
                {Object.entries(servicesByCategory).map(
                  ([category, categoryServices]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                        {category}
                      </div>
                      {categoryServices.map((service) => (
                        <SelectItem
                          key={service.serviceID}
                          value={service.serviceID}
                        >
                          {service.serviceName} -{" "}
                          {formatCurrency(service.price)}
                        </SelectItem>
                      ))}
                    </div>
                  )
                )}
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
                  <span className="font-medium text-gray-900">{quantity}</span>
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
