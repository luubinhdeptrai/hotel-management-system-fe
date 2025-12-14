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
import { fetchDashboardData } from "@/lib/services/dashboard.service";
import { authService } from "@/lib/services/auth.service";

// ============================================================================
// Configuration - Toggle between mock and real API
// ============================================================================

/**
 * Set this to false to use real API data
 * Set to true to use mock data (for development/testing)
 */
const USE_MOCK_DATA = false;

// ============================================================================
// Hook Interface
// ============================================================================

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
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// Default Values
// ============================================================================

const defaultStats: DashboardStats = {
  totalRooms: 0,
  availableRooms: 0,
  dirtyRooms: 0,
  todayRevenue: 0,
  currentGuests: 0,
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDashboardPage(): UseDashboardPageResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  // API data states
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [roomStatusData, setRoomStatusData] = useState<RoomStatusData[]>([]);
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (USE_MOCK_DATA) {
      // Use mock data
      setStats(getMockDashboardStats());
      setRoomStatusData(getMockRoomStatusData());
      setArrivals(getMockArrivals());
      setDepartures(getMockDepartures());
      setIsLoading(false);
      return;
    }

    // Use real API
    try {
      const data = await fetchDashboardData();
      setStats(data.stats);
      setRoomStatusData(data.roomStatusData);
      setArrivals(data.arrivals);
      setDepartures(data.departures);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard. Đang sử dụng dữ liệu mẫu.");

      // Fallback to mock data on error
      setStats(getMockDashboardStats());
      setRoomStatusData(getMockRoomStatusData());
      setArrivals(getMockArrivals());
      setDepartures(getMockDepartures());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate derived values
  const occupancyRate = useMemo(() => {
    if (!stats.totalRooms) return 0;
    return ((stats.totalRooms - stats.availableRooms) / stats.totalRooms) * 100;
  }, [stats]);

  const roomsNeedingCleaning = useMemo(() => {
    return (
      roomStatusData.find((room) => room.status === "Bẩn")?.count ??
      roomStatusData.find((room) => room.status === "Đang dọn dẹp")?.count ??
      0
    );
  }, [roomStatusData]);

  const arrivalsCount = useMemo(() => arrivals.length, [arrivals]);
  const departuresCount = useMemo(() => departures.length, [departures]);

  // Redirect if not authenticated
  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [router, user]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Fallback to mock logout if API fails
      mockLogout();
    }
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
    isLoading,
    error,
    refetch: fetchData,
  };
}
