"use client";

import { useDropzone } from "react-dropzone";
import { X, UploadCloud } from "lucide-react";
import Image from "next/image";

interface LocalImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export default function LocalImageUpload({
  files,
  onFilesChange,
}: LocalImageUploadProps) {
  const onDrop = (acceptedFiles: File[]) => {
    // Append new files to existing ones
    onFilesChange([...files, ...acceptedFiles]);
  };

  const removeFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, index) => index !== indexToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-primary-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <UploadCloud
            className={`w-8 h-8 ${
              isDragActive ? "text-primary-500" : "text-gray-400"
            }`}
          />
          {isDragActive ? (
            <p className="text-primary-600 font-medium">
              Thả hình ảnh vào đây...
            </p>
          ) : (
            <div>
              <p className="text-gray-700 font-medium">
                Kéo thả hoặc click để chọn hình ảnh
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Đã chọn {files.length} hình ảnh
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFilesChange([]);
              }}
              className="text-xs text-error-600 hover:text-error-700 font-medium"
            >
              Xóa tất cả
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  fill
                  className="object-cover"
                />

                {/* Overlay with file info and delete button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-1 right-1 bg-white/10 hover:bg-red-500 hover:text-white text-white rounded-full p-1 transition-colors backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-white text-xs text-center truncate w-full px-2 mt-auto pb-1">
                    {file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
