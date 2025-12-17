import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerFilters } from "@/lib/types/customer";
import { ICONS } from "@/src/constants/icons.enum";

interface CustomerFiltersProps extends CustomerFilters {
  onSearchChange: (value: string) => void;
  onTypeChange: (value: CustomerFilters["typeFilter"]) => void;
  onVipChange: (value: CustomerFilters["vipFilter"]) => void;
  onAddCustomer: () => void;
}

export function CustomerFilters({
  searchQuery,
  typeFilter,
  vipFilter,
  onSearchChange,
  onTypeChange,
  onVipChange,
  onAddCustomer,
}: CustomerFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5">
          {ICONS.SEARCH}
        </span>
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo tên, số điện thoại, email, CCCD..."
          className="pl-12 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors w-full"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-semibold">Lọc:</span>
          
          {/* Customer Type Filter */}
          <button
            onClick={() => onTypeChange("Tất cả")}
            className={`min-w-max px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              typeFilter === "Tất cả"
                ? "bg-gray-800 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => onTypeChange("Cá nhân")}
            className={`min-w-max px-5 py-2.5 rounded-full text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 ${
              typeFilter === "Cá nhân"
                ? "bg-primary-600 text-white shadow-md"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center">{ICONS.USER}</span>
            <span>Cá nhân</span>
          </button>
          <button
            onClick={() => onTypeChange("Doanh nghiệp")}
            className={`min-w-max px-5 py-2.5 rounded-full text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 ${
              typeFilter === "Doanh nghiệp"
                ? "bg-info-600 text-white shadow-md"
                : "bg-info-50 text-info-700 hover:bg-info-100"
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center">{ICONS.CLIPBOARD_LIST}</span>
            <span>Doanh nghiệp</span>
          </button>

          {/* VIP Filter */}
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <button
            onClick={() => onVipChange(vipFilter === "VIP" ? "Tất cả" : "VIP")}
            className={`min-w-max px-5 py-2.5 rounded-full text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 ${
              vipFilter === "VIP"
                ? "bg-linear-to-r from-warning-600 to-warning-500 text-white shadow-md"
                : "bg-warning-50 text-warning-700 hover:bg-warning-100"
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center">{ICONS.USER_CHECK}</span>
            <span>VIP</span>
          </button>
        </div>

        <Button
          onClick={onAddCustomer}
          className="h-11 px-6 font-semibold bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg"
        >
          <span className="w-5 h-5 mr-2">{ICONS.PLUS}</span>
          Thêm Khách hàng
        </Button>
      </div>
    </div>
  );
}
