"use client";

import { use, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import {
  getMutableFolioById,
  addChargeToFolio,
  addPaymentToFolio,
  voidTransaction,
} from "@/lib/mock-folio";
import type {
  Folio,
  PostChargeFormData,
  PostPaymentFormData,
} from "@/lib/types/folio";
import { FolioHeader } from "@/components/folio/folio-header";
import { BalanceCard } from "@/components/folio/balance-card";
import { TransactionTable } from "@/components/folio/transaction-table";
import { PostChargeModal } from "@/components/folio/post-charge-modal";
import { PostPaymentModal } from "@/components/folio/post-payment-modal";
import { VoidTransactionModal } from "@/components/folio/void-transaction-modal";
import { toast } from "sonner";

interface FolioPageProps {
  params: Promise<{ id: string }>;
}

export default function FolioPage({ params }: FolioPageProps) {
  const { id } = use(params);

  // Get initial folio data and use state for reactivity
  const initialFolio = getMutableFolioById(id);
  const [folio, setFolio] = useState<Folio | undefined>(initialFolio);

  // Modal states
  const [isPostChargeOpen, setIsPostChargeOpen] = useState(false);
  const [isPostPaymentOpen, setIsPostPaymentOpen] = useState(false);
  const [isVoidOpen, setIsVoidOpen] = useState(false);

  // Handler for posting charges
  const handlePostCharge = useCallback(
    (data: PostChargeFormData) => {
      const updatedFolio = addChargeToFolio(id, {
        type: data.type,
        description: data.description,
        amount: data.amount,
      });

      if (updatedFolio) {
        setFolio({ ...updatedFolio });
        toast.success("Thêm phí thành công", {
          description: `Đã thêm ${data.description} - ${new Intl.NumberFormat(
            "vi-VN",
            {
              style: "currency",
              currency: "VND",
            }
          ).format(data.amount)}`,
        });
      } else {
        toast.error("Lỗi", { description: "Không thể thêm phí vào folio" });
      }
    },
    [id]
  );

  // Handler for posting payments
  const handlePostPayment = useCallback(
    (data: PostPaymentFormData) => {
      const updatedFolio = addPaymentToFolio(id, {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      });

      if (updatedFolio) {
        setFolio({ ...updatedFolio });
        toast.success("Ghi nhận thanh toán thành công", {
          description: `Đã nhận ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(data.amount)}`,
        });
      } else {
        toast.error("Lỗi", { description: "Không thể ghi nhận thanh toán" });
      }
    },
    [id]
  );

  // Handler for voiding transactions
  const handleVoidTransaction = useCallback(
    (transactionId: string, reason: string) => {
      const updatedFolio = voidTransaction(id, transactionId, reason);

      if (updatedFolio) {
        setFolio({ ...updatedFolio });
        toast.success("Hủy giao dịch thành công", {
          description: "Giao dịch đã được đánh dấu là đã hủy",
        });
      } else {
        toast.error("Lỗi", { description: "Không thể hủy giao dịch" });
      }
    },
    [id]
  );

  if (!folio) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <span className="w-4 h-4">{ICONS.ALERT}</span>
          <AlertDescription>Không tìm thấy folio với ID: {id}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => window.history.back()}>
          {ICONS.CHEVRON_LEFT}
          <span className="ml-2">Quay lại</span>
        </Button>
      </div>
    );
  }

  const isFolioClosed = folio.status === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.history.back()}
        className="h-9"
      >
        {ICONS.CHEVRON_LEFT}
        <span className="ml-2">Quay lại</span>
      </Button>

      {/* Folio Header */}
      <FolioHeader folio={folio} />

      {/* Balance Card */}
      <BalanceCard folio={folio} />

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:border-blue-500 hover:bg-blue-50"
              disabled={isFolioClosed}
              onClick={() => setIsPostChargeOpen(true)}
            >
              {ICONS.PLUS}
              <span className="text-sm">Post Charge</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:border-green-500 hover:bg-green-50"
              disabled={isFolioClosed}
              onClick={() => setIsPostPaymentOpen(true)}
            >
              {ICONS.CREDIT_CARD}
              <span className="text-sm">Post Payment</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:border-red-500 hover:bg-red-50"
              disabled={
                isFolioClosed ||
                folio.transactions.filter((t) => !t.isVoided).length === 0
              }
              onClick={() => setIsVoidOpen(true)}
            >
              {ICONS.X_CIRCLE}
              <span className="text-sm">Void/Adjust</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.print()}
            >
              {ICONS.PRINTER}
              <span className="text-sm">Print Folio</span>
            </Button>
          </div>

          {isFolioClosed && (
            <p className="mt-3 text-sm text-amber-600">
              ⚠️ Folio đã đóng. Không thể thêm/chỉnh sửa giao dịch.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <TransactionTable transactions={folio.transactions} />

      {/* Info Note */}
      <Alert>
        <span className="w-4 h-4">{ICONS.INFO}</span>
        <AlertDescription>
          <strong>Debit (Nợ):</strong> Các khoản phí khách cần thanh toán.{" "}
          <strong>Credit (Có):</strong> Các khoản tiền khách đã thanh toán.
        </AlertDescription>
      </Alert>

      {/* Modals */}
      <PostChargeModal
        isOpen={isPostChargeOpen}
        onClose={() => setIsPostChargeOpen(false)}
        onSubmit={handlePostCharge}
      />

      <PostPaymentModal
        isOpen={isPostPaymentOpen}
        onClose={() => setIsPostPaymentOpen(false)}
        onSubmit={handlePostPayment}
        balance={folio.balance}
      />

      <VoidTransactionModal
        isOpen={isVoidOpen}
        onClose={() => setIsVoidOpen(false)}
        onVoid={handleVoidTransaction}
        transactions={folio.transactions}
      />
    </div>
  );
}
