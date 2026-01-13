"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export function ServiceReports() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-pink-500" />
            Báo Cáo Dịch Vụ
          </CardTitle>
          <CardDescription>
            Chức năng đang được phát triển
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Package className="h-16 w-16 text-pink-300" />
            <p className="text-center">
              Báo cáo dịch vụ và thống kê sử dụng sẽ sớm được bổ sung
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
