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
