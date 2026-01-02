import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICONS } from "@/src/constants/icons.enum";

interface StaffFiltersProps {
  searchQuery: string;
  statusFilter: string;
  accountFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

export function StaffFilters({
  searchQuery,
  statusFilter,
  accountFilter,
  onSearchChange,
  onStatusChange,
  onAccountChange,
  onClearFilters,
  hasFilters,
}: StaffFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5">
          {ICONS.SEARCH}
        </span>
        <Input
          placeholder="Tìm theo tên, mã NV, email, số điện thoại..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-11 border-gray-200 focus:ring-info-500"
        />
      </div>

      {/* Pill-style Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Status Filters */}
        <div className="flex items-center gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Trạng thái:</span>
            <button
              onClick={() => onStatusChange("all")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all min-w-max flex items-center justify-center gap-2 ${
                statusFilter === "all"
                  ? "bg-linear-to-r from-info-500 to-info-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.USERS}</span>
              <span>Tất cả</span>
            </button>
            <button
              onClick={() => onStatusChange("Đang làm việc")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all min-w-max flex items-center justify-center gap-2 ${
                statusFilter === "Đang làm việc"
                  ? "bg-linear-to-r from-success-500 to-success-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.USER_CHECK}</span>
              <span>Đang làm việc</span>
            </button>
            <button
              onClick={() => onStatusChange("Tạm nghỉ")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all min-w-max flex items-center justify-center gap-2 ${
                statusFilter === "Tạm nghỉ"
                  ? "bg-linear-to-r from-warning-500 to-warning-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.PAUSE}</span>
              <span>Tạm nghỉ</span>
            </button>
          </div>
        </div>

        {/* Right side - Account Filters + Clear Button */}
        <div className="flex items-center gap-3">
          {/* Account Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Tài khoản:</span>
            <button
              onClick={() => onAccountChange("all")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all min-w-max flex items-center justify-center gap-2 ${
                accountFilter === "all"
                  ? "bg-linear-to-r from-info-500 to-info-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.USERS}</span>
              <span>Tất cả</span>
            </button>
            <button
              onClick={() => onAccountChange("has-account")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all min-w-max flex items-center justify-center gap-2 ${
                accountFilter === "has-account"
                  ? "bg-linear-to-r from-success-500 to-success-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.USER_COG}</span>
              <span>Có tài khoản</span>
            </button>
            <button
              onClick={() => onAccountChange("no-account")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all min-w-max flex items-center justify-center gap-2 ${
                accountFilter === "no-account"
                  ? "bg-linear-to-r from-error-500 to-error-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">{ICONS.ALERT_CIRCLE}</span>
              <span>Chưa có tài khoản</span>
            </button>
          </div>

          {/* Clear Filter Button */}
          {hasFilters && (
            <Button
              onClick={onClearFilters}
              className="h-11 px-5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-linear-to-r hover:from-error-500 hover:to-error-600 hover:text-white hover:border-transparent rounded-xl font-semibold shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="w-4 h-4">{ICONS.X}</span>
              Xóa lọc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
