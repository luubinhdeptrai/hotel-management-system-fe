# Web Frontend Implementation Guide - Cloudinary Image Management (Next.js)

## Overview

This guide covers the Next.js web frontend implementation for the hotel management admin dashboard. Uses **Backend Upload** (files go through Express API to Cloudinary).

---

## 1. Dependencies Installation

```bash
# TanStack Query for data fetching
pnpm install @tanstack/react-query @tanstack/react-query-devtools

# Axios for HTTP requests
pnpm install axios

# Drag and Drop
pnpm install react-dropzone @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Toast notifications
pnpm install sonner

# Next.js Image optimization (already included)
# next/image
```

---

## 2. Environment Variables

**File: `.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
# For production: https://api.yourhotel.com/api
```

⚠️ **IMPORTANT:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## 3. API Client Setup

**File: `lib/api/axios-instance.ts`**

```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## 4. Image API Functions

**File: `lib/api/image.api.ts`**

```typescript
import { apiClient } from "./axios-instance";

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

    const { data } = await apiClient.post(
      `/room-types/${roomTypeId}/images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  },

  // Upload multiple images
  uploadRoomTypeImages: async (
    roomTypeId: string,
    files: File[]
  ): Promise<ImageResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const { data } = await apiClient.post(
      `/room-types/${roomTypeId}/images/batch`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    // Handle partial success (HTTP 207)
    return data.successful || data;
  },

  // Get all images
  getRoomTypeImages: async (roomTypeId: string): Promise<ImageResponse[]> => {
    const { data } = await apiClient.get(`/room-types/${roomTypeId}/images`);
    return data;
  },

  // Delete image
  deleteRoomTypeImage: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/room-types/images/${imageId}`);
    return data;
  },

  // Reorder images
  reorderRoomTypeImages: async (
    roomTypeId: string,
    imageIds: string[]
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.put(
      `/room-types/${roomTypeId}/images/reorder`,
      { imageIds }
    );
    return data;
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

    const { data } = await apiClient.post(
      `/services/${serviceId}/images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  },

  uploadServiceImages: async (
    serviceId: string,
    files: File[]
  ): Promise<ImageResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const { data } = await apiClient.post(
      `/services/${serviceId}/images/batch`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data.successful || data;
  },

  getServiceImages: async (serviceId: string): Promise<ImageResponse[]> => {
    const { data } = await apiClient.get(`/services/${serviceId}/images`);
    return data;
  },

  deleteServiceImage: async (
    imageId: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/services/images/${imageId}`);
    return data;
  },

  reorderServiceImages: async (
    serviceId: string,
    imageIds: string[]
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.put(
      `/services/${serviceId}/images/reorder`,
      { imageIds }
    );
    return data;
  },
};
```

---

## 5. TanStack Query Hooks

**File: `hooks/useImageUpload.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { imageApi, ImageResponse } from "@/lib/api/image.api";
import { toast } from "sonner";

// Query keys factory
export const imageKeys = {
  all: ["images"] as const,
  roomTypes: () => [...imageKeys.all, "room-types"] as const,
  roomType: (id: string) => [...imageKeys.roomTypes(), id] as const,
  services: () => [...imageKeys.all, "services"] as const,
  service: (id: string) => [...imageKeys.services(), id] as const,
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
    mutationFn: (files: File[]) =>
      imageApi.uploadRoomTypeImages(roomTypeId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: imageKeys.roomType(roomTypeId),
      });
      toast.success("Images uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to upload images");
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
      toast.error(error.response?.data?.error || "Failed to delete image");
    },
  });
};

export const useReorderRoomTypeImages = (roomTypeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageIds: string[]) =>
      imageApi.reorderRoomTypeImages(roomTypeId, imageIds),
    onMutate: async (imageIds) => {
      // Optimistic update
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

export const useUploadServiceImages = (serviceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) =>
      imageApi.uploadServiceImages(serviceId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.service(serviceId) });
      toast.success("Images uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to upload images");
    },
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
      toast.error(error.response?.data?.error || "Failed to delete image");
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
```

---

## 6. Image Upload Component

**File: `components/ImageUpload.tsx`**

```typescript
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
  useRoomTypeImages,
  useUploadRoomTypeImages,
  useDeleteRoomTypeImage,
  useReorderRoomTypeImages,
  useServiceImages,
  useUploadServiceImages,
  useDeleteServiceImage,
  useReorderServiceImages,
} from "@/hooks/useImageUpload";
import { ImageResponse } from "@/lib/api/image.api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageUploadProps {
  entityType: "roomType" | "service";
  entityId: string;
}

// Sortable Image Item
function SortableImageItem({
  image,
  onDelete,
}: {
  image: ImageResponse;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-move"
      {...attributes}
      {...listeners}
    >
      <Image
        src={image.thumbnailUrl || image.url}
        alt="Preview"
        width={300}
        height={200}
        className="rounded-lg object-cover w-full h-48"
      />
      {image.isDefault && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Default
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(image.id);
        }}
        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition"
      >
        ✕
      </button>
    </div>
  );
}

export default function ImageUpload({
  entityType,
  entityId,
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  // Select hooks based on entity type
  const {
    data: images = [],
    isLoading,
    error,
  } = entityType === "roomType"
    ? useRoomTypeImages(entityId)
    : useServiceImages(entityId);

  const uploadMutation =
    entityType === "roomType"
      ? useUploadRoomTypeImages(entityId)
      : useUploadServiceImages(entityId);

  const deleteMutation =
    entityType === "roomType"
      ? useDeleteRoomTypeImage(entityId)
      : useDeleteServiceImage(entityId);

  const reorderMutation =
    entityType === "roomType"
      ? useReorderRoomTypeImages(entityId)
      : useReorderServiceImages(entityId);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  // Upload handler
  const handleUpload = async () => {
    if (files.length === 0) return;
    await uploadMutation.mutateAsync(files);
    setFiles([]);
  };

  // Delete handler
  const handleDelete = (imageId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(imageId);
    }
  };

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const reorderedImages = arrayMove(images, oldIndex, newIndex);
      const imageIds = reorderedImages.map((img) => img.id);

      reorderMutation.mutate(imageIds);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading images...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">Error loading images</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-gray-600">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Max 5MB per file, JPG/PNG/WEBP
            </p>
          </div>
        )}
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Selected Files ({files.length})</h3>
            <div className="space-x-2">
              <button
                onClick={() => setFiles([])}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-xs truncate mt-1">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      <div>
        <h3 className="font-semibold mb-4">
          Uploaded Images ({images.length})
          {images.length > 0 && (
            <span className="text-sm text-gray-500 ml-2">
              (Drag to reorder)
            </span>
          )}
        </h3>

        {images.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No images uploaded yet
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-4">
                {images.map((image) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
```

---

## 7. Query Provider Setup

**File: `app/providers.tsx`**

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**File: `app/layout.tsx`**

```typescript
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 8. Usage Example

**File: `app/admin/room-types/[id]/edit/page.tsx`**

```typescript
"use client";

import ImageUpload from "@/components/ImageUpload";

export default function EditRoomTypePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Room Type</h1>

      {/* Other form fields... */}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Images</h2>
        <ImageUpload entityType="roomType" entityId={params.id} />
      </div>
    </div>
  );
}
```

---

## 9. Optimized Image Display Component

**File: `components/OptimizedImage.tsx`**

```typescript
"use client";

import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
}: OptimizedImageProps) {
  // Cloudinary automatic optimization
  const optimizedSrc = src.includes("cloudinary.com")
    ? src.replace("/upload/", "/upload/f_auto,q_auto/")
    : src;

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      loading={priority ? undefined : "lazy"}
    />
  );
}
```

---

## 10. Testing Checklist

### Component Tests

- [ ] ImageUpload renders correctly
- [ ] Drag and drop works
- [ ] File selection works
- [ ] Upload button triggers mutation
- [ ] Delete button triggers mutation
- [ ] Reordering triggers mutation
- [ ] Error states display correctly

### Integration Tests

- [ ] Upload single image end-to-end
- [ ] Upload multiple images
- [ ] Delete image
- [ ] Reorder images
- [ ] Handle partial upload failures
- [ ] Display optimized images

### User Experience Tests

- [ ] Loading states show during operations
- [ ] Success toasts appear
- [ ] Error toasts appear
- [ ] Optimistic updates work for reordering
- [ ] Images load with proper aspect ratios

---

## 11. Common Issues & Solutions

### Issue: Images not uploading

**Check:**

- Network tab for API errors
- CORS configuration on backend
- File size limits
- Auth token in localStorage

### Issue: Drag and drop not working

**Check:**

- @dnd-kit dependencies installed
- Sensors configured correctly
- Items have unique IDs

### Issue: Slow image loading

**Check:**

- Using thumbnailUrl for thumbnails
- Cloudinary f_auto,q_auto transformations
- Next.js Image component for optimization

---
