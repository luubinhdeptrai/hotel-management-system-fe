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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoomType } from "@/hooks/use-room-types";
import { ICONS } from "@/src/constants/icons.enum";
import { formatCurrency } from "@/lib/utils";

interface RoomTypeTableProps {
  roomTypes: RoomType[];
  onEdit: (roomType: RoomType) => void;
  onDelete: (roomTypeID: string) => void;
  isDeleting?: string | null;
}

export function RoomTypeTable({
  roomTypes,
  onEdit,
  onDelete,
  isDeleting,
}: RoomTypeTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    roomType: RoomType | null;
  }>({
    open: false,
    roomType: null,
  });

  const handleDeleteClick = (roomType: RoomType) => {
    setDeleteConfirm({ open: true, roomType });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.roomType) {
      onDelete(deleteConfirm.roomType.roomTypeID);
      setDeleteConfirm({ open: false, roomType: null });
    }
  };

  if (roomTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="w-16 h-16 text-gray-400 mb-4">{ICONS.BED_DOUBLE}</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có loại phòng nào
        </h3>
        <p className="text-sm text-gray-500">
          Nhấn &quot;Thêm loại phòng mới&quot; để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">
                Mã loại phòng
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Tên loại phòng
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">
                Giá (VNĐ)
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">
                Sức chứa
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Tiện nghi
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomTypes.map((roomType) => (
              <TableRow
                key={roomType.roomTypeID}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium text-gray-900">
                  {roomType.roomTypeID}
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {roomType.roomTypeName}
                </TableCell>
                <TableCell className="text-right font-medium text-gray-900">
                  {formatCurrency(roomType.price)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className="bg-primary-blue-50 text-primary-blue-700 border-primary-blue-200"
                  >
                    {roomType.capacity} người
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {roomType.tagDetails && roomType.tagDetails.length > 0 ? (
                      <>
                        {roomType.tagDetails.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {roomType.tagDetails.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 text-xs"
                          >
                            +{roomType.tagDetails.length - 3}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Chưa có</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(roomType)}
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                      {ICONS.EDIT}
                      <span className="ml-1">Sửa</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(roomType)}
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                    >
                      <span className="w-4 h-4 mr-1">{ICONS.TRASH}</span>
                      {isDeleting === roomType.roomTypeID
                        ? "Đang xóa..."
                        : "Xóa"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm({ open, roomType: deleteConfirm.roomType })
        }
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Xác nhận xóa loại phòng
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-warning-100 border border-warning-600 rounded-md mb-4">
              <p className="text-sm text-warning-600 flex items-start gap-2">
                <span className="w-5 h-5 shrink-0 mt-0.5">{ICONS.ALERT}</span>
                <span>
                  Bạn có chắc chắn muốn xóa loại phòng{" "}
                  <strong>{deleteConfirm.roomType?.roomTypeName}</strong> (
                  {deleteConfirm.roomType?.roomTypeID})?
                </span>
              </p>
            </div>

            {deleteConfirm.roomType && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(deleteConfirm.roomType.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sức chứa:</span>
                  <span className="font-medium text-gray-900">
                    {deleteConfirm.roomType.capacity} người
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500">Tiện nghi:</span>
                  <span className="font-medium text-gray-900 text-right">
                    {deleteConfirm.roomType.tagDetails && deleteConfirm.roomType.tagDetails.length > 0
                      ? deleteConfirm.roomType.tagDetails.map(tag => tag.name).join(", ")
                      : "Chưa có"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, roomType: null })}
              className="h-10 px-5 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="h-10 px-5 bg-error-600 text-white hover:bg-error-700"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
