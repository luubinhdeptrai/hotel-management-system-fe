# Hotel Management System - Architecture Guide

## Document 1: Developer Reference Guide

> **For Developers** - Comprehensive guide to understand the project structure, architecture, and development workflow

**Last Updated:** January 14, 2026  
**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Project Structure](#architecture--project-structure)
4. [Code Organization Principles](#code-organization-principles)
5. [Feature Implementation Lifecycle](#feature-implementation-lifecycle)
6. [Code Style Guidelines](#code-style-guidelines)
7. [State Management Strategy](#state-management-strategy)
8. [API Integration Pattern](#api-integration-pattern)
9. [Component Development Patterns](#component-development-patterns)
10. [Common Development Workflows](#common-development-workflows)

---

## Project Overview

This is a comprehensive hotel management system frontend built for UIT Hotel, serving hotel staff (Receptionist, Manager, Admin) with features for:

- **Check-in/Check-out** management with walk-in support
- **Booking/Reservation** system with calendar view and conflict detection
- **Room Management** with real-time status tracking
- **Payment Processing** with multiple transaction types
- **Service Management** (room service orders, surcharges, penalties)
- **Staff Management** with role-based permissions
- **Reports & Analytics** (revenue, occupancy, customer insights)
- **Customer Ranking** system with dynamic pricing
- **Housekeeping** workflow management

### Key Features

- **Vietnamese Language** - All UI text in Vietnamese
- **Role-Based Access Control** - Permissions enforced at component and route level
- **Real-time Updates** - Optimistic UI updates with server reconciliation
- **Responsive Design** - Mobile, tablet, and desktop support
- **Modern UI/UX** - ShadCN UI components restyled to match design system

---

## Technology Stack

### Core Framework

```json
{
  "next": "^16.1.1",              // App Router, React Server Components
  "react": "19.2.3",              // Latest React with concurrent features
  "typescript": "^5"              // Strict type checking enabled
}
```

### Styling & UI

```json
{
  "tailwindcss": "^4",            // Utility-first CSS framework
  "@tailwindcss/postcss": "^4",   // PostCSS integration
  "lucide-react": "^0.562.0",     // Icon library
  "@radix-ui/*": "latest",        // Headless UI components (ShadCN base)
  "class-variance-authority": "^0.7.1",  // CVA for variants
  "tailwind-merge": "^3.4.0"      // Merge Tailwind classes
}
```

### State Management

```json
{
  "@reduxjs/toolkit": "^2.11.2",  // Redux for global state
  "react-redux": "^9.2.0",        // React bindings
  "@tanstack/react-query": "^5.90.16"  // Server state & caching
}
```

### Form & Validation

```json
{
  "react-hook-form": "^7.70.0",   // Form management
  "@hookform/resolvers": "^5.2.2", // Validation resolvers
  "zod": "^4.3.5"                 // Schema validation
}
```

### HTTP & Data

```json
{
  "axios": "^1.13.2",             // HTTP client
  "date-fns": "^4.1.0"            // Date manipulation
}
```

---

## Architecture & Project Structure

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Pages (RSC)  │  │  Components  │  │     Hooks    │      │
│  │  /app/**     │  │ /components/ │  │   /hooks/    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Redux Store  │  │ React Query  │  │   Context    │      │
│  │ /lib/redux/  │  │ (TanStack)   │  │ Permissions  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │    Schemas   │  │    Utils     │      │
│  │ /lib/services│  │ /lib/schemas │  │  /lib/utils  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Client  │  │  Type Defs   │  │  API Routes  │      │
│  │ /lib/services│  │  /lib/types  │  │   /lib/api   │      │
│  │    /api.ts   │  │    /api.ts   │  │   /*.api.ts  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
                    Backend API (Port 8080)
```

### Directory Structure

```
hotel-management-system-fe/
├── app/                          # Next.js 16 App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing/redirect page
│   ├── providers.tsx            # React Query, Redux, Permissions providers
│   ├── globals.css              # Tailwind imports + CSS variables
│   ├── (auth)/                  # Auth route group (no dashboard layout)
│   │   └── login/page.tsx       # Login page
│   └── (dashboard)/             # Dashboard route group (with sidebar/navbar)
│       ├── layout.tsx           # Dashboard layout (AuthGuard + Sidebar)
│       ├── checkin/             # Check-in feature
│       ├── checkout/            # Check-out feature
│       ├── reservations/        # Booking management
│       ├── rooms/               # Room management
│       ├── room-types/          # Room type configuration
│       ├── customers/           # Customer management
│       ├── services/            # Service management
│       ├── payments/            # Payment processing
│       ├── reports/             # Reports & analytics
│       ├── staff/               # Staff management
│       └── ...                  # Other feature pages
│
├── components/                   # React components
│   ├── ui/                      # ShadCN UI base components (restyled)
│   │   ├── button.tsx           # Button with CVA variants
│   │   ├── dialog.tsx           # Modal/Dialog
│   │   ├── input.tsx            # Form inputs
│   │   └── ...
│   ├── app-sidebar.tsx          # Main navigation sidebar
│   ├── navbar.tsx               # Top navigation bar
│   ├── auth-guard.tsx           # Route protection component
│   ├── permission-guard.tsx     # Permission-based rendering
│   ├── checkin-checkout/        # Check-in/out specific components
│   │   ├── check-in-search.tsx
│   │   ├── check-in-results-table.tsx
│   │   ├── modern-check-in-modal.tsx
│   │   ├── walk-in-modal.tsx
│   │   └── ...
│   ├── reservations/            # Reservation components
│   ├── rooms/                   # Room components
│   └── .../                     # Feature-specific component folders
│
├── hooks/                        # Custom React hooks (business logic)
│   ├── use-auth.ts              # Authentication state & actions
│   ├── use-checkin.ts           # Check-in workflow logic
│   ├── use-checkout.ts          # Check-out workflow logic
│   ├── use-permissions.ts       # Permission checks
│   ├── use-notification.ts      # Toast notifications (sonner)
│   └── use-*.ts                 # Feature-specific hooks
│
├── lib/                          # Core libraries & utilities
│   ├── types/                   # TypeScript type definitions
│   │   ├── api.ts               # Backend API types (from Swagger)
│   │   ├── checkin-checkout.ts  # Check-in/out types
│   │   ├── customer.ts          # Customer types
│   │   ├── room.ts              # Room types
│   │   └── ...
│   ├── services/                # API service layer
│   │   ├── api.ts               # Base API client (Axios wrapper)
│   │   ├── booking.service.ts   # Booking API calls
│   │   ├── auth.service.ts      # Authentication APIs
│   │   ├── room.service.ts      # Room APIs
│   │   └── *.service.ts         # Feature service files
│   ├── schemas/                 # Zod validation schemas
│   │   └── booking.schema.ts    # Booking form validation
│   ├── redux/                   # Redux store setup
│   │   ├── index.ts             # Store configuration
│   │   ├── hooks.ts             # Typed hooks (useAppSelector, etc.)
│   │   └── slices/              # Redux slices
│   │       ├── checkin.slice.ts # Check-in state
│   │       └── auth.slice.ts    # Auth state
│   ├── api/                     # API route handlers (optional)
│   ├── utils/                   # Utility functions
│   │   ├── logger.ts            # Console logger
│   │   ├── format.ts            # Formatting helpers
│   │   └── ...
│   ├── utils.ts                 # Core utilities (cn, formatCurrency)
│   └── permissions-context.tsx  # Permissions Context Provider
│
├── src/                          # Additional source files
│   └── constants/
│       └── icons.enum.tsx       # Centralized Lucide icon exports
│
├── docs/                         # Documentation
│   ├── page-description.md      # Screen specs (Vietnamese)
│   ├── ui-specifications.md     # Design system specs (Vietnamese)
│   ├── API_QUICK_REFERENCE.md   # Backend API reference
│   └── ...
│
├── public/                       # Static assets (images, fonts)
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies & scripts
├── tailwind.config.ts           # Tailwind configuration
├── next.config.ts               # Next.js configuration
└── components.json              # ShadCN UI configuration
```

---

## Code Organization Principles

### 1. **Separation of Concerns**

Each layer has a clear responsibility:

- **Pages** (`/app/**/page.tsx`) - Routing & layout, minimal logic
- **Components** (`/components/**`) - Presentation & UI composition
- **Hooks** (`/hooks/**`) - Business logic & state orchestration
- **Services** (`/lib/services/**`) - API communication & data fetching
- **Types** (`/lib/types/**`) - Type safety & contracts
- **Schemas** (`/lib/schemas/**`) - Validation rules

### 2. **Colocation by Feature**

Related components are grouped by feature:

```
components/
  checkin-checkout/
    ├── check-in-search.tsx
    ├── check-in-results-table.tsx
    ├── modern-check-in-modal.tsx
    ├── walk-in-modal.tsx
    └── ...
```

### 3. **Shared UI Components**

Common UI components in `/components/ui/` (ShadCN base):

```
components/ui/
  ├── button.tsx      # Restyled with CVA
  ├── dialog.tsx      # Modal component
  ├── input.tsx       # Form input
  ├── select.tsx      # Dropdown select
  └── ...
```

### 4. **Type-Driven Development**

All API types defined first in `/lib/types/api.ts` from Swagger specs:

```typescript
// lib/types/api.ts
export interface Booking {
  id: string;
  status: BookingStatus;
  checkInDate: string;
  checkOutDate: string;
  // ... full type definition
}
```

---

## Feature Implementation Lifecycle

### Standard Workflow: Types → Services → Hooks → Components → Pages

#### Example: Implementing Check-in Feature

```
1. Define Types         (lib/types/api.ts, lib/types/checkin-checkout.ts)
           ↓
2. Create Service       (lib/services/booking.service.ts)
           ↓
3. Build Hook           (hooks/use-checkin.ts)
           ↓
4. Create Components    (components/checkin-checkout/*)
           ↓
5. Compose Page         (app/(dashboard)/checkin/page.tsx)
```

### Step-by-Step Breakdown

#### **Step 1: Define Types** ✅

```typescript
// lib/types/checkin-checkout.ts
export interface BackendCheckInRequest {
  checkInInfo: {
    bookingRoomId: string;
    customerIds: string[];
  }[];
}

export interface WalkInFormData {
  customerName: string;
  phoneNumber: string;
  identityCard: string;
  email?: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: { roomId: string }[];
  numberOfGuests: number;
}
```

#### **Step 2: Create Service** ✅

```typescript
// lib/services/booking.service.ts
export const bookingService = {
  // Search confirmed bookings for check-in
  async searchBookings(query: string): Promise<Booking[]> {
    const response = await api.get(`/employee/bookings/search?q=${query}`);
    return response.data;
  },

  // Perform check-in
  async checkIn(data: BackendCheckInRequest): Promise<void> {
    await api.post("/employee/bookings/check-in", data);
  },

  // Create walk-in booking
  async createBooking(data: CreateBookingRequest): Promise<CreateBookingResponse> {
    const response = await api.post("/employee/bookings", data);
    return response.data;
  },
};
```

#### **Step 3: Build Hook** ✅

```typescript
// hooks/use-checkin.ts
export function useCheckIn() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    try {
      const searchResults = await bookingService.searchBookings(searchQuery);
      setResults(searchResults.filter((b) => b.status === "CONFIRMED"));
    } catch (error) {
      logger.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCheckIn = async (data: BackendCheckInRequest) => {
    setIsLoading(true);
    try {
      await bookingService.checkIn(data);
      setResults((prev) => prev.filter((b) => b.id !== selectedBooking?.id));
      setShowModal(false);
      setSelectedBooking(null);
    } catch (error) {
      logger.error("Check-in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    results,
    selectedBooking,
    showModal,
    isLoading,
    handleSearch,
    handleSelectBooking,
    handleConfirmCheckIn,
    // ...
  };
}
```

#### **Step 4: Create Components** ✅

```tsx
// components/checkin-checkout/check-in-search.tsx
export function CheckInSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Tìm kiếm theo tên, SĐT, mã booking..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button onClick={() => onSearch(query)}>Tìm kiếm</Button>
    </div>
  );
}

// components/checkin-checkout/modern-check-in-modal.tsx
export function ModernCheckInModal({ open, booking, onConfirm }: Props) {
  const [notes, setNotes] = useState("");
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    const checkInData: BackendCheckInRequest = {
      checkInInfo: booking.bookingRooms.map((br) => ({
        bookingRoomId: br.id,
        customerIds: roomGuests[br.id]?.map((g) => g.customerId) || [],
      })),
    };
    await onConfirm(checkInData);
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in xác nhận</DialogTitle>
        </DialogHeader>
        {/* Room list, customer assignment UI */}
        <DialogFooter>
          <Button onClick={handleConfirm}>Xác nhận Check-in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### **Step 5: Compose Page** ✅

```tsx
// app/(dashboard)/checkin/page.tsx
"use client";

import { CheckInSearch } from "@/components/checkin-checkout/check-in-search";
import { CheckInResultsTable } from "@/components/checkin-checkout/check-in-results-table";
import { ModernCheckInModal } from "@/components/checkin-checkout/modern-check-in-modal";
import { useCheckIn } from "@/hooks/use-checkin";
import { useNotification } from "@/hooks/use-notification";

export default function CheckInPage() {
  const checkIn = useCheckIn();
  const notification = useNotification();

  const handleCheckInConfirm = async (data: BackendCheckInRequest) => {
    try {
      const guestName = await checkIn.handleConfirmCheckIn(data);
      notification.showSuccess(`Check-in thành công cho ${guestName}!`);
    } catch (error) {
      notification.showError("Check-in thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <h1>Check-in</h1>
      <CheckInSearch onSearch={checkIn.handleSearch} />
      <CheckInResultsTable
        bookings={checkIn.results}
        onSelectBooking={checkIn.handleSelectBooking}
      />
      <ModernCheckInModal
        open={checkIn.showModal}
        booking={checkIn.selectedBooking}
        onConfirm={handleCheckInConfirm}
      />
    </div>
  );
}
```

---

## Code Style Guidelines

### 1. **File Naming Conventions**

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CheckInModal.tsx`, `RoomCard.tsx` |
| Hooks | camelCase with `use-` prefix | `use-checkin.ts`, `use-auth.ts` |
| Services | camelCase with `.service.ts` | `booking.service.ts`, `auth.service.ts` |
| Types | camelCase with `.ts` | `api.ts`, `checkin-checkout.ts` |
| Utils | camelCase | `logger.ts`, `formatCurrency.ts` |
| Routes | kebab-case | `checkin/`, `room-types/` |

### 2. **TypeScript Conventions**

```typescript
// ✅ GOOD: Explicit types for all props
interface ButtonProps {
  variant?: "default" | "destructive" | "outline";
  size?: "sm" | "default" | "lg";
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ variant = "default", size = "default", onClick, children }: ButtonProps) {
  // ...
}

// ✅ GOOD: Type imports
import type { Booking, BookingStatus } from "@/lib/types/api";

// ❌ BAD: Using 'any'
function processData(data: any) { // Avoid!
  // ...
}
```

### 3. **Component Structure**

```tsx
"use client"; // Only if using hooks/client-side features

// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/src/constants/icons.enum";
import type { Booking } from "@/lib/types/api";

// 2. Types/Interfaces
interface CheckInModalProps {
  open: boolean;
  booking: Booking | null;
  onConfirm: (data: BackendCheckInRequest) => Promise<void>;
}

// 3. Component
export function CheckInModal({ open, booking, onConfirm }: CheckInModalProps) {
  // 4. State
  const [notes, setNotes] = useState("");
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Event handlers
  const handleConfirm = async () => {
    // ...
  };
  
  // 7. Render
  return (
    <Dialog open={open}>
      {/* JSX */}
    </Dialog>
  );
}
```

### 4. **Styling with Tailwind**

```tsx
// ✅ GOOD: Use semantic/palette tokens
<div className="bg-primary-blue-600 text-white hover:bg-primary-blue-700">

// ✅ GOOD: Use cn() for conditional classes
<button className={cn(
  "px-4 py-2 rounded-md",
  isActive && "bg-primary-blue-600 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>

// ✅ GOOD: CSS variables from globals.css
<div className="bg-[var(--primary-blue-600)]">

// ❌ BAD: Hardcoded colors
<div className="bg-[#1E40AF]"> // Don't do this!
```

### 5. **Import Order**

```tsx
// 1. React/Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. External libraries
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// 3. Internal components
import { Button } from "@/components/ui/button";
import { CheckInModal } from "@/components/checkin-checkout/modern-check-in-modal";

// 4. Hooks
import { useAuth } from "@/hooks/use-auth";
import { useCheckIn } from "@/hooks/use-checkin";

// 5. Services & utilities
import { bookingService } from "@/lib/services";
import { cn, formatCurrency } from "@/lib/utils";

// 6. Types
import type { Booking, BookingStatus } from "@/lib/types/api";

// 7. Constants
import { ICONS } from "@/src/constants/icons.enum";
```

---

## State Management Strategy

### 1. **Redux (Global State)**

Used for:
- Authentication state (`auth.slice.ts`)
- Check-in workflow state (`checkin.slice.ts`)
- Global UI state (sidebar, theme)

```typescript
// lib/redux/slices/checkin.slice.ts
const checkInSlice = createSlice({
  name: "checkin",
  initialState: {
    bookingId: null,
    selectedRooms: [],
    roomGuests: {},
    isModalOpen: false,
  },
  reducers: {
    initCheckIn: (state, action: PayloadAction<{ bookingId: string }>) => {
      state.bookingId = action.payload.bookingId;
      state.isModalOpen = true;
    },
    assignGuest: (state, action: PayloadAction<{ bookingRoomId: string; guest: RoomGuest }>) => {
      // ...
    },
  },
});

// Usage in components
const dispatch = useAppDispatch();
const { roomGuests } = useAppSelector((state) => state.checkin);

dispatch(initCheckIn({ bookingId: "123" }));
```

### 2. **React Query (Server State)**

Used for:
- API data fetching & caching
- Automatic refetching & invalidation
- Optimistic updates

```typescript
// Example: Using React Query in a hook
export function useRooms() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomService.getAllRooms(),
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    rooms: data || [],
    isLoading,
    error,
  };
}
```

### 3. **Context API (Shared State)**

Used for:
- Permissions context (`permissions-context.tsx`)
- Theme context

```typescript
// lib/permissions-context.tsx
const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Fetch permissions based on user role
  useEffect(() => {
    if (user) {
      // Load permissions
    }
  }, [user]);

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
}
```

### 4. **Local State (Component State)**

Used for:
- Form inputs
- Modal open/close
- UI toggles

```typescript
export function CheckInModal() {
  const [notes, setNotes] = useState("");
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  return (
    // ...
  );
}
```

---

## API Integration Pattern

### Base API Client

```typescript
// lib/services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (response.status === 401) {
      // Attempt token refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry request
      } else {
        // Redirect to login
      }
    }

    if (!response.ok) {
      throw new ApiError(response.status, "Request failed");
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    // Similar implementation
  },

  // put, delete, etc.
};
```

### Service Layer Pattern

```typescript
// lib/services/booking.service.ts
export const bookingService = {
  /**
   * Search bookings by query
   * @param query - Search string (name, phone, booking ID)
   * @returns Array of matching bookings
   */
  async searchBookings(query: string): Promise<Booking[]> {
    const response = await api.get<ApiResponse<Booking[]>>(
      `/employee/bookings/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  /**
   * Check in a booking
   * @param data - Check-in request data
   */
  async checkIn(data: BackendCheckInRequest): Promise<void> {
    await api.post("/employee/bookings/check-in", data);
  },
};
```

### Error Handling

```typescript
// In hooks
try {
  const result = await bookingService.checkIn(data);
  notification.showSuccess("Check-in thành công!");
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      notification.showError("Dữ liệu không hợp lệ");
    } else if (error.statusCode === 404) {
      notification.showError("Không tìm thấy booking");
    } else {
      notification.showError("Có lỗi xảy ra");
    }
  }
  logger.error("Check-in failed:", error);
  throw error;
}
```

---

## Component Development Patterns

### 1. **Controlled Components (Forms)**

```tsx
export function CheckInSearchForm({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm kiếm..."
      />
      <Button type="submit">Tìm</Button>
    </form>
  );
}
```

### 2. **Compound Components (Complex UI)**

```tsx
// Parent component
export function CheckInModal({ booking }: Props) {
  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>Check-in</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <RoomList rooms={booking.bookingRooms} />
        <CustomerAssignment />
      </DialogContent>
      <DialogFooter>
        <Button>Xác nhận</Button>
      </DialogFooter>
    </Dialog>
  );
}
```

### 3. **Render Props Pattern (Flexible Rendering)**

```tsx
export function DataTable<T>({
  data,
  renderRow,
}: {
  data: T[];
  renderRow: (item: T) => React.ReactNode;
}) {
  return (
    <table>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>{renderRow(item)}</tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage
<DataTable
  data={bookings}
  renderRow={(booking) => (
    <>
      <td>{booking.id}</td>
      <td>{booking.customer.fullName}</td>
    </>
  )}
/>
```

### 4. **Custom Hooks Pattern (Reusable Logic)**

```typescript
// hooks/use-notification.ts
export function useNotification() {
  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  return { showSuccess, showError };
}

// Usage in components
const notification = useNotification();
notification.showSuccess("Thao tác thành công!");
```

---

## Common Development Workflows

### 1. **Adding a New Feature Page**

```bash
# 1. Create page file
app/(dashboard)/my-feature/page.tsx

# 2. Create types
lib/types/my-feature.ts

# 3. Create service
lib/services/my-feature.service.ts

# 4. Create hook
hooks/use-my-feature.ts

# 5. Create components
components/my-feature/
  ├── my-feature-list.tsx
  ├── my-feature-form.tsx
  └── my-feature-modal.tsx

# 6. Add route to sidebar
components/app-sidebar.tsx
```

### 2. **Implementing a Form with Validation**

```tsx
// 1. Define Zod schema
// lib/schemas/my-feature.schema.ts
import { z } from "zod";

export const myFeatureSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^[0-9]{10}$/, "SĐT phải có 10 số"),
});

export type MyFeatureFormData = z.infer<typeof myFeatureSchema>;

// 2. Use react-hook-form with zodResolver
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function MyFeatureForm({ onSubmit }: Props) {
  const form = useForm<MyFeatureFormData>({
    resolver: zodResolver(myFeatureSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register("name")} />
      {form.formState.errors.name && (
        <span className="text-error-600">{form.formState.errors.name.message}</span>
      )}
      <Button type="submit">Lưu</Button>
    </form>
  );
}
```

### 3. **Adding Permission Checks**

```tsx
import { PermissionGuard } from "@/components/permission-guard";

export function MyFeaturePage() {
  return (
    <PermissionGuard permissions={["MANAGE_BOOKINGS"]}>
      <div>
        {/* Content only visible to users with MANAGE_BOOKINGS permission */}
      </div>
    </PermissionGuard>
  );
}
```

### 4. **Working with Icons**

```tsx
// Always import from centralized enum
import { ICONS } from "@/src/constants/icons.enum";

export function MyComponent() {
  return (
    <Button>
      <span className="w-4 h-4">{ICONS.CHECK}</span>
      Xác nhận
    </Button>
  );
}

// If icon doesn't exist, add to icons.enum.tsx:
// src/constants/icons.enum.tsx
import { NewIcon } from "lucide-react";

export const ICONS = {
  // ...existing icons
  NEW_ICON: <NewIcon />,
};
```

### 5. **Debugging Tips**

```typescript
// Use logger utility instead of console.log
import { logger } from "@/lib/utils/logger";

logger.log("User action:", action);
logger.error("API call failed:", error);
logger.warn("Deprecated feature used");

// Enable React Query Devtools
// Already configured in app/providers.tsx
// Access at: http://localhost:3000 (bottom-left toggle)
```

---

## Next Steps

- Read [UI Specifications](./ui-specifications.md) for design system details
- Read [Page Description](./page-description.md) for feature workflows (Vietnamese)
- Read [API Quick Reference](./API_QUICK_REFERENCE.md) for backend API docs
- Review [Copilot Instructions](../.github/copilot-instructions.md) for AI coding guidelines

---

**Questions or Issues?** Check existing documentation or review similar implemented features for reference patterns.
