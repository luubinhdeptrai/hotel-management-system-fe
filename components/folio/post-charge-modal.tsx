"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TransactionType, PostChargeFormData } from "@/lib/types/folio";
import { TRANSACTION_TYPE_LABELS } from "@/lib/types/folio";
import { useServices } from "@/hooks/use-services";
import { usePenaltyPage } from "@/hooks/use-penalty-page";
import { useSurchargePage } from "@/hooks/use-surcharge-page";

interface PostChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostChargeFormData) => void;
}

// Only charge types (not payments)
const CHARGE_TYPES: TransactionType[] = [
  "ROOM_CHARGE",
  "SERVICE_CHARGE",
];

export function PostChargeModal({
  isOpen,
  onClose,
  onSubmit,
}: PostChargeModalProps) {
  const [type, setType] = useState<TransactionType>("SERVICE_CHARGE");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  // Load data from hooks
  const { getActiveServices } = useServices();
  const { penalties } = usePenaltyPage();
  const { surcharges } = useSurchargePage();

  // Get active items based on selected type
  const activeServices = getActiveServices();
  const activePenalties = penalties.filter(p => p.isActive);
  const activeSurcharges = surcharges.filter(s => s.isActive);

  // Handle type change - reset form
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setSelectedItemId("");
    setDescription("");
    setAmount("");
    setIsCustomAmount(false);
  };

  // Handle item selection - auto-fill description and amount
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);

    if (type === "SERVICE_CHARGE") {
      const selectedItem = activeServices.find(s => s.serviceID === itemId);
      if (selectedItem) {
        setDescription(selectedItem.serviceName);
        setAmount(selectedItem.price.toString());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !description || !amount) {
      return;
    }

    onSubmit({
      type,
      description,
      amount: parseFloat(amount),
    });

    // Reset form
    setType("SERVICE_CHARGE");
    setSelectedItemId("");
    setDescription("");
    setAmount("");
    setIsCustomAmount(false);
    onClose();
  };

  const handleClose = () => {
    setType("SERVICE_CHARGE");
    setSelectedItemId("");
    setDescription("");
    setAmount("");
    setIsCustomAmount(false);
    onClose();
  };

  // Check if current type needs item selection
  const needsItemSelection = ["SERVICE_CHARGE"].includes(type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm phí (Post Charge)</DialogTitle>
          <DialogDescription>
            Thêm phí mới vào folio của khách. Phí sẽ được tính vào cột Debit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="charge-type">Loại phí</Label>
            <Select
              value={type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="charge-type">
                <SelectValue placeholder="Chọn loại phí" />
              </SelectTrigger>
              <SelectContent>
                {CHARGE_TYPES.map((chargeType) => (
                  <SelectItem key={chargeType} value={chargeType}>
                    {TRANSACTION_TYPE_LABELS[chargeType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show item selection dropdown for SERVICE_CHARGE */}
          {needsItemSelection && (
            <div className="space-y-2">
              <Label htmlFor="item-select">
                {type === "SERVICE_CHARGE" && "Chọn dịch vụ"}
              </Label>
              <Select
                value={selectedItemId}
                onValueChange={handleItemSelect}
              >
                <SelectTrigger id="item-select">
                  <SelectValue placeholder={
                    type === "SERVICE_CHARGE" ? "Chọn dịch vụ từ danh sách" : "Chọn từ danh sách"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {type === "SERVICE_CHARGE" && activeServices.map((service) => (
                    <SelectItem key={service.serviceID} value={service.serviceID}>
                      {service.serviceName} - {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(service.price)}
                    </SelectItem>
                  ))}
                  {type === "SERVICE_CHARGE" && activeServices.length === 0 && (
                    <SelectItem value="_empty" disabled>Chưa có dịch vụ nào</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả cho khoản phí"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền (VND)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1000"
              required
              disabled={!isCustomAmount && needsItemSelection && !!selectedItemId}
            />
            {isCustomAmount && (
              <p className="text-xs text-amber-600">
                Mục này cho phép nhập giá tùy chỉnh
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!type || !description || !amount}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500"
            >
              Thêm phí
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
