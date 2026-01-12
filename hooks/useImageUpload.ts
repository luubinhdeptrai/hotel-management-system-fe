/**
 * Image Upload Hooks
 * TanStack Query hooks for image management operations
 * Loosely coupled - can be easily refactored when migrating other hooks to TanStack Query
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { imageApi, ImageResponse } from "@/lib/api/image.api";
import { toast } from "sonner";
import { compressFiles } from "@/lib/utils/image-compression";

// Query keys factory - centralized for easy refactoring
export const imageKeys = {
  all: ["images"] as const,
  roomTypes: () => [...imageKeys.all, "room-types"] as const,
  roomType: (id: string) => [...imageKeys.roomTypes(), id] as const,
  services: () => [...imageKeys.all, "services"] as const,
  service: (id: string) => [...imageKeys.services(), id] as const,
  rooms: () => [...imageKeys.all, "rooms"] as const,
  room: (id: string) => [...imageKeys.rooms(), id] as const,
};

// ==================== ROOM TYPE IMAGES ====================

export const useRoomTypeImages = (roomTypeId: string) => {
  return useQuery({
    queryKey: imageKeys.roomType(roomTypeId),
    queryFn: () => imageApi.getRoomTypeImages(roomTypeId),
    enabled: !!roomTypeId,
  });
};

export const useUploadRoomTypeImages = (roomTypeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      // Compress files before upload
      const compressedFiles = await compressFiles(files);
      return imageApi.uploadRoomTypeImages(roomTypeId, compressedFiles);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.roomType(roomTypeId),
      });
      toast.success("Images uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload images");
    },
  });
};

// ...

export const useUploadServiceImages = (serviceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      // Compress files before upload
      const compressedFiles = await compressFiles(files);
      return imageApi.uploadServiceImages(serviceId, compressedFiles);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.service(serviceId) });
      toast.success("Images uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload images");
    },
  });
};

export const useDeleteRoomTypeImage = (roomTypeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => imageApi.deleteRoomTypeImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.roomType(roomTypeId),
      });
      toast.success("Image deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete image");
    },
  });
};

export const useSetRoomTypeImageDefault = (roomTypeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => imageApi.setRoomTypeImageDefault(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.roomType(roomTypeId),
      });
      toast.success("Default image updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update default image");
    },
  });
};

export const useReorderRoomTypeImages = (roomTypeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageIds: string[]) =>
      imageApi.reorderRoomTypeImages(roomTypeId, imageIds),
    onMutate: async (imageIds) => {
      // Optimistic update for instant UI feedback
      await queryClient.cancelQueries({
        queryKey: imageKeys.roomType(roomTypeId),
      });

      const previousImages = queryClient.getQueryData<ImageResponse[]>(
        imageKeys.roomType(roomTypeId)
      );

      if (previousImages) {
        const reorderedImages = imageIds.map((id, index) => {
          const img = previousImages.find((i) => i.id === id)!;
          return { ...img, sortOrder: index };
        });
        queryClient.setQueryData(
          imageKeys.roomType(roomTypeId),
          reorderedImages
        );
      }

      return { previousImages };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousImages) {
        queryClient.setQueryData(
          imageKeys.roomType(roomTypeId),
          context.previousImages
        );
      }
      toast.error("Failed to reorder images");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.roomType(roomTypeId),
      });
    },
  });
};

// ==================== SERVICE IMAGES ====================

export const useServiceImages = (serviceId: string) => {
  return useQuery({
    queryKey: imageKeys.service(serviceId),
    queryFn: () => imageApi.getServiceImages(serviceId),
    enabled: !!serviceId,
  });
};

export const useDeleteServiceImage = (serviceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => imageApi.deleteServiceImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.service(serviceId) });
      toast.success("Image deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete image");
    },
  });
};

export const useReorderServiceImages = (serviceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageIds: string[]) =>
      imageApi.reorderServiceImages(serviceId, imageIds),
    onMutate: async (imageIds) => {
      await queryClient.cancelQueries({
        queryKey: imageKeys.service(serviceId),
      });

      const previousImages = queryClient.getQueryData<ImageResponse[]>(
        imageKeys.service(serviceId)
      );

      if (previousImages) {
        const reorderedImages = imageIds.map((id, index) => {
          const img = previousImages.find((i) => i.id === id)!;
          return { ...img, sortOrder: index };
        });
        queryClient.setQueryData(imageKeys.service(serviceId), reorderedImages);
      }

      return { previousImages };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousImages) {
        queryClient.setQueryData(
          imageKeys.service(serviceId),
          context.previousImages
        );
      }
      toast.error("Failed to reorder images");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.service(serviceId) });
    },
  });
};

export const useSetServiceImageDefault = (serviceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => imageApi.setServiceImageDefault(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.service(serviceId) });
      toast.success("Default image updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update default image");
    },
  });
};

// ==================== ROOM IMAGES ====================

export const useRoomImages = (roomId: string) => {
  return useQuery({
    queryKey: imageKeys.room(roomId),
    queryFn: () => imageApi.getRoomImages(roomId),
    enabled: !!roomId,
  });
};

export const useUploadRoomImages = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const compressedFiles = await compressFiles(files);
      const promises = compressedFiles.map((file) =>
        imageApi.uploadRoomImage(roomId, file)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.room(roomId) });
      toast.success("Images uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload images");
    },
  });
};

export const useDeleteRoomImage = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => imageApi.deleteRoomImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.room(roomId) });
      toast.success("Image deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete image");
    },
  });
};

export const useSetRoomImageDefault = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => imageApi.setRoomImageDefault(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.room(roomId) });
      toast.success("Default image updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update default image");
    },
  });
};
