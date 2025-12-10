import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Reservation } from "@/lib/types/reservation";

interface CancelReservationDialogProps {
  isOpen: boolean;
  reservation: Reservation | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelReservationDialog({
  isOpen,
  reservation,
  onConfirm,
  onCancel,
}: CancelReservationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận hủy đặt phòng</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn hủy đặt phòng{" "}
            <span className="font-semibold">{reservation?.reservationID}</span>{" "}
            cho khách hàng{" "}
            <span className="font-semibold">
              {reservation?.customer.customerName}
            </span>
            ?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Không
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Xác nhận hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
