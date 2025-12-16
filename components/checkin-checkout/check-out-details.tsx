"use client";


import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";
import type { CheckoutSummary } from "@/lib/types/checkin-checkout";
import { cn } from "@/lib/utils";
import { ExtendStayModal } from "./extend-stay-modal";

interface CheckOutDetailsProps {
  summary: CheckoutSummary;
  onAddService: () => void;
  onAddPenalty: () => void;
  onAddSurcharge?: () => void;
  onCompleteCheckout: () => void;
  onBack: () => void;
}

// 3-Step Checkout Process (per spec 2.6)
type CheckoutStep = 1 | 2 | 3;

const CHECKOUT_STEPS = [
  { step: 1, title: "Thông tin khách", description: "Xác nhận thông tin" },
  { step: 2, title: "Dịch vụ, Phạt & Phụ thu", description: "POST dịch vụ/phạt/phụ thu" },
  { step: 3, title: "Thanh toán", description: "Xuất bill và thanh toán" },
] as const;

export function CheckOutDetails({
  summary,
  onAddService,
  onAddPenalty,
  onAddSurcharge,
  onCompleteCheckout,
  onBack,
}: CheckOutDetailsProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [extendStayModalOpen, setExtendStayModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
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

  const grandTotal = 
    summary.roomTotal + 
    summary.servicesTotal + 
    summary.penaltiesTotal + 
    (summary.surchargesTotal || 0);

  return (
    <div className="space-y-8">
      {/* Modern Header with Back Button */}
      <div className="bg-linear-to-br from-white via-gray-50 to-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePrevStep}
              variant="outline"
              size="sm"
              className="h-10 px-4 border-2 border-gray-300 hover:bg-gray-100 font-semibold"
            >
              <span className="w-4 h-4 mr-2">{ICONS.CHEVRON_LEFT}</span>
              {currentStep === 1 ? "Quay lại" : "Bước trước"}
            </Button>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Chi tiết trả phòng
              </h2>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Mã phiếu thuê: <span className="font-bold text-primary-600">{summary.receiptID}</span>
              </p>
            </div>
          </div>
          <Badge className="h-8 px-4 bg-linear-to-r from-primary-600 to-primary-500 text-white font-bold">
            Bước {currentStep}/3
          </Badge>
        </div>
      </div>

      {/* Modern 3-Step Progress Indicator */}
      <div className="bg-linear-to-br from-white via-gray-50 to-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-between">
          {CHECKOUT_STEPS.map((step, index) => (
            <div key={step.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all shadow-lg",
                    currentStep === step.step
                      ? "bg-linear-to-br from-primary-600 to-primary-500 text-white scale-110"
                      : currentStep > step.step
                      ? "bg-linear-to-br from-success-600 to-success-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  )}
                >
                  {currentStep > step.step ? (
                    <span className="w-8 h-8">{ICONS.CHECK}</span>
                  ) : (
                    step.step
                  )}
                </div>
                <div className="mt-4 text-center">
                  <p
                    className={cn(
                      "text-base font-bold",
                      currentStep === step.step
                        ? "text-primary-600"
                        : currentStep > step.step
                        ? "text-success-600"
                        : "text-gray-500"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
              {index < CHECKOUT_STEPS.length - 1 && (
                <div className="flex-1 h-2 mx-4 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      currentStep > step.step 
                        ? "bg-linear-to-r from-success-600 to-success-500 w-full" 
                        : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Customer & Room Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card className="border-2 border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-gray-50 to-white border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                  <span className="w-5 h-5 text-white">{ICONS.USER}</span>
                </div>
                <CardTitle className="text-xl font-extrabold text-gray-900">
                  Thông tin khách hàng & phòng
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Khách hàng:</span>
                  <p className="text-lg font-bold text-gray-900">{summary.receipt.customerName}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Số điện thoại:</span>
                  <p className="text-lg font-bold text-gray-900">{summary.receipt.phoneNumber}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">CMND/CCCD:</span>
                  <p className="text-lg font-bold text-gray-900">{summary.receipt.identityCard}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phòng:</span>
                  <p className="text-lg font-bold text-primary-600">
                    {summary.receipt.roomName} <span className="text-gray-600">({summary.receipt.roomTypeName})</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ngày nhận:</span>
                  <p className="text-lg font-bold text-gray-900">{formatDate(summary.receipt.checkInDate)}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ngày trả:</span>
                  <p className="text-lg font-bold text-gray-900">{formatDate(summary.receipt.checkOutDate)}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Số đêm:</span>
                  <p className="text-lg font-bold text-gray-900">{summary.receipt.totalNights} đêm</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Số khách:</span>
                  <p className="text-lg font-bold text-gray-900">{summary.receipt.numberOfGuests} người</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary-200 shadow-lg rounded-2xl overflow-hidden bg-linear-to-br from-primary-50 to-white">
            <CardHeader className="bg-linear-to-r from-primary-100 to-primary-50 border-b-2 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                    <span className="w-5 h-5 text-white">{ICONS.HOME}</span>
                  </div>
                  <CardTitle className="text-xl font-extrabold text-gray-900">
                    Tiền phòng
                  </CardTitle>
                </div>
                <Button
                  onClick={() => setExtendStayModalOpen(true)}
                  variant="outline"
                  className="h-10 bg-warning-50 border-warning-300 hover:bg-warning-100 text-warning-700 font-semibold"
                >
                  {ICONS.CALENDAR_PLUS}
                  <span className="ml-2">Gia hạn lưu trú</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">
                  {summary.receipt.totalNights} đêm × {formatCurrency(summary.receipt.pricePerNight)}
                </span>
                <span className="text-2xl font-extrabold text-primary-600">
                  {formatCurrency(summary.roomTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleNextStep}
              className="h-12 px-8 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span>Tiếp theo: Dịch vụ, Phạt & Phụ thu</span>
              <span className="w-5 h-5 ml-2">{ICONS.CHEVRON_RIGHT}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Services & Penalties */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Services Card */}
          <Card className="border-2 border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-blue-50 to-white border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="w-5 h-5 text-white">{ICONS.CLIPBOARD_LIST}</span>
                  </div>
                  <CardTitle className="text-xl font-extrabold text-gray-900">
                    Dịch vụ sử dụng
                  </CardTitle>
                </div>
                <Button
                  onClick={onAddService}
                  size="sm"
                  className="h-10 px-5 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
                  POST Dịch vụ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {summary.services.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="w-10 h-10 text-gray-400">{ICONS.PACKAGE}</span>
                  </div>
                  <p className="text-base font-semibold text-gray-500">
                    Chưa có dịch vụ nào được sử dụng
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.services.map((service, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 bg-linear-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{service.serviceName}</p>
                        <p className="text-sm text-gray-600">
                          {service.quantity} × {formatCurrency(service.price)} • {formatDate(service.dateUsed)}
                        </p>
                      </div>
                      <span className="text-lg font-extrabold text-blue-600">
                        {formatCurrency(service.total)}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <span className="text-base font-bold text-gray-900">Tổng dịch vụ:</span>
                    <span className="text-xl font-extrabold text-blue-600">
                      {formatCurrency(summary.servicesTotal)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Penalties Card */}
          <Card className="border-2 border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-red-50 to-white border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="w-5 h-5 text-white">{ICONS.PENALTY}</span>
                  </div>
                  <CardTitle className="text-xl font-extrabold text-gray-900">
                    Phí phạt & bồi thường
                  </CardTitle>
                </div>
                <Button
                  onClick={onAddPenalty}
                  size="sm"
                  variant="outline"
                  className="h-10 px-5 border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
                  POST Phạt
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {summary.penalties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="w-10 h-10 text-gray-400">{ICONS.CHECK_CIRCLE}</span>
                  </div>
                  <p className="text-base font-semibold text-gray-500">
                    Không có phí phạt nào
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.penalties.map((penalty, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 bg-linear-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-red-300 transition-all"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{penalty.description}</p>
                        <p className="text-sm text-gray-600">{formatDate(penalty.dateIssued)}</p>
                      </div>
                      <span className="text-lg font-extrabold text-red-600">
                        {formatCurrency(penalty.amount)}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <span className="text-base font-bold text-gray-900">Tổng phí phạt:</span>
                    <span className="text-xl font-extrabold text-red-600">
                      {formatCurrency(summary.penaltiesTotal)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Surcharges Card */}
          <Card className="border-2 border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-yellow-50 to-white border-b-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-yellow-600 to-yellow-500 rounded-xl flex items-center justify-center">
                    <span className="w-5 h-5 text-white">{ICONS.SURCHARGE}</span>
                  </div>
                  <CardTitle className="text-xl font-extrabold text-gray-900">
                    Phụ thu
                  </CardTitle>
                </div>
                {onAddSurcharge && (
                  <Button
                    onClick={onAddSurcharge}
                    size="sm"
                    variant="outline"
                    className="h-10 px-5 border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
                    POST Phụ thu
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!summary.surcharges || summary.surcharges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="w-10 h-10 text-gray-400">{ICONS.CHECK_CIRCLE}</span>
                  </div>
                  <p className="text-base font-semibold text-gray-500">
                    Không có phụ thu nào
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.surcharges.map((surcharge, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 bg-linear-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-yellow-300 transition-all"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{surcharge.surchargeName}</p>
                        <p className="text-sm text-gray-600">
                          {surcharge.rate}% • {formatDate(surcharge.dateApplied)}
                          {surcharge.description && ` • ${surcharge.description}`}
                        </p>
                      </div>
                      <span className="text-lg font-extrabold text-yellow-600">
                        {formatCurrency(surcharge.amount)}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                    <span className="text-base font-bold text-gray-900">Tổng phụ thu:</span>
                    <span className="text-xl font-extrabold text-yellow-600">
                      {formatCurrency(summary.surchargesTotal || 0)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              onClick={handlePrevStep}
              variant="outline"
              className="h-12 px-8 border-2 border-gray-300 font-bold text-base hover:bg-gray-100"
            >
              <span className="w-5 h-5 mr-2">{ICONS.CHEVRON_LEFT}</span>
              Bước trước
            </Button>
            <Button
              onClick={handleNextStep}
              className="h-12 px-8 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span>Tiếp theo: Thanh toán</span>
              <span className="w-5 h-5 ml-2">{ICONS.CHEVRON_RIGHT}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment Summary */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card className="border-2 border-primary-200 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-linear-to-br from-primary-600 via-primary-500 to-primary-600 text-white border-b-2 border-primary-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="w-6 h-6 text-white">{ICONS.RECEIPT}</span>
                </div>
                <CardTitle className="text-2xl font-extrabold">
                  Tổng kết chi phí
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-base font-semibold text-gray-700">Tiền phòng:</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(summary.roomTotal)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-base font-semibold text-gray-700">Dịch vụ ({summary.services.length} mục):</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(summary.servicesTotal)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="text-base font-semibold text-gray-700">Phí phạt ({summary.penalties.length} mục):</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(summary.penaltiesTotal)}</span>
                </div>
                {summary.surcharges && summary.surcharges.length > 0 && (
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-base font-semibold text-gray-700">Phụ thu ({summary.surcharges.length} mục):</span>
                    <span className="text-xl font-bold text-yellow-600">{formatCurrency(summary.surchargesTotal || 0)}</span>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-between items-center p-6 bg-linear-to-r from-primary-100 to-primary-50 rounded-2xl border-2 border-primary-300 shadow-lg">
                <span className="text-2xl font-extrabold text-gray-900">TỔNG THANH TOÁN:</span>
                <span className="text-4xl font-black text-primary-600">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              onClick={handlePrevStep}
              variant="outline"
              className="h-12 px-8 border-2 border-gray-300 font-bold text-base hover:bg-gray-100"
            >
              <span className="w-5 h-5 mr-2">{ICONS.CHEVRON_LEFT}</span>
              Bước trước
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 px-8 border-2 border-gray-300 font-bold text-base hover:bg-gray-100"
                onClick={() => window.print()}
              >
                <span className="w-5 h-5 mr-2">{ICONS.PRINTER}</span>
                In Bill
              </Button>
              <Button
                onClick={onCompleteCheckout}
                className="h-12 px-10 bg-linear-to-r from-success-600 to-success-500 hover:from-success-500 hover:to-success-600 text-white font-extrabold text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <span className="w-5 h-5 mr-2">{ICONS.CHECK_CIRCLE}</span>
                Tiếp tục: Thanh toán
                <span className="w-5 h-5 ml-2">{ICONS.CHEVRON_RIGHT}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Stay Modal */}
      <ExtendStayModal
        open={extendStayModalOpen}
        onOpenChange={setExtendStayModalOpen}
        onConfirm={(additionalNights, newCheckOutDate) => {
          logger.log("Extend stay:", { additionalNights, newCheckOutDate });
          // BACKEND INTEGRATION: Call PUT /api/bookings/{bookingId}/extend
          // with { additionalNights, newCheckOutDate } and recalculate room charges
        }}
        roomNumber={summary.receipt.roomName}
        currentCheckOutDate={summary.receipt.checkOutDate}
        nightlyRate={summary.receipt.pricePerNight}
      />
    </div>
  );
}

