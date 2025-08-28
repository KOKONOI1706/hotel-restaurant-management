# Tích hợp Viettel vInvoice - Hóa đơn điện tử

## Tổng quan
Hệ thống đã được tích hợp với **Viettel vInvoice** để hỗ trợ tạo và quản lý hóa đơn điện tử theo quy định của Việt Nam.

## Tính năng đã triển khai

### 1. Quản lý hóa đơn điện tử
- ✅ Tạo hóa đơn VAT tuân thủ chuẩn Việt Nam
- ✅ Hiển thị ký hiệu, mẫu số hóa đơn
- ✅ Lưu mã tra cứu và mã xác thực
- ✅ Theo dõi trạng thái hóa đơn điện tử
- ✅ Tích hợp link tra cứu Cục Thuế

### 2. Trường dữ liệu tuân thủ
- **Thông tin doanh nghiệp**: Mã số thuế, địa chỉ
- **Thông tin hóa đơn**: Ký hiệu, mẫu số, ngày phát hành
- **Thuế VAT**: Tính toán đúng thuế suất (0%, 5%, 8%, 10%)
- **Mã tra cứu**: Tự động tạo mã tra cứu hóa đơn
- **Trạng thái**: Nháp → Đã phát hành → Đã ký → Đã gửi

### 3. API tích hợp Viettel
- 📄 `/api/vinvoice` - API endpoint chính
- **Actions hỗ trợ**:
  - `create` - Tạo hóa đơn mới
  - `sign` - Ký số hóa đơn
  - `send` - Gửi hóa đơn cho khách hàng
  - `cancel` - Hủy hóa đơn
  - `lookup` - Tra cứu hóa đơn
  - `adjust` - Điều chỉnh/thay thế hóa đơn

## Cấu hình

### 1. Biến môi trường
Thêm vào file `.env.local`:

```bash
# Viettel vInvoice
VIETTEL_API_URL=https://vinvoice-api.viettel.vn
VIETTEL_USERNAME=your_username
VIETTEL_PASSWORD=your_password
COMPANY_TAX_CODE=0123456789
INVOICE_TEMPLATE=01GTKT0/001
INVOICE_SERIAL=C22TBT

# Thông tin công ty
COMPANY_NAME=Khách sạn ABC
COMPANY_ADDRESS=123 Nguyễn Huệ, Quận 1, TP.HCM
COMPANY_PHONE=028-1234-5678
COMPANY_EMAIL=info@hotelABC.com
```

### 2. Đăng ký tài khoản Viettel
1. Truy cập: https://vinvoice.viettel.vn/
2. Đăng ký tài khoản doanh nghiệp
3. Đăng ký sử dụng hóa đơn điện tử
4. Lấy thông tin API credentials

## Sử dụng

### 1. Tạo hóa đơn điện tử
```javascript
const response = await fetch('/api/vinvoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    invoiceData: {
      templateCode: '01GTKT0/001',
      invoiceSerial: 'C22TBT',
      customerName: 'Nguyễn Văn A',
      customerTaxCode: '0123456789', // Chỉ với doanh nghiệp
      customerAddress: '123 ABC, Q1, TP.HCM',
      customerEmail: 'customer@email.com',
      items: [
        {
          name: 'Phòng Deluxe',
          quantity: 2,
          unitPrice: 1500000,
          total: 3000000,
          vatRate: 10
        }
      ],
      totalBeforeVAT: 3000000,
      vatAmount: 300000,
      totalAmount: 3300000
    }
  })
});
```

### 2. Ký số hóa đơn
```javascript
const response = await fetch('/api/vinvoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'sign',
    invoiceId: 'VTEL_123456789'
  })
});
```

### 3. Tra cứu hóa đơn
```javascript
const response = await fetch('/api/vinvoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'lookup',
    lookupCode: 'T9X4F3L8P1'
  })
});
```

## Giao diện người dùng

### 1. Danh sách hóa đôn
- Hiển thị loại hóa đơn (VAT/SALE)
- Trạng thái hóa đơn điện tử
- Mã tra cứu và link tra cứu CQT
- Badge phân biệt hóa đơn điện tử/giấy

### 2. Chi tiết hóa đơn
- Thông tin đầy đủ theo chuẩn hóa đơn Việt Nam
- Phân tích VAT và tổng tiền
- Các nút thao tác hóa đơn điện tử
- Link tra cứu trực tiếp trên website CQT

### 3. Thống kê
- Số lượng hóa đơn điện tử
- Tỷ lệ sử dụng hóa đơn điện tử
- Doanh thu từ hóa đơn điện tử

## Quy trình làm việc

### 1. Hóa đơn mới
```
Tạo booking → Tạo hóa đơn (draft) → Phát hành → Ký số → Gửi khách hàng
```

### 2. Thanh toán
```
Khách thanh toán → Cập nhật trạng thái → Gửi hóa đơn email
```

### 3. Hủy/Điều chỉnh
```
Yêu cầu hủy → Hủy trên Viettel → Cập nhật hệ thống
Cần điều chỉnh → Tạo hóa đơn điều chỉnh → Liên kết hóa đơn gốc
```

## Tuân thủ pháp lý

### 1. Thông tư 78/2021/TT-BTC
- ✅ Đúng định dạng hóa đơn điện tử
- ✅ Đầy đủ thông tin bắt buộc
- ✅ Mã tra cứu hợp lệ
- ✅ Ký số điện tử

### 2. Nghị định 123/2020/NĐ-CP
- ✅ Lưu trữ hóa đơn điện tử
- ✅ Tra cứu minh bạch
- ✅ Báo cáo sử dụng hóa đơn

## Tài liệu tham khảo

### 1. Viettel vInvoice
- Website: https://vinvoice.viettel.vn/
- Hotline: 18008198
- Email: cskh.hoadondientu@viettel.com.vn

### 2. Cơ quan quản lý
- Trang tra cứu CQT: https://tracuuhoadon.gdt.gov.vn/
- Thông tư 78: [Link thông tư](https://thuvienphapluat.vn/van-ban/thue-phi-le-phi/Thong-tu-78-2021-TT-BTC-hoa-don-chung-tu-dien-tu-481894.aspx)

### 3. API Documentation
- Viettel API Docs: [Liên hệ Viettel để được cung cấp]
- File mẫu: `/src/app/api/vinvoice/route.ts`

## Lưu ý quan trọng

⚠️ **Quan trọng**: 
- File `/src/app/api/vinvoice/route.ts` hiện tại là **mock implementation**
- Cần thay thế bằng API calls thực tế đến Viettel
- Cần test kỹ trên môi trường sandbox trước khi production
- Cần backup dữ liệu hóa đơn thường xuyên

📞 **Hỗ trợ**: Liên hệ Viettel để được hướng dẫn chi tiết về API integration và tài liệu kỹ thuật.
