# Hướng dẫn cấu hình Email cho Contact Form

## Để form liên hệ có thể gửi email đến suoimo4512@gmail.com, bạn cần:

### 1. Bật App Password cho Gmail

1. Truy cập [Google Account Settings](https://myaccount.google.com/)
2. Vào **Security** → **2-Step Verification** (bật nếu chưa có)
3. Tìm **App passwords** → **Generate new password**
4. Chọn **Mail** và **Other (Custom name)** → nhập "Suoi Mo Resort"
5. Copy password được tạo (16 ký tự)

### 2. Cập nhật Environment Variables

Trong file `.env.local`, thêm:

```env
GMAIL_USER=suoimo4512@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### 3. Deploy lên Vercel

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm 2 variables:
   - `GMAIL_USER`: `suoimo4512@gmail.com`
   - `GMAIL_APP_PASSWORD`: password 16 ký tự từ bước 1

### 4. Test

- Sau khi deploy, form liên hệ sẽ gửi email đến suoimo4512@gmail.com
- Email có format đẹp với thông tin đầy đủ từ khách hàng

## Lưu ý

- **KHÔNG** commit app password vào git
- App password khác với password thường của Gmail
- Email sẽ có subject: `[Suối Mơ Resort] {chủ đề} - {tên khách hàng}`
