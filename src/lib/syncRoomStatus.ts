import connectDB from '@/lib/mongodb';
import { Room, Booking } from '@/lib/models';

/**
 * Tự động đồng bộ trạng thái phòng dựa trên booking
 */
export async function syncRoomStatus(roomId: string) {
  try {
    await connectDB();
    
    const room = await Room.findById(roomId);
    if (!room) {
      console.error(`Room not found: ${roomId}`);
      return;
    }
    
    let correctStatus = 'available'; // Mặc định là trống
    
    // Tìm booking active cho phòng này
    // Ưu tiên: checked-in > confirmed > pending
    const checkedInBooking = await Booking.findOne({
      roomId: roomId,
      status: 'checked-in'
    }).sort({ createdAt: -1 });
    
    if (checkedInBooking) {
      correctStatus = 'occupied';
    } else {
      // Kiểm tra booking đã confirm nhưng chưa check-in
      const confirmedBooking = await Booking.findOne({
        roomId: roomId,
        status: 'confirmed'
      }).sort({ createdAt: -1 });
      
      if (confirmedBooking) {
        correctStatus = 'reserved';
      }
    }
    
    // Cập nhật nếu status không đúng
    if (room.status !== correctStatus) {
      await Room.findByIdAndUpdate(roomId, { status: correctStatus });
      console.log(`Auto-synced room ${room.roomNumber}: ${room.status} → ${correctStatus}`);
      return { updated: true, oldStatus: room.status, newStatus: correctStatus };
    }
    
    return { updated: false, currentStatus: room.status };
    
  } catch (error) {
    console.error('Auto sync room status error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Đồng bộ tất cả phòng
 */
export async function syncAllRoomsStatus() {
  try {
    await connectDB();
    
    const rooms = await Room.find({});
    const results = [];
    
    for (const room of rooms) {
      const result = await syncRoomStatus(room._id.toString());
      if (result && result.updated) {
        results.push({
          roomNumber: room.roomNumber,
          ...result
        });
      }
    }
    
    return { success: true, updatedRooms: results };
    
  } catch (error) {
    console.error('Sync all rooms error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
