"use client";

import { use, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { VoidConfirmDialog } from "@/components/folio/void-confirm-dialog";
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
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");
  
  // Get selected transaction for void confirmation
  const selectedTransaction = folio?.transactions.find(t => t.transactionID === selectedTransactionId);

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
        mode: data.mode || "PAYMENT",
      });

      if (updatedFolio) {
        setFolio({ ...updatedFolio });
        const successMsg = data.mode === "DEPOSIT" ? "Ghi nhận đặt cọc thành công" : "Ghi nhận thanh toán thành công";
        toast.success(successMsg, {
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
  
  // Open void confirmation dialog
  const handleOpenVoidDialog = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsVoidDialogOpen(true);
  };
  
  // Confirm void transaction
  const handleConfirmVoid = (reason: string) => {
    if (selectedTransactionId) {
      handleVoidTransaction(selectedTransactionId, reason);
      setSelectedTransactionId("");
    }
  };

  if (!folio) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-linear-to-br from-error-50 to-error-100/30 rounded-2xl p-6 border-2 border-error-200 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-error-600 to-error-500 rounded-xl flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-6 h-6 text-white">{ICONS.ALERT}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Không tìm thấy Folio</h3>
                <p className="text-sm text-gray-600">Không tìm thấy folio với ID: {id}</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-linear-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white h-11 px-6 rounded-lg shadow-md"
          >
            <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.CHEVRON_LEFT}</span>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const isFolioClosed = folio.status === "CLOSED";

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Page Header with Gradient */}
      <div className="bg-linear-to-r from-primary-600 to-primary-500 text-white px-4 sm:px-6 lg:px-8 py-8 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-md backdrop-blur-sm">
              <span className="inline-flex items-center justify-center w-8 h-8 text-white">{ICONS.RECEIPT}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold">Chi tiết Folio</h1>
              <p className="text-primary-100 mt-1">
                Quản lý giao dịch và thanh toán
              </p>
            </div>
            <Button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white h-11 px-6 rounded-lg shadow-md backdrop-blur-sm transition-all"
            >
              <span className="inline-flex items-center justify-center w-4 h-4">{ICONS.CHEVRON_LEFT}</span>
              Quay lại
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        {/* Folio Header */}
        <FolioHeader folio={folio} />

        {/* Balance Cards */}
        <BalanceCard folio={folio} />

        {/* Action Buttons */}
        <div className="rounded-2xl bg-white border-2 border-gray-100 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="inline-flex items-center justify-center w-5 h-5 text-white">{ICONS.SETTINGS}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Thao tác</h2>
              <p className="text-xs text-gray-500">Quản lý giao dịch folio</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              disabled={isFolioClosed}
              onClick={() => setIsPostChargeOpen(true)}
              className="h-24 flex-col gap-3 bg-linear-to-br from-primary-50 to-primary-100/30 hover:from-primary-100 hover:to-primary-200/50 border-2 border-primary-200 text-primary-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-5 h-5 text-white">{ICONS.PLUS}</span>
              </div>
              <span className="text-sm">Post Charge</span>
            </Button>

            <Button
              disabled={isFolioClosed}
              onClick={() => setIsPostPaymentOpen(true)}
              className="h-24 flex-col gap-3 bg-linear-to-br from-success-50 to-success-100/30 hover:from-success-100 hover:to-success-200/50 border-2 border-success-200 text-success-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-5 h-5 text-white">{ICONS.CREDIT_CARD}</span>
              </div>
              <span className="text-sm">Post Payment</span>
            </Button>

            <Button
              onClick={() => window.print()}
              className="h-24 flex-col gap-3 bg-linear-to-br from-gray-50 to-gray-100/30 hover:from-gray-100 hover:to-gray-200/50 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 bg-linear-to-br from-gray-600 to-gray-500 rounded-xl flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-5 h-5 text-white">{ICONS.PRINTER}</span>
              </div>
              <span className="text-sm">Print Folio</span>
            </Button>
          </div>

          {isFolioClosed && (
            <div className="mt-4 bg-warning-50 border-2 border-warning-200 rounded-xl p-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 text-warning-600">{ICONS.ALERT_CIRCLE}</span>
              <p className="text-sm text-warning-700 font-semibold">
                Folio đã đóng. Không thể thêm/chỉnh sửa giao dịch.
              </p>
            </div>
          )}
        </div>
      {/* Transaction Table */}
      <TransactionTable 
        transactions={folio.transactions} 
        onVoidTransaction={handleOpenVoidDialog}
        isFolioClosed={isFolioClosed}
      />

      {/* Info Note */}
      <div className="bg-linear-to-br from-info-50 to-info-100/30 rounded-2xl p-5 border-2 border-info-200 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="inline-flex items-center justify-center w-5 h-5 text-white">{ICONS.INFO}</span>
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Hướng dẫn sử dụng:</p>
            <ul className="space-y-1">
              <li>• <strong>Debit (Nợ):</strong> Các khoản phí khách cần thanh toán (phòng, dịch vụ, phụ phí...)</li>
              <li>• <strong>Credit (Có):</strong> Các khoản tiền khách đã thanh toán (tiền mặt, chuyển khoản...)</li>
              <li>• <strong>Balance:</strong> Số dư = Debit - Credit (dương = khách nợ, âm = cần hoàn tiền)</li>
            </ul>
          </div>
        </div>
      </div>

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

      <VoidConfirmDialog
        isOpen={isVoidDialogOpen}
        onClose={() => {
          setIsVoidDialogOpen(false);
          setSelectedTransactionId("");
        }}
        onConfirm={handleConfirmVoid}
        transactionDescription={selectedTransaction?.description}
      />
    </div>
    </div>
  );
}
