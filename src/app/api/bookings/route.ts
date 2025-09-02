import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking, Room } from '@/lib/models';

// Lấy danh sách bookings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const bookingType = searchParams.get('bookingType');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const dateType = searchParams.get('dateType') || 'checkIn';
    
    let filter: any = {};
    
    // Filter by status
    if (status) filter.status = status;
    
    // Filter by booking type
    if (bookingType) filter.bookingType = bookingType;
    
    // Search filter
    if (search) {
      filter.$or = [
        { representativeName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date filters
    if (dateFrom || dateTo) {
      let dateField = 'checkInDate';
      if (dateType === 'checkOut') dateField = 'checkOutDate';
      if (dateType === 'created') dateField = 'createdAt';
      
      filter[dateField] = {};
      if (dateFrom) {
        filter[dateField].$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        filter[dateField].$lte = toDate;
      }
    }
    
    const bookings = await Booking.find(filter)
      .populate('roomId')
      .sort({ createdAt: -1 })
      .limit(100);
    
    return NextResponse.json({
      success: true,
      bookings: bookings
    });
    
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách booking' },
      { status: 500 }
    );
  }
}

// Tạo booking mới
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const bookingData = await request.json();
    
    // Kiểm tra phòng có tồn tại và trống không
    const room = await Room.findById(bookingData.roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy phòng' },
        { status: 404 }
      );
    }
    
    if (room.status !== 'available') {
      return NextResponse.json(
        { success: false, message: 'Phòng không khả dụng' },
        { status: 400 }
      );
    }
    
    // Tính tổng tiền dựa trên loại thuê
    let totalAmount = 0;
    const rentalType = bookingData.rentalType || 'daily';
    
    // Nếu có tùy chỉnh giá, dùng giá tùy chỉnh
    if (bookingData.customPricing && bookingData.customTotalAmount > 0) {
      totalAmount = bookingData.customTotalAmount;
    } else {
      switch (rentalType) {
        case 'hourly':
          if (!bookingData.checkInTime || !bookingData.checkOutTime) {
            return NextResponse.json(
              { success: false, message: 'Thiếu thông tin giờ vào/ra cho thuê theo giờ' },
              { status: 400 }
            );
          }
          
          const checkInHour = parseInt(bookingData.checkInTime.split(':')[0]);
          const checkOutHour = parseInt(bookingData.checkOutTime.split(':')[0]);
          const totalHours = checkOutHour - checkInHour;
          
          if (totalHours <= 0) {
            return NextResponse.json(
              { success: false, message: 'Giờ ra phải sau giờ vào' },
              { status: 400 }
            );
          }
          
          // Tính tiền theo giờ: giờ đầu 80k, giờ thứ 2: 40k, còn lại: 20k
          for (let i = 0; i < totalHours; i++) {
            if (i === 0) {
              totalAmount += 80000;
            } else if (i === 1) {
              totalAmount += 40000;
            } else {
              totalAmount += 20000;
            }
          }
          break;
          
        case 'daily':
          // Nếu không có ngày check-out, đặt giá mặc định cho 1 ngày
          if (bookingData.checkOutDate) {
            const checkIn = new Date(bookingData.checkInDate);
            const checkOut = new Date(bookingData.checkOutDate);
            const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            totalAmount = days * room.price;
          } else {
            // Mặc định 1 ngày nếu không có check-out date
            totalAmount = room.price;
          }
          break;
          
        case 'monthly':
          // Nếu không có ngày kết thúc, đặt giá mặc định cho 1 tháng
          if (bookingData.checkOutDate) {
            const startDate = new Date(bookingData.checkInDate);
            const endDate = new Date(bookingData.checkOutDate);
            const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const monthlyPrice = room.monthlyPrice || (room.price * 25); // Giá tháng hoặc giá ngày x25
            totalAmount = months * monthlyPrice;
          } else {
            // Mặc định 1 tháng nếu không có check-out date
            const monthlyPrice = room.monthlyPrice || (room.price * 25);
            totalAmount = monthlyPrice;
          }
          break;
          
        default:
          return NextResponse.json(
            { success: false, message: 'Loại thuê không hợp lệ' },
            { status: 400 }
          );
      }
    }
    
    // Map field names từ frontend sang database schema
    const mappedBookingData = {
      ...bookingData,
      rentalType,
      roomNumber: room.roomNumber,
      totalAmount,
      createdBy: bookingData.createdBy || 'system',
      // Map representativeIdNumber thành representativeCCCD
      representativeCCCD: bookingData.representativeIdNumber || bookingData.representativeCCCD || 'Chưa cập nhật',
      // Đảm bảo có thông tin ngày sinh và địa chỉ nếu được cung cấp
      representativeDateOfBirth: bookingData.representativeDateOfBirth || '',
      representativeAddress: bookingData.representativeAddress || ''
    };
    
    // Đảm bảo các trường bắt buộc cho booking cá nhân
    if (bookingData.bookingType === 'individual') {
      if (!mappedBookingData.representativeName) {
        return NextResponse.json(
          { success: false, message: 'Thiếu tên người đại diện' },
          { status: 400 }
        );
      }
      if (!mappedBookingData.representativePhone) {
        return NextResponse.json(
          { success: false, message: 'Thiếu số điện thoại người đại diện' },
          { status: 400 }
        );
      }
      // Đảm bảo có CCCD cho booking cá nhân
      if (!mappedBookingData.representativeCCCD) {
        mappedBookingData.representativeCCCD = 'Chưa cập nhật';
      }
    }

    // Map guest idNumber thành cccd
    if (mappedBookingData.guests) {
      mappedBookingData.guests = mappedBookingData.guests.map((guest: any) => ({
        ...guest,
        cccd: guest.cccd || guest.idNumber || 'Chưa cập nhật'
      }));
    }

    // Đặt thông tin mặc định cho booking công ty
    if (bookingData.bookingType === 'company') {
      if (!mappedBookingData.representativeName) {
        mappedBookingData.representativeName = mappedBookingData.companyName || 'Đại diện công ty';
      }
      if (!mappedBookingData.representativePhone) {
        mappedBookingData.representativePhone = 'Chưa cập nhật';
      }
      if (!mappedBookingData.representativeCCCD) {
        mappedBookingData.representativeCCCD = 'Chưa cập nhật';
      }
    }
    
    // Tạo booking
    const booking = await Booking.create(mappedBookingData);
    
    // Cập nhật trạng thái phòng
    await Room.findByIdAndUpdate(bookingData.roomId, { status: 'reserved' });
    
    return NextResponse.json({
      success: true,
      message: 'Tạo booking thành công',
      data: booking
    });
    
  } catch (error) {
    console.error('Create booking error:', error);
    
    // Log chi tiết lỗi validation
    if (error instanceof Error && error.message.includes('validation failed')) {
      console.error('Validation errors:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dữ liệu không hợp lệ',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo booking' },
      { status: 500 }
    );
  }
}
