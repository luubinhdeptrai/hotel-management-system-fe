export type ReportType =
  | "revenue-by-day"
  | "revenue-by-month"
  | "occupancy-rate"
  | "room-availability"
  | "customer-list"
  | "service-revenue";

export interface ReportFilter {
  reportType: ReportType;
  startDate: Date;
  endDate: Date;
  roomTypeId?: string;
}

export interface RevenueByDayData {
  date: string;
  totalRevenue: number;
  roomRevenue: number;
  serviceRevenue: number;
  numberOfBookings: number;
}

export interface RevenueByMonthData {
  month: string;
  totalRevenue: number;
  roomRevenue: number;
  serviceRevenue: number;
  numberOfBookings: number;
}

export interface OccupancyRateData {
  date: string;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
}

export interface RoomAvailabilityData {
  roomType: string;
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
}

export interface CustomerReportData {
  customerName: string;
  phoneNumber: string;
  email: string;
  identityCard: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit: string;
}

export interface ServiceRevenueData {
  serviceName: string;
  category: string;
  quantity: number;
  revenue: number;
}

export interface ReportSummary {
  totalRevenue: number;
  totalBookings: number;
  averageOccupancy: number;
  topRoomType: string;
  totalCustomers: number;
}
