// Service Group Types (per spec 2.7)
// MINIBAR - Đồ uống và đồ ăn nhẹ trong phòng
// LAUNDRY - Dịch vụ giặt là
// F&B - Ăn uống (Food & Beverage)
// Note: PHUTHU (Surcharges) and PHAT (Penalties) are now separate types in their own files
export type ServiceGroup = "MINIBAR" | "LAUNDRY" | "F&B";

export const SERVICE_GROUP_LABELS: Record<ServiceGroup, string> = {
  MINIBAR: "Minibar",
  LAUNDRY: "Giặt là",
  "F&B": "Ăn uống",
};

// Service Category Type
export interface ServiceCategory {
  categoryID: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Service Item Type
export interface ServiceItem {
  serviceID: string;
  serviceName: string;
  categoryID: string;
  category: ServiceCategory;
  serviceGroup: ServiceGroup; // NEW: Service group classification
  price: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isOpenPrice?: boolean; // NEW: For PHUTHU/PHAT - allow open price entry
  createdAt: Date;
  updatedAt: Date;
}

// Form Data Types
export interface ServiceCategoryFormData {
  categoryName: string;
  description?: string;
}

export interface ServiceItemFormData {
  serviceName: string;
  categoryID: string;
  serviceGroup: ServiceGroup; // NEW
  price: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  isOpenPrice?: boolean; // NEW
}

// Filter Options
export interface ServiceFilterOptions {
  category: string | "Tất cả";
  serviceGroup: ServiceGroup | "Tất cả"; // NEW
  searchTerm: string;
  status: "active" | "inactive" | "all";
}
