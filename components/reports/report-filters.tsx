"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import type { ReportType } from "@/lib/types/reports";

interface ReportFiltersProps {
  reportType: ReportType;
  onReportTypeChange: (type: ReportType) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onGenerateReport: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export function ReportFilters({
  reportType,
  onReportTypeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onGenerateReport,
  onExportPdf,
  onExportExcel,
}: ReportFiltersProps) {
  const reportTypes: { value: ReportType; label: string }[] = [
    { value: "revenue-by-day", label: "Báo cáo doanh thu theo ngày" },
    { value: "revenue-by-month", label: "Báo cáo doanh thu theo tháng" },
    { value: "occupancy-rate", label: "Báo cáo công suất phòng" },
    { value: "room-availability", label: "Báo cáo phòng trống" },
    { value: "customer-list", label: "Báo cáo danh sách khách hàng" },
    { value: "service-revenue", label: "Báo cáo doanh thu dịch vụ" },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="report-type">Loại báo cáo</Label>
          <Select value={reportType} onValueChange={onReportTypeChange}>
            <SelectTrigger id="report-type">
              <SelectValue placeholder="Chọn loại báo cáo" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-date">Từ ngày</Label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">Đến ngày</Label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue-500"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={onGenerateReport}
            className="h-10 w-full bg-primary-blue-600 hover:bg-primary-blue-700"
          >
            <div className="mr-2 h-4 w-4">{ICONS.BAR_CHART}</div>
            Xem Báo Cáo
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
        <Button
          onClick={onExportPdf}
          variant="outline"
          className="h-10 border-gray-300"
        >
          <div className="mr-2 h-4 w-4">{ICONS.DOWNLOAD}</div>
          Xuất PDF
        </Button>
        <Button
          onClick={onExportExcel}
          variant="outline"
          className="h-10 border-gray-300"
        >
          <div className="mr-2 h-4 w-4">{ICONS.DOWNLOAD}</div>
          Xuất Excel
        </Button>
      </div>
    </div>
  );
}
