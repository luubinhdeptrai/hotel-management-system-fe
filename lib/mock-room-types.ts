import { RoomType } from "@/lib/types/room";

// Mock Room Types Data
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
  {
    roomTypeID: "PRE",
    roomTypeName: "Presidential Suite",
    price: 3000000,
    capacity: 8,
    amenities: [
      "WiFi",
      "Tivi 4K",
      "Điều hòa thông minh",
      "Tủ lạnh mini",
      "Minibar cao cấp",
      "Ban công rộng",
      "Bồn tắm Jacuzzi",
      "Phòng khách sang trọng",
      "Phòng ăn riêng",
      "Bếp đầy đủ",
      "3 Phòng ngủ",
    ],
  },
];

// Mock functions for CRUD operations
export async function getRoomTypes(): Promise<RoomType[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockRoomTypes];
}

export async function createRoomType(
  roomType: Omit<RoomType, "roomTypeID">
): Promise<RoomType> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Generate unique code
  const code = roomType.roomTypeName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const newRoomType: RoomType = {
    roomTypeID: code,
    ...roomType,
  };

  mockRoomTypes.push(newRoomType);
  return newRoomType;
}

export async function updateRoomType(
  roomTypeID: string,
  updates: Partial<RoomType>
): Promise<RoomType> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockRoomTypes.findIndex((rt) => rt.roomTypeID === roomTypeID);
  if (index === -1) {
    throw new Error("Không tìm thấy loại phòng");
  }

  mockRoomTypes[index] = {
    ...mockRoomTypes[index],
    ...updates,
    roomTypeID, // Keep original code
  };

  return mockRoomTypes[index];
}

export async function deleteRoomType(roomTypeID: string): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockRoomTypes.findIndex((rt) => rt.roomTypeID === roomTypeID);
  if (index === -1) {
    throw new Error("Không tìm thấy loại phòng");
  }

  // In a real app, check if room type is in use
  // For now, just remove it (soft delete in production)
  mockRoomTypes.splice(index, 1);
}

export function checkRoomTypeInUse(roomTypeID: string): boolean {
  // In real app, query PHONG table
  // For demo, randomly return true/false based on code
  const inUseCodes = ["STD", "DLX", "SUT"];
  return inUseCodes.includes(roomTypeID);
}
