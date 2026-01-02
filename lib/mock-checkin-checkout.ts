import type {
  RentalReceipt,
  CheckoutSummary,
  Service,
} from "@/lib/types/checkin-checkout";
import type { Reservation } from "@/lib/types/reservation";

// Mock Services
export const mockServices: Service[] = [
  {
    serviceID: "SV001",
    serviceName: "Nước suối",
    category: "Minibar",
    price: 10000,
  },
  {
    serviceID: "SV002",
    serviceName: "Coca Cola",
    category: "Minibar",
    price: 15000,
  },
  {
    serviceID: "SV003",
    serviceName: "Giặt ủi (1kg)",
    category: "Giặt ủi",
    price: 50000,
  },
  {
    serviceID: "SV004",
    serviceName: "Bữa sáng",
    category: "Ăn uống",
    price: 150000,
  },
  {
    serviceID: "SV005",
    serviceName: "Massage 60 phút",
    category: "Spa",
    price: 500000,
  },
  {
    serviceID: "SV006",
    serviceName: "Đưa đón sân bay",
    category: "Vận chuyển",
    price: 300000,
  },
];

// Mock Reservations for Check-in
export const mockPendingReservations: Reservation[] = [
  {
    reservationID: "RES001",
    customerID: "CUS001",
    customer: {
      customerID: "CUS001",
      customerName: "Nguyễn Văn An",
      phoneNumber: "0901234567",
      email: "nguyenvanan@email.com",
      identityCard: "079089001234",
      address: "123 Lê Lợi, Quận 1, TP.HCM",
    },
    reservationDate: "2025-11-15",
    totalRooms: 1,
    totalAmount: 1500000,
    depositAmount: 500000,
    notes: "Khách yêu cầu phòng tầng cao",
    status: "Đã đặt",
    details: [
      {
        detailID: "DET001",
        reservationID: "RES001",
        roomID: "R101",
        roomName: "Phòng 101",
        roomTypeID: "LP002",
        roomTypeName: "Deluxe",
        checkInDate: "2025-11-18",
        checkOutDate: "2025-11-20",
        status: "Đã đặt",
        numberOfGuests: 2,
        pricePerNight: 750000,
      },
    ],
  },
  {
    reservationID: "RES002",
    customerID: "CUS002",
    customer: {
      customerID: "CUS002",
      customerName: "Trần Thị Bình",
      phoneNumber: "0912345678",
      email: "tranbình@email.com",
      identityCard: "079089005678",
      address: "456 Nguyễn Huệ, Quận 1, TP.HCM",
    },
    reservationDate: "2025-11-16",
    totalRooms: 2,
    totalAmount: 3000000,
    depositAmount: 1000000,
    notes: "Khách VIP, cần chuẩn bị hoa quả trong phòng",
    status: "Đã đặt",
    details: [
      {
        detailID: "DET002",
        reservationID: "RES002",
        roomID: "R201",
        roomName: "Phòng 201",
        roomTypeID: "LP003",
        roomTypeName: "Suite",
        checkInDate: "2025-11-18",
        checkOutDate: "2025-11-21",
        status: "Đã đặt",
        numberOfGuests: 2,
        pricePerNight: 1000000,
      },
      {
        detailID: "DET003",
        reservationID: "RES002",
        roomID: "R202",
        roomName: "Phòng 202",
        roomTypeID: "LP003",
        roomTypeName: "Suite",
        checkInDate: "2025-11-18",
        checkOutDate: "2025-11-21",
        status: "Đã đặt",
        numberOfGuests: 2,
        pricePerNight: 1000000,
      },
    ],
  },
  {
    reservationID: "RES003",
    customerID: "CUS003",
    customer: {
      customerID: "CUS003",
      customerName: "Lê Hoàng Cường",
      phoneNumber: "0923456789",
      email: "lehoangcuong@email.com",
      identityCard: "079089009012",
      address: "789 Điện Biên Phủ, Quận 3, TP.HCM",
    },
    reservationDate: "2025-11-17",
    totalRooms: 1,
    totalAmount: 1200000,
    depositAmount: 400000,
    notes: "",
    status: "Đã đặt",
    details: [
      {
        detailID: "DET004",
        reservationID: "RES003",
        roomID: "R102",
        roomName: "Phòng 102",
        roomTypeID: "LP002",
        roomTypeName: "Deluxe",
        checkInDate: "2025-11-18",
        checkOutDate: "2025-11-20",
        status: "Đã đặt",
        numberOfGuests: 2,
        pricePerNight: 600000,
      },
    ],
  },
];

// Mock Active Rentals for Check-out
export const mockActiveRentals: RentalReceipt[] = [
  {
    receiptID: "REC001",
    reservationID: "RES100",
    roomID: "R103",
    roomName: "Phòng 103",
    roomTypeName: "Standard",
    customerName: "Phạm Minh Đức",
    phoneNumber: "0934567890",
    identityCard: "079089003456",
    checkInDate: "2025-11-16",
    checkOutDate: "2025-11-18",
    numberOfGuests: 2,
    pricePerNight: 500000,
    totalNights: 2,
    roomTotal: 1000000,
    status: "Đang thuê",
  },
  {
    receiptID: "REC002",
    reservationID: "RES101",
    roomID: "R104",
    roomName: "Phòng 104",
    roomTypeName: "Deluxe",
    customerName: "Võ Thị Lan",
    phoneNumber: "0945678901",
    identityCard: "079089007890",
    checkInDate: "2025-11-15",
    checkOutDate: "2025-11-18",
    numberOfGuests: 3,
    pricePerNight: 750000,
    totalNights: 3,
    roomTotal: 2250000,
    status: "Đang thuê",
  },
  {
    receiptID: "REC003",
    reservationID: "RES102",
    roomID: "R203",
    roomName: "Phòng 203",
    roomTypeName: "Suite",
    customerName: "Đặng Văn Hùng",
    phoneNumber: "0956789012",
    identityCard: "079089001122",
    checkInDate: "2025-11-14",
    checkOutDate: "2025-11-18",
    numberOfGuests: 2,
    pricePerNight: 1200000,
    totalNights: 4,
    roomTotal: 4800000,
    status: "Đang thuê",
  },
];

// Mock Checkout Summary with Services and Penalties
export const mockCheckoutSummary: CheckoutSummary[] = [
  {
    receiptID: "REC001",
    receipt: mockActiveRentals[0],
    services: [
      {
        detailID: "SD001",
        serviceID: "SV001",
        serviceName: "Nước suối",
        quantity: 4,
        price: 10000,
        total: 40000,
        dateUsed: "2025-11-17",
      },
      {
        detailID: "SD002",
        serviceID: "SV004",
        serviceName: "Bữa sáng",
        quantity: 2,
        price: 150000,
        total: 300000,
        dateUsed: "2025-11-17",
      },
    ],
    penalties: [],
    surcharges: [],
    roomTotal: 1000000,
    servicesTotal: 340000,
    penaltiesTotal: 0,
    surchargesTotal: 0,
    grandTotal: 1340000,
  },
  {
    receiptID: "REC002",
    receipt: mockActiveRentals[1],
    services: [
      {
        detailID: "SD003",
        serviceID: "SV003",
        serviceName: "Giặt ủi (1kg)",
        quantity: 2,
        price: 50000,
        total: 100000,
        dateUsed: "2025-11-16",
      },
      {
        detailID: "SD004",
        serviceID: "SV005",
        serviceName: "Massage 60 phút",
        quantity: 1,
        price: 500000,
        total: 500000,
        dateUsed: "2025-11-17",
      },
      {
        detailID: "SD005",
        serviceID: "SV004",
        serviceName: "Bữa sáng",
        quantity: 6,
        price: 150000,
        total: 900000,
        dateUsed: "2025-11-16",
      },
    ],
    penalties: [
      {
        penaltyID: "PEN001",
        description: "Làm vỡ bình hoa trang trí",
        amount: 200000,
        dateIssued: "2025-11-17",
      },
    ],
    surcharges: [
      {
        surchargeID: "SC001",
        surchargeName: "Phụ thu cuối tuần",
        rate: 10,
        amount: 225000,
        description: "Áp dụng cho Thứ 7 & Chủ Nhật",
        dateApplied: "2025-11-16",
      },
    ],
    roomTotal: 2250000,
    servicesTotal: 1500000,
    penaltiesTotal: 200000,
    surchargesTotal: 225000,
    grandTotal: 4175000,
  },
  {
    receiptID: "REC003",
    receipt: mockActiveRentals[2],
    services: [
      {
        detailID: "SD006",
        serviceID: "SV006",
        serviceName: "Đưa đón sân bay",
        quantity: 1,
        price: 300000,
        total: 300000,
        dateUsed: "2025-11-14",
      },
      {
        detailID: "SD007",
        serviceID: "SV004",
        serviceName: "Bữa sáng",
        quantity: 8,
        price: 150000,
        total: 1200000,
        dateUsed: "2025-11-15",
      },
    ],
    penalties: [],
    surcharges: [
      {
        surchargeID: "SC002",
        surchargeName: "Phụ thu ngày lễ",
        rate: 15,
        amount: 720000,
        description: "Tết Nguyên Đán 2025",
        dateApplied: "2025-11-14",
      },
    ],
    roomTotal: 4800000,
    servicesTotal: 1500000,
    penaltiesTotal: 0,
    surchargesTotal: 720000,
    grandTotal: 7020000,
  },
];

// Helper functions
export function searchReservations(query: string): Reservation[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return mockPendingReservations;

  return mockPendingReservations.filter(
    (reservation) =>
      reservation.reservationID.toLowerCase().includes(lowerQuery) ||
      reservation.customer.customerName.toLowerCase().includes(lowerQuery) ||
      reservation.customer.phoneNumber.includes(lowerQuery)
  );
}

export function searchActiveRentals(query: string): RentalReceipt[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return mockActiveRentals;

  return mockActiveRentals.filter(
    (rental) =>
      rental.receiptID.toLowerCase().includes(lowerQuery) ||
      rental.roomName.toLowerCase().includes(lowerQuery) ||
      rental.customerName.toLowerCase().includes(lowerQuery) ||
      rental.phoneNumber.includes(lowerQuery)
  );
}

export function getCheckoutSummary(receiptID: string): CheckoutSummary | null {
  return (
    mockCheckoutSummary.find((summary) => summary.receiptID === receiptID) ||
    null
  );
}

export function getServicesByCategory(): Record<string, Service[]> {
  return mockServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);
}
