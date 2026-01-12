import { useEffect, useState } from "react";
import { bookingsApi } from "@/lib/api/bookings.api";
 
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

  const [arrivalsData, setArrivalsData] = useState<Arrival[]>([]);
  const [departuresData, setDeparturesData] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [arrivals, departures] =
        await Promise.all([
          bookingsApi.getArrivalsToday(),
          bookingsApi.getDeparturesToday(),
        ]);

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
    arrivalsData,
    departuresData,
    loading,
  };
};
