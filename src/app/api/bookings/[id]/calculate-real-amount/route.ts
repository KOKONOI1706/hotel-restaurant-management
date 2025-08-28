import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking, Room } from '@/lib/models';

// Tính tiền thực tế dựa trên thời gian check-in/out thực tế
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const booking = await Booking.findById(params.id).populate('roomId');
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }

    const room = booking.roomId;
    if (!room) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy thông tin phòng' },
        { status: 404 }
      );
    }

    // Lấy thời gian thực tế hoặc dự kiến
    const actualCheckIn = booking.actualCheckIn ? new Date(booking.actualCheckIn) : new Date(booking.checkInDate);
    const actualCheckOut = booking.actualCheckOut ? new Date(booking.actualCheckOut) : new Date();

    let realAmount = 0;
    let calculation = {};

    switch (booking.rentalType) {
      case 'hourly':
        const hoursStayed = Math.ceil((actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60));
        
        // Tính tiền theo giờ: giờ đầu 80k, giờ thứ 2: 40k, còn lại: 20k
        const hourlyBreakdown = [];
        for (let i = 0; i < hoursStayed; i++) {
          if (i === 0) {
            realAmount += 80000;
            hourlyBreakdown.push(`Giờ ${i + 1}: 80,000đ`);
          } else if (i === 1) {
            realAmount += 40000;
            hourlyBreakdown.push(`Giờ ${i + 1}: 40,000đ`);
          } else {
            realAmount += 20000;
            hourlyBreakdown.push(`Giờ ${i + 1}: 20,000đ`);
          }
        }
        
        calculation = {
          type: 'hourly',
          hoursStayed,
          breakdown: hourlyBreakdown,
          checkInTime: actualCheckIn.toLocaleString('vi-VN'),
          checkOutTime: actualCheckOut.toLocaleString('vi-VN')
        };
        break;
        
      case 'daily':
        const daysStayed = Math.ceil((actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60 * 24));
        realAmount = daysStayed * room.price;
        
        calculation = {
          type: 'daily',
          daysStayed,
          pricePerDay: room.price,
          checkInDate: actualCheckIn.toLocaleDateString('vi-VN'),
          checkOutDate: actualCheckOut.toLocaleDateString('vi-VN'),
          breakdown: [`${daysStayed} ngày x ${room.price.toLocaleString('vi-VN')}đ = ${realAmount.toLocaleString('vi-VN')}đ`]
        };
        break;
        
      case 'monthly':
        const monthsStayed = Math.ceil((actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const monthlyPrice = room.monthlyPrice || (room.price * 25);
        realAmount = monthsStayed * monthlyPrice;
        
        calculation = {
          type: 'monthly',
          monthsStayed,
          pricePerMonth: monthlyPrice,
          checkInDate: actualCheckIn.toLocaleDateString('vi-VN'),
          checkOutDate: actualCheckOut.toLocaleDateString('vi-VN'),
          breakdown: [`${monthsStayed} tháng x ${monthlyPrice.toLocaleString('vi-VN')}đ = ${realAmount.toLocaleString('vi-VN')}đ`]
        };
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Loại thuê không hợp lệ' },
          { status: 400 }
        );
    }

    // So sánh với số tiền đã tính sẵn
    const preCalculatedAmount = booking.totalAmount || 0;
    const difference = realAmount - preCalculatedAmount;

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking._id,
        rentalType: booking.rentalType,
        preCalculatedAmount, // Số tiền tính sẵn (tham khảo/thanh toán trước)
        realAmount, // Số tiền thực tế theo thời gian ở
        difference, // Chênh lệch (+ hoặc -)
        calculation,
        roomInfo: {
          roomNumber: room.roomNumber,
          roomType: room.type,
          basePrice: room.price,
          monthlyPrice: room.monthlyPrice
        }
      }
    });
    
  } catch (error) {
    console.error('Calculate real amount error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tính tiền thực tế' },
      { status: 500 }
    );
  }
}
