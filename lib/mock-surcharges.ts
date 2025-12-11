import { SurchargeItem } from "@/lib/types/surcharge";

// Mock Surcharge Items
export const mockSurchargeItems: SurchargeItem[] = [
  {
    surchargeID: "SUR001",
    surchargeName: "Check-in sớm",
    price: 200000,
    description: "Phụ thu check-in trước 14:00",
    isActive: true,
    isOpenPrice: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    surchargeID: "SUR002",
    surchargeName: "Check-out muộn",
    price: 200000,
    description: "Phụ thu check-out sau 12:00",
    isActive: true,
    isOpenPrice: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    surchargeID: "SUR003",
    surchargeName: "Người thêm",
    price: 150000,
    description: "Phụ thu thêm người ở (người/đêm)",
    isActive: true,
    isOpenPrice: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    surchargeID: "SUR004",
    surchargeName: "Thú cưng",
    price: 100000,
    description: "Phụ thu mang thú cưng (con/đêm)",
    isActive: true,
    isOpenPrice: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Helper functions
export function getSurchargeById(id: string): SurchargeItem | undefined {
  return mockSurchargeItems.find((item) => item.surchargeID === id);
}

export function getActiveSurcharges(): SurchargeItem[] {
  return mockSurchargeItems.filter((item) => item.isActive);
}
