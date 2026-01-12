import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee } from "@/lib/types/api";
import { authService } from "@/lib/services/auth.service";

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  averageRoomRate: number;
  availableRooms: number;
  dirtyRooms: number;
}

interface RoomStatusData {
  id: string;
  name: string;
  status: string;
  count: number;
  color: string;
}
import type { Arrival } from "@/components/dashboard/arrivals-table";
import type { Departure } from "@/components/dashboard/departures-table";

interface UseDashboardPageResult {
  user: Employee | null;
  stats: DashboardStats;
  roomStatusData: RoomStatusData[];
  arrivals: Arrival[];
  departures: Departure[];
  occupancyRate: number;
  arrivalsCount: number;
  departuresCount: number;
  roomsNeedingCleaning: number;
  handleLogout: () => void;
}

export function useDashboardPage(): UseDashboardPageResult {
  const router = useRouter();
  const [user, setUser] = useState<Employee | null>(() => authService.getStoredUser());

  // Default empty data - should be fetched from API in production
  const stats: DashboardStats = {
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    averageRoomRate: 0,
    availableRooms: 0,
    dirtyRooms: 0,
  };

  const roomStatusData: RoomStatusData[] = [];
  const arrivals: Arrival[] = [];
  const departures: Departure[] = [];

  const occupancyRate = useMemo(() => stats.occupancyRate, [stats]);
  const roomsNeedingCleaning = 0;
  const arrivalsCount = useMemo(() => arrivals.length, [arrivals]);
  const departuresCount = useMemo(() => departures.length, [departures]);

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [router, user]);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    stats,
    roomStatusData,
    arrivals,
    departures,
    occupancyRate,
    arrivalsCount,
    departuresCount,
    roomsNeedingCleaning,
    handleLogout,
  };
}
