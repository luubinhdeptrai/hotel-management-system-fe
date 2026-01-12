"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ICONS } from "@/src/constants/icons.enum";
import { appSettingsService } from "@/lib/services";
import { ReservationFormData, Reservation } from "@/lib/types/reservation";
import { Customer as ApiCustomer } from "@/lib/types/api";
import { RoomType } from "@/lib/types/room";
import { RoomSelector, type SelectedRoom } from "./room-selector";
import { SelectedRoomsList } from "./selected-rooms-list";
import { BookingSummary } from "./booking-summary";
import { CustomerSelectionCard, type CustomerSelectionData } from "./customer-selection-card";
import { logger } from "@/lib/utils/logger";

interface NewReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReservationFormData) => Promise<void>;
  reservation?: Reservation;
  mode: "create" | "edit" | "view";
}

const FORM_STEPS = {
  customer: "customer",
  rooms: "rooms",
  summary: "summary",
} as const;

type FormStep = typeof FORM_STEPS[keyof typeof FORM_STEPS];

export function NewReservationFormModal({
  isOpen,
  onClose,
  onSave,
  reservation,
  mode,
}: NewReservationFormModalProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(FORM_STEPS.customer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [depositPercentage, setDepositPercentage] = useState(30);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  // Form states
  const [customerData, setCustomerData] = useState<CustomerSelectionData | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [totalGuests, setTotalGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState("CASH");

  // Load room types when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadRoomTypes = async () => {
      setLoadingRoomTypes(true);
      try {
        // TODO: Fetch room types from API
        // For now, set empty array
        setRoomTypes([]);
      } catch (err) {
        logger.error("Failed to load room types:", err);
      } finally {
        setLoadingRoomTypes(false);
      }
    };

    loadRoomTypes();
  }, [isOpen]);

  // Load initial data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if ((mode === "edit" || mode === "view") && reservation) {
      // Load existing reservation data (for both edit and view modes)
      const customer = reservation.customer;
      setCustomerData({
        useExisting: true,
        customerId: reservation.customerID,
        customerName: customer?.customerName || "",
        phoneNumber: customer?.phoneNumber || "",
        email: customer?.email || "",
        identityCard: customer?.identityCard || "",
        address: customer?.address || "",
      });

      setCheckInDate(reservation.details[0]?.checkInDate || "");
      setCheckOutDate(reservation.details[0]?.checkOutDate || "");
      const totalGuests = reservation.details.reduce(
        (sum, detail) => sum + (detail.numberOfGuests || 0),
        0
      );
      setTotalGuests(totalGuests || 1);
      setNotes(reservation.notes || "");

      // Convert existing booking rooms to SelectedRoom format
      const convertedRooms: SelectedRoom[] = reservation.details.map((detail) => ({
        roomID: `mock-${detail.detailID}`, // Mock room ID for display
        roomName: detail.roomName,
        roomTypeID: detail.roomTypeID || "",
        roomType: {
          roomTypeID: detail.roomTypeID || "",
          roomTypeName: detail.roomTypeName || "",
          price: detail.pricePerNight || 0,
          capacity: 1,
        },
        roomStatus: "AVAILABLE" as any,
        floor: 0,
        selectedAt: new Date().toISOString(),
        checkInDate: detail.checkInDate,
        checkOutDate: detail.checkOutDate,
        numberOfGuests: detail.numberOfGuests || 1,
        pricePerNight: detail.pricePerNight || 0,
      }));
      setSelectedRooms(convertedRooms);
    } else {
      // Reset for create mode
      setCustomerData(null);
      setSelectedRooms([]);
      setCheckInDate("");
      setCheckOutDate("");
      setTotalGuests(1);
      setNotes("");
      setDepositConfirmed(false);
    }

    setApiError(null);
    setCurrentStep(FORM_STEPS.customer);
  }, [isOpen, mode, reservation]);

  // Load deposit percentage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const percentage = await appSettingsService.getDepositPercentage();
        setDepositPercentage(percentage);
      } catch {
        logger.warn("Failed to load deposit percentage, using default 30%");
        setDepositPercentage(30);
      }
    };

    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const handleNextStep = () => {
    // Validate current step before moving to next
    if (currentStep === FORM_STEPS.customer) {
      if (!customerData) {
        toast.error("Vui lòng chọn/thêm khách hàng");
        return;
      }
      setCurrentStep(FORM_STEPS.rooms);
    } else if (currentStep === FORM_STEPS.rooms) {
      if (!checkInDate || !checkOutDate) {
        toast.error("Vui lòng chọn ngày đến và đi");
        return;
      }
      if (selectedRooms.length === 0) {
        toast.error("Vui lòng chọn ít nhất một phòng");
        return;
      }
      setCurrentStep(FORM_STEPS.summary);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === FORM_STEPS.rooms) {
      setCurrentStep(FORM_STEPS.customer);
    } else if (currentStep === FORM_STEPS.summary) {
      setCurrentStep(FORM_STEPS.rooms);
    }
  };

  const handleSubmit = async () => {
    if (!customerData) {
      toast.error("Thông tin khách hàng chưa được chọn");
      return;
    }

    if (selectedRooms.length === 0) {
      toast.error("Vui lòng chọn ít nhất một phòng");
      return;
    }

    setApiError(null);
    setIsSubmitting(true);

    try {
      // Transform SelectedRoom[] to RoomTypeSelection[] format for API
      const roomSelections = selectedRooms.map((room) => ({
        roomTypeID: room.roomTypeID,
        roomTypeName: room.roomType?.roomTypeName || "",
        quantity: 1,
        numberOfGuests: room.numberOfGuests,
        pricePerNight: room.pricePerNight,
        checkInDate: room.checkInDate,
        checkOutDate: room.checkOutDate,
        roomID: room.roomID, // Include actual room ID for backend
      }));

      const submitData: ReservationFormData = {
        customerName: customerData.customerName,
        phoneNumber: customerData.phoneNumber,
        email: customerData.email,
        identityCard: customerData.identityCard,
        address: customerData.address,
        checkInDate,
        checkOutDate,
        roomSelections,
        depositAmount: 0,
        notes,
        depositConfirmed,
        depositPaymentMethod: depositPaymentMethod as any,
        customerSelection: {
          useExisting: customerData.useExisting,
          customerId: customerData.customerId,
        },
      };

      await onSave(submitData);
      toast.success(
        mode === "create" ? "Tạo đặt phòng thành công" : "Cập nhật thành công"
      );
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      setApiError(message);
      toast.error("Lỗi", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = customerData && selectedRooms.length > 0 && checkInDate && checkOutDate;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 rounded-t-2xl -mx-6 -mt-6 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-bold text-white">
                {mode === "create" 
                  ? "🏨 Tạo Đặt Phòng Mới" 
                  : mode === "view"
                  ? "👁️ Xem Chi Tiết Đặt Phòng"
                  : "✏️ Chỉnh Sửa Đặt Phòng"}
              </DialogTitle>
              <p className="text-blue-100 mt-2 text-sm">
                {mode === "view" 
                  ? "Xem chi tiết đặt phòng (không thể chỉnh sửa)"
                  : currentStep === FORM_STEPS.customer
                  ? "Bước 1 / 3: Chọn khách hàng"
                  : currentStep === FORM_STEPS.rooms
                  ? "Bước 2 / 3: Chọn phòng"
                  : "Bước 3 / 3: Xác nhận đặt phòng"}
              </p>
            </div>
            
            {/* Step Indicator - hide in view mode */}
            {mode !== "view" && (
              <div className="flex gap-3 items-center">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
                      step === 1 && currentStep === FORM_STEPS.customer
                        ? "bg-white text-blue-600 scale-110"
                        : step === 2 && currentStep === FORM_STEPS.rooms
                        ? "bg-white text-blue-600 scale-110"
                        : step === 3 && currentStep === FORM_STEPS.summary
                        ? "bg-white text-blue-600 scale-110"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive" className="mx-6 mt-4 border-l-4 border-red-500 bg-red-50">
            <AlertDescription className="text-red-800 font-medium">⚠️ {apiError}</AlertDescription>
          </Alert>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* VIEW MODE: Show summary only */}
          {mode === "view" && reservation && (
            <div className="space-y-6 animate-fadeIn">
              {/* Info Alert */}
              <Alert className="bg-blue-50 border-blue-200 border-2">
                <AlertDescription className="text-blue-700 font-medium">
                  ℹ️ Đặt phòng ở trạng thái &quot;{reservation?.status}&quot; không thể chỉnh sửa. Bạn chỉ có thể xem thông tin chi tiết.
                </AlertDescription>
              </Alert>

              {/* Summary view - render regardless of customerData state since it's loaded from useEffect */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <BookingSummary
                  rooms={selectedRooms.length > 0 ? selectedRooms : reservation.details.map((detail) => ({
                    roomID: `view-${detail.detailID}`,
                    roomName: detail.roomName,
                    roomTypeID: detail.roomTypeID || "",
                    roomType: {
                      roomTypeID: detail.roomTypeID || "",
                      roomTypeName: detail.roomTypeName || "",
                      price: detail.pricePerNight || 0,
                      capacity: 1,
                    },
                    roomStatus: "AVAILABLE" as any,
                    floor: 0,
                    selectedAt: new Date().toISOString(),
                    checkInDate: detail.checkInDate,
                    checkOutDate: detail.checkOutDate,
                    numberOfGuests: detail.numberOfGuests || 1,
                    pricePerNight: detail.pricePerNight || 0,
                  }))}
                  customerName={customerData?.customerName || reservation.customer?.customerName || ""}
                  checkInDate={checkInDate || reservation.details[0]?.checkInDate || ""}
                  checkOutDate={checkOutDate || reservation.details[0]?.checkOutDate || ""}
                  totalGuests={totalGuests || reservation.totalRooms || 1}
                  depositPercentage={depositPercentage}
                />
              </div>
            </div>
          )}

          {/* EDIT/CREATE MODE: Step-by-step form */}
          {mode !== "view" && (
            <>
              {/* Step 1: Customer Selection */}
              {currentStep === FORM_STEPS.customer && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100">
                <CustomerSelectionCard
                mode={mode}
                onCustomerSelected={setCustomerData}
                initialCustomerId={customerData?.customerId}
                initialData={customerData ? {
                  id: customerData.customerId || "",
                  fullName: customerData.customerName,
                  phone: customerData.phoneNumber,
                  email: customerData.email,
                  idNumber: customerData.identityCard,
                  address: customerData.address,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } : undefined}
              />
              </div>
            </div>
              )}

              {/* Step 2: Room Selection */}
          {currentStep === FORM_STEPS.rooms && (
            <div className="space-y-6 animate-fadeIn">
              {/* Date Inputs */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📅 Chọn Ngày Nhận và Trả Phòng
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Ngày nhận phòng</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Ngày trả phòng</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Room Selector */}
              {checkInDate && checkOutDate && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    🛏️ Chọn Phòng
                  </h3>
                  <RoomSelector
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  roomTypes={roomTypes}
                  selectedRooms={selectedRooms}
                  onRoomsSelected={setSelectedRooms}
                />
                </div>
              )}

              {/* Selected Rooms */}
              {selectedRooms.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    ✅ Phòng Đã Chọn ({selectedRooms.length})
                  </h3>
                  <SelectedRoomsList rooms={selectedRooms} onRemoveRoom={(id) => {
                    setSelectedRooms(selectedRooms.filter(r => r.roomID !== id));
                  }} />
                </div>
              )}

              {/* Total Guests & Notes */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">👥 Tổng số khách</label>
                  <input
                    type="number"
                    min="1"
                    value={totalGuests}
                    onChange={(e) => setTotalGuests(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white font-medium text-lg"
                  />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">📝 Ghi chú (tùy chọn)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Yêu cầu đặc biệt, các ghi chú quan trọng..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === FORM_STEPS.summary && customerData && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <BookingSummary
                  rooms={selectedRooms}
                  customerName={customerData.customerName}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  totalGuests={totalGuests}
                  depositPercentage={depositPercentage}
                />
              </div>

              {/* Deposit Confirmation */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  💳 Xác Nhận Thanh Toán Cọc
                </h3>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={depositConfirmed}
                    onChange={(e) => setDepositConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 accent-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    ✓ Tôi xác nhận sẽ thanh toán cọc khi tạo đặt phòng này
                  </span>
                </label>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6 flex justify-between items-center rounded-b-2xl gap-4">
          {mode === "view" ? (
            // View mode: Only close button
            <Button
              onClick={onClose}
              className="ml-auto px-8 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-medium transition-all hover:shadow-lg"
            >
              ✅ Đóng
            </Button>
          ) : (
            // Edit/Create mode: Navigation buttons
            <>
              <Button
                onClick={() => {
                  if (currentStep === FORM_STEPS.customer) {
                    onClose();
                  } else {
                    handlePreviousStep();
                  }
                }}
                variant="outline"
                className="px-8 py-2 rounded-lg border-2 hover:bg-gray-100 transition-colors font-medium"
              >
                {currentStep === FORM_STEPS.customer ? "❌ Đóng" : "⬅️ Quay lại"}
              </Button>

              <div className="flex gap-3">
                {currentStep !== FORM_STEPS.summary && (
                  <Button
                    onClick={handleNextStep}
                    disabled={
                      currentStep === FORM_STEPS.customer ? !customerData : selectedRooms.length === 0
                    }
                    className="px-8 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    Tiếp Theo ➜
                  </Button>
                )}

                {currentStep === FORM_STEPS.summary && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !customerData || selectedRooms.length === 0}
                    className="px-8 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block animate-spin">⏳</span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>✅ Xác Nhận Đặt Phòng</>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

