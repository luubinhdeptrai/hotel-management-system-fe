import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MultiCustomerSelectionCard,
  MultiCustomerSelectionData,
} from "../reservations/booking-modal/multi-customer-selection-card";

interface MultiCustomerSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: MultiCustomerSelectionData) => void;
  initialCustomerIds?: string[];
  title?: string;
}

export function MultiCustomerSelectionDialog({
  open,
  onOpenChange,
  onConfirm,
  initialCustomerIds,
  title = "Chọn Khách Hàng",
}: MultiCustomerSelectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="max-w-4xl h-[800px] p-0 overflow-hidden bg-gray-50/50"
      >
        <div className="h-full flex flex-col">
          <div className="p-1 h-full">
            <MultiCustomerSelectionCard
              onConfirm={onConfirm}
              initialCustomerIds={initialCustomerIds}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
