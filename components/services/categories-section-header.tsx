import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

interface CategoriesSectionHeaderProps {
  onAddCategory: () => void;
}

export function CategoriesSectionHeader({
  onAddCategory,
}: CategoriesSectionHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Danh sách Loại Dịch vụ
        </h2>
        <p className="text-sm text-gray-500">
          Quản lý các loại dịch vụ (Minibar, Giặt ủi, Spa...)
        </p>
      </div>
      <Button
        onClick={onAddCategory}
        className="bg-primary-600 hover:bg-primary-500"
      >
        {ICONS.PLUS}
        <span className="ml-2">Thêm loại dịch vụ</span>
      </Button>
    </div>
  );
}
