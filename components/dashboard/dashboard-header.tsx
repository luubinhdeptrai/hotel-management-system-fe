import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const now = new Date();
  const formattedDate = format(now, "EEEE, dd MMMM yyyy", { locale: vi });
  const formattedTime = format(now, "HH:mm:ss");

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-2xl p-8 shadow-2xl overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl -mr-40 -mt-40"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-2">
          Chào mừng, <span className="text-cyan-200">{userName || "Quản lý"}</span>
        </h1>
        <p className="text-blue-100 text-lg mb-6">
          Tổng quan hoạt động khách sạn thời gian thực
        </p>

        {/* Date and Time */}
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg">
            <Calendar size={20} className="text-cyan-200" />
            <span className="font-semibold capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg">
            <Clock size={20} className="text-cyan-200" />
            <span className="font-mono font-semibold">{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
