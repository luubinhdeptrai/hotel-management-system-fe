### **2\. Phân tích Chi tiết các Màn hình (Screen in Detail)**

#### **2.1. Màn hình Đăng nhập (Login Screen)**

- **Mục đích chính:** Xác thực người dùng (nhân viên) và điều hướng họ đến màn hình chính dựa trên vai trò (phân quyền).

- **Luồng tham chiếu (Use Case):** Là điều kiện tiên quyết (Precondition) cho hầu hết các Use Case nghiệp vụ (ví dụ: UC1, UC2, UC4, UC5, v.v.). Tham chiếu yêu cầu chức năng quản lý tài khoản và phân quyền (FR-025, FR-026).

- **Các Control chính:**

  - Textbox "Tên đăng nhập" (hoặc "Mã nhân viên").
  - Textbox "Mật khẩu" (dạng password).
  - Button "Đăng nhập".
  - Link "Quên mật khẩu?" (Tùy chọn).
  - Checkbox "Nhớ mật khẩu" (Tùy chọn).

- **Màn hình con / Component phụ:**

  - Thông báo lỗi (Error Message Box) (ví dụ: "Tên đăng nhập hoặc mật khẩu không đúng").

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Người dùng nhập Tên đăng nhập và Mật khẩu.

  2. Người dùng nhấn button "Đăng nhập".

  3. **Hệ thống xử lý:** Hệ thống sẽ kiểm tra thông tin đăng nhập dựa trên bảng PHANQUYEN.

  4. **Thành công:** Nếu hợp lệ, hệ thống đọc vai trò (ví dụ: Admin, Lễ tân) và chuyển hướng người dùng đến "Màn hình Bảng điều khiển (Dashboard)" với các chức năng tương ứng với vai trò đó.

  5. **Thất bại:** Nếu thông tin không hợp lệ, hệ thống hiển thị thông báo lỗi 6 và giữ nguyên màn hình đăng nhập.

#### **2.2. Màn hình Bảng điều khiển (Dashboard)**

- **Mục đích chính:** Cung cấp cái nhìn tổng quan, tức thời về tình hình hoạt động của khách sạn cho nhân viên (đặc biệt là Quản lý và Lễ tân).

- **Luồng tham chiếu (Use Case):** Đây là màn hình tổng hợp thông tin, không gắn trực tiếp với 1 UC cụ thể nhưng lấy dữ liệu từ nhiều nguồn (Quản lý phòng, Đặt phòng, Doanh thu).

- **Các Control chính:**

  - Các "Thẻ" (KPI Cards) hiển thị thông số nhanh: Tổng số phòng, Phòng trống, Doanh thu hôm nay, Số lượng khách đang ở.

  - Biểu đồ (Chart): Biểu đồ tròn hoặc cột về công suất phòng (ví dụ: Trống vs. Đang thuê vs. Bảo trì).

  - Bảng (Table): Danh sách các lượt đặt phòng sắp đến (Today's Arrivals) và các lượt trả phòng (Today's Departures).

  - Menu điều hướng chính (Main Navigation Menu): Thanh sidebar hoặc topbar để truy cập các màn hình chức năng khác.

- **Màn hình con / Component phụ:** Không có.

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Màn hình tự động tải dữ liệu khi người dùng đăng nhập thành công.

  2. Dữ liệu được lấy từ các bảng PHONG (TrangThaiPhong), DATPHONG, và TRAPHONG (TongTien).

  3. Người dùng xem thông tin tổng quan.

  4. **Sự kiện (Nhấn vào Menu):** Người dùng nhấn vào một mục trên menu điều hướng (ví dụ: "Quản lý Phòng") để chuyển đến màn hình tương ứng.

  5. **Sự kiện (Nhấn vào danh sách):** (Tùy chọn) Nhấn vào một lượt đặt phòng trong danh sách "sắp đến" sẽ điều hướng thẳng đến chi tiết của đặt phòng đó (trên Màn hình Quản lý Đặt phòng).

#### **2.3. Màn hình Quản lý Phòng (Room Management)**

- **Mục đích chính:** Hiển thị trực quan trạng thái tất cả các phòng và cho phép Lễ tân/Quản lý cập nhật thông tin, trạng thái phòng.

- **Luồng tham chiếu (Use Case):** UC1 \- Quản lý phòng. SRS 3.2.

- **Các Control chính:**

  - Lưới/Bảng danh sách phòng (Room Grid/Table): Hiển thị thông tin cơ bản của từng phòng (Tên phòng, Loại phòng, Trạng thái).

  - Bộ lọc (Filters): Lọc danh sách theo "Trạng thái" (Trống, Đang thuê, Bảo trì...) và "Loại phòng".

  - Button "Thêm phòng mới".

  - Các controls trên mỗi phòng trong lưới: Button "Sửa" (chỉnh sửa thông tin phòng), Button "Xóa".

  - Controls cập nhật trạng thái nhanh (ví dụ: Nhấn chuột phải vào phòng \-\> "Đánh dấu đang dọn dẹp", "Đánh dấu bảo trì").

- **Màn hình con / Component phụ:**

  - **Form Thêm/Sửa phòng (Modal):** Một cửa sổ popup/modal hiển thị khi nhấn "Thêm mới" hoặc "Sửa". Yêu cầu nhập các trường như MaPhong, TenPhong, MaLoaiPhong.

  - **Hộp thoại xác nhận (Confirmation Dialog):** Hiển thị khi nhấn "Xóa" hoặc khi chuyển trạng thái sang "Bảo trì" (để cảnh báo nếu có đặt phòng trong tương lai).

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Người dùng xem danh sách phòng. Họ có thể sử dụng bộ lọc để tìm phòng trống.

  2. **Sự kiện (Thêm phòng):** Nhấn "Thêm phòng mới", Form (modal) xuất hiện. Người dùng nhập thông tin và nhấn "Lưu". Hệ thống kiểm tra tính hợp lệ (FR-005) và lưu vào CSDL.

  3. **Sự kiện (Cập nhật trạng thái):** Lễ tân nhấn vào một phòng và chọn trạng thái mới (ví dụ: "Bảo trì"). Hệ thống yêu cầu xác nhận. Nếu OK, hệ thống cập nhật PHONG.TrangThaiPhong (FR-006) và làm mới giao diện.

  4. **Sự kiện (Xóa phòng):** Nhấn "Xóa". Hộp thoại xác nhận hiện lên. Nếu OK, hệ thống thực hiện xóa (nên là xóa mềm).

#### **2.4. Màn hình Quản lý Loại phòng (Room Type Management)**

- **Mục đích chính:** Cho phép Quản lý định nghĩa các loại phòng, giá cơ bản, sức chứa, và các tiện nghi.

- **Luồng tham chiếu (Use Case):** UC1.2 \- Quản lý loại phòng. SRS 3.1.

- **Các Control chính:**

  - Bảng danh sách các loại phòng hiện có (Tên loại, Giá, Sức chứa).

  - Button "Thêm loại phòng mới".

  - Các controls trên mỗi hàng: Button "Sửa", Button "Xóa".

- **Màn hình con / Component phụ:**

  - **Form Thêm/Sửa Loại phòng (Modal):** Cửa sổ popup để nhập/sửa thông tin MaLoaiPhong, TenLoaiPhong, Gia, SucChua, TienNghi (FR-001). Có thể cho phép gán nhiều mức giá (FR-003).

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Quản lý truy cập màn hình (thường trong khu vực Cài đặt/Admin).

  2. **Sự kiện (Thêm/Sửa):** Nhấn "Thêm mới" hoặc "Sửa". Form modal xuất hiện. Người dùng nhập thông tin.

  3. **Hệ thống xử lý:** Khi nhấn "Lưu", hệ thống kiểm tra ràng buộc (FR-004: mã không trùng, giá \> 0, sức chứa \> 0). Nếu hợp lệ, lưu vào bảng LOAIPHONG.

  4. **Sự kiện (Xóa):** Nhấn "Xóa". Hệ thống kiểm tra xem loại phòng này có đang được PHONG nào sử dụng không.

  5. **Xử lý ràng buộc:** Nếu đang được sử dụng, hệ thống hiển thị thông báo "Không thể xóa loại phòng đang được sử dụng, chỉ có thể chỉnh sửa". Nếu không, cho phép xóa (xóa mềm) (FR-002).

#### **2.5. Màn hình Quản lý Đặt phòng (Reservation Management)**

- **Mục đích chính:** Tạo, xem, sửa, và hủy đặt phòng cho khách hàng (thực hiện bởi Lễ tân hoặc Khách hàng)46464646.

- **Luồng tham chiếu (Use Case):** UC1.3 \- Đặt phòng. SRS 3.3.

- **Các Control chính:**

  - Bộ chọn ngày (Date Pickers): "Ngày đến" (Check-in Date) và "Ngày đi" (Check-out Date).

  - Bộ lọc (Filters): "Loại phòng", "Số lượng khách".

  - Button "Tìm phòng trống".

  - Khu vực hiển thị kết quả: Thường là dạng Lịch (Calendar) hoặc Timeline, hiển thị các phòng và các khối đặt phòng đã có.

  - Button "Tạo đặt phòng mới".

- **Màn hình con / Component phụ:**

  - **Form Tạo/Sửa Đặt phòng (Modal):** Hiển thị khi nhấn "Tạo đặt phòng" hoặc nhấn vào một khối đặt phòng để sửa. Yêu cầu nhập thông tin khách hàng, xác nhận phòng, và thông tin đặt cọc (nếu có).

  - **Hộp thoại xác nhận Hủy phòng (Cancel Confirmation).**

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Lễ tân chọn ngày đến, ngày đi và loại phòng.

  2. Nhấn "Tìm phòng trống". Hệ thống kiểm tra xung đột thời gian (FR-009) 56 và hiển thị các phòng/slot trống.

  3. **Sự kiện (Tạo Đặt phòng):** Lễ tân chọn phòng trống và nhấn "Tạo đặt phòng".

  4. Form Tạo Đặt phòng xuất hiện. Lễ tân nhập thông tin khách, số tiền cọc.

  5. **Hệ thống xử lý:** Khi nhấn "Lưu", hệ thống tạo bản ghi DATPHONG và CHITIET_DATPHONG 58 (FR-010). Hệ thống cũng có thể kích hoạt gửi email/SMS xác nhận (FR-011).

  6. **Sự kiện (Sửa Đặt phòng):** Lễ tân nhấn vào một khối đặt phòng đã có. Form Sửa xuất hiện. Lễ tân thay đổi (ví dụ: ngày đi). Khi "Lưu", hệ thống phải kiểm tra lại tính khả dụng mới (FR-012).

  7. **Sự kiện (Hủy phòng):** Nhấn "Hủy". Hệ thống yêu cầu xác nhận. Nếu OK, cập nhật trạng thái đặt phòng (và có thể tính phí hủy nếu có).

#### **2.6. Màn hình Check-in / Check-out**

- **Mục đích chính:** Xử lý quy trình nghiệp vụ chính của Lễ tân khi khách đến nhận phòng (Check-in) và khi khách trả phòng (Check-out).

- **Luồng tham chiếu (Use Case):** UC1.4 \- Check-in. UC1.5 \- Check-out SRS 3.4.

- **Các Control chính:**

  - Tabs: "Check-in" và "Check-out".

  - **Tab Check-in:**

    - Thanh tìm kiếm: Tìm theo MaDatPhong hoặc Tên khách hàng.

    - Bảng kết quả: Hiển thị các đặt phòng khớp.

    - Button "Check-in" (cho đặt phòng đã chọn).

    - Button "Tạo đặt phòng trực tiếp (Walk-in)" (cho khách vãng lai).

  - **Tab Check-out:**

    - Thanh tìm kiếm: Tìm theo MaPhong hoặc MaPhieuThue.

    - Khu vực hiển thị chi tiết: Hiển thị thông tin phiếu thuê, tiền phòng, danh sách các dịch vụ/phụ thu/phạt đã sử dụng.

    - Button "Thêm Dịch vụ / Phạt".

    - Label "Tổng tiền" (tự động cập nhật).

    - Button "Hoàn tất Check-out và Thanh toán".

- **Màn hình con / Component phụ:**

  - **Form Tạo Phiếu Thuê (Modal):** Hiển thị khi nhấn "Check-in", yêu cầu xác nhận thông tin khách, số người ở thực tế (SoNguoiO).

  - **Modal Thêm Dịch vụ / Phạt:** Hiển thị khi Lễ tân nhấn "Thêm Dịch vụ" lúc check-out. Cho phép chọn dịch vụ từ DICHVU hoặc nhập phí phạt (PHIEUPHAT).

  - **Modal Xử lý Thanh toán:** (Xem Màn hình 2.8) Thường được gọi sau khi nhấn "Hoàn tất Check-out".

- **Mô tả sử dụng và xử lý sự kiện:**

  - **Luồng Check-in:**

    1. Lễ tân tìm đặt phòng của khách.

    2. Chọn đúng đặt phòng, nhấn "Check-in".

    3. Hệ thống hiển thị Form Phiếu Thuê. Lễ tân xác nhận thông tin.

    4. **Hệ thống xử lý:** Khi "Lưu", hệ thống tạo PHIEUTHUEPHONG(FR-015) 79, cập nhật CHITIET_DATPHONG.TinhTrangDatPhong \= "Đã nhận", và PHONG.TrangThaiPhong \= "Đang thuê".

  - **Luồng Check-out:**

    1. Lễ tân tìm phiếu thuê của phòng đang trả.

    2. Hệ thống tự động tính tiền phòng và hiển thị các dịch vụ đã dùng (CHITIET_TRAPHONG).

    3. Lễ tân kiểm tra phòng và (nếu cần) nhấn "Thêm Phạt" để nhập phí hư hỏng (FR-017).

    4. Lễ tân nhấn "Hoàn tất Check-out và Thanh toán".

    5. **Hệ thống xử lý:** (Sau khi thanh toán thành công \- xem 2.8) Cập nhật PHONG.TrangThaiPhong \= "Đang vệ sinh" (FR-018) và gửi thông báo cho nhân viên dọn phòng.

#### **2.7. Màn hình Quản lý Dịch vụ (Service Management)**

- **Mục đích chính:** Cho phép Quản lý định nghĩa, cập nhật giá và quản lý danh mục các dịch vụ mà khách sạn cung cấp (Giặt ủi, Minibar, Spa, v.v.).

- **Luồng tham chiếu (Use Case):** UC1.6 \- Quản lý dịch vụ. SRS 3.5.

- **Các Control chính:**

  - Tabs: "Quản lý Dịch vụ" (ví dụ: "Nước suối", "Giặt ủi 1kg") và "Quản lý Loại Dịch vụ" (ví dụ: "Minibar", "Giặt ủi").

  - Bảng danh sách (cho cả Dịch vụ và Loại Dịch vụ).

  - Button "Thêm mới", "Sửa", "Xóa" (cho cả hai tab)9191.

- **Màn hình con / Component phụ:**

  - **Form Thêm/Sửa Loại Dịch vụ (Modal):** Nhập TenLoai DichVu.

  - **Form Thêm/Sửa Dịch vụ (Modal):** Nhập TenDV, chọn MaLoaiDichVu, và nhập Gia.

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Quản lý vào màn hình này để cài đặt dịch vụ.

  2. **Sự kiện (Thêm DV):** Nhấn "Thêm Dịch vụ". Form modal hiện ra. Quản lý nhập "Trà (gói)", chọn loại "Minibar", nhập giá.

  3. **Hệ thống xử lý:** Khi "Lưu", hệ thống lưu vào bảng DICHVU (FR-022).

  4. Các dịch vụ này sau đó sẽ khả dụng để Lễ tân chọn trong "Modal Thêm Dịch vụ" ở màn hình Check-out.

  5. **Sự kiện (Xóa):** Nếu xóa một dịch vụ đã từng được sử dụng (có trong CHITIET_TRAPHONG lịch sử), hệ thống nên thực hiện xóa mềm (soft-delete) để đảm bảo tính toàn vẹn của báo cáo.

#### **2.8. Màn hình Quản lý Thanh toán & Hóa đơn (Payment & Invoice Management)**

- **Mục đích chính:** Xử lý giao dịch tài chính cuối cùng khi check-out và tạo/in hóa đơn cho khách.

- **Luồng tham chiếu (Use Case):** UC1.8 \- Quản lý thanh toán và hóa đơ. SRS 3.7.

- **Lưu ý:** Màn hình này thường không đứng riêng lẻ mà là một **Modal (Form)** được gọi từ Màn hình Check-out.

- **Các Control chính (trong Modal Thanh toán):**

  - Label "Tổng số tiền thanh toán" (ví dụ: 5,000,000 VNĐ).

  - Dropdown "Chọn phương thức thanh toán" (HINHTHUCTHANHTOAN: Tiền mặt, Thẻ tín dụng, Chuyển khoản...).

  - (Tùy chọn) Các trường nhập thông tin thanh toán (nếu tích hợp cổng thanh toán).

  - Button "Xác nhận Thanh toán".

  - Button "In Hóa đơn" (thường chỉ kích hoạt sau khi thanh toán thành công).

- **Màn hình con / Component phụ:**

  - **Giao diện In Hóa đơn (Print View):** Một template/layout chuẩn để in ra máy in hóa đơ.

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Modal này xuất hiện sau khi Lễ tân nhấn "Hoàn tất Check-out" (từ màn hình 2.6).

  2. Lễ tân xác nhận số tiền với khách và chọn phương thức thanh toán.

  3. **Sự kiện (Chọn Thẻ/Online):** Nếu chọn thanh toán thẻ, hệ thống gửi yêu cầu đến Cổng thanh toán (External System) (FR-029).

  4. **Sự kiện (Xác nhận Thanh toán):** Nhấn "Xác nhận Thanh toán".

  5. **Thành công:** Hệ thống tạo bản ghi TRAPHONG và HOADON (FR-028). Cập nhật trạng thái phiếu thuê là "Đã thanh toán".

  6. **Thất bại (ví dụ: thẻ bị từ chối):** Hệ thống hiển thị thông báo lỗi. Lễ tân yêu cầu khách đổi phương thức khác (quay lại bước 2).

  7. **Sự kiện (In Hóa đơn):** Sau khi thành công, Lễ tân nhấn "In Hóa đơn". Hệ thống tạo file PDF/view in (FR-030) và gửi lệnh in.

#### **2.9. Màn hình Quản lý Nhân viên & Phân quyền (Admin)**

- **Mục đích chính:** Cho phép Admin tạo, quản lý tài khoản nhân viên và gán quyền hạn truy cập hệ thống.

- **Luồng tham chiếu (Use Case):** UC1.7 \- Quản lý nhân viên và phân quyền. SRS 3.6.

- **Các Control chính:**

  - Tabs: "Quản lý Nhân viên" và "Quản lý Vai trò (Phân quyền)".

  - **Tab Nhân viên:**

    - Bảng danh sách nhân viên (NHANVIEN).

    - Button "Thêm nhân viên mới"118.

    - Controls "Sửa", "Vô hiệu hóa" (Xóa mềm).

  - **Tab Vai trò:**

    - Danh sách các vai trò (Role): Admin, Lễ tân, Phục vụ.

    - Danh sách/Cây các quyền (Permissions) để gán cho vai trò.

- **Màn hình con / Component phụ:**

  - **Form Thêm/Sửa Nhân viên (Modal):** Nhập thông tin TenNV, ChucVu, SoDienThoai... (FR-024).

  - **Modal Tạo/Cập nhật Tài khoản (Modal):** Cho phép tạo tài khoản đăng nhập (bảng PHANQUYEN), đặt mật khẩu, và gán Vai trò (FR-025).

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Admin vào màn hình "Quản lý Nhân viên".

  2. **Sự kiện (Thêm NV):** Nhấn "Thêm nhân viên mới". Form modal xuất hiện.

  3. Admin nhập thông tin cá nhân.

  4. **Hệ thống xử lý:** Khi "Lưu", hệ thống kiểm tra dữ liệu (Validate Employee Data).

  5. Sau đó, Admin nhấn "Tạo tài khoản" cho nhân viên đó. Modal Tài khoản xuất hiện.

  6. Admin gán vai trò (ví dụ: "Lễ tân") và tạo mật khẩu.

  7. **Hệ thống xử lý:** Hệ thống tạo bản ghi PHANQUYEN (FR-025). Nhân viên này giờ có thể đăng nhập với quyền Lễ tân.

  8. **Sự kiện (Vô hiệu hóa):** Admin nhấn "Vô hiệu hóa" (thay vì Xóa). Hệ thống cập nhật NHANVIEN.TinhTrangLamViec và vô hiệu hóa tài khoản đăng nhập (Deactivate Account).

#### **2.10. Màn hình Báo cáo & Thống kê (Admin)**

- **Mục đích chính:** Cung cấp các báo cáo tổng hợp về doanh thu, công suất phòng, và các hoạt động khác cho Quản lý.

- **Luồng tham chiếu (Use Case):** SRS 3.8, SRS 4.3 (Danh sách báo cáo).

- **Các Control chính:**

  - Danh sách chọn loại báo cáo (Dropdown/List): "Báo cáo doanh thu theo ngày", "Báo cáo phòng trống", "Báo cáo danh sách khách hàng", v.v.

  - Bộ lọc (Filters): "Khoảng ngày" (Date Range Picker), "Lọc theo Loại phòng" (tùy chọn).

  - Button "Xem Báo cáo" (Generate Report).

  - Button "Xuất PDF" / "Xuất Excel" (FR-036).

  - Khu vực hiển thị kết quả (Result Area): Hiển thị bảng dữ liệu (Table) và/hoặc Biểu đồ (Chart).

- **Màn hình con / Component phụ:** Không có.

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Quản lý chọn loại báo cáo (ví dụ: "Báo cáo doanh thu theo ngày").

  2. Chọn khoảng thời gian (ví dụ: Tháng 10/2025).

  3. Nhấn "Xem Báo cáo".

  4. **Hệ thống xử lý:** Hệ thống chạy truy vấn (query) CSDL, tổng hợp dữ liệu từ TRAPHONG và CHITIET TRAPHONG. Hệ thống phải được tối ưu để trả về kết quả nhanh (NFR-003: \< 5 giây).

  5. Kết quả được hiển thị trong "Khu vực hiển thị" dưới dạng bảng và biểu đồ.

  6. **Sự kiện (Xuất file):** Quản lý nhấn "Xuất Excel". Hệ thống tạo file Excel chứa dữ liệu báo cáo và cho phép người dùng tải về (FR-036).

#### **2.11. Màn hình Quản lý Khách hàng (Customer Management)**

- **Mục đích chính:** Lưu trữ và quản lý thông tin khách hàng, hỗ trợ tra cứu lịch sử đặt phòng và cung cấp trải nghiệm cá nhân hóa cho khách quen.

- **Luồng tham chiếu (Use Case):** Liên quan đến UC1.3 (Đặt phòng), UC1.4 (Check-in). Tham chiếu yêu cầu chức năng quản lý khách hàng (FR-031, FR-032, FR-033).

- **Các Control chính:**

  - Bảng danh sách khách hàng (Customer Table): Hiển thị CustomerID, CustomerName, phoneNumber, Email, identityCard, Address.
  - Thanh tìm kiếm (Search Bar): Tìm kiếm theo tên, số điện thoại, email, hoặc số CCCD (identityCard).
  - Button "Thêm khách hàng mới".
  - Các controls trên mỗi hàng: Button "Xem chi tiết", Button "Sửa", Button "Xóa".
  - Bộ lọc (Filters): Lọc theo "Loại khách hàng" (Cá nhân/Doanh nghiệp), "Khách VIP".

- **Màn hình con / Component phụ:**

  - **Form Thêm/Sửa Khách hàng (Modal):** Cửa sổ popup để nhập/chỉnh sửa thông tin khách hàng (CustomerName, phoneNumber, Email, identityCard, Address, Nationality). Yêu cầu validate số điện thoại và email (FR-032).
  - **Modal Chi tiết Khách hàng:** Hiển thị thông tin đầy đủ của khách hàng và lịch sử đặt phòng/lưu trú (FR-033). Bao gồm danh sách các lần đặt phòng trước đó với trạng thái và tổng chi tiêu.
  - **Hộp thoại xác nhận (Confirmation Dialog):** Hiển thị khi nhấn "Xóa" khách hàng.

- **Mô tả sử dụng và xử lý sự kiện:**

  1. Lễ tân/Quản lý truy cập màn hình để quản lý thông tin khách hàng.

  2. **Sự kiện (Tìm kiếm):** Người dùng nhập số điện thoại hoặc tên khách vào thanh tìm kiếm. Hệ thống tự động lọc danh sách khách hàng phù hợp (FR-031).

  3. **Sự kiện (Thêm khách hàng):** Nhấn "Thêm khách hàng mới". Form modal xuất hiện. Lễ tân nhập thông tin khách hàng.

  4. **Hệ thống xử lý:** Khi nhấn "Lưu", hệ thống kiểm tra tính hợp lệ (số điện thoại không trùng, email đúng định dạng, số CCCD hợp lệ) (FR-032). Nếu hợp lệ, tạo bản ghi KHACHHANG mới và trả về MaKH.

  5. **Sự kiện (Xem chi tiết):** Nhấn "Xem chi tiết" trên một khách hàng. Modal Chi tiết xuất hiện, hiển thị thông tin cá nhân và lịch sử đặt phòng (lấy từ DATPHONG và PHIEUTHUEPHONG) (FR-033).

  6. **Sự kiện (Sửa):** Nhấn "Sửa". Form modal với thông tin hiện tại xuất hiện. Lễ tân chỉnh sửa (ví dụ: cập nhật số điện thoại mới). Khi "Lưu", hệ thống cập nhật bản ghi KHACHHANG.

  7. **Sự kiện (Xóa):** Nhấn "Xóa". Hộp thoại xác nhận hiện lên.

  8. **Xử lý ràng buộc:** Hệ thống kiểm tra xem khách hàng này có đặt phòng đang hoạt động hoặc lịch sử giao dịch không. Nếu có, hệ thống thông báo "Không thể xóa khách hàng có lịch sử giao dịch. Chỉ có thể vô hiệu hóa." Thực hiện xóa mềm (soft delete) bằng cách đánh dấu trạng thái thay vì xóa vật lý.

  9. **Tích hợp với Đặt phòng:** Khi tạo đặt phòng mới (màn hình 2.5), Lễ tân có thể tìm kiếm khách hàng hiện có hoặc nhanh chóng thêm mới từ form đặt phòng. Hệ thống tự động điền thông tin khách hàng vào các trường liên quan.
