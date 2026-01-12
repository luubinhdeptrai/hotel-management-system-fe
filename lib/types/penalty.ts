// Penalty (Phí phạt) Type Definitions
// Types for penalty usages: penalties applied to bookings/rooms

export interface PenaltyItem {
  // ServiceUsage fields
  id: string;
  bookingId?: string;
  bookingRoomId?: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  customPrice?: number; // Custom price for penalty
  totalPrice: number;
  note: string; // Reason for penalty
  status: 'PENDING' | 'TRANSFERRED' | 'COMPLETED';
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PenaltyFormData {
  bookingId?: string;
  bookingRoomId?: string;
  customPrice: number;
  quantity: number;
  reason: string; // Reason for penalty
}

export interface PenaltyFilterOptions {
  searchTerm?: string;
  status?: 'PENDING' | 'TRANSFERRED' | 'COMPLETED' | 'all';
  bookingId?: string;
}
