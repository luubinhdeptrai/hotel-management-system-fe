import { Employee } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";

interface StaffStatisticsProps {
  employees: Employee[];
}

export function StaffStatistics({ employees }: StaffStatisticsProps) {
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "Đang làm việc").length,
    hasAccount: employees.filter((e) => e.hasAccount).length,
    noAccount: employees.filter(
      (e) => !e.hasAccount && e.status === "Đang làm việc"
    ).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng nhân viên</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
            {ICONS.USERS}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Đang làm việc</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.active}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center text-success-600">
            {ICONS.USER_CHECK}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Có tài khoản</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.hasAccount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-info-100 flex items-center justify-center text-info-600">
            {ICONS.USER_COG}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Chưa có tài khoản</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.noAccount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center text-warning-600">
            {ICONS.ALERT}
          </div>
        </div>
      </div>
    </div>
  );
}
