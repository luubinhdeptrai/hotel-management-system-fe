import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types/auth";
import {
  getMockArrivals,
  getMockDashboardStats,
  getMockDepartures,
  getMockRoomStatusData,
  type DashboardStats,
  type RoomStatusData,
} from "@/lib/mock-dashboard";
import { getCurrentUser, mockLogout } from "@/lib/mock-auth";
import type { Arrival } from "@/components/dashboard/arrivals-table";
import type { Departure } from "@/components/dashboard/departures-table";

interface UseDashboardPageResult {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  const stats = useMemo(() => getMockDashboardStats(), []);
  const roomStatusData = useMemo(() => getMockRoomStatusData(), []);
  const arrivals = useMemo(() => getMockArrivals(), []);
  const departures = useMemo(() => getMockDepartures(), []);

  const occupancyRate = useMemo(() => {
    if (!stats.totalRooms) return 0;
    return ((stats.totalRooms - stats.availableRooms) / stats.totalRooms) * 100;
  }, [stats]);

  const roomsNeedingCleaning = useMemo(() => {
    return (
      roomStatusData.find((room) => room.status === "Đang dọn dẹp")?.count ?? 0
    );
  }, [roomStatusData]);

  const arrivalsCount = useMemo(() => arrivals.length, [arrivals]);
  const departuresCount = useMemo(() => departures.length, [departures]);

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [router, user]);

  const handleLogout = useCallback(() => {
    mockLogout();
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
