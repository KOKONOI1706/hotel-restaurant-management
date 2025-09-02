# 🏨 Tính năng Tự động điền Form Thông báo Lưu trú

## 📋 Tổng quan
Hệ thống đã được tích hợp tính năng tự động điền thông tin khách lưu trú vào trang dichvucong.gov.vn, giúp admin tiết kiệm thời gian và giảm thiểu lỗi nhập liệu.

## ✨ Tính năng đã hoàn thành

### 1. 🤖 Service Tự động điền (DichVuCongAutomationService)
- **File**: `src/lib/dichvucong-automation.ts`
- **Chức năng**:
  - Chuyển đổi dữ liệu khách từ hệ thống sang format phù hợp với form dichvucong
  - Tạo JavaScript script tự động điền form
  - Mapping thông minh các field (họ tên, CCCD, ngày sinh, mục đích...)
  - Xử lý đặc biệt cho dropdown và date picker

### 2. 📊 Trang Quản lý Thông báo Lưu trú
- **File**: `src/app/dashboard/notifications/page.tsx`
- **Chức năng**:
  - Hiển thị danh sách tất cả thông báo lưu trú đã gửi
  - Trạng thái "Đã gửi hồ sơ" / "Chưa gửi hồ sơ"
  - Nút "🤖 Tự động điền" mở dichvucong.gov.vn với auto-fill
  - Nút "✅ Đã gửi" để đánh dấu hoàn thành
  - Chi tiết từng thông báo với thông tin khách

### 3. 🔧 Giao diện Helper trên Portal
- **Floating UI** xuất hiện trên trang dichvucong.gov.vn
- **Chức năng**:
  - Hiển thị thông tin khách hiện tại
  - Nút "Trước/Sau" để chuyển đổi giữa các khách
  - Đóng helper khi không cần
  - Tự động cập nhật button state

### 4. 📡 API Backend
- **File**: `src/app/api/notifications/route.ts` - Lấy danh sách thông báo
- **File**: `src/app/api/notifications/[id]/submit/route.ts` - Cập nhật trạng thái gửi
- **Database**: Thêm field `submittedToPortal`, `portalSubmissionDate`

### 5. 🧪 Trang Test
- **File**: `src/app/test-autofill/page.tsx`
- **Chức năng**: Test tính năng auto-fill trước khi sử dụng thực tế

## 🔄 Workflow sử dụng

### Bước 1: Sau khi Check-in
1. Admin check-in khách
2. Modal đăng ký thông tin lưu trú tự động xuất hiện
3. Nhập thông tin chi tiết các khách
4. Gửi thông báo lưu trú

### Bước 2: Gửi hồ sơ lên Portal
1. Vào trang "Thông báo lưu trú" (`/dashboard/notifications`)
2. Nhấn nút "🤖 Tự động điền" cho thông báo cần xử lý
3. Trang dichvucong.gov.vn mở trong tab mới
4. Script tự động điền thông tin tất cả khách
5. Helper UI xuất hiện để điều khiển
6. Kiểm tra thông tin và nhấn "Gửi hồ sơ" trên dichvucong

### Bước 3: Đánh dấu hoàn thành
1. Quay lại trang admin
2. Nhấn nút "✅ Đã gửi" để đánh dấu hoàn thành
3. Trạng thái cập nhật thành "Đã gửi hồ sơ"

## 🛠️ Kỹ thuật

### Auto-fill Strategy
```javascript
// Sử dụng multiple selectors để tìm field
const fieldMappings = {
  'hoTen': ['input[name*="hoten"]', 'input[id*="hoten"]', 'input[placeholder*="họ tên"]'],
  'ngaySinh': ['input[name*="ngaysinh"]', 'input[type="date"]'],
  // ...
};

// Dispatch events để trigger validation
element.value = value;
element.dispatchEvent(new Event('input', { bubbles: true }));
element.dispatchEvent(new Event('change', { bubbles: true }));
```

### Cross-origin Handling
- Sử dụng `postMessage` và script injection
- Fallback với clipboard copy
- Error handling cho các trường hợp bảo mật

### State Management
- LocalStorage lưu trạng thái "đã gửi hồ sơ"
- Database sync cho trạng thái chính thức
- Real-time update UI

## 🔗 Navigation
- Thêm link "Thông báo lưu trú" vào sidebar
- Accessible từ `/dashboard/notifications`

## 🧪 Testing
- Trang test riêng: `/test-autofill`
- Mock data để test script
- Preview script code

## 🚀 Lợi ích
1. **Tiết kiệm thời gian**: Tự động điền thay vì nhập thủ công
2. **Giảm lỗi**: Dữ liệu từ hệ thống đã validated
3. **Truy vết được**: Lưu lại lịch sử gửi hồ sơ
4. **User-friendly**: Giao diện trực quan, hướng dẫn rõ ràng
5. **Fallback options**: Luôn có phương án dự phòng

## 📝 Ghi chú
- Script hoạt động trên hầu hết các form web
- Tương thích với các framework JS phổ biến
- An toàn, không lưu trữ dữ liệu nhạy cảm
- Có thể mở rộng cho các portal khác
