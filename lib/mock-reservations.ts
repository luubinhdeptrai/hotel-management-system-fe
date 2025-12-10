import {
  Reservation,
  ReservationDetail,
  ReservationEvent,
  ReservationDetailStatus,
  ReservationHeaderStatus,
} from "@/lib/types/reservation";
import { mockCustomers } from "@/lib/mock-customers";

// Mock Reservation Details with 2-level status
const mockReservationDetails: ReservationDetail[] = [
  {
    detailID: "CTD001",
    reservationID: "DP001",
    roomID: "P101",
    roomName: "Phòng 101",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    checkInDate: "2025-12-12",
    checkOutDate: "2025-12-15",
    detailStatus: "Chờ nhận",
    status: "Đã xác nhận",
    numberOfGuests: 2,
    pricePerNight: 500000,
  },
  {
    detailID: "CTD002",
    reservationID: "DP002",
    roomID: "P201",
    roomName: "Phòng 201",
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    checkInDate: "2025-12-11",
    checkOutDate: "2025-12-14",
    detailStatus: "Chờ nhận",
    status: "Chờ xác nhận",
    numberOfGuests: 2,
    pricePerNight: 800000,
  },
  {
    detailID: "CTD003",
    reservationID: "DP003",
    roomID: "P301",
    roomName: "Phòng 301",
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    checkInDate: "2025-12-13",
    checkOutDate: "2025-12-17",
    detailStatus: "Chờ nhận",
    status: "Đã xác nhận",
    numberOfGuests: 4,
    pricePerNight: 1200000,
  },
  {
    detailID: "CTD004",
    reservationID: "DP004",
    roomID: "P102",
    roomName: "Phòng 102",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    checkInDate: "2025-12-08",
    checkOutDate: "2025-12-10",
    detailStatus: "Đã nhận",
    status: "Đã nhận phòng",
    numberOfGuests: 2,
    pricePerNight: 500000,
  },
  {
    detailID: "CTD005",
    reservationID: "DP005",
    roomID: "P202",
    roomName: "Phòng 202",
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    checkInDate: "2025-12-14",
    checkOutDate: "2025-12-18",
    detailStatus: "Chờ nhận",
    status: "Đã xác nhận",
    numberOfGuests: 3,
    pricePerNight: 800000,
  },
  {
    detailID: "CTD006",
    reservationID: "DP006",
    roomID: "P103",
    roomName: "Phòng 103",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    checkInDate: "2025-12-05",
    checkOutDate: "2025-12-07",
    detailStatus: "Hủy",
    status: "Đã hủy",
    numberOfGuests: 2,
    pricePerNight: 500000,
  },
  {
    detailID: "CTD007",
    reservationID: "DP007",
    roomID: "P302",
    roomName: "Phòng 302",
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    checkInDate: "2025-12-16",
    checkOutDate: "2025-12-20",
    detailStatus: "Chờ nhận",
    status: "Đã xác nhận",
    numberOfGuests: 4,
    pricePerNight: 1200000,
  },
  {
    detailID: "CTD008",
    reservationID: "DP008",
    roomID: "P203",
    roomName: "Phòng 203",
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    checkInDate: "2025-12-18",
    checkOutDate: "2025-12-20",
    status: "Đã đặt",
    numberOfGuests: 2,
    pricePerNight: 800000,
  },
  {
    detailID: "CTD009",
    reservationID: "DP009",
    roomID: "P104",
    roomName: "Phòng 104",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    checkInDate: "2025-12-20",
    checkOutDate: "2025-12-23",
    status: "Đã đặt",
    numberOfGuests: 2,
    pricePerNight: 500000,
  },
  {
    detailID: "CTD010",
    reservationID: "DP010",
    roomID: "P204",
    roomName: "Phòng 204",
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    checkInDate: "2025-12-22",
    checkOutDate: "2025-12-26",
    status: "Đã đặt",
    numberOfGuests: 3,
    pricePerNight: 800000,
  },
  {
    detailID: "CTD011",
    reservationID: "DP011",
    roomID: "P303",
    roomName: "Phòng 303",
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    checkInDate: "2025-12-24",
    checkOutDate: "2025-12-28",
    status: "Đã đặt",
    numberOfGuests: 4,
    pricePerNight: 1200000,
  },
  {
    detailID: "CTD012",
    reservationID: "DP012",
    roomID: "P105",
    roomName: "Phòng 105",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    checkInDate: "2025-12-09",
    checkOutDate: "2025-12-11",
    status: "Đã nhận",
    numberOfGuests: 1,
    pricePerNight: 500000,
  },
  {
    detailID: "CTD013",
    reservationID: "DP013",
    roomID: "P205",
    roomName: "Phòng 205",
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    checkInDate: "2025-12-15",
    checkOutDate: "2025-12-19",
    status: "Đã đặt",
    numberOfGuests: 2,
    pricePerNight: 800000,
  },
  {
    detailID: "CTD014",
    reservationID: "DP014",
    roomID: "P304",
    roomName: "Phòng 304",
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    checkInDate: "2025-12-26",
    checkOutDate: "2025-12-30",
    status: "Đã đặt",
    numberOfGuests: 5,
    pricePerNight: 1200000,
  },
  {
    detailID: "CTD015",
    reservationID: "DP015",
    roomID: "P106",
    roomName: "Phòng 106",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    checkInDate: "2025-12-28",
    checkOutDate: "2026-01-02",
    status: "Đã đặt",
    numberOfGuests: 2,
    pricePerNight: 500000,
  },
];

// Mock Reservations
export const mockReservations: Reservation[] = [
  {
    reservationID: "DP001",
    customerID: "KH001",
    customer: mockCustomers[0],
    reservationDate: "2025-12-05",
    totalRooms: 1,
    totalAmount: 1500000, // 3 nights * 500000
    depositAmount: 500000,
    notes: "Yêu cầu phòng tầng cao",
    status: "Đã đặt",
    details: [mockReservationDetails[0]],
  },
  {
    reservationID: "DP002",
    customerID: "KH002",
    customer: mockCustomers[1],
    reservationDate: "2025-12-04",
    totalRooms: 1,
    totalAmount: 2400000, // 3 nights * 800000
    depositAmount: 800000,
    notes: "Khách VIP, chuẩn bị hoa tươi",
    status: "Đã đặt",
    details: [mockReservationDetails[1]],
  },
  {
    reservationID: "DP003",
    customerID: "KH003",
    customer: mockCustomers[2],
    reservationDate: "2025-12-06",
    totalRooms: 1,
    totalAmount: 4800000, // 4 nights * 1200000
    depositAmount: 1200000,
    notes: "Du lịch gia đình",
    status: "Đã đặt",
    details: [mockReservationDetails[2]],
  },
  {
    reservationID: "DP004",
    customerID: "KH004",
    customer: mockCustomers[3],
    reservationDate: "2025-12-01",
    totalRooms: 1,
    totalAmount: 1000000, // 2 nights * 500000
    depositAmount: 500000,
    notes: "Công tác",
    status: "Đã nhận",
    details: [mockReservationDetails[3]],
  },
  {
    reservationID: "DP005",
    customerID: "KH005",
    customer: mockCustomers[4],
    reservationDate: "2025-12-07",
    totalRooms: 1,
    totalAmount: 3200000, // 4 nights * 800000
    depositAmount: 800000,
    notes: "Kỷ niệm ngày cưới",
    status: "Đã đặt",
    details: [mockReservationDetails[4]],
  },
  {
    reservationID: "DP006",
    customerID: "KH001",
    customer: mockCustomers[0],
    reservationDate: "2025-11-28",
    totalRooms: 1,
    totalAmount: 1000000, // 2 nights * 500000
    depositAmount: 500000,
    notes: "Hủy do thay đổi kế hoạch",
    status: "Đã hủy",
    details: [mockReservationDetails[5]],
  },
  {
    reservationID: "DP007",
    customerID: "KH002",
    customer: mockCustomers[1],
    reservationDate: "2025-12-08",
    totalRooms: 1,
    totalAmount: 4800000, // 4 nights * 1200000
    depositAmount: 1200000,
    notes: "Họp hội nghị",
    status: "Đã đặt",
    details: [mockReservationDetails[6]],
  },
  {
    reservationID: "DP008",
    customerID: "KH003",
    customer: mockCustomers[2],
    reservationDate: "2025-12-09",
    totalRooms: 1,
    totalAmount: 1600000, // 2 nights * 800000
    depositAmount: 500000,
    notes: "Tuần trăng mật",
    status: "Đã đặt",
    details: [mockReservationDetails[7]],
  },
  {
    reservationID: "DP009",
    customerID: "KH004",
    customer: mockCustomers[3],
    reservationDate: "2025-12-10",
    totalRooms: 1,
    totalAmount: 1500000, // 3 nights * 500000
    depositAmount: 500000,
    notes: "Nghỉ dưỡng cuối tuần",
    status: "Đã đặt",
    details: [mockReservationDetails[8]],
  },
  {
    reservationID: "DP010",
    customerID: "KH005",
    customer: mockCustomers[4],
    reservationDate: "2025-12-12",
    totalRooms: 1,
    totalAmount: 3200000, // 4 nights * 800000
    depositAmount: 800000,
    notes: "Khách đoàn",
    status: "Đã đặt",
    details: [mockReservationDetails[9]],
  },
  {
    reservationID: "DP011",
    customerID: "KH001",
    customer: mockCustomers[0],
    reservationDate: "2025-12-15",
    totalRooms: 1,
    totalAmount: 4800000, // 4 nights * 1200000
    depositAmount: 1200000,
    notes: "Kỳ nghỉ lễ Giáng sinh",
    status: "Đã đặt",
    details: [mockReservationDetails[10]],
  },
  {
    reservationID: "DP012",
    customerID: "KH002",
    customer: mockCustomers[1],
    reservationDate: "2025-12-02",
    totalRooms: 1,
    totalAmount: 1000000, // 2 nights * 500000
    depositAmount: 500000,
    notes: "Khách quen",
    status: "Đã nhận",
    details: [mockReservationDetails[11]],
  },
  {
    reservationID: "DP013",
    customerID: "KH003",
    customer: mockCustomers[2],
    reservationDate: "2025-12-08",
    totalRooms: 1,
    totalAmount: 3200000, // 4 nights * 800000
    depositAmount: 800000,
    notes: "Công tác dài ngày",
    status: "Đã đặt",
    details: [mockReservationDetails[12]],
  },
  {
    reservationID: "DP014",
    customerID: "KH004",
    customer: mockCustomers[3],
    reservationDate: "2025-12-18",
    totalRooms: 1,
    totalAmount: 4800000, // 4 nights * 1200000
    depositAmount: 1200000,
    notes: "Kỳ nghỉ lễ",
    status: "Đã đặt",
    details: [mockReservationDetails[13]],
  },
  {
    reservationID: "DP015",
    customerID: "KH005",
    customer: mockCustomers[4],
    reservationDate: "2025-12-20",
    totalRooms: 1,
    totalAmount: 3000000, // 6 nights * 500000
    depositAmount: 1000000,
    notes: "Đón năm mới",
    status: "Đã đặt",
    details: [mockReservationDetails[14]],
  },
];

// Helper function to convert reservations to calendar events
export const convertReservationsToEvents = (
  reservations: Reservation[]
): ReservationEvent[] => {
  const events: ReservationEvent[] = [];

  reservations.forEach((reservation) => {
    reservation.details.forEach((detail) => {
      events.push({
        id: detail.detailID,
        reservationID: reservation.reservationID,
        roomID: detail.roomID,
        roomName: detail.roomName,
        customerName: reservation.customer.customerName,
        start: new Date(detail.checkInDate),
        end: new Date(detail.checkOutDate),
        status: detail.status,
        numberOfGuests: detail.numberOfGuests,
      });
    });
  });

  return events;
};

// Helper function to check room availability (conflict detection - FR-009)
export const checkRoomAvailability = (
  roomID: string,
  checkInDate: string,
  checkOutDate: string,
  excludeReservationID?: string
): boolean => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const conflictingReservations = mockReservations.filter((reservation) => {
    if (
      excludeReservationID &&
      reservation.reservationID === excludeReservationID
    ) {
      return false;
    }

    return reservation.details.some((detail) => {
      if (detail.roomID !== roomID) return false;
      if (detail.status === "Đã hủy" || detail.status === "Không đến")
        return false;

      const existingCheckIn = new Date(detail.checkInDate);
      const existingCheckOut = new Date(detail.checkOutDate);

      // Check for overlap
      return checkIn < existingCheckOut && checkOut > existingCheckIn;
    });
  });

  return conflictingReservations.length === 0;
};

// Helper function to get available rooms for a date range
export const getAvailableRooms = (
  checkInDate: string,
  checkOutDate: string
): string[] => {
  // This would normally query the database
  // For mock purposes, return a simple list
  const allRoomIDs = [
    "P101",
    "P102",
    "P103",
    "P104",
    "P105",
    "P201",
    "P202",
    "P203",
    "P204",
    "P205",
    "P301",
    "P302",
    "P303",
    "P304",
    "P305",
  ];

  return allRoomIDs.filter((roomID) => {
    const isAvailable = checkRoomAvailability(
      roomID,
      checkInDate,
      checkOutDate
    );
    return isAvailable;
  });
};
