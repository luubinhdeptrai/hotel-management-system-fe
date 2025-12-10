import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export interface Arrival {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkInTime: Date;
  numberOfGuests: number;
}

interface ArrivalsTableProps {
  arrivals: Arrival[];
}

export function ArrivalsTable({ arrivals }: ArrivalsTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Khách Đến Hôm Nay
        </CardTitle>
      </CardHeader>
      <CardContent>
        {arrivals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Không có lượt check-in nào hôm nay</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">
                    Tên Khách
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Phòng
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Loại Phòng
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Giờ Đến
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Số Khách
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arrivals.map((arrival) => (
                  <TableRow
                    key={arrival.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {arrival.guestName}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {arrival.roomNumber}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {arrival.roomType}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {format(arrival.checkInTime, "HH:mm", { locale: vi })}
                    </TableCell>
                    <TableCell className="text-gray-700 text-right">
                      {arrival.numberOfGuests}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
