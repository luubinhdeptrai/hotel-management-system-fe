import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";

interface CategoriesSectionHeaderProps {
  onAddCategory: () => void;
}

export function CategoriesSectionHeader({
  onAddCategory,
}: CategoriesSectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Danh sách Loại Dịch vụ
        </h2>
        <p className="text-sm text-gray-600 font-medium">
          Quản lý các loại dịch vụ (Minibar, Giặt ủi, Spa...)
        </p>
      </div>
      <Button
        onClick={onAddCategory}
        className="h-12 px-6 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <div className="w-5 h-5 mr-2 flex items-center justify-center">{ICONS.PLUS}</div>
        <span>Thêm loại dịch vụ</span>
      </Button>
    </div>
  );
}

