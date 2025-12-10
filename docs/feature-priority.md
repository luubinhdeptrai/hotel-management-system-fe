# Feature Implementation Priority

Features ordered by priority based on:

- **Core operations** (daily use) → Higher priority
- **Dependencies** (features that others depend on) → Higher priority
- **Complexity** (simpler first to establish patterns) → Medium priority
- **New pages** (larger scope) → Lower priority (after core updates)

---

## Priority Order

| #   | Feature                        | Priority  | Reason                                                  | Est. Files |
| --- | ------------------------------ | --------- | ------------------------------------------------------- | ---------- |
| 1   | **Room Status Updates**        | 🔴 HIGH   | Foundation for other features (Housekeeping, Dashboard) | 4          |
| 2   | **Dashboard KPI Updates**      | 🔴 HIGH   | Daily operational visibility                            | 2          |
| 3   | **Service Management Groups**  | 🟡 MEDIUM | Required for Folio transactions                         | 3          |
| 4   | **Check-in Enhancements**      | 🟡 MEDIUM | Core daily operation                                    | 4          |
| 5   | **Check-out 3-Step Process**   | 🟡 MEDIUM | Core daily operation, depends on #3                     | 5          |
| 6   | **Reservation 2-Level Status** | 🟡 MEDIUM | Booking workflow improvement                            | 4          |
| 7   | **Customer VIP Tabs**          | 🟢 LOW    | Enhancement, not blocking                               | 2          |
| 8   | **Pricing Engine Tab**         | 🟢 LOW    | Configuration feature                                   | 3          |
| 9   | **Folio Detail Page**          | 🟡 MEDIUM | New page, but core for payments                         | 8          |
| 10  | **Housekeeping Page**          | 🟡 MEDIUM | New page, depends on #1                                 | 5          |
| 11  | **Shift Management Page**      | 🟢 LOW    | New page, standalone                                    | 6          |
| 12  | **New Reports**                | 🟢 LOW    | Enhancement, not blocking                               | 4          |

---

## Implementation Batches

### Batch 1: Core Status & Dashboard (Features 1-2)

- Update room statuses with 5 types + colors
- Add context menu for rooms
- Update dashboard KPIs

### Batch 2: Service & Transaction Flow (Features 3-6)

- Add service groups
- Enhance check-in with guest grid
- Implement 3-step check-out
- Add 2-level reservation status

### Batch 3: New Pages (Features 9-11)

- Create Folio Detail page
- Create Housekeeping page
- Create Shift Management page
- Add all to sidebar navigation

### Batch 4: Enhancements (Features 7-8, 12)

- Customer VIP tabs
- Pricing Engine with full calendar
- New report types
