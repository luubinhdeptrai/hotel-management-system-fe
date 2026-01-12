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
  name: string;
  email?: string;
  phone?: string;
  roomNumbers: string;
  checkOutTime: string;
}

interface DeparturesTableProps {
  departures: Departure[];
}

export function DeparturesTable({ departures }: DeparturesTableProps) {
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
                    Điện Thoại
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Phòng
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Giờ Trả
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
                      {departure.name}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {departure.phone || 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {departure.roomNumbers}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {departure.checkOutTime ? format(new Date(departure.checkOutTime), "HH:mm", { locale: vi }) : 'N/A'}
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
