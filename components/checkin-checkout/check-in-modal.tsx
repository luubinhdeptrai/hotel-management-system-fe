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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONS } from "@/src/constants/icons.enum";
import type { Reservation } from "@/lib/types/reservation";
import type { CheckInFormData } from "@/lib/types/checkin-checkout";
import { mockRooms } from "@/lib/mock-rooms";
import type { Room } from "@/lib/types/room";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  onConfirm: (data: CheckInFormData) => void;
}

interface RoomAssignment {
  detailID: string;
  roomID: string;
  numberOfGuests: number;
}

export function CheckInModal({
  open,
  onOpenChange,
  reservation,
  onConfirm,
}: CheckInModalProps) {
  // State for multiple room assignments
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([]);
  const [notes, setNotes] = useState("");

  // Get available rooms for a specific detail (grouped by room type)
  const getAvailableRoomsForDetail = (
    detail: Reservation["details"][0]
  ): Room[] => {
    if (!reservation) return [];

    // Get already selected room IDs (excluding current detail)
    const selectedRoomIDs = roomAssignments
      .filter((a) => a.detailID !== detail.detailID)
      .map((a) => a.roomID);

    return mockRooms.filter((room) => {
      // Condition 1: Is this the currently assigned room in reservation?
      const isOriginalRoom = room.roomID === detail.roomID;

      // Condition 2: Matches Room Type?
      const matchesType =
        room.roomTypeID === detail.roomTypeID ||
        (detail.roomTypeName &&
          room.roomType?.roomTypeName === detail.roomTypeName);

      // Condition 3: Is Ready or is already assigned to this detail?
      const isReady = room.roomStatus === "Sẵn sàng";
      const isCurrentlyAssigned = roomAssignments.find(
        (a) => a.detailID === detail.detailID && a.roomID === room.roomID
      );

      // Condition 4: Not selected for another room
      const notSelectedElsewhere = !selectedRoomIDs.includes(room.roomID);

      // Logic: Include if matches type AND (is ready OR is original OR is currently assigned) AND not selected elsewhere
      if (isOriginalRoom) return true;
      if (isCurrentlyAssigned) return true;
      return matchesType && isReady && notSelectedElsewhere;
    });
  };

  // Initialize room assignments when reservation changes or modal opens
  // This useEffect is intentional - we need to reset form state based on props
  useEffect(() => {
    if (reservation && open) {
      const initialAssignments: RoomAssignment[] = reservation.details.map(
        (detail) => ({
          detailID: detail.detailID,
          roomID: detail.roomID,
          numberOfGuests: detail.numberOfGuests,
        })
      );
      setRoomAssignments(initialAssignments);
      setNotes("");
    } else if (!open) {
      // Reset state when modal closes
      setRoomAssignments([]);
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation?.reservationID, open]);

  // Update room assignment
  const updateRoomAssignment = (
    detailID: string,
    field: keyof RoomAssignment,
    value: string | number
  ) => {
    setRoomAssignments((prev) =>
      prev.map((assignment) =>
        assignment.detailID === detailID
          ? { ...assignment, [field]: value }
          : assignment
      )
    );
  };

  const handleConfirm = () => {
    if (!reservation || roomAssignments.length === 0) return;

    // Validate all rooms are selected
    const allRoomsSelected = roomAssignments.every((a) => a.roomID);
    if (!allRoomsSelected) {
      alert("Vui lòng chọn phòng cho tất cả các đặt phòng!");
      return;
    }

    // Check-in each room (in production, you might want to batch this into one API call)
    roomAssignments.forEach((assignment) => {
      const formData: CheckInFormData = {
        reservationID: reservation.reservationID,
        roomID: assignment.roomID,
        numberOfGuests: assignment.numberOfGuests,
        notes: notes.trim() || undefined,
      };
      onConfirm(formData);
    });

    onOpenChange(false);
  };

  if (!reservation) return null;

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

  // Group details by room type to show count and total
  const groupedDetails = reservation.details.reduce((acc, detail) => {
    const key = `${detail.roomTypeID}_${detail.checkInDate}_${detail.checkOutDate}_${detail.pricePerNight}`;
    if (!acc[key]) {
      acc[key] = {
        ...detail,
        count: 0,
      };
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, (typeof reservation.details)[0] & { count: number }>);

  const uniqueDetails = Object.values(groupedDetails);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        {/* ... Header ... */}
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Xác nhận Check-in
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Vui lòng xác nhận thông tin trước khi check-in cho khách
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Customer Info */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Họ tên:</span>
                <p className="font-medium text-gray-900">
                  {reservation.customer.customerName}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Số điện thoại:</span>
                <p className="font-medium text-gray-900">
                  {reservation.customer.phoneNumber}
                </p>
              </div>
              <div>
                <span className="text-gray-500">CMND:</span>
                <p className="font-medium text-gray-900">
                  {reservation.customer.identityCard}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium text-gray-900">
                  {reservation.customer.email || "Không có"}
                </p>
              </div>
            </div>
          </div>

          {/* Reservation Info (Deduplicated) */}
          <div className="rounded-lg border border-gray-300 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              Thông tin đặt phòng
            </h3>
            <div className="space-y-2 text-sm">
              {uniqueDetails.map((detail) => (
                <div
                  key={detail.detailID}
                  className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {detail.roomTypeName}
                      {detail.count > 1 && (
                        <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          x{detail.count} phòng
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(detail.checkInDate)} -{" "}
                      {formatDate(detail.checkOutDate)}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(detail.pricePerNight)}/đêm
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Room Selector - One selector per reserved room */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">
              Chọn phòng cho từng đặt phòng
              <span className="text-xs text-gray-500 ml-2 font-normal">
                (Chỉ hiện phòng Sẵn sàng cùng loại)
              </span>
            </h3>
            {reservation.details.map((detail, index) => {
              const assignment = roomAssignments.find(
                (a) => a.detailID === detail.detailID
              );
              const availableRooms = getAvailableRoomsForDetail(detail);

              return (
                <div
                  key={detail.detailID}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Phòng #{index + 1}: {detail.roomTypeName}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatDate(detail.checkInDate)} -{" "}
                      {formatDate(detail.checkOutDate)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`room-${detail.detailID}`}
                      className="text-sm font-medium"
                    >
                      Chọn phòng <span className="text-error-600">*</span>
                    </Label>
                    <Select
                      value={assignment?.roomID || ""}
                      onValueChange={(value) =>
                        updateRoomAssignment(detail.detailID, "roomID", value)
                      }
                    >
                      <SelectTrigger className="h-10 border-gray-300 bg-white">
                        <SelectValue placeholder="Chọn phòng..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms.length === 0 ? (
                          <SelectItem value="no-rooms" disabled>
                            Không có phòng sẵn sàng
                          </SelectItem>
                        ) : (
                          availableRooms.map((room) => (
                            <SelectItem key={room.roomID} value={room.roomID}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {room.roomName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Tầng {room.floor}
                                </span>
                                <span className="text-xs text-success-600">
                                  {room.roomStatus === "Sẵn sàng" ? "🟢" : "🔵"}{" "}
                                  {room.roomStatus}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {availableRooms.length === 0 && (
                      <p className="text-xs text-warning-600">
                        ⚠️ Không có phòng sẵn sàng. Vui lòng chuẩn bị phòng
                        trước.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`guests-${detail.detailID}`}
                      className="text-sm font-medium"
                    >
                      Số người ở thực tế{" "}
                      <span className="text-error-600">*</span>
                    </Label>
                    <Input
                      id={`guests-${detail.detailID}`}
                      type="number"
                      min="1"
                      value={assignment?.numberOfGuests || 1}
                      onChange={(e) =>
                        updateRoomAssignment(
                          detail.detailID,
                          "numberOfGuests",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="h-10 border-gray-300 focus:ring-primary-500 bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Ghi chú
            </Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú (nếu có)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border-gray-300 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-primary-50 p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">
                Tổng tiền đặt cọc:
              </span>
              <span className="text-lg font-bold text-primary-600">
                {formatCurrency(reservation.depositAmount)}
              </span>
            </div>
          </div>
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
            className="h-10 bg-primary-600 hover:bg-primary-500 text-white"
          >
            {ICONS.CHECK}
            <span className="ml-2">Xác nhận Check-in</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
