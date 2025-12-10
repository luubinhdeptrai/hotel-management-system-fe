import type {
  RevenueByDayData,
  RevenueByMonthData,
  OccupancyRateData,
  RoomAvailabilityData,
  CustomerReportData,
  ServiceRevenueData,
  ReportSummary,
} from "./types/reports";

// Revenue by Day Data (Last 30 days)
export const mockRevenueByDayData: RevenueByDayData[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const roomRevenue = Math.floor(Math.random() * 5000000) + 2000000;
    const serviceRevenue = Math.floor(Math.random() * 1000000) + 500000;

    return {
      date: date.toISOString().split("T")[0],
      roomRevenue,
      serviceRevenue,
      totalRevenue: roomRevenue + serviceRevenue,
      numberOfBookings: Math.floor(Math.random() * 15) + 5,
    };
  }
);

// Revenue by Month Data (Last 12 months)
export const mockRevenueByMonthData: RevenueByMonthData[] = Array.from(
  { length: 12 },
  (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const roomRevenue = Math.floor(Math.random() * 150000000) + 60000000;
    const serviceRevenue = Math.floor(Math.random() * 30000000) + 15000000;

    return {
      month: date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
      }),
      roomRevenue,
      serviceRevenue,
      totalRevenue: roomRevenue + serviceRevenue,
      numberOfBookings: Math.floor(Math.random() * 300) + 150,
    };
  }
);

// Occupancy Rate Data (Last 30 days)
export const mockOccupancyRateData: OccupancyRateData[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const totalRooms = 50;
    const occupiedRooms = Math.floor(Math.random() * 30) + 15;
    const availableRooms = totalRooms - occupiedRooms;

    return {
      date: date.toISOString().split("T")[0],
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate: Math.round((occupiedRooms / totalRooms) * 100 * 100) / 100,
    };
  }
);

// Room Availability Data
export const mockRoomAvailabilityData: RoomAvailabilityData[] = [
  {
    roomType: "Phòng Standard",
    total: 20,
    available: 8,
    occupied: 10,
    maintenance: 1,
    cleaning: 1,
  },
  {
    roomType: "Phòng Deluxe",
    total: 15,
    available: 5,
    occupied: 8,
    maintenance: 1,
    cleaning: 1,
  },
  {
    roomType: "Phòng Suite",
    total: 10,
    available: 3,
    occupied: 6,
    maintenance: 0,
    cleaning: 1,
  },
  {
    roomType: "Phòng Executive",
    total: 5,
    available: 2,
    occupied: 2,
    maintenance: 0,
    cleaning: 1,
  },
];

// Customer Report Data
export const mockCustomerReportData: CustomerReportData[] = [
  {
    customerName: "Nguyễn Văn An",
    phoneNumber: "0901234567",
    email: "nguyenvanan@gmail.com",
    identityCard: "001234567890",
    totalBookings: 15,
    totalSpent: 45000000,
    lastVisit: "2024-11-15",
  },
  {
    customerName: "Trần Thị Bình",
    phoneNumber: "0912345678",
    email: "tranthibinh@gmail.com",
    identityCard: "001234567891",
    totalBookings: 12,
    totalSpent: 38000000,
    lastVisit: "2024-11-10",
  },
  {
    customerName: "Lê Hoàng Cường",
    phoneNumber: "0923456789",
    email: "lehoangcuong@gmail.com",
    identityCard: "001234567892",
    totalBookings: 10,
    totalSpent: 32000000,
    lastVisit: "2024-11-08",
  },
  {
    customerName: "Phạm Thị Dung",
    phoneNumber: "0934567890",
    email: "phamthidung@gmail.com",
    identityCard: "001234567893",
    totalBookings: 8,
    totalSpent: 25000000,
    lastVisit: "2024-11-05",
  },
  {
    customerName: "Hoàng Văn Em",
    phoneNumber: "0945678901",
    email: "hoangvanem@gmail.com",
    identityCard: "001234567894",
    totalBookings: 7,
    totalSpent: 22000000,
    lastVisit: "2024-11-03",
  },
  {
    customerName: "Đặng Thị Phượng",
    phoneNumber: "0956789012",
    email: "dangthiphuong@gmail.com",
    identityCard: "001234567895",
    totalBookings: 6,
    totalSpent: 19000000,
    lastVisit: "2024-10-28",
  },
  {
    customerName: "Vũ Văn Giang",
    phoneNumber: "0967890123",
    email: "vuvangiang@gmail.com",
    identityCard: "001234567896",
    totalBookings: 5,
    totalSpent: 16000000,
    lastVisit: "2024-10-25",
  },
  {
    customerName: "Bùi Thị Hà",
    phoneNumber: "0978901234",
    email: "buithiha@gmail.com",
    identityCard: "001234567897",
    totalBookings: 4,
    totalSpent: 13000000,
    lastVisit: "2024-10-20",
  },
];

// Service Revenue Data
export const mockServiceRevenueData: ServiceRevenueData[] = [
  {
    serviceName: "Giặt là Express",
    category: "Giặt là",
    quantity: 150,
    revenue: 4500000,
  },
  {
    serviceName: "Giặt là tiêu chuẩn",
    category: "Giặt là",
    quantity: 200,
    revenue: 4000000,
  },
  {
    serviceName: "Massage toàn thân",
    category: "Spa & Massage",
    quantity: 80,
    revenue: 24000000,
  },
  {
    serviceName: "Massage chân",
    category: "Spa & Massage",
    quantity: 120,
    revenue: 12000000,
  },
  {
    serviceName: "Bữa sáng buffet",
    category: "Ăn uống",
    quantity: 300,
    revenue: 30000000,
  },
  {
    serviceName: "Bữa tối set menu",
    category: "Ăn uống",
    quantity: 150,
    revenue: 37500000,
  },
  {
    serviceName: "Xe đưa đón sân bay",
    category: "Vận chuyển",
    quantity: 60,
    revenue: 18000000,
  },
  {
    serviceName: "Thuê xe trong ngày",
    category: "Vận chuyển",
    quantity: 40,
    revenue: 20000000,
  },
];

// Report Summary
export const mockReportSummary: ReportSummary = {
  totalRevenue: 185000000,
  totalBookings: 450,
  averageOccupancy: 68.5,
  topRoomType: "Phòng Deluxe",
  totalCustomers: 320,
};

// Helper function to filter data by date range
export function filterDataByDateRange<
  T extends { date?: string; month?: string }
>(
  data: T[],
  startDate: Date,
  endDate: Date,
  dateField: "date" | "month" = "date"
): T[] {
  return data.filter((item) => {
    const itemDate = item[dateField];
    if (!itemDate) return false;

    const date = new Date(itemDate);
    return date >= startDate && date <= endDate;
  });
}

// Helper function to calculate summary from filtered data
export function calculateSummary(
  revenueData: RevenueByDayData[],
  occupancyData: OccupancyRateData[]
): ReportSummary {
  const totalRevenue = revenueData.reduce(
    (sum, item) => sum + item.totalRevenue,
    0
  );
  const totalBookings = revenueData.reduce(
    (sum, item) => sum + item.numberOfBookings,
    0
  );
  const averageOccupancy =
    occupancyData.reduce((sum, item) => sum + item.occupancyRate, 0) /
    (occupancyData.length || 1);

  return {
    totalRevenue,
    totalBookings,
    averageOccupancy: Math.round(averageOccupancy * 100) / 100,
    topRoomType: "Phòng Deluxe",
    totalCustomers: mockCustomerReportData.length,
  };
}
