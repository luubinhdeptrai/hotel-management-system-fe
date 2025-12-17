"use client";


import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ICONS } from "@/src/constants/icons.enum";
import * as FolioService from "@/lib/services/folio-service";
import type { Transaction } from "@/lib/services/folio-service";

// Mock folio data
const mockFolios: Array<{
  folioID: string;
  folioType: "GUEST" | "MASTER" | "NO_RESIDENT";
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  balance: number;
  transactions: Transaction[];
  linkedFolios?: string[];
}> = [
  {
    folioID: "F001",
    folioType: "GUEST" as const,
    guestName: "Nguyễn Văn A",
    roomNumber: "101",
    checkInDate: "2025-12-10",
    checkOutDate: "2025-12-16",
    balance: 8500000,
    transactions: [
      { id: "T001", date: "2025-12-10", type: "ROOM_CHARGE" as const, description: "Tiền phòng - Đêm 1", amount: 1500000 },
      { id: "T002", date: "2025-12-11", type: "ROOM_CHARGE" as const, description: "Tiền phòng - Đêm 2", amount: 1500000 },
      { id: "T003", date: "2025-12-12", type: "SERVICE" as const, description: "Minibar - Nước ngọt", amount: 50000 },
      { id: "T004", date: "2025-12-13", type: "ROOM_CHARGE" as const, description: "Tiền phòng - Đêm 3", amount: 1500000 },
      { id: "T005", date: "2025-12-14", type: "SERVICE" as const, description: "Giặt là - 3 áo", amount: 150000 },
      { id: "T006", date: "2025-12-15", type: "ROOM_CHARGE" as const, description: "Tiền phòng - Đêm 4", amount: 1500000 },
      { id: "T007", date: "2025-12-16", type: "ROOM_CHARGE" as const, description: "Tiền phòng - Đêm 5", amount: 1500000 },
      { id: "T008", date: "2025-12-14", type: "DEPOSIT" as const, description: "Đặt cọc", amount: -1200000 },
    ],
  },
  {
    folioID: "F002",
    folioType: "MASTER" as const,
    guestName: "Công ty ABC",
    roomNumber: "201-205",
    checkInDate: "2025-12-12",
    checkOutDate: "2025-12-18",
    balance: 25000000,
    transactions: [
      { id: "M001", date: "2025-12-12", type: "ROOM_CHARGE" as const, description: "Tiền phòng - 5 phòng x Đêm 1", amount: 7500000 },
      { id: "M002", date: "2025-12-13", type: "ROOM_CHARGE" as const, description: "Tiền phòng - 5 phòng x Đêm 2", amount: 7500000 },
      { id: "M003", date: "2025-12-14", type: "ROOM_CHARGE" as const, description: "Tiền phòng - 5 phòng x Đêm 3", amount: 7500000 },
      { id: "M004", date: "2025-12-12", type: "DEPOSIT" as const, description: "Đặt cọc", amount: -5000000 },
    ],
    linkedFolios: ["F003", "F004", "F005", "F006", "F007"],
  },
  {
    folioID: "F003",
    folioType: "NO_RESIDENT" as const,
    guestName: "Sự kiện Hội nghị",
    roomNumber: "N/A",
    checkInDate: "2025-12-15",
    checkOutDate: "2025-12-15",
    balance: 12000000,
    transactions: [
      { id: "N001", date: "2025-12-15", type: "SERVICE" as const, description: "Thuê hội trường - 4 giờ", amount: 8000000 },
      { id: "N002", date: "2025-12-15", type: "SERVICE" as const, description: "Set coffee break - 50 pax", amount: 2500000 },
      { id: "N003", date: "2025-12-15", type: "SERVICE" as const, description: "Microphone & Projector", amount: 1500000 },
    ],
  },
];

type FolioType = "GUEST" | "MASTER" | "NO_RESIDENT" | "ALL";

export default function FolioPage() {
  const [selectedFolio, setSelectedFolio] = useState(mockFolios[0]);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<FolioType>("ALL");
  
  // Transfer Charge state
  const [transferData, setTransferData] = useState<{
    selectedTransaction: string;
    targetFolio: string;
  }>({ selectedTransaction: "", targetFolio: "" });
  
  // Split Bill state
  const [splitData, setSplitData] = useState<{
    companyAmount: number;
    guestAmount: number;
  }>({ companyAmount: 0, guestAmount: 0 });

  const filteredFolios = filterType === "ALL" 
    ? mockFolios 
    : mockFolios.filter(f => f.folioType === filterType);

  // Use FolioService to calculate balance
  const calculatedBalance = FolioService.calculateBalance(selectedFolio.transactions);
  const breakdown = FolioService.getTransactionBreakdown(selectedFolio.transactions);

  const getFolioTypeBadge = (type: "GUEST" | "MASTER" | "NO_RESIDENT") => {
    const badges = {
      GUEST: <Badge className="bg-linear-to-r from-primary-600 to-primary-500 text-white">Guest Folio</Badge>,
      MASTER: <Badge className="bg-linear-to-r from-success-600 to-success-500 text-white">Master Folio</Badge>,
      NO_RESIDENT: <Badge className="bg-linear-to-r from-warning-600 to-warning-500 text-white">No-Resident Folio</Badge>,
    };
    return badges[type];
  };

  const getTransactionTypeBadge = (type: string) => {
    const badges: Record<string, React.ReactElement> = {
      ROOM_CHARGE: <Badge variant="outline" className="border-primary-600 text-primary-700">Tiền phòng</Badge>,
      SERVICE: <Badge variant="outline" className="border-info-600 text-info-700">Dịch vụ</Badge>,
      DEPOSIT: <Badge variant="outline" className="border-success-600 text-success-700">Đặt cọc</Badge>,
      PAYMENT: <Badge variant="outline" className="border-error-600 text-error-700">Thanh toán</Badge>,
    };
    return badges[type] || <Badge variant="outline">{type}</Badge>;
  };

  const handleTransferCharge = () => {
    if (!transferData.selectedTransaction || !transferData.targetFolio) {
      alert("Vui lòng chọn transaction và folio đích");
      return;
    }
    // BACKEND INTEGRATION: Call POST /api/folios/transfer-charge
    // with { transactionId, sourceFolioId, targetFolioId }
    logger.log("Transfer charge:", transferData);
    setTransferModalOpen(false);
    setTransferData({ selectedTransaction: "", targetFolio: "" });
  };

  const handleSplitBill = () => {
    const total = selectedFolio.balance;
    
    if (splitData.companyAmount + splitData.guestAmount !== total) {
      alert(`Tổng tiền split (${(splitData.companyAmount + splitData.guestAmount).toLocaleString("vi-VN")}đ) phải bằng tổng bill (${total.toLocaleString("vi-VN")}đ)`);
      return;
    }
    // BACKEND INTEGRATION: Call POST /api/folios/split-bill
    // with { folioId, companyAmount, guestAmount, newFolioType }
    logger.log("Split bill:", splitData);
    setSplitModalOpen(false);
    setSplitData({ companyAmount: 0, guestAmount: 0 });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-linear-to-br from-primary-600 via-primary-500 to-primary-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản Lý Folio</h1>
            <p className="text-primary-50 text-sm">Sổ tính tiền - Quản lý giao dịch & chia bill</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <span className="w-10 h-10 text-white flex items-center justify-center">{ICONS.FILE_TEXT}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">Guest Folios</div>
            <div className="text-3xl font-bold">{mockFolios.filter(f => f.folioType === "GUEST").length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">Master Folios</div>
            <div className="text-3xl font-bold">{mockFolios.filter(f => f.folioType === "MASTER").length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">No-Resident</div>
            <div className="text-3xl font-bold">{mockFolios.filter(f => f.folioType === "NO_RESIDENT").length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">Tổng balance</div>
            <div className="text-3xl font-bold">{mockFolios.reduce((sum, f) => sum + f.balance, 0).toLocaleString("vi-VN")}</div>
          </div>
        </div>
      </div>

      {/* Folio List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Folio List */}
        <Card className="shadow-xl border-0 lg:col-span-1">
          <CardHeader className="bg-linear-to-br from-gray-50 via-white to-gray-50/30 border-b border-gray-200">
            <CardTitle className="text-lg font-bold text-gray-900">Danh sách Folio</CardTitle>
            <div className="mt-3">
              <Select value={filterType} onValueChange={(value) => setFilterType(value as FolioType)}>
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="GUEST">Guest Folio</SelectItem>
                  <SelectItem value="MASTER">Master Folio</SelectItem>
                  <SelectItem value="NO_RESIDENT">No-Resident</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredFolios.map((folio) => (
                <div
                  key={folio.folioID}
                  onClick={() => setSelectedFolio(folio)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedFolio.folioID === folio.folioID
                      ? "bg-primary-50 border-l-4 border-primary-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{folio.guestName}</p>
                      <p className="text-sm text-gray-600">{folio.folioID} • {folio.roomNumber}</p>
                    </div>
                    {getFolioTypeBadge(folio.folioType)}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Balance:</span>
                    <span className="font-bold text-primary-700">{folio.balance.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Folio Details */}
        <Card className="shadow-xl border-0 lg:col-span-2">
          <CardHeader className="bg-linear-to-br from-primary-50 via-white to-primary-50/30 border-b border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  {selectedFolio.guestName}
                  <span className="ml-2">{getFolioTypeBadge(selectedFolio.folioType)}</span>
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {selectedFolio.folioID} • Phòng: {selectedFolio.roomNumber} • {selectedFolio.checkInDate} → {selectedFolio.checkOutDate}
                </CardDescription>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransferModalOpen(true)}
                className="h-9 border-info-300 text-info-700 hover:bg-info-50 flex items-center"
              >
                <span className="w-4 h-4 mr-1 flex items-center justify-center">{ICONS.ARROW_UP_DOWN}</span>
                Transfer Charge
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSplitModalOpen(true)}
                className="h-9 border-success-300 text-success-700 hover:bg-success-50 flex items-center"
              >
                <span className="w-4 h-4 mr-1 flex items-center justify-center">{ICONS.SPLIT}</span>
                Split Bill
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions" className="space-y-4">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-bold">Ngày</TableHead>
                      <TableHead className="font-bold">Loại</TableHead>
                      <TableHead className="font-bold">Mô tả</TableHead>
                      <TableHead className="font-bold text-right">Số tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedFolio.transactions.map((txn) => (
                      <TableRow key={txn.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-gray-600">{txn.date}</TableCell>
                        <TableCell>{getTransactionTypeBadge(txn.type)}</TableCell>
                        <TableCell className="font-medium text-gray-900">{txn.description}</TableCell>
                        <TableCell className={`text-right font-bold ${txn.amount < 0 ? 'text-success-700' : 'text-gray-900'}`}>
                          {txn.amount < 0 ? '-' : ''}{Math.abs(txn.amount).toLocaleString("vi-VN")}đ
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="summary" className="space-y-4">
                <Card className="bg-linear-to-br from-gray-50 to-white border-gray-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Chi tiết tính toán (Folio Service)</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tiền phòng:</span>
                        <span className="font-semibold text-gray-900">
                          {breakdown.roomCharges.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Dịch vụ:</span>
                        <span className="font-semibold text-gray-900">
                          {breakdown.services.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Phụ thu:</span>
                        <span className="font-semibold text-gray-900">
                          {breakdown.surcharges.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Phạt:</span>
                        <span className="font-semibold text-gray-900">
                          {breakdown.penalties.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Đặt cọc:</span>
                        <span className="font-semibold text-success-700">
                          {breakdown.deposits.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Thanh toán:</span>
                        <span className="font-semibold text-success-700">
                          {breakdown.payments.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Tổng charges:</span>
                          <span className="font-bold text-gray-900">{breakdown.totalCharges.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Tổng payments:</span>
                          <span className="font-bold text-success-700">{breakdown.totalPayments.toLocaleString("vi-VN")}đ</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t-2 border-gray-400">
                        <span className="text-lg font-bold text-gray-900">Balance (Calculated):</span>
                        <span className="text-2xl font-bold text-primary-700">
                          {calculatedBalance.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className="bg-info-50 border border-info-200 rounded-lg p-3">
                        <p className="text-xs text-info-800">
                          <span className="font-bold">Verification:</span> Mock balance: {selectedFolio.balance.toLocaleString("vi-VN")}đ | 
                          Service balance: {calculatedBalance.toLocaleString("vi-VN")}đ | 
                          Breakdown balance: {breakdown.balance.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Charge Modal */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <span className="w-6 h-6 text-white flex items-center justify-center">{ICONS.ARROW_UP_DOWN}</span>
              </div>
              Transfer Charge
            </DialogTitle>
            <DialogDescription>Chuyển giao dịch sang folio khác</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transaction</Label>
              <Select value={transferData.selectedTransaction} onValueChange={(value) => setTransferData({...transferData, selectedTransaction: value})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Chọn transaction cần transfer..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedFolio.transactions.filter(t => t.amount > 0).map(txn => (
                    <SelectItem key={txn.id} value={txn.id}>
                      {txn.description} - {txn.amount.toLocaleString("vi-VN")}đ
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Folio đích</Label>
              <Select value={transferData.targetFolio} onValueChange={(value) => setTransferData({...transferData, targetFolio: value})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Chọn folio..." />
                </SelectTrigger>
                <SelectContent>
                  {mockFolios.filter(f => f.folioID !== selectedFolio.folioID).map(folio => (
                    <SelectItem key={folio.folioID} value={folio.folioID}>
                      {folio.folioID} - {folio.guestName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferModalOpen(false)}>Hủy</Button>
            <Button className="bg-linear-to-r from-info-600 to-info-500 hover:from-info-700 hover:to-info-600 text-white" onClick={handleTransferCharge}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Split Bill Modal */}
      <Dialog open={splitModalOpen} onOpenChange={setSplitModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-success-600 to-success-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <span className="w-6 h-6 text-white flex items-center justify-center">{ICONS.SPLIT}</span>
              </div>
              Split Bill
            </DialogTitle>
            <DialogDescription>Chia bill giữa các bên thanh toán</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-primary-900">
                Tổng bill: <span className="text-xl font-bold text-primary-700">{selectedFolio.balance.toLocaleString("vi-VN")}đ</span>
              </p>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2 border-2 border-gray-100">
                <Label className="text-sm font-semibold text-gray-900">Công ty trả (Tiền phòng)</Label>
                <Input 
                  type="number" 
                  placeholder="Nhập số tiền..." 
                  className="h-11 border-gray-300" 
                  value={splitData.companyAmount}
                  onChange={(e) => setSplitData({...splitData, companyAmount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2 border-2 border-gray-100">
                <Label className="text-sm font-semibold text-gray-900">Khách trả (Dịch vụ cá nhân)</Label>
                <Input 
                  type="number" 
                  placeholder="Nhập số tiền..." 
                  className="h-11 border-gray-300" 
                  value={splitData.guestAmount}
                  onChange={(e) => setSplitData({...splitData, guestAmount: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            {/* Split Summary */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Công ty:</span>
                <span className="font-bold text-blue-700">{splitData.companyAmount.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Khách:</span>
                <span className="font-bold text-blue-700">{splitData.guestAmount.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-blue-200 text-sm">
                <span className="text-gray-700 font-semibold">Tổng:</span>
                <span className={`font-bold text-lg ${(splitData.companyAmount + splitData.guestAmount) === selectedFolio.balance ? 'text-success-700' : 'text-error-700'}`}>
                  {(splitData.companyAmount + splitData.guestAmount).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
            
            <div className="bg-warning-50 border-l-4 border-warning-600 p-4 rounded-r-lg">
              <p className="text-sm font-medium text-warning-800 flex items-center">
                <span className="w-5 h-5 inline-flex mr-2 shrink-0">{ICONS.INFO}</span>
                <span>Sau khi split, hệ thống sẽ tạo 2 folio riêng cho từng bên.</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSplitModalOpen(false)}>Hủy</Button>
            <Button 
              className="bg-linear-to-r from-success-600 to-success-500 hover:from-success-700 hover:to-success-600 text-white"
              disabled={(splitData.companyAmount + splitData.guestAmount) !== selectedFolio.balance}
              onClick={handleSplitBill}
            >
              Xác nhận Split
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
