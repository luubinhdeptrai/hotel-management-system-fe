/**
 * Service Index
 * Central export for all API services
 */

export { authService } from "./auth.service";
export { bookingService } from "./booking.service";
export { customerService } from "./customer.service";
export { employeeService } from "./employee.service";
export { roomService } from "./room.service";
export { roomTagService } from "./roomTag.service";
export { serviceManagementService } from "./service.service";

// Re-export API utilities
export { api, ApiError, getAccessToken, clearTokens } from "./api";
