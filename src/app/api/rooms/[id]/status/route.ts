import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/lib/models';

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

    const room = await Room.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

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
