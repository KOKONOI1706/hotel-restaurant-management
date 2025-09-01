import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cập nhật trạng thái thành ${status} thành công`,
      data: booking
    });

  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật trạng thái' },
      { status: 500 }
    );
  }
}
