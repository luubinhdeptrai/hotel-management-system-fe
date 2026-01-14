import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CustomerSelectionCard,
  CustomerSelectionData,
} from "../reservations/booking-modal/customer-selection-card";
import { ICONS } from "@/src/constants/icons.enum";

interface CustomerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerSelected: (data: CustomerSelectionData) => void;
  title?: string;
}

export function CustomerSelectionDialog({
  open,
  onOpenChange,
  onCustomerSelected,
  title = "Chọn Khách Hàng",
}: CustomerSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gray-50 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4 bg-white border-b shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary-600">
            {ICONS.USER_PLUS} {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <CustomerSelectionCard
            mode="create"
            onCustomerSelected={onCustomerSelected}
          />
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
