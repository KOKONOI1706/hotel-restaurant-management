import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Room, Booking, Service } from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    await Service.deleteMany({});

    // Create users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const hashedStaffPassword = await bcrypt.hash('staff123', 10);
    
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@hotel.com',
        passwordHash: hashedPassword,
        role: 'admin',
        fullName: 'Administrator'
      },
      {
        username: 'staff',
        email: 'staff@hotel.com',
        passwordHash: hashedStaffPassword,
        role: 'staff',
        fullName: 'Staff User'
      }
    ]);

    // Create rooms
    const rooms = await Room.insertMany([
      // Single rooms
      { roomNumber: '201', type: 'single', price: 500000, monthlyPrice: 12000000, status: 'available', amenities: ['Wi-Fi', 'AC', 'TV'] },
      { roomNumber: '206', type: 'single', price: 500000, monthlyPrice: 12000000, status: 'available', amenities: ['Wi-Fi', 'AC', 'TV'] },
      { roomNumber: '207', type: 'single', price: 500000, monthlyPrice: 12000000, status: 'available', amenities: ['Wi-Fi', 'AC', 'TV'] },
      
      // Double rooms  
      { roomNumber: '202', type: 'double', price: 800000, monthlyPrice: 18000000, status: 'available', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar'] },
      { roomNumber: '203', type: 'double', price: 800000, monthlyPrice: 18000000, status: 'available', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar'] },
      { roomNumber: '204', type: 'double', price: 800000, monthlyPrice: 18000000, status: 'occupied', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar'] },
      { roomNumber: '205', type: 'double', price: 800000, monthlyPrice: 18000000, status: 'cleaning', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar'] },
      
      // Suites
      { roomNumber: '301', type: 'suite', price: 1500000, monthlyPrice: 35000000, status: 'available', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
      { roomNumber: '302', type: 'suite', price: 1500000, monthlyPrice: 35000000, status: 'maintenance', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
      
      // Deluxe rooms
      { roomNumber: '401', type: 'deluxe', price: 2000000, monthlyPrice: 45000000, status: 'available', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Kitchen'] },
      { roomNumber: '402', type: 'deluxe', price: 2000000, monthlyPrice: 45000000, status: 'available', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Kitchen'] }
    ]);

    // Create sample bookings
    const bookings = await Booking.insertMany([
      // Individual booking theo ngày - confirmed (có thể check-in)
      {
        bookingType: 'individual',
        rentalType: 'daily',
        roomId: rooms[0]._id, // Room 201
        roomNumber: '201',
        representativeName: 'Nguyễn Văn An',
        representativePhone: '0123456789',
        representativeEmail: 'nguyenvanan@email.com',
        representativeCCCD: '123456789012',
        checkInDate: new Date('2025-08-26T14:00:00'),
        checkOutDate: new Date('2025-08-28T12:00:00'),
        totalAmount: 1000000,
        status: 'confirmed',
        notes: 'Khách hàng VIP - thuê theo ngày',
        createdBy: 'admin'
      },
      
      // Company booking theo giờ - checked-in
      {
        bookingType: 'company',
        rentalType: 'hourly',
        roomId: rooms[5]._id, // Room 204
        roomNumber: '204',
        representativeName: 'Đại diện công ty',
        representativePhone: '0111222333',
        representativeCCCD: 'Chưa cập nhật',
        companyName: 'Công ty TNHH ABC',
        companyAddress: '123 Đường ABC, TP.HCM',
        companyTaxCode: '0123456789',
        guests: [
          {
            name: 'Lê Văn Cường',
            phone: '0111222333',
            email: 'levancuong@company.com',
            cccd: '111222333444'
          },
          {
            name: 'Phạm Thị Dung',
            phone: '0444555666',
            email: 'phamthidung@company.com',
            cccd: '444555666777'
          }
        ],
        checkInDate: new Date('2025-08-28T00:00:00'), // Ngày hôm nay
        checkInTime: '09:00',
        checkOutTime: '15:00', // 6 giờ: 80k + 40k + 20k*4 = 200k
        actualCheckIn: new Date('2025-08-28T09:30:00'),
        totalAmount: 200000,
        status: 'checked-in',
        notes: 'Thuê phòng họp theo giờ',
        createdBy: 'admin'
      },
      
      // Individual booking theo tháng - confirmed
      {
        bookingType: 'individual',
        rentalType: 'monthly',
        roomId: rooms[7]._id, // Room 301 - Suite
        roomNumber: '301',
        representativeName: 'Hoàng Minh Đức',
        representativePhone: '0555666777',
        representativeEmail: 'hoangminhduc@email.com',
        representativeCCCD: '555666777888',
        checkInDate: new Date('2025-09-01T00:00:00'),
        checkOutDate: new Date('2025-12-01T00:00:00'), // 3 tháng
        totalAmount: 105000000, // 35M x 3 tháng
        status: 'confirmed',
        notes: 'Thuê dài hạn 3 tháng',
        createdBy: 'admin'
      },
      
      // Individual booking theo ngày - pending
      {
        bookingType: 'individual',
        rentalType: 'daily',
        roomId: rooms[1]._id, // Room 206
        roomNumber: '206',
        representativeName: 'Trần Thị Bình',
        representativePhone: '0666777888',
        representativeEmail: 'tranthibinh@email.com',
        representativeCCCD: '666777888999',
        checkInDate: new Date('2025-08-30T14:00:00'),
        checkOutDate: new Date('2025-09-01T12:00:00'),
        totalAmount: 1000000,
        status: 'pending',
        notes: 'Booking cuối tuần',
        createdBy: 'admin'
      },
      
      // Company booking theo giờ - confirmed
      {
        bookingType: 'company',
        rentalType: 'hourly',
        roomId: rooms[2]._id, // Room 207
        roomNumber: '207',
        representativeName: 'Đại diện XYZ',
        representativePhone: '0777888999',
        representativeCCCD: 'Chưa cập nhật',
        companyName: 'Công ty XYZ Ltd',
        companyTaxCode: '9876543210',
        guests: [
          {
            name: 'Võ Văn Em',
            phone: '0777888999',
            email: 'vovanem@xyz.com',
            cccd: '777888999000'
          }
        ],
        checkInDate: new Date('2025-08-29T00:00:00'),
        checkInTime: '13:00',
        checkOutTime: '17:00', // 4 giờ: 80k + 40k + 20k*2 = 160k
        totalAmount: 160000,
        status: 'confirmed',
        notes: 'Phòng họp chiều',
        createdBy: 'admin'
      }
    ]);

    // Create services
    const services = await Service.insertMany([
      {
        name: 'Massage thư giãn',
        description: 'Dịch vụ massage thư giãn toàn thân với tinh dầu thiên nhiên, giúp giảm stress và mệt mỏi',
        category: 'spa',
        price: 500000,
        status: 'available'
      },
      {
        name: 'Ăn sáng buffet',
        description: 'Buffet sáng đa dạng món Á và Âu từ 6:00 - 10:00 hàng ngày',
        category: 'food',
        price: 250000,
        status: 'available'
      },
      {
        name: 'Đưa đón sân bay',
        description: 'Dịch vụ đưa đón sân bay bằng xe 7 chỗ, tài xế có kinh nghiệm',
        category: 'transport',
        price: 350000,
        status: 'available'
      },
      {
        name: 'Giặt ủi quần áo',
        description: 'Dịch vụ giặt ủi quần áo express trong ngày, chất lượng cao',
        category: 'laundry',
        price: 50000,
        status: 'available'
      },
      {
        name: 'Cocktail đặc biệt',
        description: 'Cocktail pha chế từ bartender chuyên nghiệp với nguyên liệu cao cấp',
        category: 'beverage',
        price: 180000,
        status: 'available'
      },
      {
        name: 'Facial chăm sóc da',
        description: 'Liệu trình chăm sóc da mặt với sản phẩm organic từ Hàn Quốc',
        category: 'spa',
        price: 400000,
        status: 'available'
      },
      {
        name: 'Karaoke VIP',
        description: 'Phòng karaoke VIP với hệ thống âm thanh cao cấp, phục vụ 24/7',
        category: 'other',
        price: 300000,
        status: 'available'
      },
      {
        name: 'Ăn tối set menu',
        description: 'Set menu ăn tối 5 món cho 2 người, món Âu hiện đại',
        category: 'food',
        price: 800000,
        status: 'available'
      }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: users.length,
        rooms: rooms.length,
        bookings: bookings.length,
        services: services.length
      }
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}
