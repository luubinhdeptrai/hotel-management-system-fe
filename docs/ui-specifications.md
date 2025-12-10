# **Tài liệu Thiết kế Giao diện Hệ thống Quản lý Khách sạn**

## **Design System Documentation**

---

## **1\. Tổng quan Thiết kế (Design Overview)**

### **1.1. Triết lý Thiết kế**

Hệ thống quản lý khách sạn cần đảm bảo:

- **Chuyên nghiệp & Đáng tin cậy**: Giao diện phải phản ánh sự chuyên nghiệp của ngành khách sạn
- **Hiệu quả & Nhanh chóng**: Tối ưu hóa workflow cho nhân viên lễ tân với tốc độ xử lý cao
- **Rõ ràng & Dễ đọc**: Thông tin quan trọng phải nổi bật, dễ nhận diện trong môi trường làm việc căng thẳng
- **Nhất quán**: Đảm bảo trải nghiệm đồng nhất trên tất cả các màn hình

### **1.2. Đối tượng Người dùng**

- **Lễ tân**: Sử dụng hệ thống liên tục, cần truy cập nhanh các chức năng chính
- **Quản lý**: Cần cái nhìn tổng quan, báo cáo và phân tích
- **Admin**: Cấu hình hệ thống, quản lý nhân viên

---

## **2\. Color Palette (Bảng Màu)**

### **2.1. Màu Chính (Primary Colors)**

Primary Color (Màu chủ đạo \- Xanh dương sang trọng)  
\- Primary-600: \#1E40AF (Chủ đạo cho buttons, headers)  
\- Primary-500: \#3B82F6 (Hover states)  
\- Primary-400: \#60A5FA (Active elements)  
\- Primary-300: \#93C5FD (Secondary highlights)
\- Primary-200: \#BFDBFE (Light accents)
\- Primary-100: \#DBEAFE (Backgrounds, subtle highlights)  
\- Primary-50: \#EFF6FF (Very light backgrounds)

Ý nghĩa: Xanh dương thể hiện sự chuyên nghiệp, tin cậy và ổn định

### **2.2. Màu Phụ (Secondary Colors)**

Secondary Color (Xám \- Neutral)  
\- Gray-900: \#111827 (Text chính)  
\- Gray-700: \#374151 (Text phụ)  
\- Gray-500: \#6B7280 (Placeholder, disabled text)  
\- Gray-300: \#D1D5DB (Borders, dividers)  
\- Gray-100: \#F3F4F6 (Background sections)  
\- Gray-50: \#F9FAFB (Page background)

Ý nghĩa: Tạo nền trung tính, không gây mệt mỏi khi sử dụng lâu

### **2.3. Màu Trạng thái (Status Colors)**

Success (Thành công \- Xanh lá)  
\- Success-600: \#059669  
\- Success-500: \#10B981  
\- Success-100: \#D1FAE5  
Sử dụng: Phòng trống, check-in thành công, thanh toán hoàn tất

Warning (Cảnh báo \- Vàng cam)  
\- Warning-600: \#D97706  
\- Warning-500: \#F59E0B  
\- Warning-100: \#FEF3C7  
Sử dụng: Phòng đang dọn dẹp, sắp hết hạn, cần chú ý

Error (Lỗi \- Đỏ)  
\- Error-600: \#DC2626  
\- Error-500: \#EF4444  
\- Error-100: \#FEE2E2  
Sử dụng: Phòng bảo trì, lỗi hệ thống, hủy đặt phòng

Info (Thông tin \- Xanh dương nhạt)  
\- Info-600: \#0284C7  
\- Info-500: \#06B6D4  
\- Info-100: \#CFFAFE  
Sử dụng: Phòng đang được thuê, thông báo thông tin

### **2.4. Màu Bổ sung (Accent Colors)**

Accent-Gold (Vàng sang trọng \- cho highlights đặc biệt)  
\- Accent-500: \#F59E0B  
\- Accent-100: \#FEF3C7

Sử dụng: Highlight các phòng VIP, khách hàng VIP, khuyến mãi đặc biệt

---

## **3\. Typography (Kiểu chữ)**

### **3.1. Font Family**

Primary Font: 'Inter', \-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif  
\- Modern, dễ đọc, tối ưu cho màn hình  
\- Hỗ trợ tiếng Việt tốt  
\- Phù hợp cho cả text và số liệu

Fallback Font: 'Roboto', 'Arial', sans-serif

Monospace Font (cho mã, số liệu): 'JetBrains Mono', 'Courier New', monospace

### **3.2. Font Sizes & Weights**

/\* Headings \*/  
h1: 32px / 2rem \- font-weight: 700 (Bold) \- Page titles  
h2: 24px / 1.5rem \- font-weight: 600 (Semibold) \- Section headers  
h3: 20px / 1.25rem \- font-weight: 600 (Semibold) \- Card headers  
h4: 18px / 1.125rem \- font-weight: 600 (Semibold) \- Subsection headers

/\* Body Text \*/  
body-large: 16px / 1rem \- font-weight: 400 (Regular) \- Main content  
body-regular: 14px / 0.875rem \- font-weight: 400 (Regular) \- Default text  
body-small: 12px / 0.75rem \- font-weight: 400 (Regular) \- Helper text, labels  
body-xs: 10px / 0.625rem \- font-weight: 400 (Regular) \- Timestamps, badges

/\* Special \*/  
caption: 12px / 0.75rem \- font-weight: 500 (Medium) \- Table headers  
button: 14px / 0.875rem \- font-weight: 500 (Medium) \- Button text

### **3.3. Line Height**

Headings: 1.2 \- 1.3 (Compact cho tiêu đề)  
Body text: 1.5 (Thoải mái cho đọc)  
Buttons/Forms: 1.0 (Tight cho controls)

---

## **4\. Spacing System (Hệ thống Khoảng cách)**

Sử dụng scale 4px (0.25rem) để đảm bảo consistency:

xs: 4px (0.25rem) \- Padding nhỏ trong badges, tight spacing  
sm: 8px (0.5rem) \- Padding buttons, form controls  
md: 16px (1rem) \- Default spacing, card padding  
lg: 24px (1.5rem) \- Section spacing  
xl: 32px (2rem) \- Large section separation  
2xl: 48px (3rem) \- Major section separation  
3xl: 64px (4rem) \- Page-level spacing

---

## **5\. Page Layout (Bố cục Trang)**

### **5.1. Overall Structure**

![][image1]

### **5.2. Top Navigation Bar**

Height: 64px  
Background: White (\#FFFFFF)  
Border-bottom: 1px solid Gray-200  
Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

Sections:  
\- Left: Logo \+ Tên khách sạn (Brand identity)  
\- Center: Global search bar (tùy chọn)  
\- Right:  
 \- Notifications icon (với badge count)  
 \- User avatar \+ dropdown (Tên NV, Vai trò, Logout)

### **5.3. Sidebar Navigation**

Width: 240px (collapsed: 64px)  
Background: Gray-50 hoặc Primary-50  
Border-right: 1px solid Gray-200

Structure:  
\- Navigation items với icon \+ label  
\- Active state: Primary-100 background, Primary-600 text, left border accent  
\- Hover state: Gray-100 background  
\- Group sections với dividers

Collapse behavior:  
\- Toggle button ở bottom hoặc top  
\- Khi collapsed: chỉ hiển thị icons, tooltip on hover

### **5.4. Main Content Area**

Padding: 24px (lg)  
Background: Gray-50  
Max-width: 1400px (centered for large screens)

Components:  
\- Page Header:  
 \- Breadcrumb navigation  
 \- Page title (h1)  
 \- Action buttons (aligned right)

\- Content Body:  
 \- Cards/Panels với white background  
 \- Border-radius: 8px  
 \- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

---

### **6.1. Buttons**

/_ Base Styles _/
border-radius: 6px (rounded-md)
font-size: 14px (text-sm)
font-weight: 500 (font-medium)
transition: all
disabled: opacity: 0.5, pointer-events: none
focus: ring: 3px, ring-color: ring/50

/_ Primary Button (variant: default) _/
background: Primary (var(--primary))
color: Primary Foreground (var(--primary-foreground))
hover: background: Primary/90

/_ Destructive Button (variant: destructive) _/
background: Destructive (var(--destructive))
color: White
hover: background: Destructive/90

/_ Outline Button (variant: outline) _/
border: 1px solid Input (var(--border))
background: transparent
hover: background: Accent (var(--accent)), color: Accent Foreground (var(--accent-foreground))

/_ Secondary Button (variant: secondary) _/
background: Secondary (var(--secondary))
color: Secondary Foreground (var(--secondary-foreground))
hover: background: Secondary/80

/_ Ghost Button (variant: ghost) _/
background: transparent
hover: background: Accent (var(--accent)), color: Accent Foreground (var(--accent-foreground))

/_ Link Button (variant: link) _/
background: transparent
color: Primary (var(--primary))
text-decoration: underline

### **6.2. Form Controls**

/\* Text Input \*/  
height: 40px  
padding: 8px 12px  
border: 1px solid Gray-300  
border-radius: 6px  
font-size: 14px

focus: border: Primary-500, box-shadow: 0 0 0 3px Primary-100  
error: border: Error-500, box-shadow: 0 0 0 3px Error-100  
disabled: background: Gray-100, cursor: not-allowed

/\* Labels \*/  
font-size: 14px  
font-weight: 500  
color: Gray-700  
margin-bottom: 6px

Required indicator: Red asterisk (\*)

/\* Helper Text \*/  
font-size: 12px  
color: Gray-500  
margin-top: 4px

### **6.3. Cards**

background: White  
border-radius: 8px  
border: 1px solid Gray-200  
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)  
padding: 20px

Card Header:  
\- border-bottom: 1px solid Gray-200  
\- padding-bottom: 12px  
\- margin-bottom: 16px  
\- font-size: 18px, font-weight: 600

Card Body:  
\- padding: 0 (relies on card padding)

Card Footer:  
\- border-top: 1px solid Gray-200  
\- padding-top: 12px  
\- margin-top: 16px

### **6.4. Tables**

Table:  
\- width: 100%  
\- border-collapse: collapse  
\- background: White

Table Header:  
\- background: Gray-50  
\- font-weight: 600  
\- font-size: 12px  
\- text-transform: uppercase  
\- color: Gray-700  
\- padding: 12px 16px  
\- border-bottom: 2px solid Gray-200

Table Row:  
\- border-bottom: 1px solid Gray-200  
\- transition: background 0.2s

hover: background: Gray-50

Table Cell:  
\- padding: 12px 16px  
\- font-size: 14px  
\- vertical-align: middle

Action Buttons in Table:  
\- Icon buttons (Edit, Delete, View)  
\- Size: 32px x 32px  
\- Ghost style

### **6.5. Modals/Dialogs**

Backdrop:  
\- background: rgba(0, 0, 0, 0.5)  
\- backdrop-filter: blur(2px)

Modal Container:  
\- background: White  
\- border-radius: 12px  
\- box-shadow: 0 20px 25px \-5px rgba(0, 0, 0, 0.3)  
\- max-width: 600px (small), 800px (medium), 1200px (large)  
\- padding: 0

Modal Header:  
\- padding: 20px 24px  
\- border-bottom: 1px solid Gray-200  
\- display: flex (title left, close button right)

Modal Body:  
\- padding: 24px  
\- max-height: 70vh  
\- overflow-y: auto

Modal Footer:  
\- padding: 16px 24px  
\- border-top: 1px solid Gray-200  
\- text-align: right  
\- buttons: gap 12px

### **6.6. Badges & Status Pills**

Badge:  
\- display: inline-flex  
\- padding: 4px 10px  
\- border-radius: 12px (pill shape)  
\- font-size: 12px  
\- font-weight: 500

Status variants:  
\- Available: background: Success-100, color: Success-700  
\- Occupied: background: Info-100, color: Info-700  
\- Cleaning: background: Warning-100, color: Warning-700  
\- Maintenance: background: Error-100, color: Error-700

### **6.7. Tabs**

Tab Container:  
\- border-bottom: 2px solid Gray-200

Tab Item:  
\- padding: 12px 20px  
\- font-size: 14px  
\- font-weight: 500  
\- color: Gray-600  
\- cursor: pointer  
\- border-bottom: 2px solid transparent  
\- margin-bottom: \-2px

hover: color: Primary-600

active:  
\- color: Primary-600  
\- border-bottom-color: Primary-600

---

## **7\. Icons & Illustrations**

### **7.1. Icon System**

Icon Library: Lucide Icons (hoặc Heroicons)  
\- Modern, consistent style  
\- Available in outline & solid variants

Default Size: 20px (1.25rem)  
Button icons: 16px  
Large feature icons: 24px

Color:  
\- Default: Gray-600  
\- Active/Primary: Primary-600  
\- Danger: Error-600

### **7.2. Các Icon Chính**

Navigation:  
\- Dashboard: LayoutDashboard  
\- Rooms: Bed / DoorOpen  
\- Reservations: Calendar  
\- Check-in/out: UserCheck / UserMinus  
\- Services: Coffee / Utensils  
\- Payments: CreditCard / DollarSign  
\- Reports: BarChart3 / FileText  
\- Users: Users / UserCog  
\- Settings: Settings

Actions:  
\- Add: Plus  
\- Edit: Pencil / Edit  
\- Delete: Trash2  
\- Save: Check / Save  
\- Cancel: X  
\- Search: Search  
\- Filter: Filter  
\- Export: Download  
\- Print: Printer

Status:  
\- Success: CheckCircle  
\- Warning: AlertTriangle  
\- Error: XCircle  
\- Info: Info

---

## **8\. States & Interactions**

### **8.1. Hover States**

Buttons: Background darkens, shadow appears  
Links: Color changes to Primary-700, underline  
Table rows: Background: Gray-50  
Cards: Shadow intensifies (0 4px 6px)

Transition: all 0.2s ease-in-out

### **8.2. Loading States**

Spinner:  
\- Primary-600 color  
\- Size: 20px (small), 32px (medium), 48px (large)

Skeleton Screens:  
\- Background: Gray-200  
\- Animated gradient effect  
\- Use for tables, cards during data loading

Progress Bars:  
\- Height: 4px  
\- Background: Gray-200  
\- Fill: Primary-600  
\- Animated stripe (optional)

### **8.3. Error States**

Form Fields:  
\- Border: Error-500  
\- Background: Error-50 (subtle)  
\- Icon: AlertCircle in Error-500

Error Messages:  
\- Color: Error-600  
\- Font-size: 12px  
\- Icon: AlertTriangle  
\- Padding: 12px  
\- Background: Error-50  
\- Border-left: 4px solid Error-500

### **8.4. Empty States**

Container:  
\- Center aligned  
\- Padding: 48px

Illustration:  
\- Grayscale or subtle color  
\- Size: 200px x 200px

Text:  
\- Title: Gray-900, 18px, font-weight: 600  
\- Description: Gray-600, 14px  
\- Spacing: 16px between elements

CTA Button: Primary button

---

## **9\. Responsive Design**

### **9.1. Breakpoints**

Mobile: \< 640px (sm)  
Tablet: 640px \- 1024px (md, lg)  
Desktop: \> 1024px (xl, 2xl)

### **9.2. Mobile Adaptations**

\- Sidebar: Overlay drawer (hidden by default)  
\- Top navigation: Hamburger menu  
\- Tables: Horizontal scroll or card view  
\- Forms: Full width, stacked layout  
\- Modals: Full screen on mobile  
\- Font sizes: Scale down 10-20%

---

## **10\. Accessibility (A11y)**

### **10.1. Contrast Ratios**

Normal text: Minimum 4.5:1  
Large text (18px+): Minimum 3:1  
UI components: Minimum 3:1

Kiểm tra tất cả color combinations với WCAG standards

### **10.2. Focus States**

Focus ring:  
\- outline: 2px solid Primary-500  
\- outline-offset: 2px  
\- border-radius: match element

Visible trên tất cả interactive elements  
Never use outline: none without alternative

### **10.3. Semantic HTML**

\- Proper heading hierarchy (h1 → h6)  
\- Form labels linked với inputs  
\- ARIA labels cho icons-only buttons  
\- Alt text cho images  
\- Role attributes cho custom components

---

## **11\. Dark Mode (Optional \- Future Enhancement)**

### **11.1. Color Adjustments**

Background:  
\- Light: Gray-50  
\- Dark: Gray-900

Cards/Surfaces:  
\- Light: White  
\- Dark: Gray-800

Text:  
\- Light: Gray-900  
\- Dark: Gray-100

Borders:  
\- Light: Gray-200  
\- Dark: Gray-700

---

## **12\. Animation & Motion**

### **12.1. Transition Timing**

Fast: 150ms \- Small state changes (hover)  
Normal: 250ms \- Default transitions  
Slow: 350ms \- Complex animations (modal open)

Easing: ease-in-out (default), ease-out (entrances), ease-in (exits)

### **12.2. Common Animations**

/\* Fade In \*/  
@keyframes fadeIn {  
 from { opacity: 0; }  
 to { opacity: 1; }  
}

/\* Slide In From Right (Modal) \*/  
@keyframes slideInRight {  
 from { transform: translateX(100%); }  
 to { transform: translateX(0); }  
}

/\* Scale Pop (Notifications) \*/  
@keyframes scalePop {  
 from { transform: scale(0.8); opacity: 0; }  
 to { transform: scale(1); opacity: 1; }  
}

---

## **13\. Special Components**

### **13.1. Room Status Grid**

Visual representation:  
\- Grid layout (4-6 columns)  
\- Each cell: Room card với color-coded status  
\- Hover: Tooltip với thông tin chi tiết  
\- Click: Quick actions menu

Room Card:  
\- Border-radius: 8px  
\- Padding: 16px  
\- Status indicator: Color bar ở top/left  
\- Room number: Prominent (18px, bold)  
\- Room type: Subtitle (12px, gray)

### **13.2. Calendar/Timeline View**

For reservations:  
\- Header: Month/Week navigation  
\- Grid: Days x Rooms  
\- Blocks: Colored segments for bookings  
\- Drag & drop: Visual feedback  
\- Tooltips: Booking details on hover

### **13.3. KPI Cards (Dashboard)**

Card:  
\- White background  
\- Icon: Large (32px), Primary-600  
\- Value: 32px, Bold, Gray-900  
\- Label: 14px, Gray-600  
\- Change indicator: ↑↓ với Success/Error color  
\- Compact: 200px x 120px

---

## **14\. Implementation Notes**

### **14.1. CSS Framework Recommendation**

Tailwind CSS \- Highly recommended  
\- Utility-first approach  
\- Customizable theme  
\- Responsive modifiers  
\- Purge for production

Hoặc:  
\- CSS Modules (React)  
\- Styled Components (React)  
\- SCSS với BEM methodology

### **14.2. Component Library (Optional)**

Consider:  
\- Shadcn/ui (React \+ Tailwind) \- Recommended  
\- Material-UI (MUI)  
\- Ant Design  
\- Chakra UI

Benefits: Pre-built accessible components, faster development

---

## **15\. Design Assets & Resources**

### **15.1. Design Files**

Recommendation: Figma  
\- Design system library  
\- Component variants  
\- Prototype interactions  
\- Developer handoff with specs

### **15.2. Export Guidelines**

Icons: SVG format  
Images: WebP (với PNG fallback)  
Logos: SVG (scalable)  
Illustrations: SVG hoặc PNG (2x resolution)

---

## **16\. Checklist Triển khai**

\- \[ \] Setup color variables (CSS custom properties / Tailwind config)  
\- \[ \] Define typography system  
\- \[ \] Create base layout components (Sidebar, TopNav, ContentArea)  
\- \[ \] Build core UI components (Button, Input, Card, Modal, Table)  
\- \[ \] Implement form components với validation states  
\- \[ \] Create status badges và icons  
\- \[ \] Setup responsive breakpoints  
\- \[ \] Implement focus states cho accessibility  
\- \[ \] Test contrast ratios  
\- \[ \] Create component documentation/Storybook  
\- \[ \] Setup dark mode (if applicable)  
\- \[ \] Performance optimization (lazy loading, code splitting)

[image1]: data:image/png;base64,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
