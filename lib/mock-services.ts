import {
  ServiceCategory,
  ServiceItem,
} from "@/lib/types/service";

// Mock Service Categories
export const mockServiceCategories: ServiceCategory[] = [
  {
    categoryID: "CAT001",
    categoryName: "Minibar",
    description: "Đồ uống và đồ ăn nhẹ trong phòng",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    categoryID: "CAT002",
    categoryName: "Giặt ủi",
    description: "Dịch vụ giặt là và ủi quần áo",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    categoryID: "CAT003",
    categoryName: "Spa & Massage",
    description: "Dịch vụ chăm sóc sắc đẹp và thư giãn",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    categoryID: "CAT004",
    categoryName: "Ăn uống",
    description: "Dịch vụ phục vụ đồ ăn tại phòng",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    categoryID: "CAT005",
    categoryName: "Thuê xe",
    description: "Dịch vụ thuê xe và đưa đón",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  // NEW: Surcharge category
  {
    categoryID: "CAT006",
    categoryName: "Phụ thu",
    description: "Phí phụ thu (check-in sớm, người thêm, thú cưng...)",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  // NEW: Penalty category
  {
    categoryID: "CAT007",
    categoryName: "Phí phạt",
    description: "Phí phạt hư hỏng, mất đồ, vi phạm quy định",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock Service Items
export const mockServiceItems: ServiceItem[] = [
  // Minibar (serviceGroup: MINIBAR)
  {
    serviceID: "SRV001",
    serviceName: "Nước suối",
    categoryID: "CAT001",
    category: mockServiceCategories[0],
    serviceGroup: "MINIBAR",
    price: 15000,
    unit: "chai",
    description: "Nước khoáng La Vie 500ml",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV002",
    serviceName: "Coca Cola",
    categoryID: "CAT001",
    category: mockServiceCategories[0],
    serviceGroup: "MINIBAR",
    price: 20000,
    unit: "lon",
    description: "Coca Cola 330ml",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV003",
    serviceName: "Trà xanh 0 độ",
    categoryID: "CAT001",
    category: mockServiceCategories[0],
    serviceGroup: "MINIBAR",
    price: 12000,
    unit: "chai",
    description: "Trà xanh không độ 350ml",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV004",
    serviceName: "Snack khoai tây",
    categoryID: "CAT001",
    category: mockServiceCategories[0],
    serviceGroup: "MINIBAR",
    price: 25000,
    unit: "gói",
    description: "Snack khoai tây Lay's",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Giặt ủi (serviceGroup: LAUNDRY)
  {
    serviceID: "SRV005",
    serviceName: "Giặt ủi áo sơ mi",
    categoryID: "CAT002",
    category: mockServiceCategories[1],
    serviceGroup: "LAUNDRY",
    price: 30000,
    unit: "cái",
    description: "Giặt và ủi áo sơ mi",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV006",
    serviceName: "Giặt ủi quần tây",
    categoryID: "CAT002",
    category: mockServiceCategories[1],
    serviceGroup: "LAUNDRY",
    price: 35000,
    unit: "cái",
    description: "Giặt và ủi quần tây",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV007",
    serviceName: "Giặt ủi váy/đầm",
    categoryID: "CAT002",
    category: mockServiceCategories[1],
    serviceGroup: "LAUNDRY",
    price: 50000,
    unit: "cái",
    description: "Giặt và ủi váy/đầm",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Spa & Massage (serviceGroup: F&B - using F&B for personal services)
  {
    serviceID: "SRV008",
    serviceName: "Massage toàn thân",
    categoryID: "CAT003",
    category: mockServiceCategories[2],
    serviceGroup: "F&B",
    price: 500000,
    unit: "60 phút",
    description: "Massage thư giãn toàn thân 60 phút",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV009",
    serviceName: "Massage chân",
    categoryID: "CAT003",
    category: mockServiceCategories[2],
    serviceGroup: "F&B",
    price: 250000,
    unit: "30 phút",
    description: "Massage chân thư giãn 30 phút",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV010",
    serviceName: "Chăm sóc da mặt",
    categoryID: "CAT003",
    category: mockServiceCategories[2],
    serviceGroup: "F&B",
    price: 400000,
    unit: "45 phút",
    description: "Chăm sóc da mặt chuyên nghiệp",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Ăn uống (serviceGroup: F&B)
  {
    serviceID: "SRV011",
    serviceName: "Bữa sáng Á",
    categoryID: "CAT004",
    category: mockServiceCategories[3],
    serviceGroup: "F&B",
    price: 150000,
    unit: "suất",
    description: "Bữa sáng kiểu Á (phở, bánh mì...)",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV012",
    serviceName: "Bữa sáng Âu",
    categoryID: "CAT004",
    category: mockServiceCategories[3],
    serviceGroup: "F&B",
    price: 200000,
    unit: "suất",
    description: "Bữa sáng kiểu Âu (bánh mì, trứng...)",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV013",
    serviceName: "Cơm trưa/tối",
    categoryID: "CAT004",
    category: mockServiceCategories[3],
    serviceGroup: "F&B",
    price: 250000,
    unit: "suất",
    description: "Suất cơm trưa hoặc tối",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },

  // Thuê xe (serviceGroup: F&B - using F&B for transport services)
  {
    serviceID: "SRV014",
    serviceName: "Đưa đón sân bay",
    categoryID: "CAT005",
    category: mockServiceCategories[4],
    serviceGroup: "F&B",
    price: 300000,
    unit: "chuyến",
    description: "Đưa đón sân bay bằng xe 4 chỗ",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV015",
    serviceName: "Thuê xe 4 chỗ",
    categoryID: "CAT005",
    category: mockServiceCategories[4],
    serviceGroup: "F&B",
    price: 800000,
    unit: "ngày",
    description: "Thuê xe 4 chỗ có tài xế",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    serviceID: "SRV016",
    serviceName: "Thuê xe 7 chỗ",
    categoryID: "CAT005",
    category: mockServiceCategories[4],
    serviceGroup: "F&B",
    price: 1200000,
    unit: "ngày",
    description: "Thuê xe 7 chỗ có tài xế",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Helper functions
export function getServiceCategoryById(
  id: string
): ServiceCategory | undefined {
  return mockServiceCategories.find((cat) => cat.categoryID === id);
}

export function getServiceItemById(id: string): ServiceItem | undefined {
  return mockServiceItems.find((item) => item.serviceID === id);
}

export function getServiceItemsByCategory(categoryID: string): ServiceItem[] {
  return mockServiceItems.filter((item) => item.categoryID === categoryID);
}

export function getActiveServiceCategories(): ServiceCategory[] {
  return mockServiceCategories.filter((cat) => cat.isActive);
}

export function getActiveServiceItems(): ServiceItem[] {
  return mockServiceItems.filter((item) => item.isActive);
}
