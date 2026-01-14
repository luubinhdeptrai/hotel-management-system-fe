# AI Workflow Guide - Hotel Management System

## Document 2: AI Agent Implementation Guide

> **For AI Agents** - Strict implementation rules, patterns, and checklists for consistent code generation

**Purpose:** This document provides AI agents with explicit instructions for implementing features in this Next.js hotel management system. Follow these rules **exactly** to maintain code quality and consistency.

---

## Table of Contents

1. [Critical Rules (NEVER VIOLATE)](#critical-rules-never-violate)
2. [Feature Implementation Checklist](#feature-implementation-checklist)
3. [Code Generation Rules](#code-generation-rules)
4. [Type System Rules](#type-system-rules)
5. [Component Creation Rules](#component-creation-rules)
6. [Hook Creation Rules](#hook-creation-rules)
7. [Service Layer Rules](#service-layer-rules)
8. [Styling Rules](#styling-rules)
9. [Error Handling Patterns](#error-handling-patterns)
10. [File Creation Templates](#file-creation-templates)

---

## Critical Rules (NEVER VIOLATE)

### 🚨 Mandatory Rules

1. **ALL UI TEXT MUST BE IN VIETNAMESE**
   - Buttons: "Lưu" not "Save", "Hủy" not "Cancel"
   - Messages: "Thành công" not "Success"
   - Placeholders: "Tìm kiếm..." not "Search..."

2. **NO HARDCODED COLORS IN CLASSNAMES**
   ```tsx
   // ✅ CORRECT
   <div className="bg-primary-blue-600 text-white">
   
   // ❌ WRONG
   <div className="bg-[#1E40AF] text-[#FFFFFF]">
   ```

3. **ALWAYS USE TYPE IMPORTS**
   ```typescript
   // ✅ CORRECT
   import type { Booking } from "@/lib/types/api";
   
   // ❌ WRONG
   import { Booking } from "@/lib/types/api";
   ```

4. **NO `any` TYPES EVER**
   ```typescript
   // ✅ CORRECT
   function processData(data: Booking[]): void { }
   
   // ❌ WRONG
   function processData(data: any): void { }
   ```

5. **USE CENTRALIZED ICON ENUM**
   ```tsx
   // ✅ CORRECT
   import { ICONS } from "@/src/constants/icons.enum";
   <span className="w-4 h-4">{ICONS.CHECK}</span>
   
   // ❌ WRONG
   import { Check } from "lucide-react";
   <Check className="w-4 h-4" />
   ```

6. **ALWAYS USE `cn()` FOR CONDITIONAL CLASSES**
   ```tsx
   // ✅ CORRECT
   import { cn } from "@/lib/utils";
   <div className={cn("base-class", isActive && "active-class")}>
   
   // ❌ WRONG
   <div className={`base-class ${isActive ? 'active-class' : ''}`}>
   ```

7. **USE LOGGER, NOT console.log**
   ```typescript
   // ✅ CORRECT
   import { logger } from "@/lib/utils/logger";
   logger.error("Failed:", error);
   
   // ❌ WRONG
   console.log("Failed:", error);
   ```

8. **"use client" ONLY WHEN NECESSARY**
   - Add only if using hooks, browser APIs, or event handlers
   - Server Components by default

---

## Feature Implementation Checklist

When implementing a new feature, complete ALL steps in order:

### Phase 1: Planning & Types ✅

- [ ] Read `docs/page-description.md` for feature requirements (Vietnamese)
- [ ] Read `docs/ui-specifications.md` for design system specs
- [ ] Identify backend API endpoints from `docs/API_QUICK_REFERENCE.md`
- [ ] Create type definitions in `lib/types/`
- [ ] Verify no existing types can be reused

### Phase 2: Service Layer ✅

- [ ] Create service file in `lib/services/[feature].service.ts`
- [ ] Implement all API calls with proper typing
- [ ] Add JSDoc comments for each method
- [ ] Handle errors properly (throw ApiError)
- [ ] Export service object (not class)

### Phase 3: Business Logic (Hooks) ✅

- [ ] Create hook in `hooks/use-[feature].ts`
- [ ] Implement state management (useState, useReducer, Redux)
- [ ] Call service methods with error handling
- [ ] Return clean API (no internal state leaks)
- [ ] Add loading/error states

### Phase 4: UI Components ✅

- [ ] Create component folder `components/[feature]/`
- [ ] Build atomic components first (inputs, cards)
- [ ] Compose complex components from atoms
- [ ] Use ShadCN components where possible (restyled)
- [ ] Apply design system colors/spacing

### Phase 5: Page Integration ✅

- [ ] Create page in `app/(dashboard)/[feature]/page.tsx`
- [ ] Use "use client" directive if needed
- [ ] Import and compose components
- [ ] Connect to hook for business logic
- [ ] Add permission guards if needed

### Phase 6: Testing & Refinement ✅

- [ ] Test all user flows
- [ ] Verify Vietnamese text rendering
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Ensure proper error handling
- [ ] Verify permission checks work

---

## Code Generation Rules

### File Structure Rules

```typescript
// MANDATORY ORDER FOR ALL FILES:

// 1. "use client" directive (if needed)
"use client";

// 2. React/Next.js imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 3. External library imports
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// 4. Internal component imports
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

// 5. Hook imports
import { useAuth } from "@/hooks/use-auth";

// 6. Service imports
import { bookingService } from "@/lib/services";

// 7. Utility imports
import { cn, formatCurrency } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

// 8. Type imports
import type { Booking } from "@/lib/types/api";

// 9. Constant imports
import { ICONS } from "@/src/constants/icons.enum";

// 10. Component definition
export function MyComponent() {
  // Implementation
}
```

### Naming Rules

| Entity | Pattern | Example |
|--------|---------|---------|
| Component File | PascalCase.tsx | `CheckInModal.tsx` |
| Hook File | use-kebab-case.ts | `use-checkin.ts` |
| Service File | kebab-case.service.ts | `booking.service.ts` |
| Type File | kebab-case.ts | `api.ts`, `checkin-checkout.ts` |
| Route Folder | kebab-case | `checkin/`, `room-types/` |
| Interface | PascalCase with suffix | `BookingProps`, `CheckInState` |
| Type Alias | PascalCase | `BookingStatus`, `RoomType` |
| Function | camelCase | `handleSearch`, `formatDate` |
| Variable | camelCase | `bookingList`, `isLoading` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_GUESTS` |

---

## Type System Rules

### 1. Define Types First

```typescript
// lib/types/checkin-checkout.ts

// Backend request types
export interface BackendCheckInRequest {
  checkInInfo: {
    bookingRoomId: string;
    customerIds: string[];
  }[];
}

// Frontend form types
export interface WalkInFormData {
  customerName: string;
  phoneNumber: string;
  identityCard: string;
  email?: string; // Optional with ?
  checkInDate: string; // ISO string
  checkOutDate: string;
  rooms: { roomId: string }[];
  numberOfGuests: number;
}

// Component prop types
export interface CheckInModalProps {
  open: boolean;
  booking: Booking | null;
  onConfirm: (data: BackendCheckInRequest) => Promise<void>;
  isLoading?: boolean; // Optional props with ?
}
```

### 2. Import Types Correctly

```typescript
// ✅ CORRECT: Type-only import
import type { Booking, Customer } from "@/lib/types/api";

// ✅ CORRECT: Mixed import
import { bookingService } from "@/lib/services";
import type { Booking } from "@/lib/types/api";

// ❌ WRONG: Regular import for types
import { Booking } from "@/lib/types/api";
```

### 3. Use Discriminated Unions

```typescript
// ✅ CORRECT
type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

interface Booking {
  id: string;
  status: BookingStatus;
}

// ❌ WRONG
interface Booking {
  id: string;
  status: string; // Too broad!
}
```

### 4. Generic Types for Reusability

```typescript
// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Usage
const response: ApiResponse<Booking[]> = await api.get("/bookings");
```

---

## Component Creation Rules

### Component Template

```tsx
"use client"; // Only if using hooks/interactivity

// Imports (follow order from Code Generation Rules)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import { cn } from "@/lib/utils";
import type { Booking } from "@/lib/types/api";

// Props interface
interface CheckInModalProps {
  open: boolean;
  booking: Booking | null;
  onConfirm: (data: BackendCheckInRequest) => Promise<void>;
  onCancel?: () => void;
}

// Component
export function CheckInModal({
  open,
  booking,
  onConfirm,
  onCancel,
}: CheckInModalProps) {
  // 1. Hooks (state, context, custom hooks)
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 2. Derived state
  const hasRooms = booking?.bookingRooms && booking.bookingRooms.length > 0;
  
  // 3. Effects
  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setNotes("");
    }
  }, [open]);
  
  // 4. Event handlers
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm({
        checkInInfo: booking!.bookingRooms.map((br) => ({
          bookingRoomId: br.id,
          customerIds: [booking!.primaryCustomerId],
        })),
      });
    } catch (error) {
      logger.error("Check-in failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 5. Early returns
  if (!booking) return null;
  
  // 6. Render
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận Check-in</DialogTitle>
        </DialogHeader>
        
        {/* Content */}
        <div className="space-y-4">
          {/* Booking info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-medium text-gray-900">
              {booking.primaryCustomer?.fullName}
            </p>
            <p className="text-sm text-gray-600">
              {booking.primaryCustomer?.phone}
            </p>
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || !hasRooms}
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 animate-spin">{ICONS.SPINNER}</span>
                Đang xử lý...
              </>
            ) : (
              <>
                <span className="w-4 h-4">{ICONS.CHECK}</span>
                Xác nhận
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Component Rules Checklist

- [ ] Props interface defined before component
- [ ] All props typed (no `any`)
- [ ] Optional props marked with `?`
- [ ] Default values provided where appropriate
- [ ] State hooks at top of component
- [ ] Event handlers named `handle[Action]`
- [ ] Vietnamese text for all UI strings
- [ ] Icons from `ICONS` enum
- [ ] Tailwind classes use semantic tokens
- [ ] `cn()` for conditional classes
- [ ] Early returns for edge cases
- [ ] Loading/disabled states handled

---

## Hook Creation Rules

### Hook Template

```typescript
// hooks/use-checkin.ts
import { useState, useEffect, useCallback } from "react";
import { bookingService } from "@/lib/services";
import { logger } from "@/lib/utils/logger";
import type { Booking } from "@/lib/types/api";
import type { BackendCheckInRequest } from "@/lib/types/checkin-checkout";

// Hook return type (optional but recommended)
interface UseCheckInReturn {
  // Data
  query: string;
  results: Booking[];
  selectedBooking: Booking | null;
  
  // UI state
  showModal: boolean;
  isLoading: boolean;
  
  // Actions
  handleSearch: (query: string) => Promise<void>;
  handleSelectBooking: (booking: Booking) => void;
  handleConfirmCheckIn: (data: BackendCheckInRequest) => Promise<string>;
  resetModal: () => void;
}

export function useCheckIn(): UseCheckInReturn {
  // 1. State declarations
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Effects (data fetching, subscriptions)
  useEffect(() => {
    // Fetch initial data
    fetchInitialBookings();
  }, []);
  
  // 3. Helper functions (internal, not returned)
  const fetchInitialBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.searchBookings("");
      setResults(data.filter((b) => b.status === "CONFIRMED"));
    } catch (error) {
      logger.error("Failed to fetch bookings:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 4. Public action handlers (returned to consumers)
  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    try {
      const data = await bookingService.searchBookings(searchQuery);
      setResults(data.filter((b) => b.status === "CONFIRMED"));
    } catch (error) {
      logger.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleSelectBooking = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  }, []);
  
  const handleConfirmCheckIn = useCallback(
    async (data: BackendCheckInRequest): Promise<string> => {
      setIsLoading(true);
      try {
        await bookingService.checkIn(data);
        
        // Update local state after success
        setResults((prev) =>
          prev.filter((b) => b.id !== selectedBooking?.id)
        );
        
        setShowModal(false);
        setSelectedBooking(null);
        
        return selectedBooking?.primaryCustomer?.fullName || "Guest";
      } catch (error) {
        logger.error("Check-in failed:", error);
        throw error; // Re-throw for component to handle
      } finally {
        setIsLoading(false);
      }
    },
    [selectedBooking]
  );
  
  const resetModal = useCallback(() => {
    setShowModal(false);
    setSelectedBooking(null);
  }, []);
  
  // 5. Return public API
  return {
    // Data
    query,
    results,
    selectedBooking,
    
    // UI state
    showModal,
    isLoading,
    
    // Actions
    handleSearch,
    handleSelectBooking,
    handleConfirmCheckIn,
    resetModal,
  };
}
```

### Hook Rules Checklist

- [ ] Hook name starts with `use`
- [ ] Return type interface defined
- [ ] State grouped logically
- [ ] Effects for side effects only
- [ ] `useCallback` for functions passed as props
- [ ] Error handling with try-catch
- [ ] Loading states managed
- [ ] Logger used instead of console
- [ ] Services called, not direct API calls
- [ ] Clean public API returned (no internal state)

---

## Service Layer Rules

### Service Template

```typescript
// lib/services/booking.service.ts

/**
 * Booking Service
 * Handles all booking-related API calls for employee dashboard
 */

import { api } from "./api";
import type {
  ApiResponse,
  Booking,
  CreateBookingRequest,
  CreateBookingResponse,
  CheckInRequest,
} from "@/lib/types/api";

// Service-specific types (if needed)
export interface BookingSearchParams {
  query?: string;
  status?: BookingStatus;
  checkInDate?: string;
  checkOutDate?: string;
}

/**
 * Build query string from params object
 * @param params - Query parameters
 * @returns URL query string
 */
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const bookingService = {
  // ============================================================================
  // LIST & SEARCH
  // ============================================================================

  /**
   * Search bookings by query string
   * @param query - Search term (name, phone, booking ID)
   * @returns Array of matching bookings
   */
  async searchBookings(query: string): Promise<Booking[]> {
    const response = await api.get<ApiResponse<Booking[]>>(
      `/employee/bookings/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  /**
   * Get all bookings with filters
   * @param params - Filter parameters
   * @returns Paginated booking list
   */
  async getAllBookings(
    params?: BookingSearchParams
  ): Promise<PaginatedResponse<Booking>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await api.get<PaginatedResponse<Booking>>(
      `/employee/bookings${queryString}`
    );
    return response;
  },

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Get booking by ID with full details
   * @param bookingId - Booking ID
   * @returns Booking with nested relations
   */
  async getBookingById(bookingId: string): Promise<BookingResponse> {
    const response = await api.get<BookingResponse>(
      `/employee/bookings/${bookingId}`
    );
    return response;
  },

  /**
   * Create new booking
   * @param data - Booking creation data
   * @returns Created booking with ID
   */
  async createBooking(
    data: CreateBookingRequest
  ): Promise<CreateBookingResponse> {
    const response = await api.post<CreateBookingResponse>(
      "/employee/bookings",
      data
    );
    return response;
  },

  // ============================================================================
  // CHECK-IN/OUT
  // ============================================================================

  /**
   * Check in a confirmed booking
   * @param data - Check-in request with room-customer assignments
   * @throws ApiError if booking not found or already checked in
   */
  async checkIn(data: CheckInRequest): Promise<void> {
    await api.post("/employee/bookings/check-in", data);
  },

  /**
   * Check out a checked-in booking
   * @param bookingId - Booking ID
   * @throws ApiError if booking not checked in
   */
  async checkOut(bookingId: string): Promise<void> {
    await api.post(`/employee/bookings/${bookingId}/check-out`, {});
  },
};
```

### Service Rules Checklist

- [ ] JSDoc comments for every method
- [ ] Explicit return types
- [ ] Parameter types defined
- [ ] Use `api` client from `lib/services/api.ts`
- [ ] Export service object (not class)
- [ ] Group related methods with comments
- [ ] Helper functions (like `buildQueryString`) kept internal
- [ ] No business logic (just API calls)
- [ ] Throw errors, don't catch (let hooks handle)

---

## Styling Rules

### Color Usage (MANDATORY)

```tsx
// ✅ CORRECT: Use palette tokens
<button className="bg-primary-blue-600 text-white hover:bg-primary-blue-700">
  Đặt phòng
</button>

// ✅ CORRECT: Use status colors
<Badge className="bg-success-100 text-success-700">Trống</Badge>
<Badge className="bg-warning-100 text-warning-700">Đang dọn</Badge>
<Badge className="bg-error-100 text-error-700">Bảo trì</Badge>
<Badge className="bg-info-100 text-info-700">Đang thuê</Badge>

// ✅ CORRECT: Use neutral colors
<div className="bg-gray-50 border border-gray-300 text-gray-900">

// ❌ WRONG: Hardcoded hex colors
<button className="bg-[#1E40AF]"> // NEVER DO THIS
```

### Available Color Palette

```typescript
// Primary (Blue)
primary-blue-700, primary-blue-600, primary-blue-500, primary-blue-400,
primary-blue-300, primary-blue-200, primary-blue-100, primary-blue-50

// Neutral (Gray)
gray-900, gray-700, gray-500, gray-300, gray-200, gray-100, gray-50

// Status
success-600, success-500, success-100  // Green (Available, Success)
warning-600, warning-500, warning-100  // Orange (Cleaning, Warning)
error-600, error-500, error-100        // Red (Maintenance, Error)
info-600, info-500, info-100           // Cyan (Occupied, Info)

// Accent
accent-gold-500, accent-gold-100
```

### Spacing Scale (Use Tailwind tokens)

```tsx
// ✅ CORRECT: Tailwind spacing
<div className="space-y-4 p-6 gap-2 mt-8">

// Standard scale: p-1=4px, p-2=8px, p-3=12px, p-4=16px, p-5=20px, p-6=24px, p-8=32px

// ❌ WRONG: Arbitrary values
<div className="p-[18px] mt-[13px]"> // Avoid unless absolutely necessary
```

### Typography

```tsx
// ✅ CORRECT: Semantic classes
<h1 className="text-3xl font-bold text-gray-900">Tiêu đề</h1>
<h2 className="text-2xl font-semibold text-gray-900">Phụ đề</h2>
<p className="text-base text-gray-700">Nội dung chính</p>
<span className="text-sm text-gray-600">Chi tiết phụ</span>
<small className="text-xs text-gray-500">Ghi chú nhỏ</small>
```

### Component Styling Pattern

```tsx
// ✅ CORRECT: Tailwind with cn()
export function RoomCard({ status, isSelected }: Props) {
  return (
    <div
      className={cn(
        // Base styles
        "rounded-lg border p-4 transition-all",
        // Conditional styles
        isSelected && "ring-2 ring-primary-blue-500",
        // Status-based styles
        status === "AVAILABLE" && "bg-success-100 border-success-300",
        status === "OCCUPIED" && "bg-info-100 border-info-300",
        status === "MAINTENANCE" && "bg-error-100 border-error-300"
      )}
    >
      {/* Content */}
    </div>
  );
}
```

---

## Error Handling Patterns

### Service Layer (Throw)

```typescript
// lib/services/booking.service.ts
export const bookingService = {
  async checkIn(data: CheckInRequest): Promise<void> {
    // Don't catch errors here - let them bubble up
    await api.post("/employee/bookings/check-in", data);
  },
};
```

### Hook Layer (Catch & Log)

```typescript
// hooks/use-checkin.ts
export function useCheckIn() {
  const handleConfirmCheckIn = async (data: BackendCheckInRequest) => {
    setIsLoading(true);
    try {
      await bookingService.checkIn(data);
      // Handle success
      setResults((prev) => prev.filter((b) => b.id !== selectedBooking?.id));
      return selectedBooking?.primaryCustomer?.fullName || "Guest";
    } catch (error) {
      logger.error("Check-in failed:", error);
      throw error; // Re-throw for component to show notification
    } finally {
      setIsLoading(false);
    }
  };

  return { handleConfirmCheckIn };
}
```

### Component Layer (User Feedback)

```tsx
// app/(dashboard)/checkin/page.tsx
export default function CheckInPage() {
  const checkIn = useCheckIn();
  const notification = useNotification();

  const handleCheckInConfirm = async (data: BackendCheckInRequest) => {
    try {
      const guestName = await checkIn.handleConfirmCheckIn(data);
      notification.showSuccess(`Check-in thành công cho ${guestName}!`);
    } catch (error) {
      // Specific error messages
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          notification.showError("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
        } else if (error.statusCode === 404) {
          notification.showError("Không tìm thấy booking.");
        } else if (error.statusCode === 409) {
          notification.showError("Phòng đã được check-in.");
        } else {
          notification.showError("Check-in thất bại. Vui lòng thử lại.");
        }
      } else {
        notification.showError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
      logger.error("Check-in error in component:", error);
    }
  };

  return (
    // JSX
  );
}
```

---

## File Creation Templates

### 1. New Feature Page Template

```tsx
// app/(dashboard)/[feature]/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FeatureList } from "@/components/[feature]/feature-list";
import { FeatureModal } from "@/components/[feature]/feature-modal";
import { ICONS } from "@/src/constants/icons.enum";
import { useFeature } from "@/hooks/use-feature";
import { useNotification } from "@/hooks/use-notification";

export default function FeaturePage() {
  const feature = useFeature();
  const notification = useNotification();

  const handleCreate = async (data: FeatureFormData) => {
    try {
      await feature.handleCreate(data);
      notification.showSuccess("Tạo thành công!");
    } catch (error) {
      notification.showError("Tạo thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tiêu đề</h1>
          <p className="text-sm text-gray-600 mt-1">Mô tả</p>
        </div>
        <Button onClick={() => feature.setShowModal(true)}>
          <span className="w-4 h-4">{ICONS.PLUS}</span>
          Thêm mới
        </Button>
      </div>

      {/* Content */}
      <FeatureList
        items={feature.items}
        isLoading={feature.isLoading}
        onEdit={feature.handleEdit}
        onDelete={feature.handleDelete}
      />

      {/* Modal */}
      <FeatureModal
        open={feature.showModal}
        onOpenChange={feature.setShowModal}
        onSubmit={handleCreate}
      />
    </div>
  );
}
```

### 2. New Hook Template

```typescript
// hooks/use-[feature].ts
import { useState, useCallback } from "react";
import { [feature]Service } from "@/lib/services";
import { logger } from "@/lib/utils/logger";
import type { Feature } from "@/lib/types/api";

export function useFeature() {
  const [items, setItems] = useState<Feature[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await [feature]Service.getAll();
      setItems(data);
    } catch (error) {
      logger.error("Failed to fetch items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (data: CreateFeatureRequest) => {
    setIsLoading(true);
    try {
      const created = await [feature]Service.create(data);
      setItems((prev) => [...prev, created]);
      setShowModal(false);
    } catch (error) {
      logger.error("Failed to create item:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    items,
    showModal,
    isLoading,
    setShowModal,
    fetchItems,
    handleCreate,
  };
}
```

### 3. New Service Template

```typescript
// lib/services/[feature].service.ts

/**
 * Feature Service
 * Description of what this service does
 */

import { api } from "./api";
import type { ApiResponse, Feature } from "@/lib/types/api";

export const [feature]Service = {
  /**
   * Get all items
   * @returns Array of items
   */
  async getAll(): Promise<Feature[]> {
    const response = await api.get<ApiResponse<Feature[]>>("/employee/[feature]");
    return response.data;
  },

  /**
   * Get item by ID
   * @param id - Item ID
   * @returns Item details
   */
  async getById(id: string): Promise<Feature> {
    const response = await api.get<ApiResponse<Feature>>(`/employee/[feature]/${id}`);
    return response.data;
  },

  /**
   * Create new item
   * @param data - Creation data
   * @returns Created item
   */
  async create(data: CreateFeatureRequest): Promise<Feature> {
    const response = await api.post<ApiResponse<Feature>>("/employee/[feature]", data);
    return response.data;
  },

  /**
   * Update existing item
   * @param id - Item ID
   * @param data - Update data
   * @returns Updated item
   */
  async update(id: string, data: UpdateFeatureRequest): Promise<Feature> {
    const response = await api.put<ApiResponse<Feature>>(`/employee/[feature]/${id}`, data);
    return response.data;
  },

  /**
   * Delete item
   * @param id - Item ID
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/employee/[feature]/${id}`);
  },
};
```

### 4. New Component Template

```tsx
// components/[feature]/feature-list.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ICONS } from "@/src/constants/icons.enum";
import { cn } from "@/lib/utils";
import type { Feature } from "@/lib/types/api";

interface FeatureListProps {
  items: Feature[];
  isLoading: boolean;
  onEdit: (item: Feature) => void;
  onDelete: (id: string) => void;
}

export function FeatureList({
  items,
  isLoading,
  onEdit,
  onDelete,
}: FeatureListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="w-8 h-8 animate-spin text-primary-blue-600">
          {ICONS.SPINNER}
        </span>
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Không có dữ liệu</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onEdit(item)}
              >
                <span className="w-4 h-4">{ICONS.EDIT}</span>
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onDelete(item.id)}
              >
                <span className="w-4 h-4 text-error-600">{ICONS.TRASH}</span>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

---

## Implementation Checklist Summary

When implementing ANY feature, verify:

### Types ✅
- [ ] All types defined in `lib/types/`
- [ ] No `any` types used
- [ ] Type imports use `import type`
- [ ] Interfaces use PascalCase

### Services ✅
- [ ] Service in `lib/services/[feature].service.ts`
- [ ] All methods have JSDoc comments
- [ ] Export service object (not class)
- [ ] No business logic (just API calls)

### Hooks ✅
- [ ] Hook in `hooks/use-[feature].ts`
- [ ] Clean return API
- [ ] Error handling with try-catch
- [ ] Logger used for errors

### Components ✅
- [ ] Components in `components/[feature]/`
- [ ] Props interface defined
- [ ] Vietnamese text only
- [ ] Icons from `ICONS` enum
- [ ] Colors use palette tokens (no hex)
- [ ] `cn()` for conditional classes

### Page ✅
- [ ] Page in `app/(dashboard)/[feature]/page.tsx`
- [ ] "use client" if needed
- [ ] Composes components & hooks
- [ ] Notification feedback

### Quality ✅
- [ ] Responsive design tested
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Permission guards if needed

---

## Quick Reference

### Must-Use Utilities

```typescript
import { cn } from "@/lib/utils";              // Merge classNames
import { formatCurrency } from "@/lib/utils";   // Format VND
import { logger } from "@/lib/utils/logger";    // Logging
import { ICONS } from "@/src/constants/icons.enum"; // Icons
```

### Must-Follow Patterns

1. **Types → Services → Hooks → Components → Pages**
2. **Vietnamese UI text only**
3. **No hardcoded colors**
4. **No `any` types**
5. **Type imports: `import type`**
6. **Icons from enum**
7. **Logger not console**
8. **cn() for conditional classes**

---

## When in Doubt

1. **Check existing similar features** for patterns
2. **Read `docs/page-description.md`** for requirements
3. **Read `docs/ui-specifications.md`** for design specs
4. **Follow the templates** in this document exactly
5. **Ask for clarification** rather than guessing

---

**This document is the source of truth for AI-assisted development. Follow it strictly for consistent, high-quality code generation.**
