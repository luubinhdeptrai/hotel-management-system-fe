"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ICONS } from "@/src/constants/icons.enum";
import type { CheckoutSummary } from "@/lib/types/checkin-checkout";
import { cn } from "@/lib/utils";

interface CheckOutDetailsProps {
  summary: CheckoutSummary;
  onAddService: () => void;
  onAddPenalty: () => void;
  onCompleteCheckout: () => void;
  onBack: () => void;
}

// 3-Step Checkout Process (per spec 2.6)
type CheckoutStep = 1 | 2 | 3;

const CHECKOUT_STEPS = [
  { step: 1, title: "Thông tin khách", description: "Xác nhận thông tin" },
  { step: 2, title: "Dịch vụ & Phạt", description: "POST dịch vụ/phạt" },
  { step: 3, title: "Thanh toán", description: "Xuất bill và thanh toán" },
] as const;

export function CheckOutDetails({
  summary,
  onAddService,
  onAddPenalty,
  onCompleteCheckout,
  onBack,
}: CheckOutDetailsProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as CheckoutStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as CheckoutStep);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handlePrevStep}
          variant="outline"
          size="sm"
          className="h-8"
        >
          {ICONS.CHEVRON_LEFT}
          <span className="ml-1">
            {currentStep === 1 ? "Quay lại" : "Bước trước"}
          </span>
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Chi tiết trả phòng
          </h2>
          <p className="text-sm text-gray-500">
            Mã phiếu thuê: {summary.receiptID}
          </p>
        </div>
      </div>

      {/* 3-Step Indicator */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        {CHECKOUT_STEPS.map((step, index) => (
          <div key={step.step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors",
                  currentStep === step.step
                    ? "bg-primary-600 text-white"
                    : currentStep > step.step
                    ? "bg-success-600 text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {currentStep > step.step ? "✓" : step.step}
              </div>
              <p
                className={cn(
                  "text-sm font-medium mt-2",
                  currentStep === step.step
                    ? "text-primary-600"
                    : "text-gray-500"
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-gray-400">{step.description}</p>
            </div>
            {index < CHECKOUT_STEPS.length - 1 && (
              <div
                className={cn(
                  "w-24 h-1 mx-4",
                  currentStep > step.step ? "bg-success-600" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Guest & Room Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Thông tin khách hàng & phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Khách hàng:</span>
                  <p className="font-medium text-gray-900">
                    {summary.receipt.customerName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Số điện thoại:</span>
                  <p className="font-medium text-gray-900">
                    {summary.receipt.phoneNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">CMND:</span>
                  <p className="font-medium text-gray-900">
                    {summary.receipt.identityCard}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Phòng:</span>
                  <p className="font-medium text-gray-900">
                    {summary.receipt.roomName} ({summary.receipt.roomTypeName})
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Ngày nhận:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(summary.receipt.checkInDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Ngày trả:</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(summary.receipt.checkOutDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Số đêm:</span>
                  <p className="font-medium text-gray-900">
                    {summary.receipt.totalNights} đêm
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Số khách:</span>
                  <p className="font-medium text-gray-900">
                    {summary.receipt.numberOfGuests} người
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Charges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tiền phòng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  {summary.receipt.totalNights} đêm ×{" "}
                  {formatCurrency(summary.receipt.pricePerNight)}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(summary.roomTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Step Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleNextStep}
              className="h-10 bg-primary-600 hover:bg-primary-500 text-white px-8"
            >
              <span>Tiếp theo: Dịch vụ & Phạt</span>
              <span className="ml-2">{ICONS.CHEVRON_RIGHT}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Services & Penalties (POST) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Services */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Dịch vụ sử dụng</CardTitle>
              <Button
                onClick={onAddService}
                size="sm"
                variant="outline"
                className="h-8 border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                {ICONS.PLUS}
                <span className="ml-1">POST Dịch vụ</span>
              </Button>
            </CardHeader>
            <CardContent>
              {summary.services.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có dịch vụ nào được sử dụng
                </p>
              ) : (
                <div className="space-y-3">
                  {summary.services.map((service) => (
                    <div
                      key={service.detailID}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {service.serviceName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {service.quantity} × {formatCurrency(service.price)} •{" "}
                          {formatDate(service.dateUsed)}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(service.total)}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-700">Tổng dịch vụ:</span>
                    <span className="text-gray-900">
                      {formatCurrency(summary.servicesTotal)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Penalties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Phí phạt & bồi thường</CardTitle>
              <Button
                onClick={onAddPenalty}
                size="sm"
                variant="outline"
                className="h-8 border-error-600 text-error-600 hover:bg-error-100"
              >
                {ICONS.ALERT}
                <span className="ml-1">POST Phạt</span>
              </Button>
            </CardHeader>
            <CardContent>
              {summary.penalties.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Không có phí phạt nào
                </p>
              ) : (
                <div className="space-y-3">
                  {summary.penalties.map((penalty) => (
                    <div
                      key={penalty.penaltyID}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {penalty.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(penalty.dateIssued)}
                        </p>
                      </div>
                      <span className="font-semibold text-error-600">
                        {formatCurrency(penalty.amount)}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-700">Tổng phạt:</span>
                    <span className="text-error-600">
                      {formatCurrency(summary.penaltiesTotal)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Step Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleNextStep}
              className="h-10 bg-primary-600 hover:bg-primary-500 text-white px-8"
            >
              <span>Tiếp theo: Thanh toán</span>
              <span className="ml-2">{ICONS.CHEVRON_RIGHT}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tổng kết chi phí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Tiền phòng:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(summary.roomTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  Dịch vụ ({summary.services.length} mục):
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(summary.servicesTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  Phí phạt ({summary.penalties.length} mục):
                </span>
                <span className="font-medium text-error-600">
                  {formatCurrency(summary.penaltiesTotal)}
                </span>
              </div>
              <Separator />
            </CardContent>
          </Card>

          {/* Grand Total */}
          <Card className="bg-primary-50 border-primary-600 border-2">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  TỔNG THANH TOÁN:
                </span>
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(summary.grandTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="h-10 px-6"
              onClick={() => window.print()}
            >
              {ICONS.PRINTER}
              <span className="ml-2">In Bill</span>
            </Button>
            <Button
              onClick={onCompleteCheckout}
              className="h-10 bg-success-600 hover:bg-success-500 text-white px-8"
            >
              {ICONS.CREDIT_CARD}
              <span className="ml-2">Xác nhận Thanh toán</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
