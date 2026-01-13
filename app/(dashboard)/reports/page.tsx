"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  Hotel,
  UserCheck,
  Package,
} from "lucide-react";
import { 
  RevenueReports, 
  RoomReports, 
  CustomerReports, 
  EmployeeReports,
  ServiceReports
} from "@/components/reports";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("revenue");

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Báo Cáo Phân Tích
          </h1>
          <p className="text-muted-foreground mt-2">
            Phân tích chuyên sâu về doanh thu, khách hàng, nhân viên và hoạt động kinh doanh
          </p>
        </div>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-muted/50 p-1 h-auto">
          <TabsTrigger 
            value="revenue" 
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white gap-2 py-2.5"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Doanh Thu</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="rooms" 
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white gap-2 py-2.5"
          >
            <Hotel className="h-4 w-4" />
            <span className="hidden sm:inline">Phòng</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="customers" 
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white gap-2 py-2.5"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Khách Hàng</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="employees" 
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white gap-2 py-2.5"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Nhân Viên</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="services" 
            className="data-[state=active]:bg-linear-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white gap-2 py-2.5"
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Dịch Vụ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueReports />
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <RoomReports />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerReports />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeReports />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServiceReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
