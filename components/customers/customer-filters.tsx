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
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {ICONS.SEARCH}
            </span>
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên, số điện thoại, email, CCCD..."
              className="pl-10"
            />
          </div>
        </div>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Loại khách hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tất cả">Tất cả loại khách</SelectItem>
            <SelectItem value="Cá nhân">Khách cá nhân</SelectItem>
            <SelectItem value="Doanh nghiệp">Khách doanh nghiệp</SelectItem>
          </SelectContent>
        </Select>

        <Select value={vipFilter} onValueChange={onVipChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Phân hạng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tất cả">Tất cả hạng</SelectItem>
            <SelectItem value="VIP">Khách VIP</SelectItem>
            <SelectItem value="Thường">Khách thường</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={onAddCustomer}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <span className="mr-2">{ICONS.PLUS}</span>
          Thêm khách hàng
        </Button>
      </div>
    </div>
  );
}
