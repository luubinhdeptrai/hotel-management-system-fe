"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OccupancyRateData } from "@/lib/types/reports";

interface OccupancyRateTableProps {
  data: OccupancyRateData[];
}

export function OccupancyRateTable({ data }: OccupancyRateTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Ngày</TableHead>
              <TableHead className="text-right">Tổng phòng</TableHead>
              <TableHead className="text-right">Phòng đang thuê</TableHead>
              <TableHead className="text-right">Phòng trống</TableHead>
              <TableHead className="text-right">Công suất (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {new Date(item.date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.totalRooms}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.occupiedRooms}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.availableRooms}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        item.occupancyRate >= 80
                          ? "text-success-600"
                          : item.occupancyRate >= 50
                          ? "text-warning-600"
                          : "text-error-600"
                      }`}
                    >
                      {item.occupancyRate.toFixed(1)}%
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
