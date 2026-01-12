/**
 * Image API Client
 * Handles all image upload/management operations for Cloudinary integration
 * Uses the existing API client for consistency
 */

import { apiFetch } from "../services/api";

export interface ImageResponse {
  id: string;
  url: string;
  secureUrl: string;
  thumbnailUrl?: string;
  cloudinaryId: string;
  width?: number;
  height?: number;
  format?: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
}

// ==================== ROOM TYPE IMAGES ====================

export const imageApi = {
  // ==================== ROOM TYPE IMAGES ====================

  // Upload single image
  uploadRoomTypeImage: async (
    roomTypeId: string,
    file: File,
    options?: { isDefault?: boolean; sortOrder?: number }
  ): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    if (options?.isDefault !== undefined) {
      formData.append("isDefault", String(options.isDefault));
    }
    if (options?.sortOrder !== undefined) {
      formData.append("sortOrder", String(options.sortOrder));
    }

    return apiFetch<ImageResponse>(
      `/employee/room-types/${roomTypeId}/images`,
      {
        method: "POST",
        body: formData as any,
        headers: {}, // Let browser set Content-Type with boundary for multipart
        requiresAuth: true,
      }
    );
  },

  // Upload multiple images
  uploadRoomTypeImages: async (
    roomTypeId: string,
    files: File[]
  ): Promise<ImageResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const data = await apiFetch<any>(
      `/employee/room-types/${roomTypeId}/images/batch`,
      {
        method: "POST",
        body: formData as any,
        headers: {}, // Let browser set Content-Type with boundary for multipart
        requiresAuth: true,
      }
    );

    // Handle partial success (HTTP 207) - some backends return successful array
    return data.successful || data;
  },

  // Get all images
  getRoomTypeImages: async (roomTypeId: string): Promise<ImageResponse[]> => {
    return apiFetch<ImageResponse[]>(
      `/employee/room-types/${roomTypeId}/images`,
      {
        method: "GET",
        requiresAuth: true,
      }
    );
  },

  // Delete image
  deleteRoomTypeImage: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/employee/room-types/images/${imageId}`,
      {
        method: "DELETE",
        requiresAuth: true,
      }
    );
  },

  // Reorder images
  reorderRoomTypeImages: async (
    roomTypeId: string,
    imageIds: string[]
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/employee/room-types/${roomTypeId}/images/reorder`,
      {
        method: "PUT",
        body: JSON.stringify({ imageIds }),
        requiresAuth: true,
      }
    );
  },

  // Set default image
  setRoomTypeImageDefault: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/employee/room-types/images/${imageId}/default`,
      {
        method: "PUT",
        requiresAuth: true,
      }
    );
  },

  // ==================== SERVICE IMAGES ====================

  uploadServiceImage: async (
    serviceId: string,
    file: File,
    options?: { isDefault?: boolean; sortOrder?: number }
  ): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    if (options?.isDefault !== undefined) {
      formData.append("isDefault", String(options.isDefault));
    }
    if (options?.sortOrder !== undefined) {
      formData.append("sortOrder", String(options.sortOrder));
    }

    return apiFetch<ImageResponse>(`/employee/services/${serviceId}/images`, {
      method: "POST",
      body: formData as any,
      headers: {}, // Let browser set Content-Type with boundary for multipart
      requiresAuth: true,
    });
  },

  uploadServiceImages: async (
    serviceId: string,
    files: File[]
  ): Promise<ImageResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const data = await apiFetch<any>(
      `/employee/services/${serviceId}/images/batch`,
      {
        method: "POST",
        body: formData as any,
        headers: {}, // Let browser set Content-Type with boundary for multipart
        requiresAuth: true,
      }
    );
    return data.successful || data;
  },

  getServiceImages: async (serviceId: string): Promise<ImageResponse[]> => {
    return apiFetch<ImageResponse[]>(`/employee/services/${serviceId}/images`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  deleteServiceImage: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/employee/services/images/${imageId}`,
      {
        method: "DELETE",
        requiresAuth: true,
      }
    );
  },

  reorderServiceImages: async (
    serviceId: string,
    imageIds: string[]
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/employee/services/${serviceId}/images/reorder`,
      {
        method: "PUT",
        body: JSON.stringify({ imageIds }),
        requiresAuth: true,
      }
    );
  },

  // Set default image
  setServiceImageDefault: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/employee/services/images/${imageId}/default`,
      {
        method: "PUT",
        requiresAuth: true,
      }
    );
  },

  // ==================== ROOM IMAGES ====================

  uploadRoomImage: async (
    roomId: string,
    file: File,
    options?: { isDefault?: boolean; sortOrder?: number }
  ): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append("image", file);
    if (options?.isDefault !== undefined) {
      formData.append("isDefault", String(options.isDefault));
    }
    if (options?.sortOrder !== undefined) {
      formData.append("sortOrder", String(options.sortOrder));
    }

    return apiFetch<ImageResponse>(`/employee/rooms/${roomId}/images`, {
      method: "POST",
      body: formData as any,
      headers: {}, // Let browser set Content-Type with boundary for multipart
      requiresAuth: true,
    });
  },

  getRoomImages: async (roomId: string): Promise<ImageResponse[]> => {
    return apiFetch<ImageResponse[]>(`/employee/rooms/${roomId}/images`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  deleteRoomImage: async (imageId: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/employee/rooms/images/${imageId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  // Set default image
  setRoomImageDefault: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(
      `/employee/rooms/images/${imageId}/default`,
      {
        method: "PUT",
        requiresAuth: true,
      }
    );
  },
};
