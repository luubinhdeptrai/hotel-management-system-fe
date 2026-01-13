/**
 * SERVICE USAGE INTEGRATION GUIDE
 * 
 * Hướng dẫn tích hợp ServiceUsageList vào các màn hình
 * 
 * ✅ HOÀN TẤT:
 * - Check-out Details: INTEGRATED (modern-check-out-details.tsx)
 * 
 * CÓ THỂ INTEGRATE:
 * - Booking Details
 * - Folio/Bill View
 * - Service Management
 * 
 * DOCUMENTATION:
 * See SERVICE_USAGE_IMPLEMENTATION.md for complete details
 */

// Example code comments below. For actual integration:
// 1. Copy ServiceUsageList component to your page
// 2. Add props: bookingId, onAddService callback
// 3. Place in your JSX layout
// 4. Handle refresh callbacks to reload data

export const INTEGRATION_EXAMPLES = `
1. CHECK-OUT DETAILS (COMPLETED)
   File: components/checkin-checkout/modern-check-out-details.tsx
   Status: INTEGRATED and working

2. BOOKING DETAILS
   Import ServiceUsageList
   Pass bookingId prop
   Wrap in useState for refresh

3. FOLIO/BILL VIEW
   Use ServiceUsageList in read-only mode
   Display alongside payment details

4. ROOM-SPECIFIC VIEW
   Pass both bookingId and bookingRoomId
   Filter shows only that room's services

API USAGE:
   import { serviceUsageService } from "@/lib/services";
   
   // Get list
   serviceUsageService.getServiceUsages({ bookingId })
   
   // Create
   serviceUsageService.createServiceUsage(data)
   
   // Update
   serviceUsageService.updateServiceUsage(id, data)
   
   // Delete
   serviceUsageService.deleteServiceUsage(id)

KEY FEATURES:
   - CRUD operations
   - Status management
   - Auto-calculate totals
   - Permission checking
   - Error handling
   - Loading states
`;

export const SERVICE_USAGE_INTEGRATION_GUIDE = {
  status: "READY FOR USE",
  integrated: ["modern-check-out-details.tsx"],
  canIntegrate: [
    "booking-details.tsx",
    "folio-view.tsx",
    "service-management.tsx"
  ],
  features: [
    "CRUD operations",
    "Status management",
    "Auto-calculate totals",
    "Permission checking",
    "Error handling",
    "Loading states"
  ]
};
