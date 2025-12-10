import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

interface ServicesSectionHeaderProps {
  onAddService: () => void;
}

export function ServicesSectionHeader({
  onAddService,
}: ServicesSectionHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Danh sách Dịch vụ
        </h2>
        <p className="text-sm text-gray-500">
          Quản lý các dịch vụ khách sạn cung cấp
        </p>
      </div>
      <Button
        onClick={onAddService}
        className="bg-primary-600 hover:bg-primary-500"
      >
        {ICONS.PLUS}
        <span className="ml-2">Thêm dịch vụ</span>
      </Button>
    </div>
  );
}
