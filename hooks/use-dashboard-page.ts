import { useEffect, useState } from "react";
import { bookingsApi } from "@/lib/api/bookings.api";
import { reportsApi } from "@/lib/api/reports.api";

interface BookingResponse {
  id: string;
  primaryCustomer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  bookingRooms?: Array<{
    room?: {
      roomNumber: string;
    };
  }>;
  checkInDate?: string;
  checkOutDate?: string;
}

interface OccupancyForecast {
  forecast: Array<{
    date: string;
    period: string;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
  }>;
}

interface OccupancyForecastResult {
  forecast: Array<{
    date: string;
    period: string;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
  }>;
}

interface Arrival {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roomNumbers?: string[];
  checkInTime?: string;
  totalGuests?: number;
}

interface Departure {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roomNumbers?: string[];
  checkOutTime?: string;
}

export const useDashboardPage = () => {
  const [stats, setStats] = useState({
    availableRooms: 0,
    dirtyRooms: 0,
    occupancyRate: 0,
    totalRevenue: 0,
    roomRevenue: 0,
    serviceRevenue: 0,
    totalBookings: 0,
    totalRoomNights: 0,
    averageRoomRate: 0,
    revenuePerAvailableRoom: 0,
  });

  const [occupancyData, setOccupancyData] = useState<OccupancyForecast | null>(null);
  const [arrivalsData, setArrivalsData] = useState<Arrival[]>([]);
  const [departuresData, setDeparturesData] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get tomorrow's date to query for seeded bookings
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowISO = tomorrow.toISOString().split("T")[0];

      // Query date range: tomorrow to tomorrow + 30 days
      const endDate = new Date(tomorrow);
      endDate.setDate(endDate.getDate() + 30);
      const endDateISO = endDate.toISOString().split("T")[0];

      const [revenueSummary, occupancyForecast, arrivals, departures] =
        await Promise.all([
          reportsApi.getRevenueSummary({
            fromDate: tomorrowISO,
            toDate: tomorrowISO,
          }),
          reportsApi.getOccupancyForecast({
            startDate: tomorrowISO,
            endDate: endDateISO,
          }),
          bookingsApi.getArrivalsToday(),
          bookingsApi.getDeparturesToday(),
        ]);

      // Transform revenue data
      if (revenueSummary?.summary) {
        const summary = revenueSummary.summary;
        setStats({
          availableRooms: 0, // Will be set from room status
          dirtyRooms: 0, // Will be set from room status
          occupancyRate: summary.occupancyRate || 0,
          totalRevenue: summary.totalRevenue || 0,
          roomRevenue: summary.roomRevenue || 0,
          serviceRevenue: summary.serviceRevenue || 0,
          totalBookings: summary.totalBookings || 0,
          totalRoomNights: summary.totalRoomNights || 0,
          averageRoomRate: summary.averageDailyRate || 0,
          revenuePerAvailableRoom: summary.revenuePerAvailableRoom || 0,
        });
      }

      // Transform occupancy forecast data
      if (occupancyForecast) {
        const transformedForecast: OccupancyForecast = {
          forecast: occupancyForecast.forecast.map((item) => ({
            ...item,
            availableRooms: item.totalRooms - item.occupiedRooms,
          })),
        };
        setOccupancyData(transformedForecast);
      }

      // Transform arrivals
      if (arrivals && Array.isArray(arrivals)) {
        const transformedArrivals: Arrival[] = arrivals.map((booking: BookingResponse) => ({
          id: booking.id,
          name: booking.primaryCustomer?.fullName || "N/A",
          email: booking.primaryCustomer?.email || "",
          phone: booking.primaryCustomer?.phone || "",
          roomNumbers: booking.bookingRooms?.map((br) => br.room?.roomNumber).filter(Boolean) as string[] || [],
          checkInTime: booking.checkInDate || "",
          totalGuests: booking.bookingRooms?.length || 0,
        }));
        setArrivalsData(transformedArrivals);
      }

      // Transform departures
      if (departures && Array.isArray(departures)) {
        const transformedDepartures: Departure[] = departures.map((booking: BookingResponse) => ({
          id: booking.id,
          name: booking.primaryCustomer?.fullName || "N/A",
          email: booking.primaryCustomer?.email || "",
          phone: booking.primaryCustomer?.phone || "",
          roomNumbers: booking.bookingRooms?.map((br) => br.room?.roomNumber).filter(Boolean) as string[] || [],
          checkOutTime: booking.checkOutDate || "",
        }));
        setDeparturesData(transformedDepartures);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    occupancyData,
    arrivalsData,
    departuresData,
    loading,
  };
};
