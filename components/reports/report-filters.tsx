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
import { PermissionGuard } from "@/components/permission-guard";

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
    <div className="space-y-4 rounded-2xl border-2 border-gray-100 bg-white shadow-lg p-6">
      {/* Filters Row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
        {/* Report Type */}
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="report-type" className="text-sm font-semibold text-gray-700">
            Loại báo cáo
          </Label>
          <Select value={reportType} onValueChange={onReportTypeChange}>
            <SelectTrigger 
              id="report-type"
              className="h-11 border-2 border-gray-200 rounded-lg font-medium focus:ring-primary-500"
            >
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

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-sm font-semibold text-gray-700">
            Từ ngày
          </Label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-11 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm font-semibold text-gray-700">
            Đến ngày
          </Label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-11 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Generate Report Button */}
        <div className="flex items-end">
          <Button
            onClick={onGenerateReport}
            className="h-11 w-full bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2"
          >
            <span className="w-5 h-5">{ICONS.BAR_CHART}</span>
            <span>Xem</span>
          </Button>
        </div>
      </div>

      {/* Export Buttons Row */}
      <div className="flex flex-wrap gap-3 border-t-2 border-gray-100 pt-4">
        <PermissionGuard permission="report:export">
          <Button
            onClick={onExportPdf}
            className="h-11 px-6 bg-linear-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white font-bold shadow-md hover:shadow-lg transition-all rounded-lg flex items-center gap-2"
          >
            <span className="w-5 h-5">{ICONS.DOWNLOAD}</span>
            <span>Xuất PDF</span>
          </Button>
        </PermissionGuard>
        <PermissionGuard permission="report:export">
          <Button
            onClick={onExportExcel}
            className="h-11 px-6 bg-linear-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold shadow-md hover:shadow-lg transition-all rounded-lg flex items-center gap-2"
          >
            <span className="w-5 h-5">{ICONS.DOWNLOAD}</span>
            <span>Xuất Excel</span>
          </Button>
        </PermissionGuard>
      </div>
    </div>
  );
}
