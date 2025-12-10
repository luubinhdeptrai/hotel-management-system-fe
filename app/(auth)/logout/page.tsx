"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockLogout } from "@/lib/mock-auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    mockLogout();
    router.push("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Đang đăng xuất...</p>
    </div>
  );
}
