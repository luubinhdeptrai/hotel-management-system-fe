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
  bgGradient?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconBgColor = "from-primary-600 to-primary-500",
  iconColor = "text-white",
  subtitle,
  alert,
  trend,
  bgGradient = "from-primary-50 to-primary-100/30",
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-linear-to-br rounded-2xl p-6 border-2 border-white/50 shadow-lg hover:-translate-y-1 transition-all duration-300 group",
        bgGradient,
        alert && "border-warning-500 bg-linear-to-br from-warning-50 to-warning-100/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs mt-2 font-semibold",
                trend.isPositive ? "text-success-600" : "text-error-600"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 bg-linear-to-br rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}
