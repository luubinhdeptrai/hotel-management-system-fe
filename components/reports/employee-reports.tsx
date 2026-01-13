"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Activity } from "lucide-react";

export function EmployeeReports() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-orange-500" />
            Báo Cáo Hiệu Suất Nhân Viên
          </CardTitle>
          <CardDescription>
            Chức năng đang được phát triển
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Activity className="h-16 w-16 text-orange-300" />
            <p className="text-center">
              Báo cáo hiệu suất nhân viên sẽ sớm được bổ sung
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
