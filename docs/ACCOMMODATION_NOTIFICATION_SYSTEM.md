# 🏨 Hệ thống Thông báo Lưu trú & Tự động Điền Form

## 📋 Tổng quan
Hệ thống hoàn chỉnh để quản lý thông báo lưu trú cho cơ quan công an theo quy định của Việt Nam, tích hợp với portal dichvucong.gov.vn với tính năng tự động điền form.

## 🚀 Tính năng chính

### 1. Quản lý Thông báo Lưu trú
- ✅ Tự động tạo thông báo sau khi check-in
- ✅ Ghi lại thông tin đầy đủ của khách
- ✅ Theo dõi trạng thái gửi hồ sơ
- ✅ Lưu trữ lịch sử thông báo

### 2. Tự động Điền Form Portal
- ✅ Tạo script tự động điền thông tin khách
- ✅ Hỗ trợ nhiều khách trong một lần gửi
- ✅ Giao diện helper trên portal
- ✅ Xử lý clipboard với nhiều phương thức fallback

### 3. Quản lý và Báo cáo
- ✅ Dashboard thống kê thông báo
- ✅ Tìm kiếm và lọc thông báo
- ✅ Xuất báo cáo
- ✅ Theo dõi tiến trình xử lý

## 🗂️ Cấu trúc Hệ thống

### Backend API Routes
```
/api/notifications/
├── GET    - Lấy danh sách thông báo
├── POST   - Tạo thông báo mới
└── PATCH  - Cập nhật trạng thái
```

### Frontend Components
```
/components/
├── CheckinCheckoutModal.tsx       - Modal check-in/out với đăng ký khách
├── GuestRegistrationModal.tsx     - Modal đăng ký thông tin khách
├── ui/
│   ├── CopyButton.tsx             - Button copy với fallback
│   ├── StatusComponents.tsx       - Badge trạng thái và progress
│   └── Sidebar.tsx                - Navigation
```

### Dashboard Pages
```
/dashboard/
├── notifications/                 - Quản lý thông báo lưu trú
├── bookings/                     - Quản lý booking
├── rooms/                        - Quản lý phòng
└── reports/                      - Báo cáo
```

### Utility Libraries
```
/lib/
├── dichvucong-automation.ts      - Service tự động điền form
├── clipboard-utils.ts            - Utilities xử lý clipboard
├── models.ts                     - Database models
└── mongodb.ts                    - Database connection
```

## 🔧 Cài đặt và Sử dụng

### 1. Cài đặt môi trường
```bash
# Clone project
git clone <repository-url>
cd management

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Điền MongoDB URI và các cấu hình khác
```

### 2. Chạy development server
```bash
npm run dev
```

### 3. Seed dữ liệu test
```bash
curl -X POST http://localhost:3000/api/seed
```

## 📖 Hướng dẫn Sử dụng

### 1. Quy trình Check-in và Đăng ký
1. **Check-in khách**: Từ dashboard → Bookings → Check-in
2. **Đăng ký thông tin**: Modal tự động hiện để nhập thông tin khách
3. **Tạo thông báo**: Hệ thống tự động tạo thông báo lưu trú
4. **Xác nhận**: Kiểm tra thông tin và lưu

### 2. Gửi Thông báo qua Portal
1. **Vào trang quản lý**: Dashboard → Notifications
2. **Chọn thông báo**: Click vào thông báo cần gửi
3. **Auto-fill script**: Click "Copy Script Tự Động Điền"
4. **Mở portal**: Click "Mở Portal" để mở dichvucong.gov.vn
5. **Chạy script**: Mở Developer Console (F12), paste script và Enter
6. **Auto workflow**: Script sẽ:
   - Tự động bấm button "THÊM MỚI NGƯỜI LƯU TRÚ"
   - Điền thông tin khách đầu tiên
   - Tạo helper UI để chuyển đổi giữa các khách
7. **Kiểm tra**: Xem thông tin đã được điền tự động
8. **Gửi hồ sơ**: Nhấn "Gửi hồ sơ" trên portal
9. **Đánh dấu**: Quay lại hệ thống đánh dấu "Đã gửi"

### 3. Script Auto-fill Features
**Tự động bấm button**: Script tìm và bấm button "THÊM MỚI NGƯỜI LƯU TRÚ"
```html
<a id="btnAddPersonLT" onclick="resetform()">
  <button>THÊM MỚI NGƯỜI LƯU TRÚ</button>
</a>
```
**Helper UI bao gồm**:
- Hiển thị tiến trình (Khách 1/3)
- Nút chuyển đổi giữa các khách
- Button backup để bấm "THÊM MỚI NGƯỜI LƯU TRÚ" thủ công
- Hiển thị tên khách hiện tại

### 4. Test Auto-fill
- Vào `/test-autofill` để test tính năng tự động điền
- Có dữ liệu mẫu để test
- Script sẽ hiển thị helper UI trên portal

## 🔒 Bảo mật và Quy định

### 1. Dữ liệu Khách hàng
- Mã hóa thông tin nhạy cảm
- Chỉ lưu trữ thông tin cần thiết theo quy định
- Có cơ chế xóa dữ liệu theo thời hạn

### 2. Tuân thủ Quy định
- Đúng format theo yêu cầu của cơ quan công an
- Đầy đủ thông tin bắt buộc
- Lưu trữ bản backup để kiểm tra

### 3. API Security
- JWT authentication
- Rate limiting
- Input validation
- CORS protection

## 🛠️ Troubleshooting

### 1. Clipboard không hoạt động
**Nguyên nhân**: Browser security, non-HTTPS, document not focused

**Giải pháp**:
- Hệ thống có 3 phương thức fallback
- Modern Clipboard API → execCommand → Manual prompt
- Tự động xử lý lỗi và fallback

### 2. Script không chạy trên Portal
**Nguyên nhân**: CSP policy, cross-origin restrictions

**Giải pháp**:
- Sử dụng Developer Console
- Script được optimize cho dichvucong.gov.vn
- Có instructions rõ ràng cho user

### 3. Database Connection Issues
**Kiểm tra**:
- MongoDB URI trong .env.local
- Network connectivity
- Database permissions

## 📊 Monitoring và Analytics

### 1. Metrics theo dõi
- Số lượng thông báo được tạo
- Tỷ lệ gửi thành công
- Thời gian xử lý trung bình
- Lỗi phổ biến

### 2. Logs
- API request logs
- Error logs
- User action logs
- Performance metrics

## 🔄 Cập nhật và Maintenance

### 1. Regular Updates
- Kiểm tra changes trên portal dichvucong.gov.vn
- Update script automation nếu có thay đổi form
- Security patches
- Performance optimization

### 2. Data Backup
- Backup MongoDB daily
- Export thông báo quan trọng
- Version control cho configurations

## 📞 Support và Documentation

### 1. Technical Support
- Check logs trong `/logs` directory
- Enable debug mode trong development
- Contact system administrator

### 2. User Guide
- Video tutorials cho staff
- Step-by-step instructions
- FAQ cho các vấn đề thường gặp

---

## 🎯 Roadmap Tương lai

### Phase 2 Features
- [ ] Email notifications
- [ ] Bulk operations
- [ ] Advanced reporting
- [ ] Integration với thêm services
- [ ] Mobile app support
- [ ] API for third-party integration

### Performance Optimization
- [ ] Caching strategies
- [ ] Database indexing
- [ ] CDN for static assets
- [ ] Server-side rendering optimization

---

> 📌 **Lưu ý**: Hệ thống này tuân thủ đầy đủ quy định của nhà nước về quản lý lưu trú. 
> Vui lòng đảm bảo cập nhật thường xuyên theo các thay đổi quy định mới.
