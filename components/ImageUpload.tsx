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
    data: rawImages,
    isLoading,
    error,
  } = entityType === "roomType"
    ? useRoomTypeImages(entityId)
    : useServiceImages(entityId);

  // Handle potential response wrapping (e.g. { data: [...] } or just [...])
  const images: ImageResponse[] = Array.isArray(rawImages)
    ? rawImages
    : (rawImages as any)?.data && Array.isArray((rawImages as any).data)
    ? (rawImages as any).data
    : [];

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

  // Gracefully handle error - backend endpoint might not be implemented yet
  if (error) {
    return (
      <div className="space-y-6">
        {/* Upload Area - still allow uploads even if fetching failed */}
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
                Drag &amp; drop images here, or click to select
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

        <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
          No existing images found. Upload new images above.
        </div>
      </div>
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
              Drag &amp; drop images here, or click to select
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
