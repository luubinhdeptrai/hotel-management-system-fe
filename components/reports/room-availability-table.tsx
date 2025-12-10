"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RoomAvailabilityData } from "@/lib/types/reports";

interface RoomAvailabilityTableProps {
  data: RoomAvailabilityData[];
}

export function RoomAvailabilityTable({ data }: RoomAvailabilityTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Loại phòng</TableHead>
              <TableHead className="text-right">Tổng số</TableHead>
              <TableHead className="text-right">Trống</TableHead>
              <TableHead className="text-right">Đang thuê</TableHead>
              <TableHead className="text-right">Bảo trì</TableHead>
              <TableHead className="text-right">Đang dọn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{item.roomType}</TableCell>
                  <TableCell className="text-right">{item.total}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-success-600">
                      {item.available}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-info-600">
                      {item.occupied}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-error-600">
                      {item.maintenance}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-warning-600">
                      {item.cleaning}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
