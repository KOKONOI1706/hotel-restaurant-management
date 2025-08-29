import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room, Booking } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    console.log('Starting room status synchronization...');
    
    // Lấy tất cả phòng
    const rooms = await Room.find({});
    let updatedCount = 0;
    const updateLog = [];
    
    for (const room of rooms) {
      let correctStatus = 'available'; // Mặc định là trống
      let activeBooking = null;
      
      // Tìm booking active cho phòng này
      // Ưu tiên: checked-in > confirmed > pending
      const checkedInBooking = await Booking.findOne({
        roomId: room._id,
        status: 'checked-in'
      }).sort({ createdAt: -1 });
      
      if (checkedInBooking) {
        correctStatus = 'occupied';
        activeBooking = checkedInBooking;
      } else {
        // Kiểm tra booking đã confirm nhưng chưa check-in
        const confirmedBooking = await Booking.findOne({
          roomId: room._id,
          status: 'confirmed'
        }).sort({ createdAt: -1 });
        
        if (confirmedBooking) {
          correctStatus = 'reserved';
          activeBooking = confirmedBooking;
        }
      }
      
      // Cập nhật nếu status không đúng
      if (room.status !== correctStatus) {
        await Room.findByIdAndUpdate(room._id, { status: correctStatus });
        updatedCount++;
        
        updateLog.push({
          roomNumber: room.roomNumber,
          oldStatus: room.status,
          newStatus: correctStatus,
          reason: activeBooking ? 
            `Booking ${activeBooking.status}: ${activeBooking.representativeName || activeBooking.companyName}` : 
            'Không có booking active'
        });
        
        console.log(`Updated room ${room.roomNumber}: ${room.status} → ${correctStatus}`);
      }
    }
    
    console.log(`Synchronization completed. Updated ${updatedCount} rooms.`);
    
    return NextResponse.json({
      success: true,
      message: `Đồng bộ thành công! Đã cập nhật ${updatedCount} phòng.`,
      data: {
        totalRooms: rooms.length,
        updatedCount,
        updateLog
      }
    });
    
  } catch (error) {
    console.error('Room synchronization error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi đồng bộ trạng thái phòng', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
