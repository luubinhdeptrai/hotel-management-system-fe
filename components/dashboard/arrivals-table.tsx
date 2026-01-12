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
  name: string;
  email?: string;
  phone?: string;
  roomNumbers: string;
  checkInTime: string;
  totalGuests: number;
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
                    Điện Thoại
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Phòng
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
                      {arrival.name}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {arrival.phone || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {arrival.roomNumbers}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {arrival.checkInTime ? format(new Date(arrival.checkInTime), "HH:mm", { locale: vi }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-700 text-right">
                      {arrival.totalGuests}
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
