/**
 * Unified Service API Layer
 *
 * Handles API calls for:
 * 1. Regular Services (CRUD)
 * 2. Penalty Service (READ-ONLY) + Penalty Usage (CRUD)
 * 3. Surcharge Service (READ-ONLY) + Surcharge Usage (CRUD)
 *
 * Backend endpoints:
 * - /employee/services (regular services)
 * - /employee/service/service-usage (service usages)
 * - /employee/service/penalty (create penalty)
 * - /employee/service/surcharge (create surcharge)
 * - /employee/app-settings/penalty_service_id
 * - /employee/app-settings/surcharge_service_id
 */

import { api } from "./api";
import type {
  Service,
  ServiceWithCategory,
  ServiceUsage,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateServiceUsageRequest,
  CreatePenaltySurchargeRequest,
  UpdateServiceUsageRequest,
  GetServiceUsagesParams,
} from "@/lib/types/service-unified";

const API_BASE = "/employee";

// ============================================================================
// SERVICE API (Regular Services)
// ============================================================================

export const serviceAPI = {
  /**
   * Get all services
   * Backend returns ALL services (including "Phạt" and "Phụ thu")
   */
  async getAllServices(): Promise<Service[]> {
    try {
      const endpoint = `${API_BASE}/employee/services`;
      console.log("📡 [serviceAPI.getAllServices] Calling:", endpoint);

      const response = await api.get(`${API_BASE}/employee/services`, {
        requiresAuth: true,
      });

      console.log("📦 [serviceAPI.getAllServices] Raw response:", response);

      // Handle nested data structure: { data: { data: [...], total, page, limit } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data = (response as any)?.data?.data;

      console.log(
        "🔍 [serviceAPI.getAllServices] Extracted data (level 1):",
        data
      );

      // If not array, try other paths
      if (!Array.isArray(data)) {
        data = (response as any)?.data;
        console.log(
          "🔍 [serviceAPI.getAllServices] Extracted data (level 2):",
          data
        );

        if (!Array.isArray(data)) {
          data = response;
          console.log(
            "🔍 [serviceAPI.getAllServices] Extracted data (level 3 - raw response):",
            data
          );
        }
      }

      const result = Array.isArray(data) ? data : [];
      console.log("✅ [serviceAPI.getAllServices] Final result:", {
        count: result.length,
        items: result,
      });

      return result;
    } catch (error) {
      console.error("❌ [serviceAPI.getAllServices] Error:", error);
      throw error;
    }
  },

  /**
   * Get services with category
   * Categorizes each service as REGULAR/PENALTY/SURCHARGE
   */
  async getServicesWithCategory(): Promise<ServiceWithCategory[]> {
    const services = await this.getAllServices();
    const { categorizeService } = await import("@/lib/types/service-unified");
    return services.map(categorizeService);
  },

  /**
   * Get regular services only (exclude "Phạt" and "Phụ thu")
   * For /services page
   */
  async getRegularServices(): Promise<Service[]> {
    const services = await this.getAllServices();
    const { isRegularService } = await import("@/lib/types/service-unified");
    return services.filter(isRegularService);
  },

  /**
   * Get penalty service (service with name "Phạt")
   * Returns the special penalty service
   */
  async getPenaltyService(): Promise<Service | null> {
    const services = await this.getAllServices();
    return services.find((s) => s.name === "Phạt") || null;
  },

  /**
   * Get surcharge service (service with name "Phụ thu")
   * Returns the special surcharge service
   */
  async getSurchargeService(): Promise<Service | null> {
    const services = await this.getAllServices();
    return services.find((s) => s.name === "Phụ thu") || null;
  },

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    try {
      const response = await api.get(`${API_BASE}/employee/services/${id}`, {
        requiresAuth: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data =
        (response as any)?.data?.data || (response as any)?.data || response;
      return data;
    } catch (error) {
      console.error(`Failed to get service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create regular service
   * NOT for creating "Phạt" or "Phụ thu" (those are seeded)
   */
  async createService(data: CreateServiceRequest): Promise<Service> {
    try {
      // Validate not creating penalty/surcharge
      if (data.name === "Phạt" || data.name === "Phụ thu") {
        throw new Error(
          "Cannot create penalty or surcharge service. Those are system services."
        );
      }

      const response = await api.post(`${API_BASE}/employee/services`, data, {
        requiresAuth: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unwrapped =
        (response as any)?.data?.data || (response as any)?.data || response;
      return unwrapped;
    } catch (error) {
      console.error("Failed to create service:", error);
      throw error;
    }
  },

  /**
   * Update service
   * Can update regular services, NOT penalty/surcharge services
   */
  async updateService(
    id: string,
    data: UpdateServiceRequest
  ): Promise<Service> {
    try {
      const response = await api.put(
        `${API_BASE}/employee/services/${id}`,
        data,
        {
          requiresAuth: true,
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unwrapped =
        (response as any)?.data?.data || (response as any)?.data || response;
      return unwrapped;
    } catch (error) {
      console.error(`Failed to update service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete service
   * Can delete regular services, NOT penalty/surcharge services
   */
  async deleteService(id: string): Promise<void> {
    try {
      await api.delete(`${API_BASE}/employee/services/${id}`, {
        requiresAuth: true,
      });
    } catch (error) {
      console.error(`Failed to delete service ${id}:`, error);
      throw error;
    }
  },
};

// ============================================================================
// SERVICE USAGE API (for regular services)
// ============================================================================

export const serviceUsageAPI = {
  /**
   * Get service usages with filters
   * Can filter by serviceId, bookingId, bookingRoomId, status
   */
  async getServiceUsages(
    params?: GetServiceUsagesParams
  ): Promise<ServiceUsage[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.serviceId) queryParams.append("serviceId", params.serviceId);
      if (params?.bookingId) queryParams.append("bookingId", params.bookingId);
      if (params?.bookingRoomId)
        queryParams.append("bookingRoomId", params.bookingRoomId);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const query = queryParams.toString();
      const endpoint = `${API_BASE}/service/service-usage${
        query ? `?${query}` : ""
      }`;

      const response = await api.get(endpoint, { requiresAuth: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data =
        (response as any)?.data?.data ||
        (response as any)?.data ||
        response ||
        [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to get service usages:", error);
      throw error;
    }
  },

  /**
   * Create regular service usage
   * For booking services (laundry, massage, etc.)
   */
  async createServiceUsage(
    data: CreateServiceUsageRequest
  ): Promise<ServiceUsage> {
    try {
      const response = await api.post(
        `${API_BASE}/service/service-usage`,
        data,
        {
          requiresAuth: true,
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unwrapped =
        (response as any)?.data?.data || (response as any)?.data || response;
      return unwrapped;
    } catch (error) {
      console.error("Failed to create service usage:", error);
      throw error;
    }
  },

  /**
   * Update service usage
   * Can update quantity or status
   */
  async updateServiceUsage(
    id: string,
    data: UpdateServiceUsageRequest
  ): Promise<ServiceUsage> {
    try {
      const response = await api.patch(
        `${API_BASE}/service/service-usage/${id}`,
        data,
        {
          requiresAuth: true,
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unwrapped =
        (response as any)?.data?.data || (response as any)?.data || response;
      return unwrapped;
    } catch (error) {
      console.error(`Failed to update service usage ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete service usage
   */
  async deleteServiceUsage(id: string): Promise<void> {
    try {
      await api.delete(`${API_BASE}/service/service-usage/${id}`, {
        requiresAuth: true,
      });
    } catch (error) {
      console.error(`Failed to delete service usage ${id}:`, error);
      throw error;
    }
  },
};

// ============================================================================
// PENALTY API (ServiceUsage with customPrice)
// ============================================================================

export const penaltyAPI = {
  /**
   * Get penalty service ID from Backend
   * Returns the ID of service with name "Phạt"
   */
  async getPenaltyServiceId(): Promise<string> {
    try {
      const penaltyService = await serviceAPI.getPenaltyService();
      if (!penaltyService) {
        throw new Error(
          "Penalty service not found. Please check Backend seed data."
        );
      }
      return penaltyService.id;
    } catch (error) {
      console.error("Failed to get penalty service ID:", error);
      throw error;
    }
  },

  /**
   * Get all penalty usages
   * Backend endpoint: GET /employee/service/service-usage
   * Filter client-side by penalty serviceId
   */
  async getPenaltyUsages(filters?: {
    bookingId?: string;
    bookingRoomId?: string;
  }): Promise<ServiceUsage[]> {
    try {
      console.log(
        "📡 [penaltyAPI.getPenaltyUsages] Called with filters:",
        filters
      );

      // Get penalty service ID
      const penaltyServiceId = await this.getPenaltyServiceId();
      console.log(
        "🎯 [penaltyAPI.getPenaltyUsages] Penalty service ID:",
        penaltyServiceId
      );

      // Query all service usages
      console.log(
        "📡 [penaltyAPI.getPenaltyUsages] Calling getServiceUsages with filters:",
        filters
      );
      const allUsages = await serviceUsageAPI.getServiceUsages(filters);
      console.log(
        "📦 [penaltyAPI.getPenaltyUsages] All usages returned:",
        allUsages
      );

      // Filter to only penalty usages
      const filtered = allUsages.filter(
        (usage) => usage.serviceId === penaltyServiceId
      );
      console.log("✅ [penaltyAPI.getPenaltyUsages] Filtered penalties:", {
        total: allUsages.length,
        penalties: filtered.length,
        items: filtered,
      });

      return filtered;
    } catch (error) {
      console.error("❌ [penaltyAPI.getPenaltyUsages] Error:", error);
      throw error;
    }
  },

  /**
   * Apply penalty (create ServiceUsage with customPrice)
   * Backend endpoint: POST /employee/service/penalty
   */
  async applyPenalty(
    data: CreatePenaltySurchargeRequest
  ): Promise<ServiceUsage> {
    try {
      const response = await api.post(
        `${API_BASE}/service/penalty`,
        {
          bookingId: data.bookingId,
          bookingRoomId: data.bookingRoomId,
          customPrice: data.customPrice,
          quantity: data.quantity || 1,
          reason: data.reason,
        },
        {
          requiresAuth: true,
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unwrapped =
        (response as any)?.data?.data || (response as any)?.data || response;
      return unwrapped;
    } catch (error) {
      console.error("Failed to apply penalty:", error);
      throw error;
    }
  },

  /**
   * Update penalty usage
   */
  async updatePenalty(
    id: string,
    data: {
      quantity?: number;
      status?: ServiceUsage["status"];
    }
  ): Promise<ServiceUsage> {
    return await serviceUsageAPI.updateServiceUsage(id, data);
  },

  /**
   * Delete penalty usage
   */
  async deletePenalty(id: string): Promise<void> {
    return await serviceUsageAPI.deleteServiceUsage(id);
  },
};

// ============================================================================
// SURCHARGE API (ServiceUsage with customPrice)
// ============================================================================

export const surchargeAPI = {
  /**
   * Get surcharge service ID from Backend
   * Returns the ID of service with name "Phụ thu"
   */
  async getSurchargeServiceId(): Promise<string> {
    try {
      const surchargeService = await serviceAPI.getSurchargeService();
      if (!surchargeService) {
        throw new Error(
          "Surcharge service not found. Please check Backend seed data."
        );
      }
      return surchargeService.id;
    } catch (error) {
      console.error("Failed to get surcharge service ID:", error);
      throw error;
    }
  },

  /**
   * Get all surcharge usages
   * Backend endpoint: GET /employee/service/service-usage
   * Filter client-side by surcharge serviceId
   */
  async getSurchargeUsages(filters?: {
    bookingId?: string;
    bookingRoomId?: string;
  }): Promise<ServiceUsage[]> {
    try {
      console.log(
        "📡 [surchargeAPI.getSurchargeUsages] Called with filters:",
        filters
      );

      // Get surcharge service ID
      const surchargeServiceId = await this.getSurchargeServiceId();
      console.log(
        "🎯 [surchargeAPI.getSurchargeUsages] Surcharge service ID:",
        surchargeServiceId
      );

      // Query all service usages
      console.log(
        "📡 [surchargeAPI.getSurchargeUsages] Calling getServiceUsages with filters:",
        filters
      );
      const allUsages = await serviceUsageAPI.getServiceUsages(filters);
      console.log(
        "📦 [surchargeAPI.getSurchargeUsages] All usages returned:",
        allUsages
      );

      // Filter to only surcharge usages
      const filtered = allUsages.filter(
        (usage) => usage.serviceId === surchargeServiceId
      );
      console.log("✅ [surchargeAPI.getSurchargeUsages] Filtered surcharges:", {
        total: allUsages.length,
        surcharges: filtered.length,
        items: filtered,
      });

      return filtered;
    } catch (error) {
      console.error("❌ [surchargeAPI.getSurchargeUsages] Error:", error);
      throw error;
    }
  },

  /**
   * Apply surcharge (create ServiceUsage with customPrice)
   * Backend endpoint: POST /employee/service/surcharge
   */
  async applySurcharge(
    data: CreatePenaltySurchargeRequest
  ): Promise<ServiceUsage> {
    try {
      const response = await api.post(
        `${API_BASE}/service/surcharge`,
        {
          bookingId: data.bookingId,
          bookingRoomId: data.bookingRoomId,
          customPrice: data.customPrice,
          quantity: data.quantity || 1,
          reason: data.reason,
        },
        {
          requiresAuth: true,
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unwrapped =
        (response as any)?.data?.data || (response as any)?.data || response;
      return unwrapped;
    } catch (error) {
      console.error("Failed to apply surcharge:", error);
      throw error;
    }
  },

  /**
   * Update surcharge usage
   */
  async updateSurcharge(
    id: string,
    data: {
      quantity?: number;
      status?: ServiceUsage["status"];
    }
  ): Promise<ServiceUsage> {
    return await serviceUsageAPI.updateServiceUsage(id, data);
  },

  /**
   * Delete surcharge usage
   */
  async deleteSurcharge(id: string): Promise<void> {
    return await serviceUsageAPI.deleteServiceUsage(id);
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  service: serviceAPI,
  serviceUsage: serviceUsageAPI,
  penalty: penaltyAPI,
  surcharge: surchargeAPI,
};
