import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking, Room } from '@/lib/models';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }
    
    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, message: 'Booking không ở trạng thái có thể check-in' },
        { status: 400 }
      );
    }
    
    // Cập nhật trạng thái check-in
    await Booking.findByIdAndUpdate(params.id, {
      status: 'checked-in',
      actualCheckIn: new Date(),
      updatedAt: new Date()
    });
    
    // Cập nhật trạng thái phòng
    await Room.findByIdAndUpdate(booking.roomId, { status: 'occupied' });
    
    return NextResponse.json({
      success: true,
      message: 'Check-in thành công'
    });
    
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi check-in' },
      { status: 500 }
    );
  }
}
