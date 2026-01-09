"use client";


import { logger } from "@/lib/utils/logger";
import { useState, useEffect } from "react";
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
import type { Folio } from "@/lib/types/folio";

type FolioType = "GUEST" | "MASTER" | "NO_RESIDENT" | "ALL";

export default function FolioPage() {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [selectedFolio, setSelectedFolio] = useState<Folio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Load folios from API
  useEffect(() => {
    const loadFolios = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Implement getFolios API endpoint in backend
        // For now, we'll show a placeholder until the API is available
        // const response = await transactionService.getFolios();
        setFolios([]);
        setSelectedFolio(null);
      } catch (err) {
        logger.error("Failed to load folios:", err);
        setError(err instanceof Error ? err.message : "Failed to load folios");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFolios();
  }, []);

  const filteredFolios = filterType === "ALL" 
    ? folios 
    : folios;

  const handleTransferCharge = () => {
    if (!selectedFolio) {
      alert("Vui lòng chọn folio");
      return;
    }
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
    if (!selectedFolio) {
      alert("Vui lòng chọn folio");
      return;
    }
    // TODO: Implement split bill logic when API returns correct folio structure
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
            <div className="text-3xl font-bold">{0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">Master Folios</div>
            <div className="text-3xl font-bold">{0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">No-Resident</div>
            <div className="text-3xl font-bold">{0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-primary-100 text-sm mb-1">Tổng balance</div>
            <div className="text-3xl font-bold">{0}</div>
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
                    selectedFolio && selectedFolio.folioID === folio.folioID
                      ? "bg-primary-50 border-l-4 border-primary-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{folio.folioID}</p>
                      <p className="text-sm text-gray-600">Folio Details</p>
                    </div>
                    <Badge>Folio</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Balance:</span>
                    <span className="font-bold text-primary-700">{0}đ</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Folio Details */}
        <Card className="shadow-xl border-0 lg:col-span-2">
          <CardHeader className="bg-linear-to-br from-primary-50 via-white to-primary-50/30 border-b border-primary-100">
            {isLoading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : !selectedFolio ? (
              <div className="text-center py-8">Không có folio nào được chọn</div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      {selectedFolio.folioID}
                      <span className="ml-2">Folio</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Folio Details
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
              </>
            )}
          </CardHeader>
          {!isLoading && !error && selectedFolio && (
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
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Ghi chú: Dữ liệu giao dịch sẽ được tải từ API khi kết nối hoàn tất
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="summary" className="space-y-4">
                <Card className="bg-linear-to-br from-gray-50 to-white border-gray-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      Tính năng tóm tắt sẽ được kích hoạt khi API tích hợp hoàn tất
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
          )}
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
                  {selectedFolio && selectedFolio.transactions?.filter(t => t.amount > 0).map((txn, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
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
                  {selectedFolio && folios.filter(f => f.folioID !== selectedFolio.folioID).map(folio => (
                    <SelectItem key={folio.folioID} value={folio.folioID}>
                      {folio.folioID}
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
                Tổng bill: <span className="text-xl font-bold text-primary-700">{selectedFolio && selectedFolio.balance ? selectedFolio.balance.toLocaleString("vi-VN") : "0"}đ</span>
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
                <span className={`font-bold text-lg ${selectedFolio && (splitData.companyAmount + splitData.guestAmount) === selectedFolio.balance ? 'text-success-700' : 'text-error-700'}`}>
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
              disabled={!selectedFolio || (splitData.companyAmount + splitData.guestAmount) !== selectedFolio.balance}
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
