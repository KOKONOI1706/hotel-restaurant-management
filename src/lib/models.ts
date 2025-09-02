import mongoose, { Schema, model, models } from 'mongoose';

// User Schema
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
}, { timestamps: true });

// Room Schema
const RoomSchema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['single', 'double', 'suite', 'deluxe'], required: true },
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved', 'cleaning'], default: 'available' },
  price: { type: Number, required: true }, // Giá theo ngày
  monthlyPrice: { type: Number }, // Giá theo tháng (tùy chọn)
  description: { type: String },
  amenities: [{ type: String }],
}, { timestamps: true });

// Customer Schema
const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  identityCard: { type: String },
}, { timestamps: true });

// Schema cho khách hàng trong phòng
const GuestSchema = new Schema({
  name: { type: String, required: true },
  cccd: { type: String, default: 'Chưa cập nhật' },
  phone: { type: String },
  email: { type: String },
  dateOfBirth: { type: String }, // Ngày sinh
  address: { type: String } // Địa chỉ
});

// Booking Schema
const BookingSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  roomNumber: { type: String, required: true },
  
  // Thông tin loại booking và loại thuê
  bookingType: { 
    type: String, 
    enum: ['individual', 'company'], 
    required: true 
  },
  rentalType: {
    type: String,
    enum: ['hourly', 'daily', 'monthly'],
    default: 'daily'
  },
  
  // Thông tin người đại diện/công ty
  representativeName: { 
    type: String, 
    default: 'Khách hàng'
  },
  representativeCCCD: { 
    type: String, 
    default: 'Chưa cập nhật'
  },
  representativePhone: { 
    type: String, 
    required: true
  },
  representativeEmail: { type: String },
  representativeDateOfBirth: { type: String }, // Ngày sinh người đại diện
  representativeAddress: { type: String }, // Địa chỉ người đại diện
  
  // Thông tin công ty (nếu có)
  companyName: { type: String },
  companyTaxCode: { type: String },
  
  // Danh sách tất cả khách trong phòng
  guests: [GuestSchema],
  
  // Thông tin check-in/out
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date }, // Không bắt buộc cho thuê theo giờ
  checkInTime: { type: String }, // Giờ vào cho thuê theo giờ
  checkOutTime: { type: String }, // Giờ ra cho thuê theo giờ
  actualCheckIn: { type: Date },
  actualCheckOut: { type: Date },
  
  // Thông tin thanh toán
  totalAmount: { type: Number, required: true }, // Giá tính sẵn (tham khảo/thanh toán trước)
  paidAmount: { type: Number, default: 0 },
  finalAmount: { type: Number }, // Tổng tiền cuối cùng sau khi check-out (bao gồm phí phát sinh)
  baseAmount: { type: Number }, // Số tiền cơ sở dùng để tính finalAmount (thời gian thực hoặc tính sẵn)
  extraCharges: { type: Number, default: 0 }, // Phí phát sinh
  checkoutNotes: { type: String }, // Ghi chú khi check-out
  usePreCalculated: { type: Boolean, default: false }, // Có sử dụng số tiền tính sẵn khi checkout không
  useCustomAmount: { type: Boolean, default: false }, // Có sử dụng tùy chỉnh giá khi checkout không
  customAmount: { type: Number }, // Số tiền tùy chỉnh
  realTimeCalculation: { type: Schema.Types.Mixed }, // Thông tin tính toán thời gian thực
  
  // Thông báo lưu trú
  accommodationNotificationSent: { type: Boolean, default: false }, // Đã gửi thông báo lưu trú chưa
  accommodationNotificationDate: { type: Date }, // Ngày gửi thông báo lưu trú
  accommodationNotificationStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'pending' 
  }, // Trạng thái thông báo lưu trú
  accommodationNotificationId: { type: String }, // Mã số thông báo từ Cổng dịch vụ công
  guestRegistrations: [{ type: Schema.Types.Mixed }], // Thông tin đăng ký khách lưu trú
  
  // Trạng thái gửi hồ sơ lên portal
  submittedToPortal: { type: Boolean, default: false }, // Đã gửi hồ sơ lên dichvucong.gov.vn chưa
  portalSubmissionDate: { type: Date }, // Ngày gửi hồ sơ lên portal
  
  // Trạng thái
  status: { 
    type: String, 
    enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled'], 
    default: 'confirmed' 
  },
  
  // Ghi chú
  notes: { type: String },
  
  // Thông tin tạo/cập nhật
  createdBy: { type: String, required: true }
}, { timestamps: true });

// Service Schema
const ServiceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, enum: ['food', 'beverage', 'spa', 'laundry', 'transport', 'other'], required: true },
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
}, { timestamps: true });

// Invoice Schema
const InvoiceSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' }, // Optional vì có thể lấy từ booking
  serviceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
  roomCharges: { type: Number, required: true },
  serviceCharges: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'partial', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'transfer', 'online'], default: 'cash' },
  paymentDate: { type: Date },
  paymentNotes: { type: String },
  invoiceNumber: { type: String, unique: true },
  dueDate: { type: Date },
  
  // Customer info (snapshot từ booking)
  customerName: { type: String },
  customerPhone: { type: String },
  customerEmail: { type: String },
  customerAddress: { type: String },
  companyName: { type: String },
  companyTaxCode: { type: String },
  
  // Room info (snapshot)
  roomNumber: { type: String },
  checkInDate: { type: Date },
  checkOutDate: { type: Date },
  
  // Invoice status
  status: { type: String, enum: ['draft', 'sent', 'paid', 'cancelled'], default: 'draft' },
  notes: { type: String },
}, { timestamps: true });

// Export models
export const User = models.User || model('User', UserSchema);
export const Room = models.Room || model('Room', RoomSchema);
export const Customer = models.Customer || model('Customer', CustomerSchema);
export const Booking = models.Booking || model('Booking', BookingSchema);
export const Service = models.Service || model('Service', ServiceSchema);
export const Invoice = models.Invoice || model('Invoice', InvoiceSchema);
