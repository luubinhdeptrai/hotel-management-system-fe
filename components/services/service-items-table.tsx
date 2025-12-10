"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICONS } from "@/src/constants/icons.enum";
import {
  ServiceItem,
  ServiceCategory,
  SERVICE_GROUP_LABELS,
  ServiceGroup,
} from "@/lib/types/service";

interface ServiceItemsTableProps {
  services: ServiceItem[];
  categories: ServiceCategory[];
  onEdit: (service: ServiceItem) => void;
  onDelete: (id: string) => void;
}

export function ServiceItemsTable({
  services,
  categories,
  onEdit,
  onDelete,
}: ServiceItemsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("Tất cả");

  const handleDeleteClick = (service: ServiceItem) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedService) {
      onDelete(selectedService.serviceID);
    }
    setDeleteDialogOpen(false);
    setSelectedService(null);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceID.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "Tất cả" || service.categoryID === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Lọc theo loại dịch vụ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tất cả">Tất cả loại dịch vụ</SelectItem>
            {categories
              .filter((cat) => cat.isActive)
              .map((category) => (
                <SelectItem
                  key={category.categoryID}
                  value={category.categoryID}
                >
                  {category.categoryName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">
                Mã DV
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Tên dịch vụ
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Loại dịch vụ
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Nhóm
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Giá</TableHead>
              <TableHead className="font-semibold text-gray-900">
                Đơn vị
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                Ngày tạo
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-900">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    {ICONS.INFO}
                    <p className="mt-2">
                      {searchTerm || filterCategory !== "Tất cả"
                        ? "Không tìm thấy dịch vụ nào"
                        : "Chưa có dịch vụ nào"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.serviceID} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {service.serviceID}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {service.serviceName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-primary-50 text-primary-700 border-primary-200"
                    >
                      {service.category.categoryName}
                    </Badge>
                  </TableCell>
                  {/* NEW: Service Group Badge */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        service.serviceGroup === "MINIBAR"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : service.serviceGroup === "LAUNDRY"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : service.serviceGroup === "F&B"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : service.serviceGroup === "PHUTHU"
                          ? "bg-warning-50 text-warning-700 border-warning-200"
                          : "bg-error-50 text-error-700 border-error-200"
                      }
                    >
                      {SERVICE_GROUP_LABELS[service.serviceGroup]}
                    </Badge>
                    {service.isOpenPrice && (
                      <span className="ml-1 text-xs text-warning-600">
                        (Mở)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {service.isOpenPrice ? (
                      <span className="text-warning-600 italic">
                        Nhập khi post
                      </span>
                    ) : (
                      formatCurrency(service.price)
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {service.unit}
                  </TableCell>
                  <TableCell>
                    {service.isActive ? (
                      <Badge className="bg-success-100 text-success-700 hover:bg-success-100">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        Ngừng hoạt động
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {formatDate(service.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(service)}
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                      >
                        {ICONS.EDIT}
                        <span className="ml-1">Sửa</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(service)}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        {ICONS.TRASH}
                        <span className="ml-1">Xóa</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ{" "}
              <span className="font-semibold">
                {selectedService?.serviceName}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-error-600 hover:bg-error-700"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
