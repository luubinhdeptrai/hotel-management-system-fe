import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICONS } from "@/src/constants/icons.enum";

interface StaffFiltersProps {
  searchQuery: string;
  statusFilter: string;
  accountFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onAddEmployee: () => void;
}

export function StaffFilters({
  searchQuery,
  statusFilter,
  accountFilter,
  onSearchChange,
  onStatusChange,
  onAccountChange,
  onAddEmployee,
}: StaffFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {ICONS.SEARCH}
            </span>
            <Input
              placeholder="Tìm theo tên, mã NV, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="Đang làm việc">Đang làm việc</SelectItem>
            <SelectItem value="Tạm nghỉ">Tạm nghỉ</SelectItem>
            <SelectItem value="Đã nghỉ việc">Đã nghỉ việc</SelectItem>
          </SelectContent>
        </Select>

        {/* Account Filter */}
        <Select value={accountFilter} onValueChange={onAccountChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tài khoản" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="has-account">Có tài khoản</SelectItem>
            <SelectItem value="no-account">Chưa có tài khoản</SelectItem>
          </SelectContent>
        </Select>

        {/* Add Button */}
        <Button
          onClick={onAddEmployee}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <span className="mr-2">{ICONS.PLUS}</span>
          Thêm nhân viên
        </Button>
      </div>
    </div>
  );
}
