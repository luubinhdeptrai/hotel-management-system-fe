"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ICONS } from "@/src/constants/icons.enum";
import { getFolioById } from "@/lib/mock-folio";
import { FolioHeader } from "@/components/folio/folio-header";
import { BalanceCard } from "@/components/folio/balance-card";
import { TransactionTable } from "@/components/folio/transaction-table";

interface FolioPageProps {
  params: Promise<{ id: string }>;
}

export default function FolioPage({ params }: FolioPageProps) {
  const { id } = use(params);
  const folio = getFolioById(id);

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
            <Button variant="outline" className="h-20 flex-col gap-2" disabled>
              {ICONS.PLUS}
              <span className="text-sm">Post Charge</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" disabled>
              {ICONS.CREDIT_CARD}
              <span className="text-sm">Post Payment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" disabled>
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
    </div>
  );
}
