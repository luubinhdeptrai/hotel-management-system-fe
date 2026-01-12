"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear authentication data
    authService.logout();
    
    // Redirect to login
    const timer = setTimeout(() => {
      router.push("/login");
    }, 500);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Đang đăng xuất...</p>
    </div>
  );
}
