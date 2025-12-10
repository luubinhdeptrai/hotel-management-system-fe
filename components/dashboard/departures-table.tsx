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

export interface Departure {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkOutTime: Date;
  totalAmount: number;
}

interface DeparturesTableProps {
  departures: Departure[];
}

export function DeparturesTable({ departures }: DeparturesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Khách Trả Phòng Hôm Nay
        </CardTitle>
      </CardHeader>
      <CardContent>
        {departures.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Không có lượt check-out nào hôm nay</p>
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
                    Giờ Trả
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Tổng Tiền
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departures.map((departure) => (
                  <TableRow
                    key={departure.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {departure.guestName}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {departure.roomNumber}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {departure.roomType}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {format(departure.checkOutTime, "HH:mm", { locale: vi })}
                    </TableCell>
                    <TableCell className="text-gray-700 text-right font-medium">
                      {formatCurrency(departure.totalAmount)}
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
