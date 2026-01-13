/**
 * Report Types - Based on Backend API
 * Source: roommaster-be/src/services/reports/
 */

// ==================== ROOM AVAILABILITY REPORTS ====================

export interface RoomAvailabilityFilters {
  checkInDate: string;
  checkOutDate: string;
  roomTypeId?: string;
  capacity?: number;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface AvailableRoom {
  roomId: string;
  roomNumber: string;
  floor: number;
  code: string;
  status: string;
  roomType: {
    id: string;
    name: string;
    capacity: number;
    totalBed: number;
  };
  pricePerNight: number;
  totalPrice: number;
  numberOfNights: number;
}

export interface RoomAvailabilityResponse {
  checkInDate: string;
  checkOutDate: string;
  totalAvailable: number;
  totalOccupied: number;
  totalReserved: number;
  totalRooms: number;
  availableRooms: AvailableRoom[];
}

export interface OccupancyForecast {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number;
}

export interface OccupancyForecastResponse {
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
  totalRooms: number;
  averageOccupancyRate: number;
  averageOccupiedRooms: number;
  forecast: OccupancyForecast[];
}

// ==================== CUSTOMER REPORTS ====================

export interface CustomerStayHistoryFilters {
  fromDate?: string;
  toDate?: string;
  rankId?: string;
  minStays?: number;
  minTotalSpent?: number;
  sortBy?: 'totalSpent' | 'totalStays' | 'lastVisit';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CustomerStayHistory {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  rank: {
    id: string;
    name: string;
    minSpending: number;
  } | null;
  totalStays: number;
  totalSpent: number;
  lastVisitDate?: string;
  firstVisitDate?: string;
  averageSpendPerStay: number;
}

export interface CustomerStayHistoryResponse {
  customers: CustomerStayHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FirstTimeGuest {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  firstCheckInDate: string;
  bookingCode: string;
  rank: {
    id: string;
    name: string;
  } | null;
}

export interface FirstTimeGuestsResponse {
  fromDate: string;
  toDate: string;
  firstTimeGuests: FirstTimeGuest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerLifetimeValue {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  rank: {
    id: string;
    name: string;
  } | null;
  totalSpent: number;
  totalStays: number;
  averageSpendPerStay: number;
  firstVisit?: string;
  lastVisit?: string;
  daysSinceLastVisit: number;
  frequency: number;
  clvScore: number;
}

export interface CustomerLifetimeValueResponse {
  topCustomersByValue: CustomerLifetimeValue[];
  totalCustomers: number;
  averageCLV: number;
}

export interface CustomerRankDistribution {
  rankId: string;
  rankName: string;
  minSpending: number;
  customerCount: number;
  percentage: number;
  totalRevenue: number;
  averageRevenuePerCustomer: number;
}

export interface CustomerRankDistributionResponse {
  totalCustomers: number;
  distribution: CustomerRankDistribution[];
}

// ==================== EMPLOYEE REPORTS ====================

export interface EmployeePerformanceFilters {
  employeeId?: string;
  fromDate: string;
  toDate: string;
  sortBy?: 'totalBookings' | 'totalRevenue' | 'totalTransactions';
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeBookingPerformance {
  employeeId: string;
  name: string;
  username: string;
  role: string;
  totalBookingsProcessed: number;
  totalBookingsCreated: number;
  totalCheckIns: number;
  totalCheckOuts: number;
  totalTransactions: number;
  totalRevenueProcessed: number;
  averageTransactionValue: number;
}

export interface EmployeeBookingPerformanceResponse {
  fromDate: string;
  toDate: string;
  employees: EmployeeBookingPerformance[];
  summary: {
    totalEmployees: number;
    totalBookingsProcessed: number;
    totalRevenueProcessed: number;
    totalCheckIns: number;
    totalCheckOuts: number;
  };
}

export interface TopService {
  serviceName: string;
  count: number;
  totalRevenue: number;
}

export interface EmployeeServicePerformance {
  employeeId: string;
  name: string;
  username: string;
  role: string;
  totalServicesProvided: number;
  totalServiceRevenue: number;
  totalServicesPaid: number;
  averageServiceValue: number;
  topServices: TopService[];
}

export interface EmployeeServicePerformanceResponse {
  fromDate: string;
  toDate: string;
  employees: EmployeeServicePerformance[];
  summary: {
    totalEmployees: number;
    totalServicesProvided: number;
    totalServiceRevenue: number;
  };
}

export interface EmployeeActivitySummary {
  employeeId: string;
  name: string;
  username: string;
  role: string;
  totalActivities: number;
  activityBreakdown: Record<string, number>;
}

export interface EmployeeActivitySummaryResponse {
  fromDate: string;
  toDate: string;
  totalActivities: number;
  employees: EmployeeActivitySummary[];
  activityTypeSummary: Array<{
    type: string;
    count: number;
  }>;
}

// ==================== SERVICE REPORTS ====================

export interface ServiceUsageStatisticsFilters {
  fromDate: string;
  toDate: string;
  serviceId?: string;
  status?: string;
}

export interface ServiceStatistics {
  serviceId: string;
  serviceName: string;
  unit: string;
  basePrice: number;
  totalUsageCount: number;
  totalQuantity: number;
  totalRevenue: number;
  totalPaid: number;
  averagePrice: number;
  averageQuantity: number;
  popularityRank: number;
  statusBreakdown: {
    PENDING: number;
    TRANSFERRED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

export interface ServiceUsageStatisticsResponse {
  fromDate: string;
  toDate: string;
  services: ServiceStatistics[];
  summary: {
    totalServices: number;
    totalServiceCount: number;
    totalServiceRevenue: number;
    averageRevenuePerService: number;
  };
}

export interface TopServiceByRevenue {
  rank: number;
  serviceId: string;
  serviceName: string;
  totalUsageCount: number;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
  percentageOfTotal: number;
}

export interface TopServicesByRevenueResponse {
  fromDate: string;
  toDate: string;
  topServices: TopServiceByRevenue[];
  totalRevenue: number;
}

export interface ServiceTrendPeriod {
  period: string;
  date: string;
  totalUsageCount: number;
  totalQuantity: number;
  totalRevenue: number;
  growthRate: number | null;
  services: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    quantity: number;
    revenue: number;
  }>;
}

export interface ServicePerformanceTrendResponse {
  fromDate: string;
  toDate: string;
  groupBy: 'day' | 'week' | 'month';
  trend: ServiceTrendPeriod[];
}

// ==================== REVENUE REPORTS ====================

export interface RevenueSummaryFilters {
  fromDate: string;
  toDate: string;
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface RevenueBreakdown {
  date: string;
  period: string;
  revenue: number;
  bookings: number;
}

export interface RevenueSummaryResponse {
  period: {
    fromDate: string;
    toDate: string;
    groupBy: string;
  };
  summary: {
    totalRevenue: number;
    roomRevenue: number;
    serviceRevenue: number;
    totalBookings: number;
    totalRoomNights: number;
    occupancyRate: number;
    averageDailyRate: number;
    revenuePerAvailableRoom: number;
  };
  breakdown: RevenueBreakdown[];
}

export interface RevenueByRoomType {
  roomTypeId: string;
  roomTypeName: string;
  capacity: number;
  basePrice: number;
  totalBookings: number;
  totalRoomNights: number;
  totalRevenue: number;
  averageRevenue: number;
  averageRevenuePerNight: number;
  percentageOfTotal: number;
}

export interface RevenueByRoomTypeResponse {
  fromDate: string;
  toDate: string;
  roomTypes: RevenueByRoomType[];
  summary: {
    totalRoomTypes: number;
    totalRevenue: number;
    totalBookings: number;
  };
}

export interface PaymentMethodDistribution {
  method: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  percentageByAmount: number;
  percentageByCount: number;
}

export interface PaymentMethodDistributionResponse {
  fromDate: string;
  toDate: string;
  distribution: PaymentMethodDistribution[];
  summary: {
    totalTransactions: number;
    totalAmount: number;
  };
}

export interface PromotionEffectiveness {
  promotionId: string;
  promotionCode: string;
  description: string | null;
  type: string;
  value: number;
  timesUsed: number;
  totalDiscountGiven: number;
  totalRevenueInfluenced: number;
  bookingsInfluenced: number;
  averageDiscountPerUse: number;
  roi: number;
}

export interface PromotionEffectivenessResponse {
  fromDate: string;
  toDate: string;
  promotions: PromotionEffectiveness[];
  summary: {
    totalPromotionsUsed: number;
    totalDiscountGiven: number;
    totalRevenueInfluenced: number;
    overallROI: number;
  };
}
