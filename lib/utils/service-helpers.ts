/**
 * Service API Helpers
 * Functions to parse and transform service-related API responses
 */

import type { Service } from "@/lib/types/api";
import type { ServiceUsageResponse } from "@/lib/types/checkin-checkout";
import { parseDecimalPrice, calculateServiceBalance } from "./transaction-validators";

/**
 * Parse Service from backend response
 * Converts price from Decimal string to number
 */
export const parseService = (raw: any): Service => {
  return {
    ...raw,
    price: parseDecimalPrice(raw.price),
  };
};

/**
 * Parse array of Services from backend response
 */
export const parseServices = (rawServices: any[]): Service[] => {
  return rawServices.map(parseService);
};

/**
 * Parse ServiceUsageResponse from backend
 * Adds calculated balance field
 */
export const parseServiceUsage = (raw: any): ServiceUsageResponse => {
  const totalPrice = parseDecimalPrice(raw.totalPrice);
  const totalPaid = parseDecimalPrice(raw.totalPaid || 0);
  const unitPrice = parseDecimalPrice(raw.unitPrice || raw.service?.price || 0);

  return {
    ...raw,
    unitPrice,
    totalPrice,
    totalPaid,
    balance: calculateServiceBalance(totalPrice, totalPaid),
    service: raw.service ? {
      ...raw.service,
      price: parseDecimalPrice(raw.service.price),
    } : undefined,
  };
};

/**
 * Parse array of ServiceUsageResponses from backend
 */
export const parseServiceUsages = (rawUsages: any[]): ServiceUsageResponse[] => {
  return rawUsages.map(parseServiceUsage);
};

/**
 * Format service data for API submission
 */
export const formatServiceForAPI = (service: Partial<Service>): any => {
  return {
    ...service,
    price: service.price, // Backend will parse as Decimal
  };
};

/**
 * Calculate total service charges for a booking
 */
export const calculateTotalServiceCharges = (
  services: ServiceUsageResponse[]
): number => {
  return services.reduce((total, service) => {
    return total + service.totalPrice;
  }, 0);
};

/**
 * Calculate total service balance for a booking
 */
export const calculateTotalServiceBalance = (
  services: ServiceUsageResponse[]
): number => {
  return services.reduce((total, service) => {
    return total + service.balance;
  }, 0);
};

/**
 * Filter unpaid services
 */
export const getUnpaidServices = (
  services: ServiceUsageResponse[]
): ServiceUsageResponse[] => {
  return services.filter((service) => service.balance > 0);
};

/**
 * Filter fully paid services
 */
export const getPaidServices = (
  services: ServiceUsageResponse[]
): ServiceUsageResponse[] => {
  return services.filter((service) => service.balance === 0);
};

/**
 * Group services by status
 */
export const groupServicesByStatus = (services: ServiceUsageResponse[]) => {
  return {
    pending: services.filter((s) => s.status === "PENDING"),
    transferred: services.filter((s) => s.status === "TRANSFERRED"),
    completed: services.filter((s) => s.status === "COMPLETED"),
    cancelled: services.filter((s) => s.status === "CANCELLED"),
  };
};
