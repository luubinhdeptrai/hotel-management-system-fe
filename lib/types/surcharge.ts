// Surcharge (Phụ thu) Type Definitions
// Types for surcharge usages: surcharge applied to bookings/rooms

export interface SurchargeItem {
  // ServiceUsage fields
  id: string;
  bookingId?: string;
  bookingRoomId?: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  customPrice?: number; // Custom price for surcharge
  totalPrice: number;
  note: string; // Reason for surcharge
  status: 'PENDING' | 'TRANSFERRED' | 'COMPLETED';
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurchargeFormData {
  bookingId?: string;
  bookingRoomId?: string;
  customPrice: number;
  quantity: number;
  reason: string; // Reason for surcharge
}

export interface SurchargeFilterOptions {
  searchTerm?: string;
  status?: 'PENDING' | 'TRANSFERRED' | 'COMPLETED' | 'all';
  bookingId?: string;
}
