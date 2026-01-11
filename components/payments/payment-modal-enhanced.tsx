"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ICONS } from "@/src/constants/icons.enum";
import type { CheckoutSummary } from "@/lib/types/checkin-checkout";
import type { PaymentMethod } from "@/lib/types/api";
import { PAYMENT_METHOD_LABELS } from "@/lib/types/api";

type PaymentScenario = "full" | "split" | "service";

interface PaymentModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: CheckoutSummary | null;
  bookingId: string;
  availableRooms?: Array<{ id: string; name: string; balance: number }>; // For split payment
  availableServices?: Array<{ id: string; name: string; balance: number }>; // For service payment
  onConfirm: (data: PaymentData) => void;
}

export interface PaymentData {
  method: PaymentMethod;
  scenario: PaymentScenario;
  bookingRoomIds?: string[]; // For split payment
  serviceUsageId?: string; // For service payment
  description?: string;
}

export function PaymentModalEnhanced({
  open,
  onOpenChange,
  summary,
  bookingId,
  availableRooms = [],
  availableServices = [],
  onConfirm,
}: PaymentModalEnhancedProps) {
  const [scenario, setScenario] = useState<PaymentScenario>("full");
  const [method, setMethod] = useState<PaymentMethod | undefined>(undefined);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const total = useMemo(() => {
    if (scenario === "full") {
      return summary?.grandTotal ?? 0;
    } else if (scenario === "split") {
      return availableRooms
        .filter((r) => selectedRooms.includes(r.id))
        .reduce((sum, r) => sum + r.balance, 0);
    } else if (scenario === "service") {
      const service = availableServices.find((s) => s.id === selectedService);
      return service?.balance ?? 0;
    }
    return 0;
  }, [scenario, summary, selectedRooms, selectedService, availableRooms, availableServices]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleConfirm = async () => {
    if (!method) return;

    if (scenario === "split" && selectedRooms.length === 0) {
      alert("Vui lòng chọn ít nhất một phòng");
      return;
    }

    if (scenario === "service" && !selectedService) {
      alert("Vui lòng chọn dịch vụ cần thanh toán");
      return;
    }

    setIsConfirming(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsConfirming(false);
    setIsConfirmed(true);

    onConfirm({
      method,
      scenario,
      bookingRoomIds: scenario === "split" ? selectedRooms : undefined,
      serviceUsageId: scenario === "service" ? selectedService : undefined,
      description: description || undefined,
    });
  };

  const handlePrint = () => {
    if (!summary) return;
    const url = `/payments/print?receiptID=${encodeURIComponent(
      summary.receiptID
    )}`;
    window.open(url, "_blank");
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={open ? summary?.receiptID ?? "payment" : "closed"}
        className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto"
        aria-description="Xác nhận thanh toán và in hóa đơn"
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">
            Thanh toán
          </DialogTitle>
        </DialogHeader>

        {!summary ? (
          <div className="text-sm text-gray-500">
            Không có dữ liệu thanh toán.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Customer Info */}
            <div className="rounded-md bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-700">
                  <p className="text-sm">Khách hàng</p>
                  <p className="font-medium text-gray-900">
                    {summary.receipt.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Booking ID</p>
                  <p className="font-mono text-sm text-gray-900">{bookingId.substring(0, 8)}</p>
                </div>
              </div>
            </div>

            {/* Payment Scenario Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                Loại thanh toán
              </Label>
              <Select value={scenario} onValueChange={(v) => setScenario(v as PaymentScenario)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">
                    <div>
                      <div className="font-medium">Thanh toán toàn bộ</div>
                      <div className="text-sm text-gray-500">
                        Thanh toán tất cả phòng và dịch vụ ({formatCurrency(summary?.grandTotal ?? 0)})
                      </div>
                    </div>
                  </SelectItem>

                  {availableRooms.length > 0 && (
                    <SelectItem value="split">
                      <div>
                        <div className="font-medium">Thanh toán tách phòng</div>
                        <div className="text-sm text-gray-500">
                          Chọn phòng cụ thể để thanh toán
                        </div>
                      </div>
                    </SelectItem>
                  )}

                  {availableServices.length > 0 && (
                    <SelectItem value="service">
                      <div>
                        <div className="font-medium">Thanh toán dịch vụ</div>
                        <div className="text-sm text-gray-500">
                          Thanh toán một dịch vụ cụ thể
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Split Room Selection */}
            {scenario === "split" && availableRooms.length > 0 && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <Label className="text-sm font-medium text-gray-900">
                  Chọn phòng cần thanh toán
                </Label>
                <div className="space-y-2">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`room-${room.id}`}
                          checked={selectedRooms.includes(room.id)}
                          onCheckedChange={() => toggleRoom(room.id)}
                        />
                        <Label
                          htmlFor={`room-${room.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {room.name}
                        </Label>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(room.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Selection */}
            {scenario === "service" && availableServices.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Chọn dịch vụ cần thanh toán
                </Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Chọn dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - {formatCurrency(service.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Total Amount */}
            <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border-2 border-primary-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-700">
                  Tổng số tiền thanh toán
                </span>
                <span className="text-2xl font-bold text-primary-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Chọn phương thức thanh toán
              </Label>
              <Select
                value={method}
                onValueChange={(v: PaymentMethod) => setMethod(v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">{PAYMENT_METHOD_LABELS.CASH}</SelectItem>
                  <SelectItem value="CREDIT_CARD">{PAYMENT_METHOD_LABELS.CREDIT_CARD}</SelectItem>
                  <SelectItem value="BANK_TRANSFER">{PAYMENT_METHOD_LABELS.BANK_TRANSFER}</SelectItem>
                  <SelectItem value="E_WALLET">{PAYMENT_METHOD_LABELS.E_WALLET}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Ghi chú giao dịch (tùy chọn)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập ghi chú về giao dịch này..."
                className="min-h-[60px]"
              />
            </div>

            <Separator />

            <div className="text-xs text-gray-500">
              {scenario === "full" && (
                <p>
                  Thanh toán toàn bộ sẽ cập nhật trạng thái booking thành &quot;Đã thanh toán&quot;
                  và chuyển phòng sang trạng thái &quot;Đang vệ sinh&quot;.
                </p>
              )}
              {scenario === "split" && (
                <p>
                  Thanh toán tách phòng chỉ thanh toán cho các phòng đã chọn.
                  Booking vẫn có thể có số dư còn lại.
                </p>
              )}
              {scenario === "service" && (
                <p>
                  Thanh toán dịch vụ riêng lẻ trong booking.
                  Có thể áp dụng khuyến mãi cho dịch vụ.
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="h-9"
            onClick={() => onOpenChange(false)}
          >
            {ICONS.CLOSE}
            <span className="ml-1">Đóng</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              disabled={!isConfirmed}
              onClick={handlePrint}
              className="h-9 bg-gray-900 text-white hover:bg-gray-700"
            >
              {ICONS.RECEIPT}
              <span className="ml-1">In Hóa đơn</span>
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!method || isConfirming || !summary || total <= 0}
              className="h-9 bg-primary-600 hover:bg-primary-500 text-white"
            >
              {ICONS.CREDIT_CARD}
              <span className="ml-2">
                {isConfirming
                  ? "Đang xử lý..."
                  : isConfirmed
                  ? "Đã thanh toán"
                  : "Xác nhận Thanh toán"}
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
