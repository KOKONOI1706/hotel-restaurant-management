import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking, Room } from '@/lib/models';
import { syncRoomStatus } from '@/lib/syncRoomStatus';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      extraCharges = 0, 
      notes = '', 
      usePreCalculated = false, 
      useCustomAmount = false, 
      customAmount = 0 
    } = body;
    
    const booking = await Booking.findById(params.id).populate('roomId');
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }
    
    if (booking.status !== 'checked-in') {
      return NextResponse.json(
        { success: false, message: 'Booking không ở trạng thái có thể check-out' },
        { status: 400 }
      );
    }
    
    let baseAmount = booking.totalAmount; // Mặc định dùng số tiền tính sẵn
    let realTimeCalculation = null;
    
    // Nếu sử dụng tùy chỉnh giá
    if (useCustomAmount) {
      baseAmount = customAmount;
    }
    // Nếu không sử dụng số tiền tính sẵn và không tùy chỉnh, tính theo thời gian thực
    else if (!usePreCalculated) {
      try {
        // Tính tiền theo thời gian thực
        const room = booking.roomId;
        const actualCheckIn = booking.actualCheckIn ? new Date(booking.actualCheckIn) : new Date(booking.checkInDate);
        const actualCheckOut = new Date(); // Thời điểm checkout hiện tại
        
        let realAmount = 0;
        
        switch (booking.rentalType) {
          case 'hourly':
            const hoursStayed = Math.ceil((actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60));
            
            // Tính tiền theo giờ: giờ đầu 80k, giờ thứ 2: 40k, còn lại: 20k
            for (let i = 0; i < hoursStayed; i++) {
              if (i === 0) {
                realAmount += 80000;
              } else if (i === 1) {
                realAmount += 40000;
              } else {
                realAmount += 20000;
              }
            }
            
            realTimeCalculation = {
              type: 'hourly',
              hoursStayed,
              checkInTime: actualCheckIn.toLocaleString('vi-VN'),
              checkOutTime: actualCheckOut.toLocaleString('vi-VN')
            };
            break;
            
          case 'daily':
            const daysStayed = Math.ceil((actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60 * 24));
            realAmount = daysStayed * room.price;
            
            realTimeCalculation = {
              type: 'daily',
              daysStayed,
              pricePerDay: room.price,
              checkInDate: actualCheckIn.toLocaleDateString('vi-VN'),
              checkOutDate: actualCheckOut.toLocaleDateString('vi-VN')
            };
            break;
            
          case 'monthly':
            const monthsStayed = Math.ceil((actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const monthlyPrice = room.monthlyPrice || (room.price * 25);
            realAmount = monthsStayed * monthlyPrice;
            
            realTimeCalculation = {
              type: 'monthly',
              monthsStayed,
              pricePerMonth: monthlyPrice,
              checkInDate: actualCheckIn.toLocaleDateString('vi-VN'),
              checkOutDate: actualCheckOut.toLocaleDateString('vi-VN')
            };
            break;
        }
        
        baseAmount = realAmount; // Sử dụng số tiền tính theo thời gian thực
        
      } catch (calcError) {
        console.error('Error calculating real-time amount:', calcError);
        // Nếu có lỗi khi tính thời gian thực, fallback về số tiền tính sẵn
        baseAmount = booking.totalAmount;
      }
    }
    
    // Tính tổng số tiền
    // Nếu dùng tùy chỉnh giá, không cộng thêm phí phát sinh (đã bao gồm trong giá tùy chỉnh)
    const finalAmount = useCustomAmount ? customAmount : (baseAmount + extraCharges);
    
    // Cập nhật trạng thái check-out
    await Booking.findByIdAndUpdate(params.id, {
      status: 'checked-out',
      actualCheckOut: new Date(),
      finalAmount: finalAmount,
      baseAmount: baseAmount, // Lưu số tiền cơ sở (theo thời gian thực hoặc tính sẵn hoặc tùy chỉnh)
      extraCharges: useCustomAmount ? 0 : extraCharges, // Không lưu phí phát sinh khi dùng tùy chỉnh giá
      checkoutNotes: notes,
      usePreCalculated: usePreCalculated, // Lưu thông tin có dùng số tiền tính sẵn không
      useCustomAmount: useCustomAmount, // Lưu thông tin có dùng tùy chỉnh giá không
      customAmount: useCustomAmount ? customAmount : undefined, // Lưu số tiền tùy chỉnh
      realTimeCalculation: realTimeCalculation, // Lưu thông tin tính toán thời gian thực
      updatedAt: new Date()
    });
    
    // Tự động đồng bộ trạng thái phòng
    await syncRoomStatus(booking.roomId.toString());
    
    return NextResponse.json({
      success: true,
      message: 'Check-out thành công',
      data: {
        finalAmount: finalAmount,
        baseAmount: baseAmount,
        extraCharges: useCustomAmount ? 0 : extraCharges,
        usePreCalculated: usePreCalculated,
        useCustomAmount: useCustomAmount,
        customAmount: useCustomAmount ? customAmount : undefined,
        realTimeCalculation: realTimeCalculation,
        preCalculatedAmount: booking.totalAmount,
        difference: useCustomAmount ? customAmount - booking.totalAmount : baseAmount - booking.totalAmount
      }
    });
    
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi check-out' },
      { status: 500 }
    );
  }
}
