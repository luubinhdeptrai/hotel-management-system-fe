import { Card } from "@/components/ui/card";
import { Clock, LogOut, ArrowRight } from "lucide-react";

interface Arrival {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roomNumbers?: string[];
  checkInTime?: string;
  totalGuests?: number;
}

interface Departure {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roomNumbers?: string[];
  checkOutTime?: string;
}

interface TodaysActivitySectionProps {
  arrivals: Arrival[];
  departures: Departure[];
}

export function TodaysActivitySection({
  arrivals,
  departures,
}: TodaysActivitySectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Arrivals Section */}
      <Card className="p-6 shadow-lg hover:shadow-xl transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Khách Đến Hôm Nay</h3>
            <p className="text-sm text-gray-500">{arrivals.length} khách sắp check-in</p>
          </div>
        </div>

        {arrivals.length > 0 ? (
          <div className="space-y-3">
            {arrivals.slice(0, 5).map((arrival) => (
              <div
                key={arrival.id}
                className="flex items-center justify-between p-4 bg-linear-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{arrival.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    {arrival.phone && <span>{arrival.phone}</span>}
                    {arrival.roomNumbers && arrival.roomNumbers.length > 0 && (
                      <span className="bg-green-200 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                        Phòng {arrival.roomNumbers.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                {arrival.checkInTime && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock size={16} />
                    {arrival.checkInTime.split(" ").slice(0, 1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Không có khách đến hôm nay</p>
          </div>
        )}
      </Card>

      {/* Departures Section */}
      <Card className="p-6 shadow-lg hover:shadow-xl transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <LogOut className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Khách Trả Hôm Nay</h3>
            <p className="text-sm text-gray-500">{departures.length} khách sắp check-out</p>
          </div>
        </div>

        {departures.length > 0 ? (
          <div className="space-y-3">
            {departures.slice(0, 5).map((departure) => (
              <div
                key={departure.id}
                className="flex items-center justify-between p-4 bg-linear-to-br from-orange-50 to-orange-100/50 rounded-lg border border-orange-200 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{departure.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    {departure.phone && <span>{departure.phone}</span>}
                    {departure.roomNumbers && departure.roomNumbers.length > 0 && (
                      <span className="bg-orange-200 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                        Phòng {departure.roomNumbers.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                {departure.checkOutTime && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock size={16} />
                    {departure.checkOutTime.split(" ").slice(0, 1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Không có khách trả hôm nay</p>
          </div>
        )}
      </Card>
    </div>
  );
}
