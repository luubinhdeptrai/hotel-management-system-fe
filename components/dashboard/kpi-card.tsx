import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  subtitle?: string;
  alert?: boolean;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-primary-blue-100",
  iconColor = "text-primary-blue-600",
  subtitle,
  alert,
  trend,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        "shadow-sm hover:shadow-md transition-shadow",
        alert && "border-warning-500 border-2 bg-warning-50"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", iconBgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <p
            className={cn(
              "text-xs mt-1",
              trend.isPositive ? "text-success-600" : "text-error-600"
            )}
          >
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
