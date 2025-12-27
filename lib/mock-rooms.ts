import { Room, RoomType } from "@/lib/types/room";

// Mock Room Types
export const mockRoomTypes: RoomType[] = [
  {
    roomTypeID: "STD",
    roomTypeName: "Standard",
    price: 500000,
    capacity: 2,
    amenities: ["WiFi", "Tivi", "Điều hòa", "Tủ lạnh"],
  },
  {
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    price: 800000,
    capacity: 2,
    amenities: ["WiFi", "Tivi", "Điều hòa", "Tủ lạnh", "Minibar", "Ban công"],
  },
  {
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    price: 1200000,
    capacity: 4,
    amenities: [
      "WiFi",
      "Tivi",
      "Điều hòa",
      "Tủ lạnh",
      "Minibar",
      "Ban công",
      "Bồn tắm",
      "Phòng khách riêng",
    ],
  },
  {
    roomTypeID: "FAM",
    roomTypeName: "Family",
    price: 1500000,
    capacity: 6,
    amenities: [
      "WiFi",
      "Tivi",
      "Điều hòa",
      "Tủ lạnh",
      "Minibar",
      "Bếp nhỏ",
      "2 Phòng ngủ",
    ],
  },
];

// Mock Rooms
export const mockRooms: Room[] = [
  // Floor 1 - Standard Rooms
  {
    roomID: "101",
    roomName: "Phòng 101",
    roomTypeID: "STD",
    roomType: mockRoomTypes[0],
    roomStatus: "Sẵn sàng",
    floor: 1,
  },
  {
    roomID: "102",
    roomName: "Phòng 102",
    roomTypeID: "STD",
    roomType: mockRoomTypes[0],
    roomStatus: "Đang thuê",
    floor: 1,
    guestName: "Nguyễn Văn An",
    folioId: "F001",
  },
  {
    roomID: "103",
    roomName: "Phòng 103",
    roomTypeID: "STD",
    roomType: mockRoomTypes[0],
    roomStatus: "Bẩn",
    floor: 1,
  },
  {
    roomID: "104",
    roomName: "Phòng 104",
    roomTypeID: "STD",
    roomType: mockRoomTypes[0],
    roomStatus: "Đã đặt",
    floor: 1,
  },
  {
    roomID: "105",
    roomName: "Phòng 105",
    roomTypeID: "DLX",
    roomType: mockRoomTypes[1],
    roomStatus: "Bảo trì",
    floor: 1,
  },

  // Floor 2 - Deluxe Rooms
  {
    roomID: "201",
    roomName: "Phòng 201",
    roomTypeID: "DLX",
    roomType: mockRoomTypes[1],
    roomStatus: "Đang thuê",
    floor: 2,
    guestName: "Trần Thị Bình",
    folioId: "F002",
  },
  {
    roomID: "202",
    roomName: "Phòng 202",
    roomTypeID: "DLX",
    roomType: mockRoomTypes[1],
    roomStatus: "Sẵn sàng",
    floor: 2,
  },
  {
    roomID: "203",
    roomName: "Phòng 203",
    roomTypeID: "DLX",
    roomType: mockRoomTypes[1],
    roomStatus: "Đang thuê",
    floor: 2,
    guestName: "Lê Minh Cường",
    folioId: "F003",
  },
  {
    roomID: "204",
    roomName: "Phòng 204",
    roomTypeID: "DLX",
    roomType: mockRoomTypes[1],
    roomStatus: "Đã đặt",
    floor: 2,
  },
  {
    roomID: "205",
    roomName: "Phòng 205",
    roomTypeID: "DLX",
    roomType: mockRoomTypes[1],
    roomStatus: "Bẩn",
    floor: 2,
  },

  // Floor 3 - Suite Rooms
  {
    roomID: "301",
    roomName: "Phòng 301",
    roomTypeID: "SUT",
    roomType: mockRoomTypes[2],
    roomStatus: "Đang thuê",
    floor: 3,
    guestName: "Phạm Thị Dung",
    folioId: "F004",
  },
  {
    roomID: "302",
    roomName: "Phòng 302",
    roomTypeID: "SUT",
    roomType: mockRoomTypes[2],
    roomStatus: "Sẵn sàng",
    floor: 3,
  },
  {
    roomID: "303",
    roomName: "Phòng 303",
    roomTypeID: "SUT",
    roomType: mockRoomTypes[2],
    roomStatus: "Sẵn sàng",
    floor: 3,
  },
  {
    roomID: "304",
    roomName: "Phòng 304",
    roomTypeID: "FAM",
    roomType: mockRoomTypes[3],
    roomStatus: "Đang thuê",
    floor: 3,
    guestName: "Hoàng Văn Em",
    folioId: "F005",
  },
  {
    roomID: "305",
    roomName: "Phòng 305",
    roomTypeID: "FAM",
    roomType: mockRoomTypes[3],
    roomStatus: "Sẵn sàng",
    floor: 3,
  },

  // Floor 4
  {
    roomID: "401",
    roomName: "Phòng 401",
    roomTypeID: "SUT",
    roomType: mockRoomTypes[2],
    roomStatus: "Sẵn sàng",
    floor: 4,
  },
  {
    roomID: "402",
    roomName: "Phòng 402",
    roomTypeID: "SUT",
    roomType: mockRoomTypes[2],
    roomStatus: "Đang thuê",
    floor: 4,
    guestName: "Vũ Thị Giang",
    folioId: "F006",
  },
  {
    roomID: "403",
    roomName: "Phòng 403",
    roomTypeID: "FAM",
    roomType: mockRoomTypes[3],
    roomStatus: "Đã đặt",
    floor: 4,
  },
  {
    roomID: "404",
    roomName: "Phòng 404",
    roomTypeID: "FAM",
    roomType: mockRoomTypes[3],
    roomStatus: "Bảo trì",
    floor: 4,
  },
  {
    roomID: "405",
    roomName: "Phòng 405",
    roomTypeID: "FAM",
    roomType: mockRoomTypes[3],
    roomStatus: "Bẩn",
    floor: 4,
  },

  // Floor 5 - Testing Housekeeping Workflow
  {
    roomID: "501",
    roomName: "Phòng 501",
    roomTypeID: "STD",
    roomType: mockRoomTypes[0],
    roomStatus: "Đang dọn",
    floor: 5,
  },
  {
    roomID: "502",
    roomName: "Phòng 502",
    roomTypeID: "STD",
    roomType: mockRoomTypes[0],
    roomStatus: "Đang kiểm tra",
    floor: 5,
  },
  {
    roomID: "503",
    roomName: "Phòng 503",
    roomTypeID: "DLX",
    roomType: mockRoomTypes[1],
    roomStatus: "Bẩn",
    floor: 5,
  },
  {
    roomID: "504",
    roomName: "Phòng 504",
    roomTypeID: "DLX",
    roomType: mockRoomTypes[1],
    roomStatus: "Đang dọn",
    floor: 5,
  },
];

// Helper function to get room statistics
export const getRoomStatistics = (rooms: Room[]) => {
  const total = rooms.length;
  const available = rooms.filter((r) => r.roomStatus === "Sẵn sàng").length;
  const occupied = rooms.filter((r) => r.roomStatus === "Đang thuê").length;
  const dirty = rooms.filter((r) => r.roomStatus === "Bẩn").length;
  const cleaning = rooms.filter((r) => r.roomStatus === "Đang dọn").length;
  const inspecting = rooms.filter(
    (r) => r.roomStatus === "Đang kiểm tra"
  ).length;
  const maintenance = rooms.filter((r) => r.roomStatus === "Bảo trì").length;
  const reserved = rooms.filter((r) => r.roomStatus === "Đã đặt").length;

  return {
    total,
    available,
    occupied,
    dirty,
    cleaning,
    inspecting,
    maintenance,
    reserved,
    occupancyRate: Math.round((occupied / total) * 100),
  };
};

// Helper function to get unique floors
export const getUniqueFloors = (rooms: Room[]): number[] => {
  return Array.from(new Set(rooms.map((room) => room.floor))).sort(
    (a, b) => a - b
  );
};

// Helper function to get unique room types
export const getUniqueRoomTypes = (rooms: Room[]): RoomType[] => {
  const uniqueTypes = new Map<string, RoomType>();
  rooms.forEach((room) => {
    if (!uniqueTypes.has(room.roomTypeID)) {
      uniqueTypes.set(room.roomTypeID, room.roomType);
    }
  });
  return Array.from(uniqueTypes.values());
};

// Search available rooms by date range and optional room type filter
export const searchAvailableRooms = (
  checkInDate: string,
  checkOutDate: string,
  roomTypeFilter?: string
): Room[] => {
  // Filter rooms that are available (status "Trống" or "Sẵn sàng")
  let availableRooms = mockRooms.filter((room) => {
    const isAvailable = room.roomStatus === "Trống" || room.roomStatus === "Sẵn sàng";
    return isAvailable;
  });

  // Apply room type filter if specified
  if (roomTypeFilter && roomTypeFilter !== "Tất cả") {
    availableRooms = availableRooms.filter(
      (room) => room.roomTypeID === roomTypeFilter
    );
  }

  // In real app, would check against reservations database for date conflicts
  // For now, just return filtered available rooms

  return availableRooms;
};

