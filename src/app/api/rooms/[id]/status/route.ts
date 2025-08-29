import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room, Booking } from '@/lib/models';

// PUT /api/rooms/[id]/status - Update room status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['available', 'occupied', 'maintenance', 'reserved', 'cleaning'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current room info
    const currentRoom = await Room.findById(id);
    if (!currentRoom) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if room has active bookings (checked-in guests)
    const activeBooking = await Booking.findOne({
      roomId: id,
      status: 'checked-in'
    });

    // If room currently has guests (occupied or has active booking), restrict status changes
    if (activeBooking || currentRoom.status === 'occupied') {
      // Only allow certain status changes when room has guests
      const allowedChangesWithGuests = ['occupied']; // Can only keep as occupied
      
      if (!allowedChangesWithGuests.includes(status)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Không thể thay đổi trạng thái phòng ${currentRoom.roomNumber} khi đang có khách. Vui lòng thực hiện check-out trước.`,
            currentStatus: currentRoom.status,
            hasActiveBooking: !!activeBooking
          },
          { status: 400 }
        );
      }
    }

    // If changing TO occupied status, ensure there's an active booking
    if (status === 'occupied') {
      if (!activeBooking) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Không thể đặt phòng ${currentRoom.roomNumber} thành "Có khách" khi chưa có booking nào được check-in.`
          },
          { status: 400 }
        );
      }
    }

    const room = await Room.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: `Phòng ${room.roomNumber} đã được cập nhật thành trạng thái: ${getStatusText(status)}`,
      data: { room },
    });
  } catch (error) {
    console.error('Update room status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'available': return 'Trống';
    case 'occupied': return 'Có khách';
    case 'maintenance': return 'Bảo trì';
    case 'reserved': return 'Đã đặt';
    case 'cleaning': return 'Đang dọn dẹp';
    default: return status;
  }
}
