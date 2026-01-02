"use client";


import { logger } from "@/lib/utils/logger";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ICONS } from "@/src/constants/icons.enum";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data
const mockGuests = [
  {
    id: "G001",
    hoTen: "Nguyễn Văn A",
    loaiGiayTo: "CCCD",
    soGiayTo: "001234567890",
    ngaySinh: "1985-05-15",
    quocTich: "Việt Nam",
    diaChiThuongTru: "123 Nguyễn Huệ, Q.1, TP.HCM",
    roomNumber: "101",
    ngayBatDau: "2025-12-10",
    ngayKetThuc: "2025-12-16",
    totalStays: 8,
  },
  {
    id: "G002",
    hoTen: "John Smith",
    loaiGiayTo: "Passport",
    soGiayTo: "P123456789",
    ngaySinh: "1990-08-20",
    quocTich: "United States",
    diaChiThuongTru: "456 Broadway, New York, USA",
    roomNumber: "201",
    ngayBatDau: "2025-12-12",
    ngayKetThuc: "2025-12-18",
    totalStays: 3,
  },
  {
    id: "G003",
    hoTen: "Trần Thị B",
    loaiGiayTo: "CCCD",
    soGiayTo: "001987654321",
    ngaySinh: "1992-03-10",
    quocTich: "Việt Nam",
    diaChiThuongTru: "789 Lê Lợi, Q.3, TP.HCM",
    roomNumber: "305",
    ngayBatDau: "2025-12-14",
    ngayKetThuc: "2025-12-20",
    totalStays: 12,
  },
];

const idTypes = ["CCCD", "CMND", "Passport", "Khác"];
const countries = ["Việt Nam", "United States", "Japan", "Korea", "China", "Singapore", "Thailand", "Khác"];

export default function NguoiOPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRoom, setFilterRoom] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<typeof mockGuests[0] | null>(null);
  
  // Form states
  const [hoTen, setHoTen] = useState("");
  const [loaiGiayTo, setLoaiGiayTo] = useState("");
  const [soGiayTo, setSoGiayTo] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [quocTich, setQuocTich] = useState("");
  const [diaChiThuongTru, setDiaChiThuongTru] = useState("");
  const [room, setRoom] = useState("");
  const [ngayBatDau, setNgayBatDau] = useState("");
  const [ngayKetThuc, setNgayKetThuc] = useState("");

  const filteredGuests = mockGuests.filter((guest) => {
    const matchesSearch = guest.hoTen.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.soGiayTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoom = filterRoom === "ALL" || guest.roomNumber === filterRoom;
    return matchesSearch && matchesRoom;
  });

  const resetForm = () => {
    setHoTen("");
    setLoaiGiayTo("");
    setSoGiayTo("");
    setNgaySinh("");
    setQuocTich("");
    setDiaChiThuongTru("");
    setRoom("");
    setNgayBatDau("");
    setNgayKetThuc("");
  };

  const handleSubmit = () => {
    // Simulate API call
    logger.log("Submitting guest registration...");
    setFormOpen(false);
    resetForm();
  };

  const isFormValid = hoTen && loaiGiayTo && soGiayTo && room;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-linear-to-br from-info-600 via-info-500 to-info-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Đăng Ký Tạm Trú</h1>
            <p className="text-info-50 text-sm">Quản lý thông tin khách lưu trú tại khách sạn</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <span className="w-10 h-10 text-white flex items-center justify-center">{ICONS.USERS}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-info-100 text-sm mb-2">Tổng khách</div>
            <div className="text-4xl font-bold text-white">{mockGuests.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-info-100 text-sm mb-2">Khách nội địa</div>
            <div className="text-4xl font-bold text-white">{mockGuests.filter(g => g.quocTich === "Việt Nam").length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-info-100 text-sm mb-2">Khách nước ngoài</div>
            <div className="text-4xl font-bold text-white">{mockGuests.filter(g => g.quocTich !== "Việt Nam").length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-info-100 text-sm mb-2">Hôm nay</div>
            <div className="text-4xl font-bold text-white">0</div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">{ICONS.SEARCH}</span>
                <Input
                  placeholder="Tìm theo tên hoặc số giấy tờ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:ring-info-500"
                />
              </div>
            </div>
            <Select value={filterRoom} onValueChange={setFilterRoom}>
              <SelectTrigger className="w-full md:w-[200px] h-11 border-gray-300 focus:ring-info-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả phòng</SelectItem>
                <SelectItem value="101">Phòng 101</SelectItem>
                <SelectItem value="201">Phòng 201</SelectItem>
                <SelectItem value="305">Phòng 305</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setFormOpen(true)}
              className="h-11 bg-linear-to-r from-info-600 to-info-500 hover:from-info-700 hover:to-info-600 text-white font-semibold shadow-lg"
            >
              <span className="w-5 h-5 mr-2">{ICONS.PLUS}</span>
              Đăng ký khách mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guest List */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-linear-to-br from-info-50 via-white to-info-50/30 border-b border-info-100">
          <CardTitle className="text-xl font-bold text-gray-900">
            Danh sách khách lưu trú ({filteredGuests.length})
          </CardTitle>
          <CardDescription className="text-gray-600">Thông tin chi tiết về khách đang lưu trú tại khách sạn</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold text-gray-900">Họ tên</TableHead>
                  <TableHead className="font-bold text-gray-900">Loại giấy tờ</TableHead>
                  <TableHead className="font-bold text-gray-900">Số giấy tờ</TableHead>
                  <TableHead className="font-bold text-gray-900">Quốc tịch</TableHead>
                  <TableHead className="font-bold text-gray-900">Phòng</TableHead>
                  <TableHead className="font-bold text-gray-900">Ngày ở</TableHead>
                  <TableHead className="font-bold text-gray-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <span className="w-12 h-12 text-gray-300">{ICONS.FILE_TEXT}</span>
                        <p className="font-medium">Không tìm thấy khách lưu trú nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-info-50/50 transition-colors">
                      <TableCell className="font-semibold text-gray-900">{guest.hoTen}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-info-600 text-info-700 font-medium">
                          {guest.loaiGiayTo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-700">{guest.soGiayTo}</TableCell>
                      <TableCell className="text-gray-700">{guest.quocTich}</TableCell>
                      <TableCell>
                        <Badge className="bg-linear-to-r from-info-600 to-info-500 text-white font-semibold">
                          {guest.roomNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {guest.ngayBatDau} → {guest.ngayKetThuc}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedGuest(guest);
                            setDetailsOpen(true);
                          }}
                          className="hover:bg-info-100 text-info-700 font-medium"
                        >
                          <span className="w-4 h-4 mr-1">{ICONS.EYE}</span>
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-6 h-6 text-white">{ICONS.USER_PLUS}</span>
              </div>
              Đăng ký khách lưu trú mới
            </DialogTitle>
            <DialogDescription className="text-base">
              Điền thông tin khách để đăng ký tạm trú. Các trường có dấu (*) là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* Required Fields Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-info-200 pb-2">
                Thông tin bắt buộc
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="hoTen" className="text-sm font-semibold text-gray-700">
                    Họ và tên <span className="text-error-600">*</span>
                  </Label>
                  <Input
                    id="hoTen"
                    placeholder="Nhập họ tên đầy đủ..."
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loaiGiayTo" className="text-sm font-semibold text-gray-700">
                    Loại giấy tờ <span className="text-error-600">*</span>
                  </Label>
                  <Select value={loaiGiayTo} onValueChange={setLoaiGiayTo}>
                    <SelectTrigger className="h-11 border-gray-300 focus:ring-info-500">
                      <SelectValue placeholder="Chọn loại..." />
                    </SelectTrigger>
                    <SelectContent>
                      {idTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soGiayTo" className="text-sm font-semibold text-gray-700">
                    Số giấy tờ <span className="text-error-600">*</span>
                  </Label>
                  <Input
                    id="soGiayTo"
                    placeholder="Nhập số giấy tờ..."
                    value={soGiayTo}
                    onChange={(e) => setSoGiayTo(e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room" className="text-sm font-semibold text-gray-700">
                    Phòng <span className="text-error-600">*</span>
                  </Label>
                  <Select value={room} onValueChange={setRoom}>
                    <SelectTrigger className="h-11 border-gray-300 focus:ring-info-500">
                      <SelectValue placeholder="Chọn phòng..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="101">Phòng 101 - Deluxe</SelectItem>
                      <SelectItem value="201">Phòng 201 - Suite</SelectItem>
                      <SelectItem value="305">Phòng 305 - Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                Thông tin bổ sung (tùy chọn)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ngaySinh" className="text-sm font-semibold text-gray-700">
                    Ngày sinh
                  </Label>
                  <Input
                    id="ngaySinh"
                    type="date"
                    value={ngaySinh}
                    onChange={(e) => setNgaySinh(e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quocTich" className="text-sm font-semibold text-gray-700">
                    Quốc tịch
                  </Label>
                  <Select value={quocTich} onValueChange={setQuocTich}>
                    <SelectTrigger className="h-11 border-gray-300 focus:ring-info-500">
                      <SelectValue placeholder="Chọn quốc tịch..." />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="diaChiThuongTru" className="text-sm font-semibold text-gray-700">
                    Địa chỉ thường trú
                  </Label>
                  <Input
                    id="diaChiThuongTru"
                    placeholder="Nhập địa chỉ thường trú..."
                    value={diaChiThuongTru}
                    onChange={(e) => setDiaChiThuongTru(e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ngayBatDau" className="text-sm font-semibold text-gray-700">
                    Ngày bắt đầu
                  </Label>
                  <Input
                    id="ngayBatDau"
                    type="date"
                    value={ngayBatDau}
                    onChange={(e) => setNgayBatDau(e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ngayKetThuc" className="text-sm font-semibold text-gray-700">
                    Ngày kết thúc
                  </Label>
                  <Input
                    id="ngayKetThuc"
                    type="date"
                    value={ngayKetThuc}
                    onChange={(e) => setNgayKetThuc(e.target.value)}
                    className="h-11 border-gray-300 focus:ring-info-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t border-gray-200 pt-4">
            <Button variant="outline" onClick={() => { setFormOpen(false); resetForm(); }} className="h-11 font-semibold">
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="h-11 bg-linear-to-r from-info-600 to-info-500 hover:from-info-700 hover:to-info-600 text-white font-semibold disabled:opacity-50"
            >
              <span className="w-5 h-5 mr-2">{ICONS.CHECK}</span>
              Đăng ký
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guest Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-info-600 to-info-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="w-6 h-6 text-white">{ICONS.USER}</span>
              </div>
              Thông tin khách lưu trú
            </DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-5 py-4">
              {/* Main Info Card */}
              <Card className="bg-linear-to-br from-info-50 via-white to-info-50/30 border-info-200">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-info-200 pb-3">
                    <span className="text-xs font-bold text-info-700 tracking-wide">THÔNG TIN CƠ BẢN</span>
                    <Badge className="bg-linear-to-r from-info-600 to-info-500 text-white">
                      Phòng {selectedGuest.roomNumber}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Họ và tên</p>
                      <p className="font-bold text-gray-900">{selectedGuest.hoTen}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ngày sinh</p>
                      <p className="font-semibold text-gray-900">{selectedGuest.ngaySinh}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Loại giấy tờ</p>
                      <Badge variant="outline" className="border-info-600 text-info-700 font-semibold">
                        {selectedGuest.loaiGiayTo}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Số giấy tờ</p>
                      <p className="font-mono font-semibold text-gray-900">{selectedGuest.soGiayTo}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Quốc tịch</p>
                      <p className="font-semibold text-gray-900">{selectedGuest.quocTich}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Địa chỉ thường trú</p>
                      <p className="text-sm text-gray-700">{selectedGuest.diaChiThuongTru}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stay Info */}
              <Card className="bg-linear-to-br from-gray-50 via-white to-gray-50/30 border-gray-200">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold text-gray-700 tracking-wide">THỜI GIAN LƯU TRÚ</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ngày bắt đầu</p>
                      <p className="font-bold text-success-700">{selectedGuest.ngayBatDau}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ngày kết thúc</p>
                      <p className="font-bold text-error-700">{selectedGuest.ngayKetThuc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              <Card className="bg-linear-to-br from-success-50 via-white to-success-50/30 border-success-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-success-700 font-bold mb-1 tracking-wide">LỊCH SỬ LƯU TRÚ</p>
                      <p className="text-sm text-gray-600">Số lần đã ở tại khách sạn</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-success-700">{selectedGuest.totalStays}</p>
                      <p className="text-xs text-success-600 font-medium">lần</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)} className="w-full h-11 bg-linear-to-r from-info-600 to-info-500 hover:from-info-700 hover:to-info-600 text-white font-semibold">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
