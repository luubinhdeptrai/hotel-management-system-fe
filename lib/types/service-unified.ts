/**
 * Unified Service Types
 * 
 * Backend architecture: 1 Service table cho tất cả (services + penalty + surcharge)
 * - Regular services: "Giặt ủi", "Bữa sáng", "Spa"...
 * - Special service "Phạt": Container for all penalties
 * - Special service "Phụ thu": Container for all surcharges
 * 
 * Source: roommaster-be/prisma/schema.prisma
 */

// ============================================================================
// SERVICE MODEL (matches Backend exactly)
// ============================================================================

export interface Service {
  id: string;
  name: string;
  price: number;        // Decimal from Backend → number in FE
  unit: string;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: string;    // ISO date string
  updatedAt: string;    // ISO date string
}

// ============================================================================
// SERVICE CATEGORY (for UI grouping)
// ============================================================================

export type ServiceCategory = 'REGULAR' | 'PENALTY' | 'SURCHARGE';

export interface ServiceWithCategory extends Service {
  category: ServiceCategory;
}

/**
 * Categorize service based on name
 * Backend uses hard-coded names: "Phạt" and "Phụ thu"
 */
export function categorizeService(service: Service): ServiceWithCategory {
  let category: ServiceCategory = 'REGULAR';
  
  if (service.name === 'Phạt') {
    category = 'PENALTY';
  } else if (service.name === 'Phụ thu') {
    category = 'SURCHARGE';
  }
  
  return { ...service, category };
}

/**
 * Check if service is regular (not penalty or surcharge)
 */
export function isRegularService(service: Service): boolean {
  return service.name !== 'Phạt' && service.name !== 'Phụ thu';
}

/**
 * Check if service is penalty service
 */
export function isPenaltyService(service: Service): boolean {
  return service.name === 'Phạt';
}

/**
 * Check if service is surcharge service
 */
export function isSurchargeService(service: Service): boolean {
  return service.name === 'Phụ thu';
}

// ============================================================================
// SERVICE USAGE (Backend ServiceUsage model)
// ============================================================================

export type ServiceUsageStatus = 'PENDING' | 'TRANSFERRED' | 'COMPLETED' | 'CANCELLED';

export interface ServiceUsage {
  id: string;
  bookingId?: string | null;
  bookingRoomId?: string | null;
  employeeId: string;
  
  serviceId: string;
  quantity: number;
  unitPrice: number;      // Original service price (from Service table)
  customPrice?: number | null;   // Custom price for penalty/surcharge
  totalPrice: number;     // = (customPrice ?? unitPrice) * quantity
  totalPaid: number;
  note?: string | null;   // Reason for penalty/surcharge
  status: ServiceUsageStatus;
  
  // Relations (optional, populated by Backend include)
  service?: Service;
  employee?: {
    id: string;
    name: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Create regular service usage
 * For booking services (massage, laundry, etc.)
 */
export interface CreateServiceUsageRequest {
  bookingId?: string;       // Optional: for guest services
  bookingRoomId?: string;   // Optional: for room-specific services
  serviceId: string;
  quantity: number;
  note?: string;
  employeeId: string;
}

/**
 * Create penalty/surcharge usage
 * Backend endpoints: POST /employee/service/penalty | POST /employee/service/surcharge
 * Requires customPrice and reason
 */
export interface CreatePenaltySurchargeRequest {
  bookingId?: string;
  bookingRoomId?: string;
  customPrice: number;      // Required: Custom price for this penalty/surcharge
  quantity: number;
  reason: string;           // Required: Reason/description (saved to note)
  employeeId?: string;      // Optional: Backend will use req.employee.id if not provided
}

/**
 * Update service usage
 */
export interface UpdateServiceUsageRequest {
  quantity?: number;
  status?: ServiceUsageStatus;
}

/**
 * Get service usages with filters
 */
export interface GetServiceUsagesParams {
  serviceId?: string;       // Filter by service
  bookingId?: string;       // Filter by booking
  bookingRoomId?: string;   // Filter by room
  status?: ServiceUsageStatus;
  page?: number;
  limit?: number;
}

/**
 * Create/Update service (regular services only)
 */
export interface CreateServiceRequest {
  name: string;
  price: number;
  unit?: string;
  isActive?: boolean;
  imageUrl?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  price?: number;
  unit?: string;
  isActive?: boolean;
  imageUrl?: string;
}

// ============================================================================
// DISPLAY TYPES (for UI)
// ============================================================================

/**
 * Penalty display item (ServiceUsage record)
 * Alias for PenaltyUsageDisplay for backward compatibility
 */
export interface PenaltyUsageDisplay extends ServiceUsage {
  description: string;      // From note field
  amount: number;          // From customPrice
}

/**
 * Alias for simpler import
 */
export type PenaltyDisplay = PenaltyUsageDisplay;

/**
 * Surcharge display item (ServiceUsage record)
 * Alias for SurchargeUsageDisplay for backward compatibility
 */
export interface SurchargeUsageDisplay extends ServiceUsage {
  description: string;      // From note field
  amount: number;          // From customPrice
}

/**
 * Alias for simpler import
 */
export type SurchargeDisplay = SurchargeUsageDisplay;

/**
 * Convert ServiceUsage to PenaltyUsageDisplay
 */
export function toPenaltyDisplay(usage: ServiceUsage): PenaltyUsageDisplay {
  return {
    ...usage,
    description: usage.note || 'Không có mô tả',
    amount: usage.customPrice || usage.unitPrice
  };
}

/**
 * Convert ServiceUsage to SurchargeUsageDisplay
 */
export function toSurchargeDisplay(usage: ServiceUsage): SurchargeUsageDisplay {
  return {
    ...usage,
    description: usage.note || 'Không có mô tả',
    amount: usage.customPrice || usage.unitPrice
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency (VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format service usage status
 */
export function formatServiceUsageStatus(status: ServiceUsageStatus): {
  label: string;
  color: string;
} {
  const map: Record<ServiceUsageStatus, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xử lý', color: 'yellow' },
    TRANSFERRED: { label: 'Đã chuyển', color: 'blue' },
    COMPLETED: { label: 'Hoàn thành', color: 'green' },
    CANCELLED: { label: 'Đã hủy', color: 'red' }
  };
  
  return map[status] || { label: status, color: 'gray' };
}
