"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ICONS } from "@/src/constants/icons.enum";
import { useTransactions } from "@/hooks/use-transactions";
import { useNotification } from "@/hooks/use-notification";
import { cn } from "@/lib/utils";
import type { TransactionType, TransactionStatus } from "@/lib/types/api";

// Transaction type labels
const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT: "Đặt cọc",
  ROOM_CHARGE: "Tiền phòng",
  SERVICE_CHARGE: "Tiền dịch vụ",
  REFUND: "Hoàn tiền",
  ADJUSTMENT: "Điều chỉnh",
};

// Transaction type colors
const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  DEPOSIT: "bg-indigo-100 text-indigo-800 border-indigo-300",
  ROOM_CHARGE: "bg-blue-100 text-blue-800 border-blue-300",
  SERVICE_CHARGE: "bg-green-100 text-green-800 border-green-300",
  REFUND: "bg-pink-100 text-pink-800 border-pink-300",
  ADJUSTMENT: "bg-gray-100 text-gray-800 border-gray-300",
};

// Transaction status labels
const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Đang chờ",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn",
};

// Transaction status colors
const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  PENDING: "bg-warning-100 text-warning-700 border-warning-300",
  COMPLETED: "bg-success-100 text-success-700 border-success-300",
  FAILED: "bg-error-100 text-error-700 border-error-300",
  REFUNDED: "bg-info-100 text-info-700 border-info-300",
};

export default function TransactionsPage() {
  const transactions = useTransactions();
  const notification = useNotification();

  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-linear-to-r from-primary-600 via-primary-500 to-primary-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <span className="w-8 h-8 text-white">
              {ICONS.CREDIT_CARD}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Quản lý giao dịch
            </h1>
            <p className="text-sm text-white/90 mt-1 font-medium">
              Theo dõi và quản lý tất cả giao dịch thanh toán
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.message && (
        <Alert
          className={cn(
            "shadow-md flex items-center gap-4",
            notification.type === "error"
              ? "bg-red-100 border-2 border-red-600"
              : "bg-success-100 border-2 border-success-600"
          )}
        >
          <div
            className={
              notification.type === "error"
                ? "text-red-600 shrink-0"
                : "text-success-600 shrink-0"
            }
          >
            {notification.type === "error" ? ICONS.ALERT_CIRCLE : ICONS.CHECK}
          </div>
          <AlertDescription
            className={
              notification.type === "error"
                ? "text-red-700 font-semibold"
                : "text-success-700 font-semibold"
            }
          >
            {notification.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-2 border-gray-100 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-5 h-5">{ICONS.FILTER}</span>
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Mã đặt phòng..."
              value={transactions.bookingId}
              onChange={(e) => transactions.setBookingId(e.target.value)}
              className="h-10"
            />

            <Select
              value={transactions.typeFilter || "all"}
              onValueChange={(value) =>
                transactions.setTypeFilter(
                  value === "all" ? undefined : (value as TransactionType)
                )
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="DEPOSIT">Đặt cọc</SelectItem>
                <SelectItem value="ROOM_CHARGE">Tiền phòng</SelectItem>
                <SelectItem value="SERVICE_CHARGE">Tiền dịch vụ</SelectItem>
                <SelectItem value="REFUND">Hoàn tiền</SelectItem>
                <SelectItem value="ADJUSTMENT">Điều chỉnh</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={transactions.statusFilter || "all"}
              onValueChange={(value) =>
                transactions.setStatusFilter(
                  value === "all" ? undefined : (value as TransactionStatus)
                )
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING">Đang chờ</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
                <SelectItem value="REFUNDED">Đã hoàn</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={() => transactions.fetchTransactions()}
                className="flex-1"
              >
                <span className="w-4 h-4 mr-2">{ICONS.SEARCH}</span>
                Tìm kiếm
              </Button>
              <Button
                variant="outline"
                onClick={transactions.handleClearFilters}
              >
                <span className="w-4 h-4">{ICONS.X}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-2 border-gray-100 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="w-5 h-5">{ICONS.CLIPBOARD_LIST}</span>
              Danh sách giao dịch ({transactions.totalItems})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner className="size-10 text-primary-600" />
              <p className="mt-4 text-gray-600 font-medium">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : transactions.transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="w-8 h-8 text-gray-400">
                  {ICONS.CREDIT_CARD}
                </span>
              </div>
              <p className="text-gray-600 font-medium">
                Không tìm thấy giao dịch nào
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Thử thay đổi bộ lọc hoặc tìm kiếm khác
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã giao dịch</TableHead>
                    <TableHead>Mã đặt phòng</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.booking?.bookingCode ||
                          transaction.bookingId.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            TRANSACTION_TYPE_COLORS[transaction.type]
                          }
                        >
                          {TRANSACTION_TYPE_LABELS[transaction.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {transaction.method === "CASH" && "Tiền mặt"}
                        {transaction.method === "CREDIT_CARD" && "Thẻ tín dụng"}
                        {transaction.method === "BANK_TRANSFER" &&
                          "Chuyển khoản"}
                        {transaction.method === "E_WALLET" && "Ví điện tử"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            TRANSACTION_STATUS_COLORS[transaction.status]
                          }
                        >
                          {TRANSACTION_STATUS_LABELS[transaction.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateTime(transaction.occurredAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            transactions.handleViewTransaction(transaction)
                          }
                        >
                          <span className="w-4 h-4">{ICONS.EYE}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Trang {transactions.currentPage} / {transactions.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={transactions.currentPage === 1}
                    onClick={() =>
                      transactions.setCurrentPage(transactions.currentPage - 1)
                    }
                  >
                    <span className="w-4 h-4">{ICONS.CHEVRON_LEFT}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      transactions.currentPage === transactions.totalPages
                    }
                    onClick={() =>
                      transactions.setCurrentPage(transactions.currentPage + 1)
                    }
                  >
                    <span className="w-4 h-4">{ICONS.CHEVRON_RIGHT}</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
