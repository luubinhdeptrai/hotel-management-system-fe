import { Employee } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";
import { Button } from "@/components/ui/button";

interface StaffStatisticsProps {
  employees: Employee[];
  onAddEmployee?: () => void;
}

export function StaffStatistics({ employees, onAddEmployee }: StaffStatisticsProps) {
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "Đang làm việc").length,
    hasAccount: employees.filter((e) => e.hasAccount).length,
    noAccount: employees.filter(
      (e) => !e.hasAccount && e.status === "Đang làm việc"
    ).length,
  };

  return (
    <div className="bg-linear-to-br from-info-600 via-info-500 to-info-600 rounded-2xl shadow-xl p-6 text-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
              <span className="w-6 h-6">{ICONS.USERS}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Quản lý Nhân Viên</h2>
              <p className="text-white/90 text-sm mt-0.5">
                Quản lý thông tin nhân viên và phân quyền hệ thống
              </p>
            </div>
          </div>
          {onAddEmployee && (
            <Button
              onClick={onAddEmployee}
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 h-11 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all backdrop-blur-sm"
            >
              <span className="w-5 h-5 mr-2">{ICONS.PLUS}</span>
              Thêm nhân viên
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="w-5 h-5">{ICONS.USERS}</span>
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs font-medium mb-0.5">
                Tổng nhân viên
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/30 rounded-lg flex items-center justify-center">
              <span className="w-5 h-5">{ICONS.USER_CHECK}</span>
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs font-medium mb-0.5">
                Đang làm việc
              </p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>

        {/* Has Account */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="w-5 h-5">{ICONS.USER_COG}</span>
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs font-medium mb-0.5">
                Có tài khoản
              </p>
              <p className="text-2xl font-bold">{stats.hasAccount}</p>
            </div>
          </div>
        </div>

        {/* No Account */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-500/30 rounded-lg flex items-center justify-center">
              <span className="w-5 h-5">{ICONS.ALERT}</span>
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs font-medium mb-0.5">
                Chưa có tài khoản
              </p>
              <p className="text-2xl font-bold">{stats.noAccount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
