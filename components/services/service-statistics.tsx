import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceStatisticsProps {
  activeServicesCount: number;
  totalServicesCount: number;
}

export function ServiceStatistics({
  activeServicesCount,
  totalServicesCount,
}: ServiceStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            Tổng số dịch vụ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary-600">
            {totalServicesCount}
          </div>
          <p className="text-xs text-gray-500 mt-1">Tất cả</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            Dịch vụ đang hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary-600">
            {activeServicesCount}
          </div>
          <p className="text-xs text-gray-500 mt-1">Có sẵn</p>
        </CardContent>
      </Card>
    </div>
  );
}
