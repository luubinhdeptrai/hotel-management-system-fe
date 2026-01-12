import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Employee, EmployeeRole } from "./types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Helper to safely get role from Employee object (handles both role string and roleRef object)
export function getEmployeeRole(employee: Employee | null | undefined): EmployeeRole | undefined {
  if (!employee) return undefined;
  
  // If role string exists, use it
  if (employee.role) return employee.role as EmployeeRole;
  
  // Otherwise try to get from roleRef
  if (employee.roleRef?.name) {
    const roleName = employee.roleRef.name.toUpperCase();
    // Map role names to enum values
    const roleMap: Record<string, EmployeeRole> = {
      "ADMIN": "ADMIN",
      "RECEPTIONIST": "RECEPTIONIST",
      "HOUSEKEEPING": "HOUSEKEEPING",
      "STAFF": "STAFF",
    };
    return roleMap[roleName];
  }
  
  return undefined;
}

// Helper to safely get room type price from either pricePerNight or basePrice
export function getRoomTypePrice(roomType: any): number {
  if (!roomType) return 0;
  
  const priceValue = roomType.pricePerNight || roomType.basePrice;
  if (!priceValue) return 0;
  
  const parsed = typeof priceValue === 'string' 
    ? parseFloat(priceValue) 
    : Number(priceValue);
  
  return isNaN(parsed) ? 0 : parsed;
}