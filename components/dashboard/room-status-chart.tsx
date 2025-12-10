import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RoomStatusData {
  status: string;
  count: number;
  color: string;
}

interface RoomStatusChartProps {
  data: RoomStatusData[];
}

export function RoomStatusChart({ data }: RoomStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Tình trạng Phòng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart representation */}
          <div className="space-y-3">
            {data.map((item) => {
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">
                      {item.status}
                    </span>
                    <span className="text-gray-600">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full", item.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              {data.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", item.color)} />
                  <span className="text-xs text-gray-600">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">
                Tổng số phòng
              </span>
              <span className="text-lg font-bold text-primary-blue-600">
                {total}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
