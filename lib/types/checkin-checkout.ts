// Check-in/Check-out Status Types
export type RentalStatus = "Đang thuê" | "Đã thanh toán" | "Quá hạn";

// Service/Penalty Types
export interface Service {
  serviceID: string;
  serviceName: string;
  category: string;
  price: number;
}

export interface Penalty {
  penaltyID: string;
  description: string;
  amount: number;
}

// Rental Receipt (Phiếu thuê phòng)
export interface RentalReceipt {
  receiptID: string;
  reservationID: string;
  roomID: string;
  roomName: string;
  roomTypeName: string;
  customerName: string;
  phoneNumber: string;
  identityCard: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  pricePerNight: number;
  totalNights: number;
  roomTotal: number;
  status: RentalStatus;
}

// Service/Penalty Detail for Check-out
export interface ServiceDetail {
  detailID: string;
  serviceID: string;
  serviceName: string;
  quantity: number;
  price: number;
  total: number;
  dateUsed: string;
}

export interface PenaltyDetail {
  penaltyID: string;
  description: string;
  amount: number;
  dateIssued: string;
}

// Check-out Summary
export interface CheckoutSummary {
  receiptID: string;
  receipt: RentalReceipt;
  services: ServiceDetail[];
  penalties: PenaltyDetail[];
  roomTotal: number;
  servicesTotal: number;
  penaltiesTotal: number;
  grandTotal: number;
}

// Check-in Form Data
export interface CheckInFormData {
  reservationID: string;
  roomID: string;
  numberOfGuests: number;
  notes?: string;
}

// Walk-in (Guest without reservation) Form Data
export interface WalkInFormData {
  customerName: string;
  phoneNumber: string;
  identityCard: string;
  email?: string;
  address?: string;
  roomID: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  notes?: string;
}

// Add Service Form Data
export interface AddServiceFormData {
  serviceID: string;
  quantity: number;
  notes?: string;
}

// Add Penalty Form Data
export interface AddPenaltyFormData {
  description: string;
  amount: number;
  notes?: string;
}
