import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar/navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-col">
          <Navbar />
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="p-6 min-w-full">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
