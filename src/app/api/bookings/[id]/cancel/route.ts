import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/lib/models';
import { syncRoomStatus } from '@/lib/syncRoomStatus';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { reason = '' } = body;
    
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }
    
    if (booking.status === 'cancelled' || booking.status === 'checked-out') {
      return NextResponse.json(
        { success: false, message: 'Booking đã được hủy hoặc đã check-out' },
        { status: 400 }
      );
    }
    
    // Cập nhật trạng thái hủy
    await Booking.findByIdAndUpdate(params.id, {
      status: 'cancelled',
      cancelReason: reason,
      cancelledAt: new Date(),
      updatedAt: new Date()
    });
    
    // Tự động đồng bộ trạng thái phòng (sẽ thành available nếu không có booking khác)
    await syncRoomStatus(booking.roomId.toString());
    
    return NextResponse.json({
      success: true,
      message: 'Hủy booking thành công'
    });
    
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi hủy booking' },
      { status: 500 }
    );
  }
}
