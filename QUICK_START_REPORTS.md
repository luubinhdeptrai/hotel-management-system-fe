# 🚀 QUICK START - Reports Feature

## Cách Chạy

```bash
cd hotel-management-system-fe
pnpm dev
```

Truy cập: **http://localhost:3000/reports**

---

## ✅ Checklist Hoàn Thành

- [x] 16 API endpoints mapped từ Backend
- [x] 40+ TypeScript interfaces
- [x] Revenue Reports (Charts, KPIs, Filters)
- [x] Room Reports (Occupancy Forecast)  
- [x] Customer Reports (CLV, Rankings)
- [x] Navigation & Permissions
- [x] Responsive Design
- [x] Error & Loading States

---

## 🎨 Features Nổi Bật

### 1. **Revenue Reports** 💰
- Line chart: Revenue trend
- Bar chart: Revenue by room type
- Pie chart: Payment methods
- Table: Promotion ROI
- KPIs: Total Revenue, Occupancy, ADR, RevPAR

### 2. **Room Reports** 🏨
- Area chart: Occupied vs Available rooms
- Line chart: Occupancy rate trend
- 30-day forecast
- Group by: day/week/month

### 3. **Customer Reports** 👥
- Top 10 customers by CLV
- Pie chart: Rank distribution
- Bar chart: Revenue by rank
- Customer metrics

---

## 📱 Screenshots (Mô tả)

### Tab Navigation
5 tabs với gradients đẹp mắt:
- 💰 Revenue (Emerald)
- 🏨 Rooms (Blue)
- 👥 Customers (Violet)
- 👔 Employees (Orange - placeholder)
- 🛎️ Services (Pink - placeholder)

### Charts
- **Recharts** library với smooth animations
- Tooltips hiển thị chi tiết
- Responsive trên mọi thiết bị
- Color-coded theo nghiệp vụ

---

## 🔑 Permissions

Yêu cầu: `report:read` permission

Check trong: `components/app-sidebar.tsx`

---

## 📂 File Structure

```
✅ Created Files:
- lib/types/report.ts
- lib/api/reports.api.ts
- hooks/use-revenue-reports.ts
- hooks/use-room-reports.ts
- hooks/use-customer-reports.ts
- components/reports/*.tsx (5 files)
- app/(dashboard)/reports/page.tsx

📄 Modified Files:
- components/app-sidebar.tsx (added Reports link)
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module"
```bash
pnpm install
```

### Lỗi: "Permission denied"
- Check CASL permissions
- Ensure user has `report:read`

### Charts không hiển thị
- Check data từ API
- Xem Console logs
- Verify Backend đang chạy

---

## 🎯 Next Steps

### Immediate
1. Test trên production
2. Add loading skeletons
3. Implement Employee Reports
4. Implement Service Reports

### Future
1. Export to Excel/PDF
2. Custom date presets
3. Comparison mode (YoY, MoM)
4. Real-time updates
5. Drill-down capabilities

---

## 📞 Support

Tài liệu đầy đủ:
- `REPORTS_IMPLEMENTATION.md` - Chi tiết kỹ thuật
- `REPORTS_SUMMARY.md` - Tổng quan ngắn gọn

Backend API:
- `roommaster-be/src/services/reports/`
- `roommaster-be/src/controllers/employee/reports/`

---

**🎉 Ready to use! Enjoy your new Reports feature!**
