"use client";

import { RoomAvailabilityTable } from "./room-availability-table";
import type { RoomAvailabilityData } from "@/lib/types/reports";

interface RoomAvailabilityReportProps {
  roomAvailabilityData: RoomAvailabilityData[];
}

export function RoomAvailabilityReport({
  roomAvailabilityData,
}: RoomAvailabilityReportProps) {
  return (
    <div className="space-y-6">
      <RoomAvailabilityTable data={roomAvailabilityData} />
    </div>
  );
}
