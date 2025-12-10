"use client";

import type { CheckoutSummary } from "@/lib/types/checkin-checkout";
import { formatCurrency } from "@/lib/utils";

interface InvoicePrintProps {
  summary: CheckoutSummary;
  onBack: () => void;
  onPrint: () => void;
}

export function InvoicePrint({ summary, onBack, onPrint }: InvoicePrintProps) {
  const {
    receipt,
    services,
    penalties,
    roomTotal,
    servicesTotal,
    penaltiesTotal,
    grandTotal,
  } = summary;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 print:p-0">
      {/* Print isolation to avoid printing navbar/sidebar from parent layouts */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-print-root,
          #invoice-print-root * {
            visibility: visible !important;
          }
          #invoice-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        @page {
          size: auto;
          margin: 12mm;
        }
      `}</style>

      <div id="invoice-print-root" className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-2xl font-semibold">Hóa đơn thanh toán</h1>
            <p className="text-sm text-gray-500">Khách sạn UIT</p>
            <p className="text-sm text-gray-500">
              Khu phố 6, P. Linh Trung, TP. Hồ Chí Minh
            </p>
            <p className="text-sm text-gray-500">Hotline: 1900 1234</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Mã phiếu thuê</p>
            <p className="text-lg font-semibold text-primary-600">
              {receipt.receiptID}
            </p>
            <p className="text-sm text-gray-500 mt-2">Ngày in</p>
            <p className="text-sm font-medium">
              {new Date().toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Customer & Room */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500">Khách hàng</p>
            <p className="font-medium">{receipt.customerName}</p>
            <p className="text-gray-500">Số điện thoại</p>
            <p className="font-medium">{receipt.phoneNumber}</p>
            <p className="text-gray-500">CMND</p>
            <p className="font-medium">{receipt.identityCard}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Phòng</p>
            <p className="font-medium">
              {receipt.roomName} ({receipt.roomTypeName})
            </p>
            <p className="text-gray-500">Thời gian</p>
            <p className="font-medium">
              {new Date(receipt.checkInDate).toLocaleDateString("vi-VN")}{" "}
              {" - "}
              {new Date(receipt.checkOutDate).toLocaleDateString("vi-VN")}
            </p>
            <p className="text-gray-500">Số đêm</p>
            <p className="font-medium">{receipt.totalNights} đêm</p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-6 border border-gray-300 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold text-gray-900">Mô tả</th>
                <th className="px-4 py-3 font-semibold text-gray-900">
                  Số lượng
                </th>
                <th className="px-4 py-3 font-semibold text-gray-900">
                  Đơn giá
                </th>
                <th className="px-4 py-3 font-semibold text-gray-900 text-right">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3">
                  Tiền phòng ({receipt.totalNights} đêm)
                </td>
                <td className="px-4 py-3">{receipt.totalNights}</td>
                <td className="px-4 py-3">
                  {formatCurrency(receipt.pricePerNight)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(roomTotal)}
                </td>
              </tr>
              {services.map((s) => (
                <tr key={s.detailID}>
                  <td className="px-4 py-3">Dịch vụ: {s.serviceName}</td>
                  <td className="px-4 py-3">{s.quantity}</td>
                  <td className="px-4 py-3">{formatCurrency(s.price)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(s.total)}
                  </td>
                </tr>
              ))}
              {penalties.map((p) => (
                <tr key={p.penaltyID}>
                  <td className="px-4 py-3">Phí phạt: {p.description}</td>
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex flex-col items-end gap-2 text-sm">
          <div className="w-full max-w-sm flex items-center justify-between">
            <span className="text-gray-700">Tổng dịch vụ</span>
            <span className="font-medium">{formatCurrency(servicesTotal)}</span>
          </div>
          <div className="w-full max-w-sm flex items-center justify-between">
            <span className="text-gray-700">Tổng phạt</span>
            <span className="font-medium">
              {formatCurrency(penaltiesTotal)}
            </span>
          </div>
          <div className="w-full max-w-sm flex items-center justify-between border-t border-gray-300 pt-2">
            <span className="text-base font-semibold">Tổng thanh toán</span>
            <span className="text-base font-bold text-primary-600">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-gray-500 print:hidden">
          <button
            className="h-9 px-4 rounded-md bg-primary-600 text-white hover:bg-primary-500"
            onClick={onPrint}
          >
            In lại
          </button>
          <button
            className="ml-3 h-9 px-4 rounded-md border border-gray-300 hover:bg-gray-50"
            onClick={onBack}
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
