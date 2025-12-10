### **2\. Phân tích Chi tiết các Màn hình (Screen in Detail)**

#### **2.1. Màn hình Đăng nhập (Login Screen)**

- **Mục đích:** Xác thực người dùng và mở phiên làm việc (liên quan đến Module Quản lý Ca).
- **Control chính:**
  - Input: Tên đăng nhập, Mật khẩu.
  - Button "Đăng nhập".
  - Link "Quên mật khẩu".
- **Xử** lý **sự kiện:**
  - Kiểm tra thông tin trong bảng NHANVIEN và PHANQUYEN.
  - Nếu đăng nhập thành công: Kiểm tra xem nhân viên này có ca làm việc đang mở không (Module Shift). Nếu chưa, điều hướng đến **Màn hình Mở Ca (Start Shift)**. Nếu đã có, vào Dashboard.

#### **2.2. Màn hình Bảng điều khiển (Dashboard)**

- **Mục đích:** Tổng quan tình hình khách sạn realtime.
- **Cập nhật KPI Cards:**
  - **Phòng Trống (Available):** Chỉ đếm phòng READY. (Trừ đi DIRTY, MAINTENANCE, OCCUPIED).
  - **Phòng bẩn (Dirty):** Số lượng phòng cần dọn gấp (Alert cho Housekeeping).
  - **Khách sắp đến (Arrivals):** Số lượng booking có ngày đến \= hôm nay.
  - **Khách sắp đi (Departures):** Số lượng phòng có ngày đi \= hôm nay (Cần chuẩn bị bill).
- **Biểu đồ:** Tỷ lệ lấp đầy (Occupancy Rate) thực tế.

#### **2.3. Màn hình Quản lý Phòng (Room Management)**

- **Mục đích:** Theo dõi trạng thái phòng trực quan (Room Rack).
- **Hiển thị Trạng thái (Color Coded):**
  - 🟢 **READY:** Sẵn sàng bán.
  - 🔴 **OCCUPIED:** Đang có khách (Hiển thị tên khách chính).
  - 🟡 **DIRTY:** Khách vừa check-out, chưa dọn.
  - ⚫ **MAINTENANCE:** Đang bảo trì.
  - 🔵 **RESERVED:** Phòng trống nhưng đã được gán cho booking sắp đến.
- **Action Context Menu (Chuột phải):**
  - "Cập nhật trạng thái" (VD: Từ Dirty \-\> Ready nếu Lễ tân xác nhận thay Housekeeping).
  - "Xem chi tiết Folio" (Nếu phòng đang Occupied).

#### **2.4. Màn hình Quản lý Loại phòng & Giá (Room Type & Pricing Engine)**

- **Mục đích:** Định nghĩa phòng và cấu hình giá động (Module 9).
- **Tab 1: Loại phòng:** (Giữ nguyên như cũ).
- **Tab 2: Cấu hình Giá (Pricing Engine \- MỚI):**
  - **Calendar View:** Chọn ngày để set giá đặc biệt.
  - **Form thiết lập hệ số:**
    - Giá ngày thường (Weekday Rate).
    - Giá cuối tuần (Weekend Rate \- Thứ 6, 7).
    - Giá ngày lễ (Holiday Rate).
    - Hệ số mùa cao điểm (High Season Multiplier).

#### **2.5. Màn hình Quản lý Đặt phòng (Reservation)**

- **Mục đích:** Tạo booking, xử lý đặt cọc và theo dõi trạng thái 2 cấp.
- **Nâng cấp Logic 2-Level Status:**
  - Hiển thị **Trạng thái Phiếu (Header):** PENDING | CONFIRMED | CHECKED_IN...
  - Hiển thị **Trạng** thái từng **phòng (Detail):** Cho phép 1 booking đặt nhiều phòng, mỗi phòng có trạng thái riêng.
- **Control mới:**
  - **Button "Nạp tiền cọc" (Post Deposit):**
    - Mở Modal Folio Transaction.
    - Cho phép thu tiền ngay (Credit).
    - Hệ thống tự động tạo FOLIO (nếu chưa có) và ghi nhận dòng tiền Deposit.
    - Cập nhật trạng thái booking từ PENDING \-\> CONFIRMED.
  - **Chọn phòng cụ thể (Assign Room):** Dropdown hiển thị các phòng trống theo loại.

#### **2.6. Màn hình Check-in / Check-out (Front Desk Operations)**

_(Tách luồng xử lý phức tạp)_

**A. Tab Check-in:**

- **Quy trình:**
  1. Tìm Booking hoặc tạo Walk-in.
  2. **Grid** nhập khách **ở (Guest Info \- Module 12):**
     - Bảng nhập danh sách người ở (NGUOIO).
     - Bắt buộc nhập: Họ tên, CCCD/Passport.
     - Cho phép thêm nhiều người vào 1 phòng.
  3. **Kiểm tra Phụ thu (Surcharge Check \- Module 5):**
     - Hệ thống tự động so sánh giờ hiện tại. Nếu \< 14:00 (hoặc giờ quy định) \-\> Hiển thị **Alert "Early Check-in"**.
     - Checkbox "Mang thú cưng" \-\> Tự động add phí Pet vào Folio.
  4. **Liên kết Folio:** Hiển thị số dư tiền cọc (Credit) từ Booking chuyển sang.

**B. Tab Check-out (Quy trình 3 bước):**

- **Bước** 1: Inspection (Kiểm tra phòng \- Module 6):
  - Form Checklist: Minibar, Khăn tắm, Thiết bị.
  - Nếu tích chọn "Hư hỏng/Mất" \-\> Hiển thị **Popup "Phạt/Bồi thường" (Penalty)**.
  - Chọn món đồ hư hỏng từ danh sách Dịch vụ (Nhóm PHAT) \-\> Post tiền phạt vào Folio.
- **Bước 2: Review Folio:**
  - Hiển thị bảng tổng hợp phí chia 4 nhóm màu:
    - 🏠 **Room Charge:** Tiền phòng (đã trừ ngày lễ/giảm giá).
    - 🍹 **Service:** Minibar, Spa...
    - ⚡ **Surcharge:** Phụ thu check-in sớm, check-out muộn (Auto detect), người thêm.
    - ⚠️ **Penalty:** Tiền phạt hư hỏng.
- **Bước 3: Settlement (Thanh toán):**
  - Hiển thị **Net Balance** \= (Tổng phí \- Tiền cọc).
  - Nếu Balance \> 0: Yêu cầu thanh toán.
  - Nếu Balance \< 0: Yêu cầu hoàn tiền (Refund).
  - Button "Đóng Folio & In Hóa đơn".

#### **2.7. Màn hình Quản lý Dịch vụ (Service Management)**

- **Mục đích:** Quản lý menu dịch vụ và các loại phí.
- **Cập nhật:**
  - Thêm trường **"Nhóm** Dịch Vụ" (Service **Group):** Dropdown chọn (MINIBAR, LAUNDRY, F\&B, PHUTHU, PHAT).
  - Với nhóm PHUTHU và PHAT: Cho phép set giá trị mặc định hoặc "Giá mở" (Open Price \- nhập khi post).

#### **2.8. Màn hình Chi tiết Folio (Folio Detail \- MỚI)**

- **Mục đích:** Thay thế màn hình thanh toán đơn giản cũ. Quản lý toàn bộ sổ cái tài chính của khách.
- **Giao diện:**
  - **Header:** Mã Folio, Khách hàng, Phòng, Trạng thái (Open/Closed).
  - **Balance Card:** Tổng Debit (Nợ) \- Tổng Credit (Có) \= Số dư.
- **Transaction Grid (Lưới giao dịch):**
  - Các cột: Ngày, Giờ, Loại (Room/Service/Payment...), Diễn giải, Debit, Credit, Người tạo.
- **Action Buttons:**
  - **Post Charge:** Thêm phí thủ công (dùng cho Minibar, Laundry...).
  - **Post Payment:** Thu tiền (Tiền mặt/Thẻ/CK).
  - **Void/Adjust:** Hủy hoặc sửa giao dịch sai (Yêu cầu quyền Admin \- Module 18).
  - **Transfer:** Chuyển phí sang Folio khác (Master Folio).
  - **Print Folio:** In bảng kê chi tiết.

#### **2.9. Màn hình Quản lý Nhân viên (Staff Management)**

- **Giữ nguyên:** Thêm/Sửa/Xóa nhân viên, Phân quyền (Role-based access).

#### **2.10. Màn hình Báo cáo (Reports)**

- **Bổ sung các báo cáo mới:**
  - **Night Audit Report:** Báo cáo kiểm toán đêm (Doanh thu phòng, dịch vụ trong ngày).
  - **Shift Report:** Báo cáo giao ca (Tiền đầu ca, tiền cuối ca, chênh lệch).
  - **Housekeeping Report:** Tình trạng phòng, hiệu suất nhân viên dọn phòng.

#### **2.11. Màn hình Quản lý Khách hàng (Customer Profile)**

- **Cập nhật:**
  - **Tab** Lịch sử lưu **trú:** Hiển thị list các Booking cũ.
  - **Tab Thông tin VIP:** Tổng chi tiêu tích lũy, Hạng thành viên (Standard/VIP), Progress bar để lên hạng.

#### **2.12. Màn hình Buồng phòng (Housekeeping \- MỚI)**

- **Mục đích:** Quy trình làm sạch phòng (Module 14).
- **Giao diện:**
  - **Danh sách phòng cần dọn:** Lọc theo "DIRTY" (Khách vừa đi) hoặc "CLEANING" (Đang dọn).
  - **Action Buttons:**
    - "Start": Bắt đầu dọn (Chuyển sang Cleaning).
    - "Finish": Dọn xong (Chuyển sang Inspecting).
    - "Pass Inspection": Supervisor duyệt (Chuyển sang READY \- Sẵn sàng bán).

#### **2.13. Màn hình Quản lý Ca (Shift Management \- MỚI)**

- **Mục đích:** Kiểm soát tiền mặt tại quầy (Module 19).
- **Giao diện:**
  - **Mở ca (Start Shift):** Input nhập "Tiền đầu ca" (Float amount).
  - **Đóng ca (End Shift):** Input nhập "Tiền thực tế trong két".
  - **Bảng đối soát:**
    - Hệ thống tính: Tiền đầu \+ Thu (Tiền mặt) \- Chi (Tiền mặt).
    - So sánh với Tiền thực tế.
    - Hiển thị: **Chênh lệch (Variance)**. Nếu khác 0, yêu cầu nhập lý do giải
