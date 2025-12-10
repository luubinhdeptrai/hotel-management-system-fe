import { Arrival } from "@/components/dashboard/arrivals-table";
import { Departure } from "@/components/dashboard/departures-table";

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  dirtyRooms: number;
  todayRevenue: number;
  currentGuests: number;
}

export interface RoomStatusData {
  status: string;
  count: number;
  color: string;
}

// Mock dashboard statistics
export const getMockDashboardStats = (): DashboardStats => {
  return {
    totalRooms: 20,
    availableRooms: 7, // Only READY rooms
    dirtyRooms: 3, // Rooms needing cleaning (alert for Housekeeping)
    todayRevenue: 45_500_000,
    currentGuests: 14, // Current guests in occupied rooms
  };
};

// Mock room status data for the chart
export const getMockRoomStatusData = (): RoomStatusData[] => {
  return [
    {
      status: "Sẵn sàng",
      count: 7,
      color: "bg-success-600",
    },
    {
      status: "Đang thuê",
      count: 6,
      color: "bg-error-600",
    },
    {
      status: "Bẩn",
      count: 3,
      color: "bg-warning-600",
    },
    {
      status: "Bảo trì",
      count: 2,
      color: "bg-gray-600",
    },
    {
      status: "Đã đặt",
      count: 3,
      color: "bg-info-600",
    },
  ];
};

// Mock today's arrivals
export const getMockArrivals = (): Arrival[] => {
  const now = new Date();

  return [
    {
      id: "1",
      guestName: "Nguyễn Văn An",
      roomNumber: "101",
      roomType: "Deluxe",
      checkInTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        14,
        0,
        0
      ),
      numberOfGuests: 2,
    },
    {
      id: "2",
      guestName: "Trần Thị Bình",
      roomNumber: "205",
      roomType: "Suite",
      checkInTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        15,
        30,
        0
      ),
      numberOfGuests: 3,
    },
    {
      id: "3",
      guestName: "Lê Minh Cường",
      roomNumber: "302",
      roomType: "Standard",
      checkInTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        16,
        0,
        0
      ),
      numberOfGuests: 1,
    },
    {
      id: "4",
      guestName: "Phạm Thị Dung",
      roomNumber: "408",
      roomType: "Deluxe",
      checkInTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        17,
        15,
        0
      ),
      numberOfGuests: 2,
    },
    {
      id: "5",
      guestName: "Hoàng Văn Em",
      roomNumber: "503",
      roomType: "Suite",
      checkInTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        18,
        0,
        0
      ),
      numberOfGuests: 4,
    },
  ];
};

// Mock today's departures
export const getMockDepartures = (): Departure[] => {
  const now = new Date();

  return [
    {
      id: "1",
      guestName: "Vũ Thị Giang",
      roomNumber: "103",
      roomType: "Standard",
      checkOutTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        10,
        0,
        0
      ),
      totalAmount: 1_500_000,
    },
    {
      id: "2",
      guestName: "Đặng Văn Hải",
      roomNumber: "207",
      roomType: "Deluxe",
      checkOutTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        11,
        30,
        0
      ),
      totalAmount: 3_200_000,
    },
    {
      id: "3",
      guestName: "Bùi Thị Lan",
      roomNumber: "310",
      roomType: "Suite",
      checkOutTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        11,
        45,
        0
      ),
      totalAmount: 5_800_000,
    },
    {
      id: "4",
      guestName: "Ngô Văn Khoa",
      roomNumber: "405",
      roomType: "Deluxe",
      checkOutTime: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        0,
        0
      ),
      totalAmount: 2_700_000,
    },
  ];
};
