import { PenaltyItem } from "@/lib/types/penalty";

// Mock Penalty Items
export const mockPenaltyItems: PenaltyItem[] = [
  {
    penaltyID: "PEN001",
    penaltyName: "Hư hỏng thiết bị",
    price: 0,
    description: "Phí phạt hư hỏng thiết bị (nhập giá khi post)",
    isActive: true,
    isOpenPrice: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    penaltyID: "PEN002",
    penaltyName: "Mất khăn tắm",
    price: 150000,
    description: "Phí phạt mất khăn tắm",
    isActive: true,
    isOpenPrice: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    penaltyID: "PEN003",
    penaltyName: "Mất áo choàng tắm",
    price: 300000,
    description: "Phí phạt mất áo choàng tắm",
    isActive: true,
    isOpenPrice: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    penaltyID: "PEN004",
    penaltyName: "Hút thuốc trong phòng",
    price: 500000,
    description: "Phí phạt vi phạm quy định cấm hút thuốc",
    isActive: true,
    isOpenPrice: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    penaltyID: "PEN005",
    penaltyName: "Bồi thường khác",
    price: 0,
    description: "Bồi thường thiệt hại khác (nhập giá khi post)",
    isActive: true,
    isOpenPrice: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Helper functions
export function getPenaltyById(id: string): PenaltyItem | undefined {
  return mockPenaltyItems.find((item) => item.penaltyID === id);
}

export function getActivePenalties(): PenaltyItem[] {
  return mockPenaltyItems.filter((item) => item.isActive);
}
