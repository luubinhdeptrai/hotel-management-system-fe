import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
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