# Housekeeping Workaround - Implementation Report

## 🎯 Yêu cầu
Từ API Backend hiện có (KHÔNG SỬA BE), tạo workaround cho màn hình Housekeeping ở Frontend.

## 📊 Phân tích Backend API

### Available APIs:
- ✅ `GET /employee/rooms` - Lấy danh sách phòng với filters
- ✅ `GET /employee/rooms/:id` - Chi tiết phòng
- ✅ `PUT /employee/rooms/:id` - **CẬP NHẬT PHÒNG (bao gồm status)**
- ✅ `POST /employee/rooms` - Tạo phòng mới

### Backend Room Status Enum:
```typescript
enum RoomStatus {
  AVAILABLE,      // Sẵn sàng
  RESERVED,       // Đã đặt
  OCCUPIED,       // Đang thuê
  CLEANING,       // Đang dọn
  MAINTENANCE,    // Bảo trì
  OUT_OF_SERVICE  // Ngừng phục vụ
}
```

## ✨ Giải pháp Workaround

### 1. **Rooms API Service** (`lib/api/rooms.api.ts`)

**Chức năng:**
- Mapping status BE ↔ FE (Vietnamese labels)
- Transform data BE → FE format
- CRUD operations cho rooms
- Specialized functions cho Housekeeping workflow

**Key Features:**
```typescript
// Status Mapping
mapStatusBEtoFE(status: RoomStatusBE): RoomStatusFE
mapStatusFEtoBE(status: RoomStatusFE): RoomStatusBE

// Core APIs
getRooms(filters?: RoomFilters)
getHousekeepingRooms() // Lọc status=CLEANING
updateRoomStatus(roomId, newStatus) // Update qua PUT API
getHousekeepingStats() // Dashboard statistics
```

**Status Mapping Logic:**
- BE `CLEANING` → FE "Đang dọn"
- BE `AVAILABLE` → FE "Sẵn sàng"
- FE "Đang dọn" → BE `CLEANING`
- FE "Sẵn sàng" → BE `AVAILABLE`

### 2. **React Query Hooks** (`hooks/useRooms.ts`)

**Hooks provided:**
- `useRooms(filters)` - Fetch rooms with filters
- `useHousekeepingRooms()` - Fetch CLEANING rooms (auto-refresh 1 min)
- `useRoom(roomId)` - Single room details
- `useHousekeepingStats()` - Dashboard stats (auto-refresh 1 min)
- `useUpdateRoomStatus()` - Mutation with optimistic updates
- `useBatchUpdateRoomStatus()` - Bulk updates

**Features:**
- ✅ Optimistic updates (instant UI feedback)
- ✅ Auto-refresh every 60 seconds
- ✅ Toast notifications (success/error)
- ✅ Automatic cache invalidation
- ✅ Error rollback

### 3. **Housekeeping Page Update** (`app/(dashboard)/housekeeping/page.tsx`)

**Changes:**
- ❌ Removed: Mock data (`mockRooms`)
- ✅ Added: Real API integration via hooks
- ✅ Added: Loading states with Skeleton
- ✅ Added: Real-time status updates
- ✅ Simplified: Workflow từ 3-step xuống 1-step (match với BE)

**New Workflow:**
```
BE Status CLEANING ("Đang dọn")
    ↓ [Click "Hoàn thành dọn dẹp"]
BE Status AVAILABLE ("Sẵn sàng")
```

**Removed FE-only states:**
- ❌ "Bẩn" (không có trong BE)
- ❌ "Đang kiểm tra" (không có trong BE)

## 🔄 Data Flow

```
1. Page Load
   └→ useHousekeepingRooms()
      └→ getRooms({ status: "CLEANING" })
         └→ GET /employee/rooms?status=CLEANING
            └→ Transform BE data → FE format
               └→ Display in UI

2. Status Update (User clicks "Hoàn thành")
   └→ useUpdateRoomStatus()
      └→ Optimistic Update (instant UI)
         └→ updateRoomStatus(roomId, "Sẵn sàng")
            └→ mapStatusFEtoBE("Sẵn sàng") = "AVAILABLE"
               └→ PUT /employee/rooms/:id { status: "AVAILABLE" }
                  └→ Success: Invalidate cache & refetch
                  └→ Error: Rollback optimistic update
```

## 📊 Dashboard Stats

Stats card hiển thị:
1. **Đang dọn**: Count rooms with CLEANING status
2. **Sẵn sàng**: Count rooms with AVAILABLE status  
3. **Tổng phòng**: Total room count

Data source: `getHousekeepingStats()` from API

## 🎨 UI/UX Improvements

- ✅ Loading skeleton khi fetch data
- ✅ Disabled button khi đang update
- ✅ Toast notifications cho user feedback
- ✅ Optimistic updates (no loading spinner cho updates)
- ✅ Auto-refresh mỗi 60s để sync với BE
- ✅ Simplified filter (chỉ "Đang dọn" và "Sẵn sàng")

## 🔒 Constraints Honored

✅ **KHÔNG SỬA BACKEND** - Chỉ sử dụng APIs có sẵn
✅ **Mapping Status** - Giữ Vietnamese labels cho FE
✅ **Backward Compatible** - Không break existing functionality

## 🚀 Kết quả

### ✅ Đã hoàn thành:
1. ✅ Tạo rooms API service với status mapping
2. ✅ Tạo React Query hooks với real-time features
3. ✅ Update Housekeeping page với API integration
4. ✅ Loading states & error handling
5. ✅ Optimistic updates cho UX tốt hơn
6. ✅ Auto-refresh data
7. ✅ Toast notifications

### 🎯 Workflow Housekeeping:
- Nhân viên thấy danh sách phòng status = CLEANING ("Đang dọn")
- Click "Hoàn thành dọn dẹp" → Update status → AVAILABLE ("Sẵn sàng")
- Phòng biến mất khỏi Housekeeping list (chỉ show CLEANING)
- Stats dashboard update real-time

### 📝 Notes:
- Backend có `CLEANING` status → Perfect cho Housekeeping workflow
- FE states "Bẩn", "Đang kiểm tra" không cần thiết vì BE chỉ cần CLEANING
- Workflow đơn giản hơn, match với business logic thực tế
- All updates đều sync với database qua BE API

## 🔧 Cách sử dụng:

```typescript
// Trong bất kỳ component nào
import { useHousekeepingRooms, useUpdateRoomStatus } from "@/hooks/useRooms";

function MyComponent() {
  const { data, isLoading } = useHousekeepingRooms();
  const updateStatus = useUpdateRoomStatus();
  
  const handleComplete = (roomId: string) => {
    updateStatus.mutate({
      roomId,
      newStatus: "Sẵn sàng"
    });
  };
  
  // ...
}
```

## ✨ Lợi ích:
- ✅ Real-time sync với database
- ✅ No mock data
- ✅ Production-ready
- ✅ Type-safe với TypeScript
- ✅ Caching & performance optimization (React Query)
- ✅ Error handling robust
- ✅ Great UX với optimistic updates
